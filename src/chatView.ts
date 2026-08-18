import * as vscode from "vscode";
import { OpenClawGateway } from "./gateway";
import type { OutputChannel } from "vscode";

interface ChatMessage {
  role: "user" | "assistant";
  text: string;
  timestamp: number;
  contentBlocks?: any[];
}

interface Session {
  key: string;
  displayName?: string;
  agentId?: string;
  totalTokens?: number;
  contextTokens?: number;
  lastActive?: number;
  status?: string;
}

interface Agent {
  id: string;
  name: string;
  emoji?: string;
}

export class OpenClawChatView implements vscode.WebviewViewProvider {
  public static readonly viewType = "openclaw.chatView";
  private view?: vscode.WebviewView;
  private context: vscode.ExtensionContext;
  private gateway: OpenClawGateway;
  private log: (msg: string) => void;
  private messages: ChatMessage[] = [];
  private sessions: Session[] = [];
  private agents: Agent[] = [];
  private activeAgent: Agent = { id: "main", name: "Agent", emoji: "🤖" };
  private currentModel = "";
  private currentSessionKey = "main";
  private thinkingLevel = "";
  private verboseLevel = "";
  private gatewayUrl = "";
  private messageHistory: string[] = [];

  get agentPrefix(): string {
    return `agent:${this.activeAgent.id}:`;
  }

  private gwSessionKey(localKey?: string): string {
    return this.agentPrefix + (localKey || this.currentSessionKey);
  }

  constructor(context: vscode.ExtensionContext, gateway: OpenClawGateway, channel?: OutputChannel) {
    this.context = context;
    this.gateway = gateway;
    this.log = channel
      ? (msg: string) => channel.appendLine(msg)
      : () => {};
    this.messageHistory = context.globalState.get<string[]>("openclaw.messageHistory", []);
    const config = vscode.workspace.getConfiguration("openclaw");
    this.gatewayUrl = config.get<string>("gatewayUrl", "ws://127.0.0.1:18789");
    // Read agentId and sessionKey from configuration
    const configAgentId = config.get<string>("agentId", "");
    const configSessionKey = config.get<string>("sessionKey", "");
    if (configAgentId) {
      this.activeAgent = { id: configAgentId, name: configAgentId, emoji: "🤖" };
    }
    if (configSessionKey) {
      this.currentSessionKey = configSessionKey;
    }
  }

  public show() {
    this.view?.webview.postMessage({ type: "show" });
  }

  public newChat() {
    this.messages = [];
    this.currentSessionKey = "main";
    this.postToWebview({ type: "clearMessages" });
  }

  public updateConnectionStatus(connected: boolean) {
    this.postToWebview({
      type: "connectionStatus",
      connected,
      agent: this.activeAgent
    });
  }

  // Match Obsidian plugin's handleChatEvent
  public handleChatEvent(payload: any) {
    const sessionKey = this.resolveSession(payload?.sessionKey);
    const state = typeof payload?.state === "string" ? payload.state : "";

    this.log(`chatEvent: state=${state} session=${sessionKey} hasMsg=${!!payload?.message}`);

    if (state === "delta") {
      const text = this.extractDeltaText(payload?.message);
      this.log(`delta len=${text.length} preview=${text.substring(0, 80)}`);
      if (text) {
        this.postToWebview({ type: "streamDelta", sessionKey, text });
      }
    } else if (state === "final") {
      this.log(`stream final`);
      // Extract final message text and display it
      const finalMsg = payload?.message;
      if (finalMsg) {
        const finalText = this.extractDeltaText(finalMsg);
        this.log(`final text len=${finalText.length}`);
        if (finalText) {
          // Display the final message directly
          this.postToWebview({ type: "streamDelta", sessionKey, text: finalText });
        }
      }
      this.postToWebview({ type: "streamDone", sessionKey });
      // Also reload history to sync with server
      this.handleLoadMessages(sessionKey);
    } else if (state === "aborted") {
      this.log(`stream aborted`);
      this.postToWebview({ type: "streamDone", sessionKey });
    } else if (state === "error") {
      const errorMsg = payload?.errorMessage || "unknown error";
      this.log(`stream error: ${errorMsg}`);
      this.postToWebview({ type: "streamError", sessionKey, error: errorMsg });
    } else {
      this.log(`unknown chat state: ${state}`);
    }
  }

  // Match Obsidian plugin's handleStreamEvent
  public handleStreamEvent(payload: any) {
    const stream = typeof payload?.stream === "string" ? payload.stream : "";
    const state = typeof payload?.state === "string" ? payload.state : "";
    const data = payload?.data || {};
    const toolName = data.name || data.toolName || payload?.toolName || payload?.name || "";
    const phase = data.phase || payload?.phase || "";

    this.log(`streamEvent: stream=${stream} state=${state} tool=${toolName} phase=${phase}`);

    if (toolName && (phase === "start" || state === "tool_use")) {
      const label = `${toolName}`;
      this.postToWebview({ type: "toolCall", label, phase: "start" });
    } else if (toolName && phase === "result") {
      this.postToWebview({ type: "toolCall", label: toolName, phase: "result" });
    }
  }

  private extractDeltaText(message: any): string {
    if (typeof message === "string") return message;
    if (!message) return "";

    const content = message.content ?? message;
    if (Array.isArray(content)) {
      let text = "";
      for (const item of content) {
        if (typeof item === "string") {
          text += item;
        } else if (item && typeof item === "object" && "text" in item) {
          text += (text ? "\n" : "") + String(item.text);
        }
      }
      return text;
    }

    if (typeof content === "string") return content;
    return message.text || "";
  }

  private resolveSession(sessionKey: string): string {
    if (!sessionKey) return this.currentSessionKey;
    // Strip agent prefix: "agent:main:main" → "main"
    const prefix = this.agentPrefix;
    if (prefix && sessionKey.startsWith(prefix)) {
      return sessionKey.slice(prefix.length);
    }
    // Also handle other agent prefixes
    const match = sessionKey.match(/^agent:[^:]+:(.+)$/);
    if (match) return match[1];
    return sessionKey;
  }

  resolveWebviewView(
    webviewView: vscode.WebviewView,
    _context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    this.view = webviewView;
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: []
    };

    webviewView.webview.html = this.getHtml();

