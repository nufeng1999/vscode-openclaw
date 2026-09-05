<#
.SYNOPSIS
    Automated publish script: bumps package.json version and pushes to GitHub.
.DESCRIPTION
    Receives a project directory path, reads and bumps the semver version,
    updates package.json, creates a git commit, tag, and pushes to origin.
.PARAMETER ProjectPath
    Absolute path to the target project directory.
.EXAMPLE
    .\publish.ps1 -ProjectPath "C:\myproject"
#>
[CmdletBinding()]
param(
    [Parameter(Mandatory = $true, Position = 0)]
    [ValidateNotNullOrEmpty()]
    [string]$ProjectPath
)

# ─── Helpers ─────────────────────────────────────────────────────────────────

function Write-Log {
    param([string]$Message, [string]$Level = "INFO")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    switch ($Level) {
        "ERROR" { Write-Host "[ERROR] $timestamp - $Message" }
        "WARN"  { Write-Host "[WARN]  $timestamp - $Message" }
        default { Write-Host "[INFO]  $timestamp - $Message" }
    }
}

function Format-LogBlock {
    param([string]$Title, [string]$Detail)
    Write-Host ""
    Write-Host ("=" * 60)
    Write-Host "  $Title"
    Write-Host ("=" * 60)
    if ($Detail) { Write-Host $Detail }
    Write-Host ""
}

# ─── Version bump logic ──────────────────────────────────────────────────────

function Get-IncrementedVersion {
    param([string]$CurrentVersion)

    # Strip leading 'v' or 'V'
    $clean = $CurrentVersion -replace "^[vV]", ""

    # Parse major.minor.patch
    $parts = $clean -split "\."
    if ($parts.Count -ne 3) {
        throw "Invalid version format: '$CurrentVersion' (expected major.minor.patch)"
    }

    [int]$major = $parts[0]
    [int]$minor = $parts[1]
    [int]$patch = $parts[2]
    $patch++

    $newVersion = "$major.$minor.$patch"
    return $newVersion
}

# ─── Main flow ───────────────────────────────────────────────────────────────

