import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import * as vscode from "vscode";
import { handleRequestAgentsTree, handleSaveExpandedPaths, loadExpandedPaths } from "./agentTree";
import { handleFetchModelscopeAgents as _handleFetchModelscopeAgents } from "./modelscopeHandler";
import type { ModelScopeAgentItem, ModelScopeAgentListResponse } from "./modelscopeTypes";

function filePathToFileUri(p: string): string {
  return require("url").pathToFileURL(p).href;
}

function parseFileUriList(raw: string): string[] {
  const { fileURLToPath } = require("url");
  const out: string[] = [];
  for (const line of String(raw || "").split(/\r?\n/)) {
    const t = line.trim();
    if (!t) continue;
    if (!/^file:/i.test(t)) {
      console.warn("[parseFileUriList] skipped non-file uri: " + t);
      continue;
    }
    try {
      const m = t.match(/^file:\/\/([^\/]+)(\/.*)?$/i);
      if (m && m[1] && m[1].toLowerCase() !== "localhost") {
        console.warn("[parseFileUriList] skipped remote file uri: " + t);
        continue;
      }
      const p = fileURLToPath(t);
      if (p) out.push(p);
    } catch (e) {
      console.warn('[parseFileUriList] failed to parse uri "' + t + '": ' + String(e));
    }
  }
  return out;
}

function setSystemClipboardFileList(p: string, isCut: boolean): void {
  try {
    const absPath = path.resolve(p);
    if (!fs.existsSync(absPath)) {
      console.warn("[setSystemClipboardFileList] path not found: " + absPath);
      return;
    }
    const { execSync } = require("child_process");
    if (process.platform === "win32") {
      // Windows：PowerShell CF_HDROP + Preferred DropEffect（isCut=true 为 Move=2，否则 Copy=1）
      const dropEffect = isCut ? 2 : 1;
      const psScript =
        "[Console]::OutputEncoding = [System.Text.Encoding]::UTF8; " +
        "Add-Type -AssemblyName System.Windows.Forms; " +
        "$files = New-Object System.Collections.Specialized.StringCollection; " +
        "$files.Add('" + absPath + "'); " +
        "$data = New-Object System.Windows.Forms.DataObject; " +
        "$data.SetFileDropList($files); " +
        "$ms = New-Object System.IO.MemoryStream(4); " +
        "$bw = New-Object System.IO.BinaryWriter($ms); " +
        "$bw.Write([int]" + dropEffect + "); " +
        "$bw.Flush(); $ms.Position = 0; " +
        "$data.SetData('Preferred DropEffect', $ms); " +
        "[System.Windows.Forms.Clipboard]::SetDataObject($data, $true); " +
        "Write-Output 'CLIP_FILE_SET_OK';";
      const encoded = Buffer.from(psScript, "utf16le").toString("base64");
      try {
        const out = execSync("powershell -NoProfile -STA -EncodedCommand " + encoded, {
          timeout: 15000,
          encoding: "utf8",
        });
        if (!String(out || "").includes("CLIP_FILE_SET_OK")) {
          console.error("[setSystemClipboardFileList] marker missing, stdout:", String(out || ""));
        } else {
          console.log("[setSystemClipboardFileList] clipboard write OK: " + absPath + (isCut ? " (cut)" : " (copy)"));
        }
      } catch (execErr) {
        console.error("[setSystemClipboardFileList] execSync failed:", execErr);
      }
    } else if (process.platform === "darwin") {
      // macOS：通过以「class furl」（文件 URL）形式写入剪贴板，
      // Finder 等应用可识别为文件。路径经 osascript "--" 参数传入，避免转义问题。
      // 注：macOS 剪贴板不区分 cut/copy，isCut 仅用于 Windows 分支。
      const script =
        "on run {f}\n" +
        "  tell application \"Finder\" to set the clipboard to POSIX file f as «class furl»\n" +
        "end run";
      try {
        execSync("osascript -e " + JSON.stringify(script) + " -- " + JSON.stringify(absPath), {
          timeout: 15000,
          encoding: "utf8",
        });
        console.log("[setSystemClipboardFileList] clipboard write OK (darwin): " + absPath);
      } catch (execErr) {
        console.error("[setSystemClipboardFileList] osascript failed (darwin):", execErr);
      }
    } else {
      // Linux：优先 xclip，其次 wl-copy（Wayland），无工具时降级为直接写 UTF-8 URI 文本。
      const uri = filePathToFileUri(absPath);
      const tmpUriFile = path.join(os.tmpdir(), "openclaw-clip-uri-" + Date.now() + ".txt");
      fs.writeFileSync(tmpUriFile, uri + "\n", "utf8");
      const mkCommand = (bin: string, args: string[]) => {
        const cmd = bin + " " + args.map((a) => JSON.stringify(a)).join(" ") + " < " + JSON.stringify(tmpUriFile);
        return cmd;
      };
      let succeeded = false;
      try {
        execSync(mkCommand("xclip", ["-selection", "clipboard", "-t", "text/uri-list"]), {
          timeout: 15000,
          encoding: "utf8",
        });
        succeeded = true;
      } catch (e1) {
        try {
          execSync(mkCommand("wl-copy", ["-t", "text/uri-list"]), {
            timeout: 15000,
            encoding: "utf8",
          });
          succeeded = true;
        } catch (e2) {
          console.warn("[setSystemClipboardFileList] xclip/wl-copy unavailable, fallback to text uri-list");
        }
      }
      try { fs.unlinkSync(tmpUriFile); } catch (e) { /* ignore */ }
      if (succeeded) {
        console.log("[setSystemClipboardFileList] clipboard write OK (linux): " + absPath);
      } else {
        // 降级：直接把 URI 文本写进剪贴板（粘贴时仍可被我们的读取端解析）
        try {
          execSync(mkCommand("xclip", ["-selection", "clipboard"]), { timeout: 15000, encoding: "utf8" });
          console.log("[setSystemClipboardFileList] clipboard write OK (linux, text fallback): " + absPath);
        } catch (e3) {
          try {
            execSync(mkCommand("wl-copy", []), { timeout: 15000, encoding: "utf8" });
            console.log("[setSystemClipboardFileList] clipboard write OK (linux, text fallback): " + absPath);
          } catch (e4) {
            console.error("[setSystemClipboardFileList] clipboard write failed (linux):", e4);
          }
        }
      }
      return;
    }
  } catch (err) {
    console.error("[setSystemClipboardFileList] error:", err);
  }
}