    webviewView.webview.onDidReceiveMessage(async (msg) => {
      switch (msg.type) {
        case "webviewReady":
          // Load agents first, so resolveActiveAgent can find the correct agent
          if (this.gateway.connected) {
            await this.handleRequestAgents();
            await this.handleRequestModels();
            await this.handleRequestSessions();
            await this.handleLoadDefaults();
          }
          // Now send init with the resolved agent and session key
          this.postToWebview({
            type: "init",
            sessionKey: this.currentSessionKey,
            model: this.currentModel,
            connected: this.gateway.connected,
            agent: this.activeAgent,
            gatewayUrl: this.gatewayUrl,
            thinkingLevel: this.thinkingLevel,
            verboseLevel: this.verboseLevel,
            messageHistory: this.messageHistory
          });
          break;
        case "sendMessage":
          await this.handleSendMessage(msg.text, msg.fileRefs);
          break;
        case "stopStream":
          await this.handleStopStream();
          break;
        case "selectModel":
          this.currentModel = msg.model;
          break;
        case "cycleThinking":
          await this.cycleThinking();
          break;
        case "cycleVerbose":
          await this.cycleVerbose();
          break;
        case "requestModels":
          await this.handleRequestModels();
          break;
        case "requestSessions":
          await this.handleRequestSessions();
          break;
        case "requestAgents":
          await this.handleRequestAgents();
          break;
        case "switchSession":
          this.currentSessionKey = msg.sessionKey;
          await this.handleLoadMessages(msg.sessionKey);
          break;
        case "switchTab":
          if (msg.agentId) {
            const ag = this.agents.find(a => a.id === msg.agentId);
            if (ag) {
              this.activeAgent = ag;
            } else {
              // 如果 agents 未加载，尝试通过 name 反查（兼容配置的 agentId 为 display name 的情况）
              const byName = this.agents.find(a => (a.name || "") === msg.agentId);
              if (byName) this.activeAgent = byName;
            }
          }
          this.currentSessionKey = msg.sessionKey || "main";
          await this.handleLoadMessages(this.currentSessionKey);
          this.postToWebview({ type: "agentSwitched", agent: this.activeAgent });
          break;
        case "deleteSession":
          await this.handleDeleteSession(msg.sessionKey);
          break;
        case "switchAgent":
          await this.handleSwitchAgent(msg.agentId);
          break;
        case "copyCommand":
          await vscode.env.clipboard.writeText(msg.text);
          vscode.window.showInformationMessage("Copied to clipboard");
          break;
        case "openSettings":
          vscode.commands.executeCommand("workbench.action.openSettings", "openclaw");
          break;
        case "openModelPicker":
          vscode.commands.executeCommand("openclaw.settings");
          break;
        case "searchFiles":
          await this.handleSearchFiles(msg.query, msg.requestId);
          break;
      }
    });
  }

  private async handleSendMessage(text: string, fileRefs?: string[]) {
    if (!text.trim()) return;
    if (!this.gateway.connected) {
      vscode.window.showWarningMessage("OpenClaw: Not connected to gateway");
      return;
    }

    const userMsg: ChatMessage = {
      role: "user",
      text,
      timestamp: Date.now()
    };
    this.messages.push(userMsg);
    this.messageHistory.push(text);
    if (this.messageHistory.length > 200) {
      this.messageHistory = this.messageHistory.slice(-200);
    }
    this.context.globalState.update("openclaw.messageHistory", this.messageHistory);
    this.postToWebview({ type: "userMessage", message: userMsg });
    this.postToWebview({ type: "historyUpdated", messageHistory: this.messageHistory });

    const runId = this.genId();
    this.postToWebview({ type: "streamStart", runId });

    const attachments = await this.buildAttachments(fileRefs);

    try {
      const res = await this.gateway.request("chat.send", {
        sessionKey: this.gwSessionKey(),
        message: text,
        deliver: false,
        idempotencyKey: runId,
        ...(attachments.length > 0 ? { attachments } : {})
      }) as any;
      // If gateway didn't start a stream (e.g. /stop returns aborted:false, runIds:[]),
      // clear the "Thinking" state and show the gateway's reply as assistant message
      if (res && typeof res === 'object' && 
          res.aborted === false && 
          (!Array.isArray(res.runIds) || res.runIds.length === 0)) {
        this.postToWebview({ type: "streamDone", runId });
        // Format slash command response for display
        const replyText = this.formatCommandResponse(text, res);
        const assistantMsg: ChatMessage = {
          role: "assistant",
          text: replyText,
          timestamp: Date.now()
        };
        this.messages.push(assistantMsg);
        this.postToWebview({ type: "userMessage", message: assistantMsg });
      }
    } catch (err: any) {
      this.messages.push({
        role: "assistant",
        text: `Error: ${err}`,
        timestamp: Date.now()
      });
      this.postToWebview({ type: "streamDone", runId });
    }
  }

  private async buildAttachments(fileRefs?: string[]): Promise<any[]> {
    if (!fileRefs || fileRefs.length === 0) return [];
    const attachments: any[] = [];
    const MAX_TOTAL = 20 * 1024 * 1024;
    let totalSize = 0;
    const folders = vscode.workspace.workspaceFolders;
    const rootUri = folders && folders.length > 0 ? folders[0].uri : undefined;

    for (const relPath of fileRefs) {
      if (totalSize >= MAX_TOTAL) break;
      try {
        if (!rootUri) continue;
        const fileUri = vscode.Uri.joinPath(rootUri, relPath);
        const stat = await vscode.workspace.fs.stat(fileUri);
        if (stat.size > MAX_TOTAL) continue;
        if (totalSize + stat.size > MAX_TOTAL) continue;

        const bytes = await vscode.workspace.fs.readFile(fileUri);
        const mimeType = getMimeType(relPath);
        const content = Buffer.from(bytes).toString("base64");

        attachments.push({
          type: "file",
          mimeType,
          fileName: relPath.split("/").pop() || relPath,
          content
        });
        totalSize += stat.size;
      } catch {}
    }
    return attachments;
  }

  private formatCommandResponse(command: string, response: any): string {
    const cmd = command.trim().toLowerCase();
    if (!response) return 'No response';
    
    // Handle specific command responses
    if (cmd === '/stop') {
      if (response.aborted === true) {
        return 'Stream stopped successfully';
      } else {
        return 'No active stream to stop';
      }
    }
    
    // Handle other common slash commands
    if (cmd === '/new') {
      return 'New chat session started';
    }
    
    if (cmd === '/models') {
      if (response.models && Array.isArray(response.models)) {
        return `Available models: ${response.models.join(', ')}`;
      }
      return 'Models list retrieved';
    }
    
    if (cmd === '/help') {
      return 'Available commands: /stop /new /models /help';
    }
    
    // Fallback: show meaningful fields or JSON
    if (response.message) return response.message;
    if (response.ok !== undefined) {
      const okStr = response.ok === true ? 'Success' : 'Failed';
      if (response.aborted !== undefined) {
        return `${okStr}${response.aborted ? ' (aborted)' : ''}`;
      }
      return okStr;
    }
    
    return JSON.stringify(response);
  }

  private async handleStopStream() {
    try {
      await this.gateway.request("chat.abort", {
        sessionKey: this.gwSessionKey()
      });
    } catch {}
  }

  private async handleSearchFiles(query: string, requestId: string) {
    try {
      const folders = vscode.workspace.workspaceFolders;
      if (!folders || folders.length === 0) {
        this.postToWebview({ type: "fileResults", requestId, files: [] });
        return;
      }

      const pattern = query
        ? `**/*${query.replace(/[/\\]/g, "*")}*`
        : "**/*";
      const uris = await vscode.workspace.findFiles(pattern, "**/node_modules/**", 200);

      const files: { path: string; isDir: boolean }[] = [];
      const seen = new Set<string>();

      for (const uri of uris) {
        const relPath = vscode.workspace.asRelativePath(uri, false).replace(/\\/g, "/");
        if (seen.has(relPath)) continue;
        seen.add(relPath);

        const parts = relPath.split("/");
        const isDir = false;

        if (query) {
          const q = query.toLowerCase();
          const name = parts[parts.length - 1].toLowerCase();
          const full = relPath.toLowerCase();
          if (!name.includes(q) && !full.includes(q)) continue;
        }

        files.push({ path: relPath, isDir });
        if (files.length >= 30) break;
      }

      const folders2: { path: string; isDir: boolean }[] = [];
      for (const folder of folders) {
        const folderName = folder.name;
        if (query && !folderName.toLowerCase().includes(query.toLowerCase())) continue;
        folders2.push({ path: folderName, isDir: true });
      }

      this.postToWebview({
        type: "fileResults",
        requestId,
        files: [...folders2.slice(0, 5), ...files.slice(0, 30)]
      });
    } catch {
      this.postToWebview({ type: "fileResults", requestId, files: [] });
    }
  }

  private async handleRequestModels() {
    try {
      const res = await this.gateway.request("models.list", {});
      this.postToWebview({ type: "modelsList", models: res?.models || [] });
    } catch {
      this.postToWebview({ type: "modelsList", models: [] });
    }
  }

  private async handleRequestSessions() {
    try {
      const res = await this.gateway.request("sessions.list", {});
      this.sessions = res?.sessions || [];
      this.postToWebview({ type: "sessionsList", sessions: this.sessions });
    } catch {
      this.postToWebview({ type: "sessionsList", sessions: [] });
    }
  }

  private resolveActiveAgent() {
    if (!this.agents || this.agents.length === 0) return;
    const currentId = this.activeAgent?.id;
    if (!currentId) return;
    // 1. Exact id match (original behavior)
    let match = this.agents.find(a => a.id === currentId);
    // 2. Fallback: match by name (e.g. configured "OpenClaw VSCode" matches node:<deviceId> whose name is "OpenClaw VSCode")
    if (!match) {
      match = this.agents.find(a => (a.name || "") === currentId);
    }
    if (match) {
      this.activeAgent = {
        id: match.id,
        name: match.name || match.id,
        emoji: match.emoji || "🤖"
      };
    }
  }

  private async handleRequestAgents() {
    try {
      const res = await this.gateway.request("agents.list", {});
      this.agents = res?.agents || [];
      if (this.agents.length === 0) this.agents = [{ id: "main", name: "Agent" }];
      this.resolveActiveAgent();
      this.postToWebview({ type: "agentsList", agents: this.agents });
      this.postToWebview({ type: "agentSwitched", agent: this.activeAgent });
    } catch {
      this.postToWebview({ type: "agentsList", agents: [] });
    }
  }

  private async handleLoadDefaults() {
    try {
      const res = await this.gateway.request("config.get", {});
      const config = res?.config || res || {};
      const agentDefaults = config?.agents?.defaults || {};
      this.thinkingLevel = agentDefaults.thinkingDefault || "";
      this.verboseLevel = agentDefaults.verboseDefault || "";
      this.postToWebview({
        type: "defaultsLoaded",
        thinkingLevel: this.thinkingLevel,
        verboseLevel: this.verboseLevel
      });
    } catch {}
  }

  private async cycleThinking() {
    const levels = ["", "off", "low", "medium", "high"];
    const idx = levels.indexOf(this.thinkingLevel);
    this.thinkingLevel = levels[(idx + 1) % levels.length];
    this.postToWebview({ type: "thinkingChanged", level: this.thinkingLevel });
  }

  private async cycleVerbose() {
    const levels = ["", "off", "on", "full"];
    const idx = levels.indexOf(this.verboseLevel);
    this.verboseLevel = levels[(idx + 1) % levels.length];
    this.postToWebview({ type: "verboseChanged", level: this.verboseLevel });
  }

  private async handleLoadMessages(sessionKey: string) {
    try {
      const res = await this.gateway.request("chat.history", {
        sessionKey: this.gwSessionKey(sessionKey),
        limit: 200
      });
      const msgs = res?.messages || [];
      this.log(`history: ${msgs.length} messages`);
      const parsed: ChatMessage[] = msgs
        .filter((m: any) => m.role === "user" || m.role === "assistant")
        .map((m: any) => ({
          role: m.role,
          text: this.extractHistoryContent(m.content),
          timestamp: m.timestamp || Date.now(),
          contentBlocks: Array.isArray(m.content) ? m.content : undefined
        }))
        .filter((m: ChatMessage) => m.text.trim() && !m.text.startsWith("HEARTBEAT"));
      // Remove leading orphan user message (from failed send)
      if (parsed.length > 0 && parsed[0].role === "user") {
        parsed.shift();
      }
      this.postToWebview({ type: "loadMessages", sessionKey, messages: parsed });
    } catch (err: any) {
      this.log(`history error: ${err.message}`);
      this.postToWebview({ type: "loadMessages", sessionKey, messages: [] });
    }
  }

  private extractHistoryContent(content: any): string {
    if (typeof content === "string") return content;
    if (!content) return "";
    if (Array.isArray(content)) {
      let text = "";
      for (const block of content) {
        if (block.type === "text" && block.text) {
          text += (text ? "\n" : "") + block.text;
        } else if (block.type === "tool_result" && block.content) {
          if (typeof block.content === "string") {
            text += (text ? "\n" : "") + block.content;
          } else if (Array.isArray(block.content)) {
            for (const sub of block.content) {
              if (sub?.type === "text" && sub.text) {
                text += (text ? "\n" : "") + sub.text;
              }
            }
          }
        }
      }
      return text;
    }
    return "";
  }

  private async handleDeleteSession(sessionKey: string) {
    try {
      await this.gateway.request("sessions.delete", { sessionKey: this.gwSessionKey(sessionKey) });
      await this.handleRequestSessions();
    } catch {}
  }

  private async handleSwitchAgent(agentId: string) {
    const agent = this.agents.find(a => a.id === agentId);
    if (agent) {
      this.activeAgent = agent;
      this.currentSessionKey = "main";
      this.postToWebview({
        type: "agentSwitched",
        agent: this.activeAgent
      });
      await this.handleLoadMessages("main");
      await this.handleRequestSessions();
    }
  }

  private postToWebview(msg: any) {
    this.view?.webview.postMessage(msg);
  }

  private genId(): string {
    return Math.random().toString(36).substring(2, 12);
  }

  private getHtml(): string {
    const nonce = getNonce();
    return /*html*/ `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'nonce-${nonce}' https://cdnjs.cloudflare.com; connect-src 'none';">
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
:root {
  --bg: var(--vscode-sideBar-background);
  --bg2: var(--vscode-editor-background);
  --text: var(--vscode-sideBar-foreground);
  --text-muted: var(--vscode-descriptionForeground);
  --border: var(--vscode-widget-border);
  --accent: var(--vscode-textLink-foreground, #3794ff);
  --input-bg: var(--vscode-input-background);
  --input-border: var(--vscode-input-border);
  --hover: var(--vscode-list-hoverBackground);
}
body {
  font-family: var(--vscode-font-family, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif);
  font-size: var(--vscode-font-size, 13px);
  color: var(--text);
  background: var(--bg);
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

/* ═══════════════════════════════════════════
   HUD PANEL (top) — Agent Card + Sessions
   ═══════════════════════════════════════════ */
#hud-panel {
  flex-shrink: 0;
  max-height: 45vh;
  overflow-y: auto;
  border-bottom: 2px solid var(--border);
}
#hud-panel::-webkit-scrollbar { width: 4px; }
#hud-panel::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }

.agent-card {
  background: rgba(128, 128, 128, 0.04);
  border: 1px solid rgba(128, 128, 128, 0.1);
  margin: 8px 10px 4px;
  border-radius: 10px;
  overflow: hidden;
}

.agent-identity {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
}

.agent-orb {
  width: 36px; height: 36px; border-radius: 50%;
  display: inline-flex; align-items: center; justify-content: center;
  background: rgba(128, 128, 128, 0.12);
  color: var(--text-muted);
  flex-shrink: 0; font-size: 18px;
}
.agent-orb.online { color: #4ade80; }

.agent-info { min-width: 0; flex: 1; }
.agent-name { font-size: 14px; font-weight: 600; color: var(--text); line-height: 1.25; }
.agent-status { font-size: 12px; color: var(--text-muted); line-height: 1.3; }
.agent-status.online { color: #4ade80; }

.hud-group-label {
  font-weight: 600; letter-spacing: 0.06em;
  color: var(--text-muted); text-transform: uppercase;
  font-size: 11px; margin: 8px 10px 4px; padding: 0;
}

.hud-section {
  margin: 0 6px 6px;
  border: 1px solid rgba(128, 128, 128, 0.14);
  border-radius: 10px;
  background: rgba(128, 128, 128, 0.04);
  overflow: hidden;
}

.hud-section-toggle {
  width: 100%; display: flex; align-items: center; gap: 8px;
  padding: 8px 10px; border: none; border-radius: 0;
  background: transparent; color: var(--text-muted);
  cursor: pointer; text-align: left; font-family: inherit; font-size: inherit;
  border-bottom: 1px solid rgba(128, 128, 128, 0.12); min-height: 40px;
}
.hud-section-toggle:disabled { cursor: default; }
.hud-section-toggle:not(:disabled):hover { background: rgba(128, 128, 128, 0.1); color: var(--text); }
.hud-section-label { color: var(--text-muted); flex: 0 0 auto; font-size: 11px; font-weight: 500; letter-spacing: 0.04em; text-transform: uppercase; }
.hud-section-value { flex: 1; min-width: 0; text-align: right; color: var(--text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-size: 12px; }
.hud-section-chevron { color: var(--text-muted); opacity: 0.35; font-size: 13px; flex: 0 0 auto; }
.hud-section-toggle:disabled .hud-section-chevron { visibility: hidden; }

.device-item { display: flex; align-items: center; gap: 8px; padding: 8px 12px; cursor: pointer; border-bottom: 1px solid rgba(128, 128, 128, 0.08); }
.device-item:last-child { border-bottom: none; }
.device-item:hover { background: rgba(128, 128, 128, 0.06); }
.device-item.active { background: rgba(128, 128, 128, 0.1); }
.device-dot { width: 8px; height: 8px; border-radius: 50%; background: #888; flex-shrink: 0; }
.device-dot.active { background: var(--accent); }
.device-info { min-width: 0; flex: 1; }
.device-name { font-size: 12px; font-weight: 500; color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.device-meta { font-size: 11px; color: var(--text-muted); }
.device-tokens { font-size: 11px; color: var(--text-muted); white-space: nowrap; }
.device-delete { background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 2px 4px; border-radius: 3px; opacity: 0; font-size: 12px; }
.device-item:hover .device-delete { opacity: 1; }
.device-delete:hover { color: #cc4444; background: rgba(204,68,68,0.1); }

.pairing-banner { background: var(--bg2); border: 1px solid var(--border); border-radius: 8px; padding: 12px 14px; margin: 8px 10px; color: var(--text); }
.pairing-title { font-weight: 600; color: var(--accent); margin: 0 0 6px 0; font-size: 13px; }
.pairing-desc { margin: 0 0 8px 0; font-size: 12px; color: var(--text-muted); line-height: 1.4; }
.pairing-label { font-size: 11px; font-weight: 500; color: var(--text-muted); margin: 8px 0 4px 0; }
.pairing-copy-box { background: var(--input-bg); border: 1px solid var(--input-border); border-radius: 6px; padding: 6px 8px; font-family: var(--vscode-editor-font-family, monospace); font-size: 12px; cursor: pointer; display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
.pairing-copy-box:hover { background: var(--hover); }
.pairing-copy-box code { color: var(--text); flex: 1; user-select: all; }
.pairing-copy-btn { font-size: 11px; color: var(--text-muted); margin-left: 8px; white-space: nowrap; }
.pairing-wait { display: flex; align-items: center; gap: 6px; margin-top: 10px; padding-top: 8px; border-top: 1px solid var(--border); font-size: 12px; color: var(--text-muted); }
.pairing-spinner { width: 12px; height: 12px; border: 2px solid var(--border); border-top-color: var(--accent); border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.hud-footer { padding: 4px 10px 8px; display: flex; align-items: center; }
.hud-footer-badge { display: inline-flex; font-size: 11px; color: var(--text-muted); border: 1px solid rgba(128, 128, 128, 0.18); border-radius: 999px; padding: 3px 10px; letter-spacing: 0.02em; }

/* ═══════════════════════════════════════════
   CHAT PANEL (bottom) — Messages + Input
   ═══════════════════════════════════════════ */
#chat-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 0;
}

.context-bar { height: 3px; background: rgba(128, 128, 128, 0.1); flex-shrink: 0; }
.context-fill { height: 100%; background: var(--accent); transition: width 0.3s; width: 0%; }
.context-fill.warning { background: #e2c044; }
.context-fill.danger { background: #cc4444; }

.tabs-bar { display: flex; align-items: center; gap: 2px; padding: 4px 10px; border-bottom: 1px solid var(--border); overflow-x: auto; flex-shrink: 0; }
.tabs-bar::-webkit-scrollbar { height: 0; }
.tab-item { display: flex; align-items: center; gap: 4px; padding: 4px 10px; border-radius: 6px; font-size: 12px; color: var(--text-muted); cursor: pointer; white-space: nowrap; flex-shrink: 0; }
.tab-item:hover { background: var(--hover); color: var(--text); }
.tab-item.active { background: var(--accent); color: #fff; }
.tab-close {
  margin-left: 4px;
  font-size: 14px;
  line-height: 1;
  opacity: 0;
  border-radius: 3px;
  padding: 0 2px;
  transition: opacity 0.15s;
}
.tab-item:hover .tab-close { opacity: 0.7; }
.tab-close:hover { opacity: 1 !important; background: rgba(255,255,255,0.15); }
.tab-add { background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 4px 6px; border-radius: 4px; font-size: 16px; }
.tab-add:hover { background: var(--hover); color: var(--text); }

.messages { flex: 1; overflow-y: auto; padding: 12px; display: flex; flex-direction: column; gap: 12px; min-height: 0; }
.messages::-webkit-scrollbar { width: 6px; }
.messages::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }
.msg { display: flex; flex-direction: column; gap: 4px; }
.msg-user { align-items: flex-end; }
.msg-assistant { align-items: flex-start; }
.msg-bubble { max-width: 92%; padding: 10px 14px; border-radius: 12px; line-height: 1.55; word-break: break-word; white-space: pre-wrap; }
.msg-user .msg-bubble { background: var(--accent); color: #fff; border-bottom-right-radius: 4px; }
.msg-assistant .msg-bubble { background: var(--bg2); border: 1px solid var(--border); border-bottom-left-radius: 4px; }
.msg-time { font-size: 10px; color: var(--text-muted); padding: 0 4px; }

.tool-call { display: flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: 8px; background: rgba(128, 128, 128, 0.06); border: 1px solid var(--border); font-size: 12px; color: var(--text-muted); }

.typing { display: none; align-items: center; gap: 8px; padding: 8px 14px; font-size: 12px; color: var(--text-muted); }
.typing.active { display: flex; }
.typing-dots { display: flex; gap: 3px; }
.typing-dots span { width: 5px; height: 5px; border-radius: 50%; background: var(--text-muted); animation: blink 1.4s infinite; }
.typing-dots span:nth-child(2) { animation-delay: 0.2s; }
.typing-dots span:nth-child(3) { animation-delay: 0.4s; }
@keyframes blink { 0%, 80%, 100% { opacity: 0.3; } 40% { opacity: 1; } }

.input-area { padding: 8px 10px 12px; border-top: 1px solid var(--border); flex-shrink: 0; }
.input-meta { display: flex; align-items: center; gap: 6px; margin-bottom: 6px; }
.bar-chip { font-size: 11px; color: var(--text-muted); padding: 2px 6px; border-radius: 4px; cursor: pointer; }
.bar-chip:hover { background: var(--hover); color: var(--text); }
.bar-sep { color: var(--border); font-size: 10px; }
.input-row { display: flex; align-items: flex-end; gap: 6px; }
.input-box { flex: 1; background: var(--input-bg); border: 1px solid var(--input-border); color: var(--text); border-radius: 10px; padding: 10px 14px; font-size: 13px; font-family: inherit; resize: none; outline: none; min-height: 40px; max-height: 150px; line-height: 1.4; }
.input-box:focus { border-color: var(--accent); }
.send-btn { width: 36px; height: 36px; border-radius: 50%; border: none; background: var(--accent); color: #fff; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.send-btn:hover { opacity: 0.85; }
.stop-btn { width: 36px; height: 36px; border-radius: 50%; border: none; background: #cc4444; color: #fff; cursor: pointer; display: none; align-items: center; justify-content: center; flex-shrink: 0; }
.stop-btn.active { display: flex; }
.stop-btn:hover { background: #aa3333; }

.empty-state { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; color: var(--text-muted); gap: 8px; padding: 20px; text-align: center; }
.empty-icon { font-size: 32px; opacity: 0.5; }
.empty-text { font-size: 13px; line-height: 1.5; }

/* Markdown in assistant bubbles */
.msg-assistant .msg-bubble h1, .msg-assistant .msg-bubble h2, .msg-assistant .msg-bubble h3,
.msg-assistant .msg-bubble h4, .msg-assistant .msg-bubble h5, .msg-assistant .msg-bubble h6 {
  margin: 8px 0 4px; line-height: 1.3;
}
.msg-assistant .msg-bubble h1 { font-size: 1.2em; }
.msg-assistant .msg-bubble h2 { font-size: 1.1em; }
.msg-assistant .msg-bubble h3 { font-size: 1em; }
.msg-assistant .msg-bubble p { margin: 4px 0; }
.msg-assistant .msg-bubble ul, .msg-assistant .msg-bubble ol {
  margin: 4px 0; padding-left: 20px;
}
.msg-assistant .msg-bubble li { margin: 2px 0; }
.msg-assistant .msg-bubble code {
  background: rgba(128,128,128,0.15); padding: 1px 4px; border-radius: 3px;
  font-family: var(--vscode-editor-font-family, monospace); font-size: 0.9em;
}
.msg-assistant .msg-bubble pre {
  background: rgba(0,0,0,0.2); border: 1px solid var(--border); border-radius: 6px;
  padding: 8px 10px; overflow-x: auto; margin: 6px 0;
}
.msg-assistant .msg-bubble pre code {
  background: none; padding: 0; font-size: 0.85em; line-height: 1.4;
}
.msg-assistant .msg-bubble blockquote {
  border-left: 3px solid var(--accent); padding-left: 10px; margin: 6px 0;
  color: var(--text-muted);
}
.msg-assistant .msg-bubble table {
  border-collapse: collapse; margin: 6px 0; width: 100%;
}
.msg-assistant .msg-bubble th, .msg-assistant .msg-bubble td {
  border: 1px solid var(--border); padding: 4px 8px; text-align: left; font-size: 12px;
}
.msg-assistant .msg-bubble th { background: rgba(128,128,128,0.1); font-weight: 600; }
.msg-assistant .msg-bubble a { color: var(--accent); text-decoration: none; }
.msg-assistant .msg-bubble a:hover { text-decoration: underline; }
.msg-assistant .msg-bubble hr {
  border: none; border-top: 1px solid var(--border); margin: 8px 0;
}
.msg-assistant .msg-bubble strong { font-weight: 600; }
.msg-assistant .msg-bubble em { font-style: italic; }
.msg-assistant .msg-bubble img { max-width: 100%; border-radius: 4px; }

/* HUD Toggle */
.hud-toggle {
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 4px 6px;
  border-radius: 4px;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.hud-toggle:hover { background: var(--hover); color: var(--text); }
.hud-toggle.active { color: var(--accent); }
#hud-panel.hidden { display: none; }

/* Agent Buttons Row */
.agent-buttons {
  display: flex;
  gap: 6px;
  padding: 6px 14px 10px;
  overflow-x: auto;
  flex-wrap: nowrap;
}
.agent-buttons::-webkit-scrollbar { height: 0; }
.agent-btn {
  flex-shrink: 0;
  padding: 5px 12px;
  border-radius: 8px;
  border: 1px solid rgba(128,128,128,0.18);
  background: rgba(128,128,128,0.06);
  color: var(--text-muted);
  font-size: 12px;
  font-family: inherit;
  cursor: pointer;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 5px;
  transition: background 0.15s, color 0.15s;
}
.agent-btn:hover { background: rgba(128,128,128,0.14); color: var(--text); }
.agent-btn.active { background: var(--accent); color: #fff; border-color: var(--accent); }
.agent-btn-emoji { font-size: 13px; }

/* @ Mention Dropdown */
.at-dropdown {
  position: absolute;
  bottom: 100%;
  left: 0;
  right: 0;
  max-height: 240px;
  overflow-y: auto;
  background: var(--bg2);
  border: 1px solid var(--border);
  border-radius: 8px;
  box-shadow: 0 -4px 12px rgba(0,0,0,0.25);
  display: none;
  z-index: 100;
}
.at-dropdown.visible { display: block; }
.at-dropdown::-webkit-scrollbar { width: 4px; }
.at-dropdown::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }
.at-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  cursor: pointer;
  font-size: 12px;
  color: var(--text);
  border-bottom: 1px solid rgba(128,128,128,0.08);
}
.at-item:last-child { border-bottom: none; }
.at-item:hover, .at-item.active { background: var(--hover); }
.at-icon { flex-shrink: 0; width: 16px; text-align: center; font-size: 13px; color: var(--text-muted); }
.at-label { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.at-empty { padding: 10px 12px; font-size: 12px; color: var(--text-muted); text-align: center; }
</style>
</head>
<body>

<!-- ═══ HUD PANEL ═══ -->
<div id="hud-panel">
  <div class="agent-card" id="agentCard">
    <div class="agent-identity">
      <div class="agent-orb" id="agentOrb">🤖</div>
      <div class="agent-info">
        <div class="agent-name" id="agentName">Agent</div>
        <div class="agent-status" id="agentStatus">Connecting...</div>
      </div>
    </div>
    <div class="agent-buttons" id="agentButtons"></div>
    <div class="hud-group-label">SETTINGS</div>
    <div class="hud-section">
      <button class="hud-section-toggle" id="btnModel">
        <span class="hud-section-label">AI MODEL</span>
        <span class="hud-section-value" id="modelValue">default</span>
        <span class="hud-section-chevron">›</span>
      </button>
      <button class="hud-section-toggle" id="btnReliability">
        <span class="hud-section-label">RELIABILITY</span>
        <span class="hud-section-value" id="reliabilityValue">default</span>
        <span class="hud-section-chevron">›</span>
      </button>
      <button class="hud-section-toggle" id="btnServer">
        <span class="hud-section-label">SERVER</span>
        <span class="hud-section-value" id="serverValue">127.0.0.1:18789</span>
        <span class="hud-section-chevron">›</span>
      </button>
    </div>
    <div class="hud-group-label">SESSIONS</div>
    <div class="hud-section">
      <div id="sessionsList"></div>
    </div>
    <div class="hud-footer">
      <span class="hud-footer-badge">OPENCLAW v0.41.11</span>
    </div>
  </div>

  <div class="pairing-banner" id="pairingBanner" style="display:none;">
    <div class="pairing-title">Device pairing required</div>
    <p class="pairing-desc">This device needs approval before it can connect.</p>
    <p class="pairing-label">Run on the server:</p>
    <div class="pairing-copy-box" id="pairingCopyBox">
      <code>openclaw devices approve --latest</code>
      <span class="pairing-copy-btn">Copy</span>
    </div>
    <p class="pairing-desc">Or tell your bot: "approve the pending device"</p>
    <div class="pairing-wait">
      <div class="pairing-spinner"></div>
      <span>Waiting for approval...</span>
    </div>
  </div>
</div>

<!-- ═══ CHAT PANEL ═══ -->
<div id="chat-panel">
  <div class="context-bar"><div class="context-fill" id="contextFill"></div></div>
  <div class="tabs-bar" id="tabsBar">
    <button class="hud-toggle" id="hudToggle" title="Toggle HUD Panel">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
    </button>
    <div class="tab-item active" data-session="main">Chat</div>
    <button class="tab-add" id="btnAddTab" title="New tab">+</button>
  </div>
  <div class="messages" id="messages">
    <div class="empty-state" id="emptyState">
      <div class="empty-icon">💬</div>
      <div class="empty-text">Start a conversation with your AI agent</div>
    </div>
  </div>
  <div class="typing" id="typing">
    <div class="typing-dots"><span></span><span></span><span></span></div>
    <span id="typingText">Thinking...</span>
  </div>
  <div class="input-area">
    <div class="input-meta">
      <span class="bar-chip" id="thinkingChip">think: default</span>
      <span class="bar-sep">·</span>
      <span class="bar-chip" id="verboseChip">steps: default</span>
    </div>
    <div class="input-row" style="position:relative;">
      <button class="stop-btn" id="stopBtn" title="Stop">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="4" y="4" width="16" height="16" rx="2"/></svg>
      </button>
      <div style="flex:1;position:relative;">
        <div class="at-dropdown" id="atDropdown"></div>
        <div class="at-dropdown" id="slashDropdown"></div>
        <textarea class="input-box" id="inputBox" placeholder="Message OpenClaw..." rows="1" style="width:100%;"></textarea>
      </div>
      <button class="send-btn" id="sendBtn" title="Send">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
      </button>
    </div>
  </div>
</div>

<script nonce="${nonce}" src="https://cdnjs.cloudflare.com/ajax/libs/marked/15.0.7/marked.min.js"></script>
<script nonce="${nonce}">
(function() {
  const vscode = acquireVsCodeApi();
  const $ = (sel) => document.querySelector(sel);
  const messagesEl = $('#messages');
  const inputBox = $('#inputBox');
  const sendBtn = $('#sendBtn');
  const stopBtn = $('#stopBtn');
  const typingEl = $('#typing');
  const emptyState = $('#emptyState');
  const modelValue = $('#modelValue');
  const reliabilityValue = $('#reliabilityValue');
  const serverValue = $('#serverValue');
  const sessionsList = $('#sessionsList');
  const contextFill = $('#contextFill');
  const agentOrb = $('#agentOrb');
  const agentNameEl = $('#agentName');
  const agentStatusEl = $('#agentStatus');
  const pairingBanner = $('#pairingBanner');
  const thinkingChip = $('#thinkingChip');
  const verboseChip = $('#verboseChip');

  let connected = false;
  let streaming = false;
  let sessions = [];
  let agents = [];
  let currentSession = 'main';
  let agent = { id: 'main', name: 'Agent', emoji: '🤖' };
  let currentModel = '';
  let thinkingLevel = '';
  let verboseLevel = '';
  let gatewayUrl = '';
  let hudVisible = false;
  let messageHistory = [];
  let historyIndex = -1;

  // @ mention state
  let atVisible = false;
  let atQuery = '';
  let atFiles = [];
  let atSelectedIndex = 0;
  let atRequestId = '';
  let atTriggerPos = -1;
  let atFileRefs = [];
  const atDropdown = $('#atDropdown');
  const slashDropdown = $('#slashDropdown');

  let slashVisible = false;
  let slashFilter = '';
  let slashSelectedIndex = 0;
  const SLASH_COMMANDS = [
    { cmd: '/new', desc: 'Start a new chat session' },
    { cmd: '/stop', desc: 'Stop the current response' },
    { cmd: '/reset', desc: 'Reset session context' },
    { cmd: '/compact', desc: 'Compact session messages' },
    { cmd: '/status', desc: 'Show session status' },
    { cmd: '/models', desc: 'List available models' },
    { cmd: '/model', desc: 'Switch active model' },
    { cmd: '/commands', desc: 'List available commands' },
    { cmd: '/help', desc: 'Show help information' },
  ];

  // Tab management: each tab = { id, label, agentId, sessionKey, messages[] }
  let tabs = [{ id: 'tab-main', label: 'Chat', agentId: 'main', sessionKey: 'main', messages: [] }];
  let activeTabId = 'tab-main';
  let streamEl = null;
  let activeTabMessages = [];

  function getActiveTab() { return tabs.find(t => t.id === activeTabId) || tabs[0]; }

  renderTabs();
  vscode.postMessage({ type: 'webviewReady' });

  // HUD toggle
  const hudPanel = document.getElementById('hud-panel');
  const hudToggle = document.getElementById('hudToggle');
  if (hudPanel) hudPanel.classList.add('hidden');
  if (hudToggle) {
    hudToggle.addEventListener('click', () => {
      hudVisible = !hudVisible;
      hudPanel.classList.toggle('hidden', !hudVisible);
      hudToggle.classList.toggle('active', hudVisible);
    });
  }

  $('#btnModel').addEventListener('click', () => vscode.postMessage({ type: 'openModelPicker' }));
  $('#btnReliability').addEventListener('click', () => {
    vscode.postMessage({ type: 'cycleThinking' });
    vscode.postMessage({ type: 'cycleVerbose' });
  });
  $('#btnServer').addEventListener('click', () => vscode.postMessage({ type: 'openSettings' }));
  $('#pairingCopyBox').addEventListener('click', () => {
    vscode.postMessage({ type: 'copyCommand', text: 'openclaw devices approve --latest' });
  });

  inputBox.addEventListener('input', () => {
    inputBox.style.height = 'auto';
    inputBox.style.height = Math.min(inputBox.scrollHeight, 150) + 'px';
    checkAtTrigger();
    checkSlashTrigger();
  });
  inputBox.addEventListener('keydown', (e) => {
    if (atVisible) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (atFiles.length > 0) {
          atSelectedIndex = (atSelectedIndex + 1) % atFiles.length;
          renderAtDropdown();
        }
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (atFiles.length > 0) {
          atSelectedIndex = (atSelectedIndex - 1 + atFiles.length) % atFiles.length;
          renderAtDropdown();
        }
        return;
      }
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (atFiles.length > 0) {
          selectAtItem(atFiles[atSelectedIndex]);
        }
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        hideAtDropdown();
        return;
      }
    }
    if (slashVisible) {
      const filtered = getFilteredSlashCommands();
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (filtered.length > 0) {
          slashSelectedIndex = (slashSelectedIndex + 1) % filtered.length;
          updateSlashActive();
        }
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (filtered.length > 0) {
          slashSelectedIndex = (slashSelectedIndex - 1 + filtered.length) % filtered.length;
          updateSlashActive();
        }
        return;
      }
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (filtered.length > 0) {
          selectSlashCommand(filtered[slashSelectedIndex]);
        }
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        hideSlashDropdown();
        return;
      }
    }
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
    if (e.ctrlKey && e.key === 'ArrowUp') {
      e.preventDefault();
      if (messageHistory.length === 0) return;
      if (historyIndex < messageHistory.length - 1) {
        historyIndex++;
        inputBox.value = messageHistory[messageHistory.length - 1 - historyIndex];
        inputBox.style.height = 'auto';
        inputBox.style.height = Math.min(inputBox.scrollHeight, 150) + 'px';
      }
    }
    if (e.ctrlKey && e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        historyIndex--;
        inputBox.value = messageHistory[messageHistory.length - 1 - historyIndex];
        inputBox.style.height = 'auto';
        inputBox.style.height = Math.min(inputBox.scrollHeight, 150) + 'px';
      } else if (historyIndex === 0) {
        historyIndex = -1;
        inputBox.value = '';
        inputBox.style.height = 'auto';
      }
    }
  });
  sendBtn.addEventListener('click', sendMessage);
  stopBtn.addEventListener('click', () => vscode.postMessage({ type: 'stopStream' }));
  thinkingChip.addEventListener('click', () => vscode.postMessage({ type: 'cycleThinking' }));
  verboseChip.addEventListener('click', () => vscode.postMessage({ type: 'cycleVerbose' }));

  // Slash dropdown: event delegation (set up once, survives re-renders)
  slashDropdown.addEventListener('mousedown', (e) => {
    e.preventDefault();
    e.stopPropagation();
    const item = e.target.closest('.at-item');
    if (!item || !item.dataset.cmd) return;
    inputBox.value = item.dataset.cmd + ' ';
    inputBox.setSelectionRange(inputBox.value.length, inputBox.value.length);
    inputBox.focus();
    hideSlashDropdown();
    inputBox.style.height = 'auto';
    inputBox.style.height = Math.min(inputBox.scrollHeight, 150) + 'px';
  });
  slashDropdown.addEventListener('mousemove', (e) => {
    const item = e.target.closest('.at-item');
    if (!item) return;
    const items = Array.from(slashDropdown.querySelectorAll('.at-item'));
    const idx = items.indexOf(item);
    if (idx >= 0 && idx !== slashSelectedIndex) {
      slashSelectedIndex = idx;
      updateSlashActive();
    }
  });

  window.addEventListener('message', (e) => {
    const msg = e.data;
    switch (msg.type) {
      case 'init':
        connected = msg.connected;
        agent = msg.agent || agent;
        currentModel = msg.model || '';
        thinkingLevel = msg.thinkingLevel || '';
        verboseLevel = msg.verboseLevel || '';
        gatewayUrl = msg.gatewayUrl || '';
        messageHistory = msg.messageHistory || [];
        historyIndex = -1;
        updateAgentCard();
        updateChips();
        serverValue.textContent = (gatewayUrl && gatewayUrl.indexOf('://') >= 0) ? gatewayUrl.slice(gatewayUrl.indexOf('://') + 3) : 'not configured';
        if (msg.sessionKey) currentSession = msg.sessionKey;
// Update default tab with resolved agent/session from init message
      if (tabs.length > 0) {
        tabs[0].agentId = msg.agent.id;
        tabs[0].sessionKey = msg.sessionKey;
        // If we have stored messages for this tab, use them
        if (activeTabMessages.length > 0 && tabs[0].id === activeTabId) {
          tabs[0].messages = activeTabMessages.slice();
        }
        // Re-render tabs and agent buttons to reflect updated agentId/sessionKey
        renderTabs();
        renderAgentButtons();
      }
        break;
      case 'connectionStatus':
        connected = msg.connected;
        agent = msg.agent || agent;
        updateAgentCard();
        if (connected) {
          vscode.postMessage({ type: 'requestModels' });
          vscode.postMessage({ type: 'requestSessions' });
          vscode.postMessage({ type: 'requestAgents' });
          pairingBanner.style.display = 'none';
        }
        break;
      case 'modelsList': renderModels(msg.models); break;
      case 'sessionsList':
        sessions = msg.sessions || [];
        renderSessions();
        updateContextMeter();
        break;
      case 'agentsList':
        agents = msg.agents || [];
        renderAgentButtons();
        break;
      case 'defaultsLoaded':
        thinkingLevel = msg.thinkingLevel || '';
        verboseLevel = msg.verboseLevel || '';
        updateChips();
        break;
      case 'thinkingChanged': thinkingLevel = msg.level; updateChips(); break;
      case 'verboseChanged': verboseLevel = msg.level; updateChips(); break;
      case 'agentSwitched':
        agent = msg.agent;
        updateAgentCard();
        renderAgentButtons();
        renderTabs();
        break;
      case 'userMessage':
        appendMessage(msg.message);
        activeTabMessages.push(msg.message);
        break;
      case 'loadMessages':
        clearMessages();
        const tab = getActiveTab();
        if (tab) {
          activeTabMessages = (msg.messages || []).slice();
          tab.messages = activeTabMessages;
        }
        for (const m of (msg.messages || [])) appendMessage(m);
        break;
      case 'clearMessages':
        clearMessages();
        activeTabMessages = [];
        const ct = getActiveTab();
        if (ct) ct.messages = [];
        break;
      case 'streamStart':
        streaming = true;
        showTyping(true, 'Thinking');
        sendBtn.style.display = 'none';
        stopBtn.classList.add('active');
        emptyState.style.display = 'none';
        break;
      case 'streamDelta':
        streaming = true;
        emptyState.style.display = 'none';
        showTyping(false);
        updateStream(msg.text, false);
        break;
      case 'streamDone':
        streaming = false;
        updateStream('', true);
        showTyping(false);
        sendBtn.style.display = '';
        stopBtn.classList.remove('active');
        // Store the final assistant message in activeTabMessages
        const lastMsgEl = messagesEl.querySelector('.msg.msg-assistant:last-child');
        if (lastMsgEl) {
          const bubble = lastMsgEl.querySelector('.msg-bubble');
          if (bubble && bubble.textContent.trim()) {
            activeTabMessages.push({
              role: 'assistant',
              text: bubble.textContent,
              timestamp: Date.now()
            });
          }
        }
        break;
      case 'streamError':
        streaming = false;
        appendMessage({ role: 'assistant', text: 'Error: ' + msg.error, timestamp: Date.now() });
        showTyping(false);
        sendBtn.style.display = '';
        stopBtn.classList.remove('active');
        // Store error message in activeTabMessages
        activeTabMessages.push({ role: 'assistant', text: 'Error: ' + msg.error, timestamp: Date.now() });
        break;
      case 'toolCall':
        emptyState.style.display = 'none';
        showTyping(true, msg.phase === 'start' ? msg.label : 'Thinking');
        break;
      case 'historyUpdated':
        messageHistory = msg.messageHistory || [];
        historyIndex = -1;
        break;
      case 'fileResults':
        if (msg.requestId === atRequestId && atVisible) {
          atFiles = msg.files || [];
          renderAtDropdown();
        }
        break;
    }
  });

  function sendMessage() {
    const text = inputBox.value.trim();
    if (!text || !connected) return;
    const refs = atFileRefs.slice();
    inputBox.value = '';
    inputBox.style.height = 'auto';
    historyIndex = -1;
    atFileRefs = [];
    hideAtDropdown();
    vscode.postMessage({ type: 'sendMessage', text, fileRefs: refs });
  }

  function checkAtTrigger() {
    const val = inputBox.value;
    const pos = inputBox.selectionStart;
    if (pos < 0) { hideAtDropdown(); return; }
    const before = val.substring(0, pos);
    const atIndex = before.lastIndexOf('@');
    if (atIndex >= 0) {
      const query = before.slice(atIndex + 1);
      if (query.indexOf(' ') === -1 && query.indexOf('\t') === -1) {
        atTriggerPos = atIndex;
        atQuery = query;
        atRequestId = Math.random().toString(36).substring(2, 10);
        atSelectedIndex = 0;
        atVisible = true;
        vscode.postMessage({ type: 'searchFiles', query: atQuery, requestId: atRequestId });
        atDropdown.classList.add('visible');
        renderAtDropdown();
        return;
      }
    }
    hideAtDropdown();
  }

  function hideAtDropdown() {
    atVisible = false;
    atFiles = [];
    atTriggerPos = -1;
    atDropdown.classList.remove('visible');
  }

  function renderAtDropdown() {
    if (!atVisible) return;
    if (atFiles.length === 0) {
      atDropdown.innerHTML = '<div class="at-empty">No matching files</div>';
      return;
    }
    atDropdown.innerHTML = '';
    const maxShow = Math.min(atFiles.length, 10);
    for (let i = 0; i < maxShow; i++) {
      const f = atFiles[i];
      const div = document.createElement('div');
      div.className = 'at-item' + (i === atSelectedIndex ? ' active' : '');
      const icon = document.createElement('span');
      icon.className = 'at-icon';
      icon.textContent = f.isDir ? '📁' : '📄';
      const label = document.createElement('span');
      label.className = 'at-label';
      label.textContent = f.path;
      div.appendChild(icon);
      div.appendChild(label);
      const idx = i;
      div.addEventListener('mouseenter', () => { atSelectedIndex = idx; renderAtDropdown(); });
      div.addEventListener('click', (e) => { e.preventDefault(); selectAtItem(f); });
      atDropdown.appendChild(div);
    }
    const activeItem = atDropdown.querySelector('.at-item.active');
    if (activeItem) activeItem.scrollIntoView({ block: 'nearest' });
  }

  function selectAtItem(file) {
    const val = inputBox.value;
    const pos = inputBox.selectionStart;
    const before = val.substring(0, atTriggerPos);
    const after = val.substring(pos);
    const insert = '@' + file.path + ' ';
    inputBox.value = before + insert + after;
    const newPos = before.length + insert.length;
    inputBox.setSelectionRange(newPos, newPos);
    inputBox.focus();
    if (!atFileRefs.includes(file.path)) atFileRefs.push(file.path);
    hideAtDropdown();
    inputBox.style.height = 'auto';
    inputBox.style.height = Math.min(inputBox.scrollHeight, 150) + 'px';
  }

  // ─── / Command Dropdown ───
  function getFilteredSlashCommands() {
    if (!slashFilter) return SLASH_COMMANDS;
    const q = slashFilter.toLowerCase();
    return SLASH_COMMANDS.filter(c => c.cmd.toLowerCase().includes(q) || c.desc.toLowerCase().includes(q));
  }

  function checkSlashTrigger() {
    if (atVisible) { hideSlashDropdown(); return; }
    const val = inputBox.value;
    const pos = inputBox.selectionStart;
    if (pos < 0) { hideSlashDropdown(); return; }
    const before = val.substring(0, pos);
    if (atVisible) { hideSlashDropdown(); return; }
    const slashIndex = before.lastIndexOf('/');
    if (slashIndex === 0) {
      const query = before.slice(1);
      if (query.indexOf(' ') === -1 && query.indexOf('\t') === -1) {
        slashFilter = query;
        slashSelectedIndex = 0;
        slashVisible = true;
        slashDropdown.classList.add('visible');
        renderSlashDropdown();
        return;
      }
    }
    hideSlashDropdown();
  }

  function hideSlashDropdown() {
    slashVisible = false;
    slashFilter = '';
    slashDropdown.classList.remove('visible');
  }

  function renderSlashDropdown() {
    if (!slashVisible) return;
    const filtered = getFilteredSlashCommands();
    if (filtered.length === 0) {
      slashDropdown.innerHTML = '<div class="at-empty">No matching commands</div>';
      return;
    }
    slashDropdown.innerHTML = '';
    const maxShow = Math.min(filtered.length, 10);
    for (let i = 0; i < maxShow; i++) {
      const c = filtered[i];
      const div = document.createElement('div');
      div.className = 'at-item' + (i === slashSelectedIndex ? ' active' : '');
      div.dataset.cmd = c.cmd;
      div.innerHTML = '<span class="at-icon">⚡</span><span class="at-label">' + c.cmd + '</span><span style="font-size:11px;color:var(--text-muted);margin-left:8px;white-space:nowrap;">' + c.desc + '</span>';
      slashDropdown.appendChild(div);
    }
    const activeItem = slashDropdown.querySelector('.at-item.active');
    if (activeItem) activeItem.scrollIntoView({ block: 'nearest' });
  }

  function updateSlashActive() {
    const items = slashDropdown.querySelectorAll('.at-item');
    items.forEach((el, i) => el.classList.toggle('active', i === slashSelectedIndex));
  }

  function selectSlashCommand(cmd) {
    inputBox.value = cmd.cmd + ' ';
    inputBox.setSelectionRange(inputBox.value.length, inputBox.value.length);
    inputBox.focus();
    hideSlashDropdown();
    inputBox.style.height = 'auto';
    inputBox.style.height = Math.min(inputBox.scrollHeight, 150) + 'px';
  }

  function appendMessage(msg) {
    emptyState.style.display = 'none';
    const div = document.createElement('div');
    div.className = 'msg msg-' + msg.role;
    const bubble = document.createElement('div');
    bubble.className = 'msg-bubble';
    if (msg.role === 'assistant' && typeof marked !== 'undefined') {
      bubble.innerHTML = marked.parse(msg.text);
    } else {
      bubble.textContent = msg.text;
    }
    div.appendChild(bubble);
    if (msg.timestamp) {
      const time = document.createElement('div');
      time.className = 'msg-time';
      time.textContent = new Date(msg.timestamp).toLocaleTimeString();
      div.appendChild(time);
    }
    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function clearMessages() {
    messagesEl.innerHTML = '';
    messagesEl.appendChild(emptyState);
    emptyState.style.display = '';
  }

  function updateStream(text, done) {
    if (!streamEl && !done) {
      emptyState.style.display = 'none';
      streamEl = document.createElement('div');
      streamEl.className = 'msg msg-assistant';
      const bubble = document.createElement('div');
      bubble.className = 'msg-bubble';
      streamEl.appendChild(bubble);
      messagesEl.appendChild(streamEl);
    }
    if (streamEl) {
      const bubble = streamEl.querySelector('.msg-bubble');
      if (bubble) {
        if (text && typeof marked !== 'undefined') {
          bubble.innerHTML = marked.parse(text);
        } else {
          bubble.textContent = text;
        }
      }
      messagesEl.scrollTop = messagesEl.scrollHeight;
    }
    if (done) streamEl = null;
  }

  function showTyping(show, text) {
    typingEl.classList.toggle('active', show);
    const typingText = document.getElementById('typingText');
    if (typingText && text) typingText.textContent = text;
    if (show) messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function updateAgentCard() {
    agentOrb.textContent = agent.emoji || '🤖';
    agentOrb.className = 'agent-orb' + (connected ? ' online' : '');
    agentNameEl.textContent = agent.name || agent.id || 'Agent';
    agentStatusEl.textContent = connected ? 'online' : 'disconnected';
    agentStatusEl.className = 'agent-status' + (connected ? ' online' : '');
  }

  function updateChips() {
    thinkingChip.textContent = 'think: ' + (thinkingLevel || 'default');
    verboseChip.textContent = 'steps: ' + (verboseLevel || 'default');
    reliabilityValue.textContent = (thinkingLevel || 'default') + ' · ' + (verboseLevel || 'default');
  }

  function renderModels(models) {
    modelValue.textContent = currentModel ? currentModel.split('/').pop() : 'default';
  }

  function renderSessions() {
    sessionsList.innerHTML = '';
    if (sessions.length === 0) {
      sessionsList.innerHTML = '<div style="padding:8px 12px;font-size:12px;color:var(--text-muted);">No sessions</div>';
      return;
    }
    for (const s of sessions) {
      const item = document.createElement('div');
      item.className = 'device-item' + (s.key === currentSession ? ' active' : '');
      const dot = document.createElement('div');
      dot.className = 'device-dot' + (s.key === currentSession ? ' active' : '');
      const info = document.createElement('div');
      info.className = 'device-info';
      const name = document.createElement('div');
      name.className = 'device-name';
      name.textContent = s.displayName || s.key;
      const meta = document.createElement('div');
      meta.className = 'device-meta';
      meta.textContent = s.agentId || s.key;
      info.appendChild(name);
      info.appendChild(meta);
      const tokens = document.createElement('div');
      tokens.className = 'device-tokens';
      if (s.totalTokens) tokens.textContent = formatTokens(s.totalTokens);
      const del = document.createElement('button');
      del.className = 'device-delete';
      del.textContent = '×';
      del.addEventListener('click', (e) => {
        e.stopPropagation();
        vscode.postMessage({ type: 'deleteSession', sessionKey: s.key });
      });
      item.appendChild(dot);
      item.appendChild(info);
      item.appendChild(tokens);
      item.appendChild(del);
      item.addEventListener('click', () => {
        currentSession = s.key;
        vscode.postMessage({ type: 'switchSession', sessionKey: s.key });
        renderSessions();
      });
      sessionsList.appendChild(item);
    }
  }

  function updateContextMeter() {
    const s = sessions.find(x => x.key === currentSession);
    if (s && s.totalTokens && s.contextTokens) {
      const pct = Math.min(100, Math.round(s.totalTokens / s.contextTokens * 100));
      contextFill.style.width = pct + '%';
      contextFill.className = 'context-fill' + (pct > 90 ? ' danger' : pct > 70 ? ' warning' : '');
    } else {
      contextFill.style.width = '0%';
      contextFill.className = 'context-fill';
    }
  }

  function renderAgentButtons() {
    const container = document.getElementById('agentButtons');
    if (!container) return;
    container.innerHTML = '';
    if (agents.length <= 1) return;
    for (const a of agents) {
      const btn = document.createElement('button');
      btn.className = 'agent-btn' + (a.id === agent.id ? ' active' : '');
      const emoji = document.createElement('span');
      emoji.className = 'agent-btn-emoji';
      emoji.textContent = a.emoji || '🤖';
      const name = document.createElement('span');
      name.textContent = a.name || a.id;
      btn.appendChild(emoji);
      btn.appendChild(name);
      btn.addEventListener('click', () => {
        // Find existing tab for this agent or create new one
        let tab = tabs.find(t => t.agentId === a.id);
        if (!tab) {
          tab = {
            id: 'tab-' + a.id + '-' + Date.now(),
            label: a.name || a.id,
            agentId: a.id,
            sessionKey: 'main',
            messages: []
          };
          tabs.push(tab);
        }
        switchToTab(tab.id);
      });
      container.appendChild(btn);
    }
  }

  function renderTabs() {
    const tabBar = document.getElementById('tabsBar');
    if (!tabBar) return;
    tabBar.querySelectorAll('.tab-item').forEach(el => el.remove());
    for (const t of tabs) {
      const div = document.createElement('div');
      div.className = 'tab-item' + (t.id === activeTabId ? ' active' : '');
      div.dataset.tabId = t.id;
      const label = document.createElement('span');
      label.textContent = t.label;
      div.appendChild(label);
      // Close button (not for the default Chat tab)
      if (t.id !== 'tab-main') {
        const close = document.createElement('span');
        close.className = 'tab-close';
        close.textContent = '\u00d7';
        close.addEventListener('click', (e) => {
          e.stopPropagation();
          closeTab(t.id);
        });
        div.appendChild(close);
      }
      div.addEventListener('click', () => switchToTab(t.id));
      tabBar.insertBefore(div, document.getElementById('btnAddTab'));
    }
  }

  function closeTab(tabId) {
    const idx = tabs.findIndex(t => t.id === tabId);
    if (idx < 0 || tabId === 'tab-main') return;
    tabs.splice(idx, 1);
    if (activeTabId === tabId) {
      // Switch to the last tab, or default Chat tab
      const newTab = tabs[Math.min(idx, tabs.length - 1)] || tabs[0];
      switchToTab(newTab.id);
    } else {
      renderTabs();
    }
  }

  function switchToTab(tabId) {
    const tab = tabs.find(t => t.id === tabId);
    if (!tab) return;
    // Save current tab's messages
    const oldTab = getActiveTab();
    if (oldTab) oldTab.messages = activeTabMessages.slice();
    activeTabId = tabId;
    agent = agents.find(a => a.id === tab.agentId) || agent;
    currentSession = tab.sessionKey;
    // Load new tab's messages
    activeTabMessages = (tab.messages || []).slice();
    clearMessages();
    for (const m of activeTabMessages) appendMessage(m);
    updateAgentCard();
    renderAgentButtons();
    renderTabs();
    // Tell extension to switch agent/session
    vscode.postMessage({ type: 'switchTab', agentId: tab.agentId, sessionKey: tab.sessionKey });
  }

  function formatTokens(n) {
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(0) + 'K';
    return n.toString();
  }
})();
</script>
</body>
</html>`;
  }
}