try {

    # ── Step 0: Validate project directory ───────────────────────────────────
    Format-LogBlock "Step 0 - Validate project directory"

    if (-not (Test-Path $ProjectPath)) {
        throw "Project directory does not exist: $ProjectPath"
    }

    $resolvedPath = Resolve-Path $ProjectPath -ErrorAction Stop
    Write-Log "Project directory resolved: $($resolvedPath.Path)"

    # Switch to project directory
    Set-Location $resolvedPath.Path
    Write-Log "Switched to: $PWD"

    # ── Step 1: Check git repository ─────────────────────────────────────────
    Format-LogBlock "Step 1 - Check git repository"

    # Fix: use Test-Path instead of Get-ChildItem -Hidden, because .git may not
    # have the Hidden attribute (e.g. attributes are Directory, Compressed).
    if (-not (Test-Path "$PWD/.git")) {
        throw "Not a git repository (no .git directory found): $PWD"
    }
    Write-Log "Confirmed git repository"

    # ── Step 1.5: Check package.json is clean (no uncommitted changes) ────
    Format-LogBlock "Step 1.5 - Check package.json is clean"

    $dirty = & git status --porcelain -- package.json
    if ($dirty) {
        throw "package.json has uncommitted changes, commit or stash them before publishing:`n$dirty"
    }
    Write-Log "package.json is clean (no uncommitted changes)"

    # Get current branch name
    $currentBranch = & git rev-parse --abbrev-ref HEAD 2>&1
    if (-not $currentBranch) {
        throw "Cannot determine current branch name"
    }
    Write-Log "Current branch: $currentBranch"

    # ── Step 2: Read package.json version ────────────────────────────────────
    Format-LogBlock "Step 2 - Read package.json version"

    $packageJsonPath = Join-Path $PWD "package.json"
    if (-not (Test-Path $packageJsonPath)) {
        throw "package.json not found: $packageJsonPath"
    }

    $packageJson = Get-Content $packageJsonPath -Raw -ErrorAction Stop | ConvertFrom-Json
    if (-not ($packageJson.PSObject.Properties.Name -contains "version")) {
        throw "package.json is missing the 'version' field"
    }

    $oldVersion = $packageJson.version
    Write-Log "Current version: $oldVersion"

    # ── Step 2.5: Pre-flight check — skip if target version already on remote ──
    Format-LogBlock "Step 2.5 - Check remote tags (idempotency guard)"
    & git fetch origin --tags 2>&1 | Out-Null
    $newVersionBare = Get-IncrementedVersion -CurrentVersion $oldVersion
    $newVersionTag  = "v$newVersionBare"
    $remoteTag = git ls-remote --tags origin "$newVersionTag" 2>&1
    if ($remoteTag) {
        Write-Log "Remote already has tag $newVersionTag — nothing to do, exiting gracefully."
        Write-Log "This usually means a previous run pushed the tag but did not exit cleanly."
        exit 0
    }
    Write-Log "No remote tag $newVersionTag found, proceed with publish."

    # ── Step 3: Bump version ─────────────────────────────────────────────────
    Format-LogBlock "Step 3 - Bump version"

    $newVersionBare = Get-IncrementedVersion -CurrentVersion $oldVersion
    $newVersionTag  = "v$newVersionBare"
    Write-Log "New version: $newVersionTag (was: $oldVersion)"

    # ── Step 4: Write back to package.json (regex precision replace) ────────
    Format-LogBlock "Step 4 - Update package.json"

    $content = [System.IO.File]::ReadAllText($packageJsonPath)
    if ($content.Length -gt 0 -and $content[0] -eq [char]0xFEFF) { $content = $content.Substring(1) }
    $pattern = '("version"\s*:\s*")[^"]*(")'
    $regex = [System.Text.RegularExpressions.Regex]::new($pattern)
    if (-not $regex.IsMatch($content)) { throw "version field not found by regex" }
    $newContent = $regex.Replace($content, '${1}' + $newVersionBare + '${2}', 1)
    [System.IO.File]::WriteAllText($packageJsonPath, $newContent, [System.Text.UTF8Encoding]::new($false))
    Write-Log "package.json written (regex replace, UTF-8 no BOM)"

    # Verify write result
    $verifyJson = Get-Content $packageJsonPath -Raw -ErrorAction Stop | ConvertFrom-Json
    if ($verifyJson.version -ne $newVersionBare) {
        throw "Version verification failed: file shows '$($verifyJson.version)', expected '$newVersionBare'"
    }
    Write-Log "Version verified: $($verifyJson.version)"

    # ── Step 5: git add ──────────────────────────────────────────────────────
    Format-LogBlock "Step 5 - git add package.json"

    & git add package.json
    if ($LASTEXITCODE -ne 0) { throw "git add failed with exit code $LASTEXITCODE" }
    Write-Log "git add completed"

    # ── Step 6: git commit ───────────────────────────────────────────────────
    Format-LogBlock "Step 6 - git commit"

    $commitMsg = "release $newVersionTag"
    & git commit -m $commitMsg
    if ($LASTEXITCODE -ne 0) { throw "git commit failed with exit code $LASTEXITCODE" }
    Write-Log "git commit completed: $commitMsg"

    # ── Step 7: git push ─────────────────────────────────────────────────────
    Format-LogBlock "Step 7 - git push origin"

    & git push origin $currentBranch
    if ($LASTEXITCODE -ne 0) { throw "git push failed with exit code $LASTEXITCODE" }
    Write-Log "git push completed"

    # ── Step 8: Create git tag ───────────────────────────────────────────────
    Format-LogBlock "Step 8 - Create git tag"

    $tagName = $newVersionTag
    # Double-check local tag doesn't already exist (safety net)
    $existingTag = & git tag -l $tagName 2>&1
    if ($existingTag) {
        Write-Log "Local tag $tagName already exists, skipping creation."
    } else {
        & git tag -a $tagName -m $commitMsg
        if ($LASTEXITCODE -ne 0) { throw "git tag failed with exit code $LASTEXITCODE" }
        Write-Log "git tag created: $tagName"
    }

    # ── Step 9: git push tag ─────────────────────────────────────────────────
    Format-LogBlock "Step 9 - git push origin tag"

    & git push origin $tagName
    if ($LASTEXITCODE -ne 0) { throw "git push tag failed with exit code $LASTEXITCODE" }
    Write-Log "git push tag completed"

    # ── Final summary ────────────────────────────────────────────────────────
    $summary = @"
Version: $oldVersion -> $newVersionTag
Branch:  $currentBranch
Steps:   add -> commit -> push -> tag -> push tag
"@
    Format-LogBlock "PUBLISH COMPLETED" $summary
    Write-Log "All steps completed successfully."

}
catch {
    Format-LogBlock "PUBLISH FAILED" ""
    Write-Log "Error: $_" -Level "ERROR"
    Write-Log "Check the log above for details." -Level "ERROR"
    exit 1
}