function readSystemClipboardFiles(): { paths: string[]; operation: string } | null {
  try {
    const { execSync } = require("child_process");
    if (process.platform === "win32") {
      // Windows：PowerShell 读 CF_HDROP + Preferred DropEffect
      // 脚本输出格式：第一行 OK/EMPTY，第二行起每行一个绝对路径，最后一行 OP:cut|copy
      const psScript =
        "[Console]::OutputEncoding = [System.Text.Encoding]::UTF8; " +
        "Add-Type -AssemblyName System.Windows.Forms; " +
        "$files = [System.Windows.Forms.Clipboard]::GetFileDropList(); " +
        "if ($files -eq $null -or $files.Count -eq 0) { Write-Output 'EMPTY'; exit; } " +
        "$data = [System.Windows.Forms.Clipboard]::GetDataObject(); " +
        "$op = 'copy'; " +
        "if ($data -ne $null -and $data.GetDataPresent('Preferred DropEffect')) { " +
        "  $ms = $data.GetData('Preferred DropEffect'); " +
        "  if ($ms -ne $null) { try { $ms.Position = 0; $br = New-Object System.IO.BinaryReader($ms); " +
        "    $intVal = $br.ReadInt32(); $br.Close(); " +
        "    if ($intVal -eq 2) { $op = 'cut' } elseif ($intVal -eq 1) { $op = 'copy' } " +
        "  } finally { if ($ms) { $ms.Dispose() } } } " +
        "} " +
        "Write-Output 'OK'; " +
        "foreach ($f in $files) { Write-Output $f }; " +
        "Write-Output ('OP:' + $op);";
      const encoded = Buffer.from(psScript, "utf16le").toString("base64");
      try {
        const out = execSync("powershell -NoProfile -STA -EncodedCommand " + encoded, {
          timeout: 15000,
          encoding: "utf8",
        });
        const lines = String(out || "").trim().split(/\r\n|\n/);
        if (lines.length === 0 || lines[0] !== "OK") {
          return null;
        }
        // 最后一行是 OP:cut|copy
        const opLine = lines[lines.length - 1];
        if (!opLine.startsWith("OP:")) {
          return null;
        }
        const opStr = opLine.substring(3);
        const operation = opStr === "cut" ? "cut" : "copy";
        // 路径在第 1 到倒数第二行之间
        const paths = lines.slice(1, -1).map(line => line.trim()).filter(line => line.length > 0);
        if (paths.length === 0) {
          return null;
        }
        console.log("[readSystemClipboardFiles] read " + paths.length + " file(s) from clipboard, op=" + operation);
        return { paths, operation };
      } catch (execErr) {
        console.error("[readSystemClipboardFiles] execSync failed:", execErr);
        return null;
      }
    } else if (process.platform === "darwin") {
      // macOS：AppleScript 读 furl（文件 URL）列表。
      const script =
        "try\n" +
        "  set theFiles to the clipboard as «class furl»\n" +
        "  if theFiles is \"\" then return \"EMPTY\"\n" +
        "  set out to \"OK\"\n" +
        "  repeat with f in theFiles\n" +
        "    set out to out & linefeed & (f as string)\n" +
        "  end repeat\n" +
        "  return out\n" +
        "on error\n" +
        "  return \"EMPTY\"\n" +
        "end try";
      try {
        const out = execSync("osascript -e " + JSON.stringify(script), {
          timeout: 15000,
          encoding: "utf8",
        });
        const lines = String(out || "").trim().split(/\r?\n/);
        if (lines.length === 0 || lines[0] !== "OK") {
          return null;
        }
        const paths = parseFileUriList(lines.slice(1).join("\n"));
        if (paths.length === 0) return null;
        console.log("[readSystemClipboardFiles] read " + paths.length + " file(s) from clipboard (darwin)");
        // macOS 剪贴板不区分 cut/copy
        return { paths, operation: "copy" };
      } catch (execErr) {
        console.error("[readSystemClipboardFiles] osascript failed (darwin):", execErr);
        return null;
      }
    } else {
      // Linux：优先 xclip，其次 wl-paste。
      const readCmd = (bin: string, args: string[]) => bin + " " + args.map((a) => JSON.stringify(a)).join(" ");
      let out: string | null = null;
      try {
        out = String(execSync(readCmd("xclip", ["-selection", "clipboard", "-o", "-t", "text/uri-list"]), {
          timeout: 15000,
          encoding: "utf8",
        }) || "");
      } catch (e1) {
        try {
          out = String(execSync(readCmd("wl-paste", ["-t", "text/uri-list"]), {
            timeout: 15000,
            encoding: "utf8",
          }) || "");
        } catch (e2) {
          console.warn("[readSystemClipboardFiles] xclip/wl-paste unavailable (linux):", e2);
          return null;
        }
      }
      const paths = parseFileUriList(out || "");
      if (paths.length === 0) return null;
      console.log("[readSystemClipboardFiles] read " + paths.length + " file(s) from clipboard (linux)");
      // Linux 剪贴板不区分 cut/copy
      return { paths, operation: "copy" };
    }
  } catch (err) {
    console.error("[readSystemClipboardFiles] error:", err);
    return null;
  }
}

