import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import * as vscode from "vscode";
import { handleRequestAgentsTree } from "./agentTree";
import { handleFetchModelscopeAgents as _handleFetchModelscopeAgents } from "./modelscopeHandler";
import type { ModelScopeAgentItem, ModelScopeAgentListResponse } from "./modelscopeTypes";

/**
 * Handle messages from the webview.
 * Extracted from OpenClawChatView.onDidReceiveMessage (chatView.ts L717–L972).
 */
export async function handleWebviewMessage(
  msg: any,
  ctx: {
    activeAgent: any;
    agents: any;
    agentsDir: any;
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
          await handleRequestAgentsTree(ctx.agentsDir, ctx.postToWebview.bind(ctx), ctx.log.bind(ctx));
          break;
        case "fetchModelscopeAgents":
          await _handleFetchModelscopeAgents(ctx, msg.page || 1, msg.pageSize || 9);
          break;
        case "openModelscopeAgent":
          if (msg.agentId) {
            vscode.env.openExternal(vscode.Uri.parse("https://modelscope.cn/agents/" + msg.agentId));
          }
          break;
        case "requestTasks":
          await ctx.handleRequestTasks();
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
        case "toggleSupervision":
          await ctx.handleToggleSupervision(msg.enabled);
          break;
        case "reconnect":
          vscode.commands.executeCommand('openclaw.reconnect');
          break;
      }
}