const MIME_MAP: Record<string, string> = {
  ".txt": "text/plain", ".md": "text/markdown", ".json": "application/json",
  ".js": "application/javascript", ".ts": "application/typescript",
  ".jsx": "application/javascript", ".tsx": "application/typescript",
  ".py": "text/x-python", ".rb": "text/x-ruby", ".go": "text/x-go",
  ".rs": "text/x-rust", ".java": "text/x-java", ".c": "text/x-c",
  ".cpp": "text/x-c++", ".h": "text/x-c", ".hpp": "text/x-c++",
  ".cs": "text/x-csharp", ".php": "text/x-php", ".swift": "text/x-swift",
  ".kt": "text/x-kotlin", ".scala": "text/x-scala",
  ".html": "text/html", ".htm": "text/html", ".css": "text/css",
  ".scss": "text/x-scss", ".less": "text/x-less",
  ".xml": "application/xml", ".yaml": "application/yaml", ".yml": "application/yaml",
  ".toml": "application/toml", ".ini": "text/plain", ".cfg": "text/plain",
  ".sh": "text/x-shellscript", ".bash": "text/x-shellscript",
  ".zsh": "text/x-shellscript", ".fish": "text/x-shellscript",
  ".bat": "text/plain", ".cmd": "text/plain", ".ps1": "text/plain",
  ".sql": "text/x-sql", ".graphql": "text/x-graphql",
  ".env": "text/plain", ".gitignore": "text/plain", ".dockerignore": "text/plain",
  ".csv": "text/csv", ".tsv": "text/tab-separated-values",
  ".log": "text/plain", ".conf": "text/plain", ".config": "text/plain",
  ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg", ".gif": "image/gif", ".webp": "image/webp",
  ".bmp": "image/bmp", ".ico": "image/x-icon", ".tiff": "image/tiff",
  ".pdf": "application/pdf", ".zip": "application/zip",
  ".gz": "application/gzip", ".tar": "application/x-tar",
  ".mp3": "audio/mpeg", ".mp4": "video/mp4", ".wav": "audio/wav",
  ".woff": "font/woff", ".woff2": "font/woff2", ".ttf": "font/ttf",
  ".wasm": "application/wasm",
};

function getMimeType(filePath: string): string {
  const dot = filePath.lastIndexOf(".");
  if (dot === -1) return "text/plain";
  const ext = filePath.substring(dot).toLowerCase();
  return MIME_MAP[ext] || "text/plain";
}

function getNonce(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