let pendingClipboard: { path: string; operation: 'cut' | 'copy' } | null = null;

/**
 * Handle messages from the webview.
 * Extracted from OpenClawChatView.onDidReceiveMessage (chatView.ts L717–L972).
 * @param msg 消息对象
 * @param ctx 上下文对象（含各 handler 回调与扩展状态）
 */
export async function handleWebviewMessage(
  msg: any,
  ctx: {
    activeAgent: any;
    agents: any;
    agentsDir: any;
    context: any;
    currentModel: any;
    currentSessionKey: any;
    cycleThinking: any;
    cycleVerbose: any;
    gateway: any;
    gatewayUrl: any;
    gwSessionKey: any;
    handleDeleteSession: any;
    handleLoadDefaults: any;
    handleLoadMessages: any;
    handleOpenWorkdir: any;
    handleRequestAgents: any;
    handleRequestModels: any;
    handleRequestSessions: any;
    handleRequestTasks: any;
    handleRequestCancelTask: any;
    handleSearchFiles: any;
    handleSendMessage: any;
    handleStopStream: any;
    handleSwitchAgent: any;
    handleToggleSupervision: any;
    log: any;
    messageHistory: any;
    postToWebview: any;
    resolveSession: any;
    serverVersion: any;
    supervisionEnabled: any;
    thinkingLevel: any;
    verboseLevel: any;
  },
  webviewView?: vscode.WebviewView
): Promise<void> {
      switch (msg.type) {
        case "webviewReady":
          // Load agents first, so resolveActiveAgent can find the correct agent
          if (ctx.gateway.connected) {
            await ctx.handleRequestAgents();
            await ctx.handleRequestModels();
            await ctx.handleRequestSessions();
            await ctx.handleRequestTasks();  // 新增：webviewReady 时触发任务拉取
            await ctx.handleLoadDefaults();
            await ctx.handleLoadMessages(ctx.currentSessionKey);
          }
          // Now send init with the resolved agent and session key
          // 携带缓存的 serverVersion，避免两条 init 互相覆盖版本号
          ctx.postToWebview({
            type: "init",
            sessionKey: ctx.currentSessionKey,
            gwSessionKey: ctx.gwSessionKey(),
            model: ctx.currentModel,
            connected: ctx.gateway.connected,
            agent: ctx.activeAgent,
            gatewayUrl: ctx.gatewayUrl,
            thinkingLevel: ctx.thinkingLevel,
            verboseLevel: ctx.verboseLevel,
            messageHistory: ctx.messageHistory,
            supervisionEnabled: ctx.supervisionEnabled,
            version: ctx.serverVersion
          });
          break;
        case "sendMessage":
          await ctx.handleSendMessage(msg.text, msg.fileRefs, msg.attachments);
          break;
        case "stopStream":
          await ctx.handleStopStream();
          break;
        case "selectModel":
          ctx.currentModel = msg.model;
          break;
        case "cycleThinking":
          await ctx.cycleThinking();
          break;
        case "cycleVerbose":
          await ctx.cycleVerbose();
          break;
        case "requestModels":
          await ctx.handleRequestModels();
          break;
        case "requestSessions":
          await ctx.handleRequestSessions();
          break;
        case "requestAgents":
          await ctx.handleRequestAgents();
          break;
        case "requestAgentsTree":
          await handleRequestAgentsTree(ctx.agentsDir, ctx.postToWebview.bind(ctx), ctx.log.bind(ctx), ctx.context);
          break;
        case "saveExpandedPaths":
          // webview 传来的展开状态：持久化到 globalState，并在下次请求时随树数据下发
          if (ctx.context && msg.expandedPaths) {
            handleSaveExpandedPaths(msg.expandedPaths, ctx.context, ctx.log.bind(ctx));
          } else {
            ctx.log("[saveExpandedPaths] skipped: missing context or expandedPaths");
          }
          break;
        case "fetchModelscopeAgents":
          await _handleFetchModelscopeAgents(ctx, msg.page || 1, msg.pageSize || 12, msg.category || '');
          break;
        case "openModelscopeAgent":
          if (msg.agentId) {
            vscode.env.openExternal(vscode.Uri.parse("https://modelscope.cn/agents/" + msg.agentId));
          }
          break;
        case "requestTasks":
          await ctx.handleRequestTasks();
          break;
        case "requestCancelTask":
          await ctx.handleRequestCancelTask(msg.taskId);
          break;
        case "switchSession": {
          const ssGwKey = msg.sessionKey || '';
          // 从完整 gateway sessionKey 解析 agentId（格式: agent:<agentId>:<localKey>）
          const agentMatch = ssGwKey.match(/^agent:([^:]+):/);
          let sessionAgentId: string | undefined;
          if (agentMatch) {
            sessionAgentId = agentMatch[1];
            const ag = ctx.agents.find((a: { id: string }) => a.id === sessionAgentId);
            if (ag && (!ctx.activeAgent || ctx.activeAgent.id !== sessionAgentId)) {
              ctx.activeAgent = ag;
              ctx.postToWebview({ type: "agentSwitched", agent: ctx.activeAgent });
            }
          }
          const ssLocalKey = ctx.resolveSession(ssGwKey);
          ctx.currentSessionKey = ssLocalKey;
          await ctx.handleLoadMessages(ssLocalKey, sessionAgentId, msg.sessionId);
          break;
        }
        case "switchTab":
          // 从 sessionKey 解析 agentId（格式: agent:<agentId>:<localKey>）
          if (msg.sessionKey) {
            const match = msg.sessionKey.match(/^agent:([^:]+):/);
            if (match) {
              const agentId = match[1];
              const ag = ctx.agents.find((a: { id: string }) => a.id === agentId);
              if (ag) {
                ctx.activeAgent = ag;
              }
            }
          }
          // 也兼容显式传入的 agentId
          if (msg.agentId && (!ctx.activeAgent || ctx.activeAgent.id !== msg.agentId)) {
            const ag = ctx.agents.find((a: { id: string }) => a.id === msg.agentId);
            if (ag) {
              ctx.activeAgent = ag;
            } else {
              const byName = ctx.agents.find((a: { id: string; name?: string }) => (a.name || "") === msg.agentId);
              if (byName) ctx.activeAgent = byName;
            }
          }
          const localSessionKey = ctx.resolveSession(msg.sessionKey || "main");
          ctx.currentSessionKey = localSessionKey;
          await ctx.handleLoadMessages(localSessionKey, undefined, msg.sessionId);
          ctx.postToWebview({ type: "agentSwitched", agent: ctx.activeAgent });
          break;
        case "confirmDeleteSession": {
          const sessionKey = msg.sessionKey || '';
          if (!sessionKey) break;
          const confirm = await vscode.window.showWarningMessage(
            vscode.l10n.t('是否删除此会话？'),
            { modal: true },
            { title: vscode.l10n.t('是') },
            { title: vscode.l10n.t('否'), isCloseAffordance: true } as vscode.MessageItem
          );
          if (confirm?.title === vscode.l10n.t('是')) {
            await ctx.handleDeleteSession(sessionKey);
          }
          break;
        }
        case "deleteSession":
          await ctx.handleDeleteSession(msg.sessionKey);
          break;
        case "addChatTabFromSession": {
          const sessionKey = msg.sessionKey || '';
          const deviceName = msg.deviceName || sessionKey;
          // 会话一律创建专属 tab（webview 按 sessionKey 去重，已存在则直接切换），绝不触碰 Chat tab
          const parts = deviceName.split(':');
          let tabLabel = parts[0].trim();
          if (tabLabel.length > 15) tabLabel = tabLabel.substring(0, 15) + '…';
          // 从 sessionKey 解析 agentId
          let tabAgentId = 'main';
          const match = sessionKey.match(/^agent:([^:]+):/);
          if (match) tabAgentId = match[1];
          const newTab = {
            id: 'tab-' + sessionKey + '-' + Date.now(),
            label: tabLabel,
            agentId: tabAgentId,
            sessionKey: sessionKey,
            sessionId: msg.sessionId,
            messages: []
          };
          // 通知 webview 创建 tab（webview 侧会做去重）
          ctx.postToWebview({ type: 'addChatTab', tab: newTab });
          // 加载该会话历史（绑定到该 session 所属 agent，而不是当前 activeAgent）
          ctx.currentSessionKey = ctx.resolveSession(sessionKey);
          await ctx.handleLoadMessages(ctx.currentSessionKey, tabAgentId, msg.sessionId);
          break;
        }
        case "switchAgent":
          await ctx.handleSwitchAgent(msg.agentId);
          break;
        case "copyCommand":
          await vscode.env.clipboard.writeText(msg.text);
          vscode.window.showInformationMessage(vscode.l10n.t("Copied to clipboard"));
          break;
        case "copyImage": {
          const dataUrl = msg.dataUrl;
          if (dataUrl && typeof dataUrl === "string") {
            try {
              const base64Data = dataUrl.replace(/^data:image\/png;base64,/, "");
              const os = require("os");
              const tmpB64 = path.join(os.tmpdir(), "openclaw-clip-" + Date.now() + ".b64");
              fs.writeFileSync(tmpB64, base64Data, "utf8");
              // base64 经临时文件传入 PowerShell（规避命令行 32KB 限制），
              // 内存流解码后写入剪贴板；单引号字符串内使用原始单反斜杠路径
              const psScript =
                "$b64 = [IO.File]::ReadAllText('" + tmpB64 + "').Trim(); " +
                "Add-Type -AssemblyName System.Drawing; " +
                "Add-Type -AssemblyName System.Windows.Forms; " +
                "$bytes = [Convert]::FromBase64String($b64); " +
                "$ms = New-Object System.IO.MemoryStream(,$bytes); " +
                "$img = [System.Drawing.Image]::FromStream($ms); " +
                "[System.Windows.Forms.Clipboard]::SetImage($img); " +
                "$img.Dispose(); $ms.Dispose(); " +
                "Write-Output 'CLIP_SET_OK';";
              const encoded = Buffer.from(psScript, "utf16le").toString("base64");
              const child_process = require("child_process");
              child_process.exec(
                "powershell -NoProfile -STA -EncodedCommand " + encoded,
                { timeout: 15000 },
                (pErr: any, pStdout: any) => {
                  try { fs.unlinkSync(tmpB64); } catch (e) { /* ignore */ }
                  if (pErr || !String(pStdout || "").includes("CLIP_SET_OK")) {
                    console.error("[copyImage] clipboard write failed:", pErr ? String(pErr) : "marker missing", String(pStdout || ""));
                    vscode.window.showErrorMessage(vscode.l10n.t("Failed to copy image, please check output log"));
                  } else {
                    console.log("[copyImage] clipboard write OK");
                  }
                }
              );
            } catch (copyErr) {
              console.error("copyImage failed:", copyErr);
              vscode.window.showErrorMessage(vscode.l10n.t("Copy image failed: {0}", String(copyErr)));
            }
          }
          break;
        }
        case "exportImage": {
          const dataUrl = msg.dataUrl;
          if (!dataUrl || typeof dataUrl !== "string") {
            vscode.window.showErrorMessage(vscode.l10n.t("Export failed: no image data received"));
            break;
          }
          try {
            const base64Data = dataUrl.replace(/^data:image\/png;base64,/, "");
            const ts = Date.now();
            const defaultName = "mermaid-" + ts + ".png";
            const saveUri = await vscode.window.showSaveDialog({
              title: vscode.l10n.t("Export Mermaid diagram as PNG"),
              defaultUri: vscode.Uri.file(path.join(require("os").homedir(), "Downloads", defaultName)),
              filters: { [vscode.l10n.t("PNG Image (*.png)")]: ["png"] }
            });
            if (!saveUri) {
              console.log("[exportImage] user cancelled save dialog");
              break;
            }
            await vscode.workspace.fs.writeFile(saveUri, Buffer.from(base64Data, "base64"));
            console.log("[exportImage] file written:", saveUri.fsPath);
            vscode.window.showInformationMessage(vscode.l10n.t("Exported: {0}", saveUri.fsPath));
          } catch (exportErr) {
            console.error("exportImage failed:", exportErr);
            vscode.window.showErrorMessage(vscode.l10n.t("Export failed: {0}", String(exportErr)));
          }
          break;
        }
        case "notify":
          if (msg && typeof msg.text === "string" && msg.text) {
            vscode.window.showInformationMessage(msg.text);
          }
          break;
        case "mermaidError":
          // Mermaid渲染失败时通过VSCode通知提示用户，不污染webview UI
          if (msg.text) {
            vscode.window.showWarningMessage(
              vscode.l10n.t('Mermaid diagram render failed: {0}', msg.text)
            );
          }
          break;
        case "openSettings":
          vscode.commands.executeCommand("workbench.action.openSettings", "openclaw");
          break;
        case "openModelPicker":
          vscode.commands.executeCommand("openclaw.settings");
          break;
        case "searchFiles":
          await ctx.handleSearchFiles(msg.query, msg.requestId);
          break;
        case "openWorkdir":
          await ctx.handleOpenWorkdir();
          break;
        case "openFile": {
          const p = msg.path as string;
          if (p) {
            try {
              const uri = vscode.Uri.file(p);
              const doc = await vscode.workspace.openTextDocument(uri);
              await vscode.window.showTextDocument(doc, { preview: true });
            } catch (e: any) {
              vscode.window.showErrorMessage(vscode.l10n.t('Failed to open file') + ': ' + (e?.message || e));
            }
          }
          break;
        }
        case "createAgent":
          if (msg.path) {
            // 在指定目录树节点路径下创建智能体（写入提示词到聊天输入框）
            vscode.commands.executeCommand("openclaw.createAgent", vscode.Uri.file(msg.path));
          }
          break;
        case "fileCut": {
          const p = msg.path as string;
          if (p) {
            pendingClipboard = { path: p, operation: "cut" };
            setSystemClipboardFileList(p, true);
            ctx.postToWebview({ type: "clipboardState", hasPendingClipboard: true });
            ctx.log("[fileCut] clipboard set: cut " + p);
          }
          break;
        }
        case "fileCopy": {
          const p = msg.path as string;
          if (p) {
            pendingClipboard = { path: p, operation: "copy" };
            setSystemClipboardFileList(p, false);
            ctx.postToWebview({ type: "clipboardState", hasPendingClipboard: true });
            ctx.log("[fileCopy] clipboard set: copy " + p);
          }
          break;
        }
        case "filePaste": {
          let src = pendingClipboard;
          if (!src) {
            const sysClipboard = readSystemClipboardFiles();
            if (sysClipboard && sysClipboard.paths.length > 0) {
              for (const filePath of sysClipboard.paths) {
                src = { path: filePath, operation: (sysClipboard.operation as 'cut' | 'copy') };
                if (!src) continue;
                const targetDir2 = msg.targetDir || msg.path;
                if (!targetDir2 || !fs.existsSync(src.path)) {
                  ctx.log("[filePaste] invalid source: " + src.path);
                  continue;
                }
                try {
                  const srcName = path.basename(src.path);
                  let destPath = path.join(targetDir2, srcName);
                  let counter = 1;
                  while (fs.existsSync(destPath)) {
                    const ext = path.extname(srcName);
                    const base = ext ? srcName.slice(0, srcName.length - ext.length) : srcName;
                    destPath = path.join(targetDir2, base + " - Copy" + (counter > 1 ? counter : "") + (ext ? ext : ""));
                    counter++;
                  }
                  if (src.operation === "cut") {
                    const srcRoot = path.parse(src.path).root;
                    const destRoot = path.parse(destPath).root;
                    if (path.dirname(src.path) !== path.dirname(destPath) || srcRoot !== destRoot) {
                      if (fs.existsSync(src.path) && fs.statSync(src.path).isDirectory()) {
                        await fs.promises.cp(src.path, destPath, { recursive: true });
                        await fs.promises.rm(src.path, { recursive: true, force: true });
                      } else {
                        await fs.promises.copyFile(src.path, destPath);
                        await fs.promises.unlink(src.path);
                      }
                    } else {
                      await fs.promises.rename(src.path, destPath);
                    }
                  } else {
                    if (fs.existsSync(src.path) && fs.statSync(src.path).isDirectory()) {
                      await fs.promises.cp(src.path, destPath, { recursive: true });
                    } else {
                      await fs.promises.copyFile(src.path, destPath);
                    }
                  }
                  ctx.log("[filePaste] pasted " + src.path + " -> " + destPath);
                  handleRequestAgentsTree(ctx.agentsDir, ctx.postToWebview.bind(ctx), ctx.log.bind(ctx), ctx.context);
                } catch (err: any) {
                  ctx.log("[filePaste] error: " + (err?.message || err));
                  vscode.window.showErrorMessage(vscode.l10n.t("Paste failed: {0}", String(err?.message || err)));
                }
              }
              pendingClipboard = null;
              ctx.postToWebview({ type: "clipboardState", hasPendingClipboard: false });
              break;
            } else {
              ctx.log("[filePaste] no pending clipboard");
              break;
            }
          }
          if (!src) break;
          const targetDir = msg.targetDir || msg.path;
          if (!targetDir || !fs.existsSync(src.path)) {
            ctx.log("[filePaste] invalid source: " + src.path);
            break;
          }
          try {
            const srcName = path.basename(src.path);
            let destPath = path.join(targetDir, srcName);
            let counter = 1;
            while (fs.existsSync(destPath)) {
              const ext = path.extname(srcName);
              const base = ext ? srcName.slice(0, srcName.length - ext.length) : srcName;
              destPath = path.join(targetDir, base + " - Copy" + (counter > 1 ? counter : "") + (ext ? ext : ""));
              counter++;
            }
            if (src.operation === "cut") {
              const srcRoot = path.parse(src.path).root;
              const destRoot = path.parse(destPath).root;
              if (path.dirname(src.path) !== path.dirname(destPath) || srcRoot !== destRoot) {
                if (fs.existsSync(src.path) && fs.statSync(src.path).isDirectory()) {
                  await fs.promises.cp(src.path, destPath, { recursive: true });
                  await fs.promises.rm(src.path, { recursive: true, force: true });
                } else {
                  await fs.promises.copyFile(src.path, destPath);
                  await fs.promises.unlink(src.path);
                }
              } else {
                await fs.promises.rename(src.path, destPath);
              }
            } else {
              if (fs.existsSync(src.path) && fs.statSync(src.path).isDirectory()) {
                await fs.promises.cp(src.path, destPath, { recursive: true });
              } else {
                await fs.promises.copyFile(src.path, destPath);
              }
            }
            pendingClipboard = null;
            ctx.postToWebview({ type: "clipboardState", hasPendingClipboard: false });
            ctx.log("[filePaste] pasted " + src.path + " -> " + destPath);
            handleRequestAgentsTree(ctx.agentsDir, ctx.postToWebview.bind(ctx), ctx.log.bind(ctx), ctx.context);
          } catch (err: any) {
            ctx.log("[filePaste] error: " + (err?.message || err));
            vscode.window.showErrorMessage(vscode.l10n.t("Paste failed: {0}", String(err?.message || err)));
          }
          break;
        }
        case "fileDelete": {
          const filePath = msg.path as string;
          const fileName = msg.name as string;
          
          if (!filePath || !fs.existsSync(filePath)) {
            ctx.log(`[fileDelete] path not found: ${filePath}`);
            vscode.window.showErrorMessage(vscode.l10n.t("文件/文件夹不存在: {0}", fileName));
            break;
          }
          
          const stat = fs.statSync(filePath);
          const isDirectory = stat.isDirectory();
          const itemType = isDirectory ? "文件夹" : "文件";
          
          const choice = await vscode.window.showWarningMessage(
            vscode.l10n.t("确认删除{itemType} '{name}'?", { itemType, name: fileName }),
            { modal: true },
            { title: vscode.l10n.t("删除") },
            { title: vscode.l10n.t("取消"), isCloseAffordance: true } as vscode.MessageItem
          );
          if (choice?.title !== vscode.l10n.t("删除")) {
            break;
          }
          
          try {
            if (isDirectory) {
              await fs.promises.rm(filePath, { recursive: true, force: true });
            } else {
              await fs.promises.unlink(filePath);
            }
            ctx.log(`[fileDelete] 成功删除${itemType}: ${filePath}`);
            handleRequestAgentsTree(ctx.agentsDir, ctx.postToWebview.bind(ctx), ctx.log.bind(ctx), ctx.context);
          } catch (err: any) {
            ctx.log(`[fileDelete] 删除${itemType}失败: ${err?.message || err}`);
            vscode.window.showErrorMessage(
              vscode.l10n.t("删除{0}失败: {1}", itemType, String(err?.message || err))
            );
          }
          break;
        }
        case "fileMove": {
          const sourcePath = msg.sourcePath as string;
          const targetDir = msg.targetDir as string;

          if (!sourcePath || !targetDir || typeof sourcePath !== 'string' || typeof targetDir !== 'string') {
            ctx.log(`[fileMove] invalid parameters: sourcePath=${sourcePath}, targetDir=${targetDir}`);
            vscode.window.showErrorMessage(vscode.l10n.t("移动参数无效"));
            break;
          }

          if (!fs.existsSync(sourcePath)) {
            ctx.log(`[fileMove] source not found: ${sourcePath}`);
            vscode.window.showErrorMessage(vscode.l10n.t("源路径不存在: {0}", sourcePath));
            break;
          }

          if (!fs.existsSync(targetDir)) {
            ctx.log(`[fileMove] target dir not found: ${targetDir}`);
            vscode.window.showErrorMessage(vscode.l10n.t("目标目录不存在: {0}", targetDir));
            break;
          }

          const srcResolved = path.resolve(sourcePath);
          const targetResolved = path.resolve(targetDir);

          if (srcResolved === targetResolved) {
            ctx.log(`[fileMove] invalid move: source equals target`);
            vscode.window.showErrorMessage(vscode.l10n.t("源和目标不能相同"));
            break;
          }

          if (targetResolved.startsWith(srcResolved + path.sep)) {
            ctx.log(`[fileMove] invalid move: target is inside source`);
            vscode.window.showErrorMessage(vscode.l10n.t("不能将目录移动到其自身或子目录中"));
            break;
          }

          const baseName = path.basename(sourcePath);
          const destPath = path.join(targetDir, baseName);

          if (fs.existsSync(destPath)) {
            ctx.log(`[fileMove] destination exists: ${destPath}`);
            vscode.window.showErrorMessage(vscode.l10n.t("目标位置已存在同名文件/文件夹: {0}", baseName));
            break;
          }

          try {
            await fs.promises.rename(sourcePath, destPath);
            ctx.log(`[fileMove] moved ${sourcePath} -> ${destPath}`);
            handleRequestAgentsTree(ctx.agentsDir, ctx.postToWebview.bind(ctx), ctx.log.bind(ctx), ctx.context);
          } catch (err: any) {
            ctx.log(`[fileMove] error: ${err?.message || err}`);
            vscode.window.showErrorMessage(vscode.l10n.t("移动失败: {0}", String(err?.message || err)));
          }
          break;
        }
        case "fileRename": {
          const oldPath = msg.path as string;
          const oldName = msg.name as string;
          const newName = msg.newName as string;
          if (!oldPath || !fs.existsSync(oldPath)) {
            ctx.log(`[fileRename] path not found: ${oldPath}`);
            vscode.window.showErrorMessage(vscode.l10n.t("文件/文件夹不存在: {0}", oldName));
            break;
          }
          if (!newName || newName === oldName) break;
          const parentDir = path.dirname(oldPath);
          const newPath = path.join(parentDir, newName);
          try {
            await fs.promises.rename(oldPath, newPath);
            ctx.log(`[fileRename] 重命名成功: ${oldPath} -> ${newPath}`);
            handleRequestAgentsTree(ctx.agentsDir, ctx.postToWebview.bind(ctx), ctx.log.bind(ctx), ctx.context);
          } catch (err: any) {
            ctx.log(`[fileRename] 重命名失败: ${err?.message || err}`);
            vscode.window.showErrorMessage(vscode.l10n.t("重命名失败: {0}", String(err?.message || err)));
          }
          break;
        }
        case "toggleSupervision":
          await ctx.handleToggleSupervision(msg.enabled);
          break;
        case "fileNew": {
          const dirPath = msg.path as string;
          if (!dirPath || !fs.existsSync(dirPath)) {
            ctx.log(`[fileNew] path not found: ${dirPath}`);
            vscode.window.showErrorMessage(vscode.l10n.t("目录不存在: {0}", dirPath));
            break;
          }
          const fileName = (msg.name as string || "").trim();
          if (!fileName) {
            ctx.log(`[fileNew] 文件名为空`);
            break;
          }
          const newFilePath = path.join(dirPath, fileName);
          try {
            await fs.promises.writeFile(newFilePath, "");
            ctx.log(`[fileNew] 创建文件成功: ${newFilePath}`);
            handleRequestAgentsTree(ctx.agentsDir, ctx.postToWebview.bind(ctx), ctx.log.bind(ctx), ctx.context);
          } catch (err: any) {
            ctx.log(`[fileNew] 创建文件失败: ${err?.message || err}`);
            vscode.window.showErrorMessage(vscode.l10n.t("创建文件失败: {0}", String(err?.message || err)));
          }
          break;
        }
        case "folderNew": {
          const dirPath = msg.path as string;
          if (!dirPath || !fs.existsSync(dirPath)) {
            ctx.log(`[folderNew] path not found: ${dirPath}`);
            vscode.window.showErrorMessage(vscode.l10n.t("目录不存在: {0}", dirPath));
            break;
          }
          const folderName = (msg.name as string || "").trim();
          if (!folderName) {
            ctx.log(`[folderNew] 文件夹名为空`);
            break;
          }
          const newFolderPath = path.join(dirPath, folderName);
          try {
            await fs.promises.mkdir(newFolderPath, { recursive: true });
            ctx.log(`[folderNew] 创建文件夹成功: ${newFolderPath}`);
            handleRequestAgentsTree(ctx.agentsDir, ctx.postToWebview.bind(ctx), ctx.log.bind(ctx), ctx.context);
          } catch (err: any) {
            ctx.log(`[folderNew] 创建文件夹失败: ${err?.message || err}`);
            vscode.window.showErrorMessage(vscode.l10n.t("创建文件夹失败: {0}", String(err?.message || err)));
          }
          break;
        }
        case "reconnect":
          vscode.commands.executeCommand('openclaw.reconnect');
          break;
      }
}


