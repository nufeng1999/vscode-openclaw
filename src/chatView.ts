import * as vscode from "vscode";
import { OpenClawGateway } from "./gateway";
import type { OutputChannel } from "vscode";
import * as fs from "fs";
import * as path from "path";

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
  private autoContinueCount = 0;
  private supervisionEnabled = false;
  private supervisionTimer: NodeJS.Timeout | null = null;
  private lastSupervisedContent: string = "";
  private supervisorBusy: boolean = false;
  private supervisorPendingSessionKey: string | null = null;
  private supervisorResponseResolver: ((text: string | null) => void) | null = null;
  private supervisorTimeout: NodeJS.Timeout | null = null;
  private supervisorAccumulated: string = "";
  private busyCount = 0;
  // Subagent activity tracking (Requirement A)
  private lastSubagentEventMs = 0;
  private activeSubagentCount = 0;
  private subagentTimer: NodeJS.Timeout | null = null;
  private static readonly SUBAGENT_ACTIVITY_TIMEOUT_MS = 60_000;
  // sessions_yield tracking (Requirement B): set when busy + active subagent
  private yieldState = false;
  private yieldTimer: NodeJS.Timeout | null = null;
  private static readonly AUTO_CONTINUE_MAX = 3;
  private static readonly ERROR_PATTERNS = [
    "The agent run failed before producing a reply", // ✅ GATEWAY_ASSISTANT_ERROR_FALLBACK_TEXT
    "Agent run ended before producing a complete result", // ✅ formatAbandonedLivenessError 产出
    "Agent run blocked before producing a usable result", // ✅ formatBlockedLivenessError 产出
    "Agent failed before reply", // ✅ AGENT_FAILED_BEFORE_REPLY_TEXT
    "Agent run failed", // ✅ 通用后备文本
    "ACP turn failed before completion" // ✅ ACP 轮次失败
  ];

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

  public setInputText(text: string) {
    this.postToWebview({ type: "setInputText", text });
  }

  public newChat() {
    this.messages = [];
    this.currentSessionKey = "main";
    this.postToWebview({ type: "clearMessages" });
  }

  public updateConnectionStatus(connected: boolean) {
    // 发送完整的 init 消息，确保 webview 拿到权威状态
    this.postToWebview({
      type: "init",
      sessionKey: this.currentSessionKey,
      model: this.currentModel,
      connected,
      agent: this.activeAgent,
      gatewayUrl: this.gatewayUrl,
      thinkingLevel: this.thinkingLevel,
      verboseLevel: this.verboseLevel,
      messageHistory: this.messageHistory,
      supervisionEnabled: this.supervisionEnabled
    });
    // 同时发送 connectionStatus（保持向后兼容）
    this.postToWebview({
      type: "connectionStatus",
      connected,
      agent: this.activeAgent
    });
    // 如果连上了，主动拉取最新数据
    if (connected) {
      this.handleRequestModels().catch(() => {});
      this.handleRequestSessions().catch(() => {});
      this.handleRequestAgents().catch(() => {});
      this.handleLoadMessages(this.currentSessionKey).catch(() => {});
    }
  }

  /**
   * Public method to send text to the chat view
   * @param text The text to send
   */
  public async sendText(text: string) {
    await this.handleSendMessage(text);
  }

  // Match Obsidian plugin's handleChatEvent
  public handleChatEvent(payload: any) {
    const sessionKey = this.resolveSession(payload?.sessionKey);
    const rawSessionKey = payload?.sessionKey || "";
    const state = typeof payload?.state === "string" ? payload.state : "";
    
    // Intercept supervisor agent responses
    if (this.supervisorPendingSessionKey && rawSessionKey === this.supervisorPendingSessionKey) {
      if (state === "delta") {
        const text = this.extractDeltaText(payload?.message);
        if (text) {
          this.supervisorAccumulated += text;
          this.log(`Supervisor delta chunk: +${text.length} chars (total=${this.supervisorAccumulated.length})`);
        }
      } else if (state === "final") {
        const finalText = this.extractDeltaText(payload?.message);
        const fullReply = finalText || this.supervisorAccumulated;
        
        this.log(`Supervisor final reply: ${fullReply.substring(0, 80)}...`);
        
        // Clean up
        if (this.supervisorTimeout) {
          clearTimeout(this.supervisorTimeout);
          this.supervisorTimeout = null;
        }
        this.supervisorPendingSessionKey = null;
        const resolver = this.supervisorResponseResolver;
        this.supervisorResponseResolver = null;
        this.supervisorAccumulated = "";
        
        if (resolver) {
          resolver(fullReply);
        }
        // Don't forward supervisor events to webview
        return;
      } else if (state === "error") {
        if (this.supervisorTimeout) {
          clearTimeout(this.supervisorTimeout);
          this.supervisorTimeout = null;
        }
        this.supervisorPendingSessionKey = null;
        const resolver = this.supervisorResponseResolver;
        this.supervisorResponseResolver = null;
        this.supervisorAccumulated = "";
        if (resolver) {
          resolver(null);
        }
        return;
      }
    }

    // ── Requirement A: detect subagent activity ──
    // sessionKey patterns like agent:<parentAgentId>:subagent:<uuid>
    if (rawSessionKey && rawSessionKey.includes('subagent')) {
      // Only track subagent events belonging to the current agent (as parent)
      const m = rawSessionKey.match(/^agent:([^:]+):/);
      if (m && m[1] === this.activeAgent.id) {
        this.lastSubagentEventMs = Date.now();
        this.activeSubagentCount++;
        this.startSubagentTimer();
        // Extract a short label from the sessionKey tail
        const tail = rawSessionKey.split(':').pop() || 'subagent';
        const shortLabel = tail.length > 12 ? tail.substring(0, 8) + '…' : tail;
        this.postToWebview({
          type: 'subagentState',
          active: true,
          label: vscode.l10n.t('Subagent active: {0}', shortLabel),
          state
        });
        this.updateYieldState();
      }
      // Subagent events are never forwarded to the main chat view
      return;
    }

    // Only forward events for the current active agent
    if (rawSessionKey) {
      const m = rawSessionKey.match(/^agent:([^:]+):/);
      if (m && m[1] !== this.activeAgent.id) {
        this.log(`chatEvent discarded: agent=${m[1]} != current=${this.activeAgent.id}`);
        return;
      }
    }

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
          // Check if response is an error pattern that needs "Continue"
          const isErrorResponse = OpenClawChatView.ERROR_PATTERNS.some(
            pattern => finalText.includes(pattern)
          );
          
          if (isErrorResponse) {
            this.autoContinueCount++;
            this.log(`Auto-continue retry ${this.autoContinueCount}/${OpenClawChatView.AUTO_CONTINUE_MAX}`);
            
            if (this.autoContinueCount >= OpenClawChatView.AUTO_CONTINUE_MAX) {
              // Max retries reached, show error to user
              this.postToWebview({ 
                type: "autoContinueFailed", 
                sessionKey, 
                count: this.autoContinueCount 
              });
              this.autoContinueCount = 0;
            } else {
              // Send "Continue" to retry (not recorded in history)
              this.postToWebview({ type: "streamDelta", sessionKey, text: finalText });
              this.postToWebview({ type: "streamDone", sessionKey });
              this.sendContinueMessage();
              return;
            }
          } else {
            // Normal response - reset counter
            if (this.autoContinueCount > 0) {
              this.autoContinueCount = 0;
              this.context.globalState.update("openclaw.autoContinueCount", 0);
            }
            // Display the final message directly
            this.postToWebview({ type: "streamDelta", sessionKey, text: finalText });
          }
        }
      }
      this.postToWebview({ type: "streamDone", sessionKey });
      this.setBusy(false);
    } else if (state === "aborted") {
      this.log(`stream aborted`);
      this.postToWebview({ type: "streamDone", sessionKey });
      this.setBusy(false);
    } else if (state === "error") {
      const errorMsg = payload?.errorMessage || "unknown error";
      this.log(`stream error: ${errorMsg}`);
      this.postToWebview({ type: "streamError", sessionKey, error: errorMsg });
      this.setBusy(false);
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
    if (typeof message === "string") return this.resolveMediaPaths(message);
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
      return this.resolveMediaPaths(text);
    }

    if (typeof content === "string") return this.resolveMediaPaths(content);
    return message.text || "";
  }

  private resolveMediaPaths(text: string): string {
    if (!text || text.indexOf("MEDIA:") === -1) return text;
    
    const segments = text.split("\n");
    const resolvedSegments: string[] = [];
    
    for (const segment of segments) {
      if (segment.indexOf("MEDIA:") === 0) {
        const mediaPath = segment.slice(6).trim();
        const result = this.convertMediaToMarkdown(mediaPath);
        if (result) {
          resolvedSegments.push(result);
        }
      } else {
        resolvedSegments.push(segment);
      }
    }
    
    return resolvedSegments.join("\n");
  }

  private convertMediaToMarkdown(mediaPath: string): string | null {
    try {
      if (!mediaPath) return null;

      // ── 远程 URL 支持：http:// 或 https:// 开头 ──
      if (mediaPath.startsWith("http://") || mediaPath.startsWith("https://")) {
        return this.buildRemoteMediaTag(mediaPath);
      }

      // 否则处理本地文件（现有 base64 逻辑）
      // Normalize path: handle both forward and backward slashes
      const normalizedPath = mediaPath.replace(/\\/g, "/");
      
      // Try to read file as buffer
      let buffer: Buffer;
      try {
        buffer = fs.readFileSync(mediaPath);
      } catch {
        // Try with forward slashes
        try {
          buffer = fs.readFileSync(normalizedPath);
        } catch {
          // Return original path as text
          return null;
        }
      }
      
      // Detect MIME type from extension
      const ext = path.extname(mediaPath).toLowerCase();
      const mediaInfo = this.getMediaInfo(ext);
      let mimeType = mediaInfo.mimeType;
      let tag = mediaInfo.tag;
      
      // Convert to base64
      const base64 = buffer.toString("base64");
      const dataUrl = `data:${mimeType};base64,${base64}`;
      
      // Generate markdown
      return this.buildMediaTag(tag, dataUrl);
    } catch {
      // Return original path if conversion fails
      return null;
    }
  }

  /**
   * 根据扩展名解析媒体类型信息（MIME 类型与 HTML 标签名）。
   * 统一用于本地文件与远程 URL 两种路径，保证行为一致。
   */
  private getMediaInfo(ext: string): { mimeType: string; tag: string } {
    switch (ext) {
      // 图片
      case ".png":
        return { mimeType: "image/png", tag: "img" };
      case ".jpg":
      case ".jpeg":
        return { mimeType: "image/jpeg", tag: "img" };
      case ".gif":
        return { mimeType: "image/gif", tag: "img" };
      case ".webp":
        return { mimeType: "image/webp", tag: "img" };
      case ".svg":
        return { mimeType: "image/svg+xml", tag: "img" };
      // 视频
      case ".mp4":
        return { mimeType: "video/mp4", tag: "video" };
      case ".webm":
        return { mimeType: "video/webm", tag: "video" };
      case ".ogv":
        return { mimeType: "video/ogg", tag: "video" };
      case ".avi":
        return { mimeType: "video/x-msvideo", tag: "video" };
      case ".mov":
        return { mimeType: "video/quicktime", tag: "video" };
      // 音频
      case ".mp3":
        return { mimeType: "audio/mpeg", tag: "audio" };
      case ".wav":
        return { mimeType: "audio/wav", tag: "audio" };
      case ".ogg":
      case ".oga":
        return { mimeType: "audio/ogg", tag: "audio" };
      case ".m4a":
        return { mimeType: "audio/mp4", tag: "audio" };
      case ".flac":
        return { mimeType: "audio/flac", tag: "audio" };
      // 默认
      default:
        return { mimeType: "application/octet-stream", tag: "img" };
    }
  }

  /**
   * 为远程 URL 直接生成 HTML 标签（video/audio/img）。
   * 外部 URL 直接作为 src 使用，webview 需开启 enableResourceLoading 才能加载。
   */
  private buildRemoteMediaTag(url: string): string {
    // 去除 URL 中可能携带的查询参数后再取扩展名
    const cleanUrl = url.split("#")[0].split("?")[0];
    const ext = path.extname(cleanUrl).toLowerCase();
    const { tag } = this.getMediaInfo(ext);
    return this.buildMediaTag(tag, url);
  }

  /**
   * 根据标签名与数据源生成最终 HTML 标签。
   * video/audio 添加 controls 属性；img 添加样式限制大小。
   */
  private buildMediaTag(tag: string, src: string): string {
    if (tag === "video") {
      return `<video src="${src}" controls preload="metadata" style="max-width:100%;max-height:400px;border-radius:6px;"></video>`;
    } else if (tag === "audio") {
      return `<audio src="${src}" controls preload="metadata" style="max-width:100%;"></audio>`;
    } else {
      return `<img src="${src}" alt="media" style="max-width:100%;max-height:400px;border-radius:6px;" />`;
    }
  }

  private extractHistoryContent(content: any): string {
    if (typeof content === "string") return this.resolveMediaPaths(content);
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
      return this.resolveMediaPaths(text);
    }
    return "";
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
      enableResourceLoading: true,
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
            await this.handleLoadMessages(this.currentSessionKey);
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
            messageHistory: this.messageHistory,
            supervisionEnabled: this.supervisionEnabled
          });
          break;
        case "sendMessage":
          await this.handleSendMessage(msg.text, msg.fileRefs, msg.attachments);
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
                (pErr, pStdout) => {
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
        case "openSettings":
          vscode.commands.executeCommand("workbench.action.openSettings", "openclaw");
          break;
        case "openModelPicker":
          vscode.commands.executeCommand("openclaw.settings");
          break;
        case "searchFiles":
          await this.handleSearchFiles(msg.query, msg.requestId);
          break;
        case "openWorkdir":
          await this.handleOpenWorkdir();
          break;
        case "toggleSupervision":
          await this.handleToggleSupervision(msg.enabled);
          break;
        case "reconnect":
          vscode.commands.executeCommand('openclaw.reconnect');
          break;
      }
    });
  }

  private async handleSendMessage(text: string, fileRefs?: string[], webviewAttachments?: any[]) {
    if (!text.trim()) return;
    if (!this.gateway.connected) {
      vscode.window.showWarningMessage(vscode.l10n.t("OpenClaw: Not connected to gateway"));
      return;
    }
    
    // Reset auto-continue counter when user sends a new message
    if (this.autoContinueCount > 0) {
      this.autoContinueCount = 0;
      this.context.globalState.update("openclaw.autoContinueCount", 0);
    }

    const userMsg: ChatMessage = {
      role: "user",
      text,
      timestamp: Date.now()
    };
    
    // 先初始化 attachments
    let attachments: any[] = [];
    if (webviewAttachments && webviewAttachments.length > 0) {
      // Convert webview format {name, size, mimeType, data} to OpenClaw format
      attachments = webviewAttachments.map(a => ({
        type: 'file',
        mimeType: a.mimeType,
        fileName: a.name,
        content: a.data
      }));
    } else if (fileRefs) {
      attachments = await this.buildAttachments(fileRefs);
    }
    
    this.messages.push(userMsg);
    this.messageHistory.push(text);
    if (this.messageHistory.length > 200) {
      this.messageHistory = this.messageHistory.slice(-200);
    }
    this.context.globalState.update("openclaw.messageHistory", this.messageHistory);
    // Send user message with attachments for rendering
    const msgWithAttachments = (webviewAttachments && webviewAttachments.length > 0) || attachments.length > 0 ? {
      ...userMsg,
      attachments: webviewAttachments || []
    } : userMsg;
    this.postToWebview({ type: "userMessage", message: msgWithAttachments });
    this.postToWebview({ type: "historyUpdated", messageHistory: this.messageHistory });

    const runId = this.genId();
    this.postToWebview({ type: "streamStart", runId });

    try {
      const res = await this.gateway.request("chat.send", {
        sessionKey: this.gwSessionKey(),
        message: text,
        deliver: false,
        idempotencyKey: runId,
        ...(attachments.length > 0 ? { attachments } : {})
      }) as any;
      this.setBusy(true);
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
        this.setBusy(false);  // fix: close busy state for slash commands that don't produce streaming runs
      }
    } catch (err: any) {
      this.messages.push({
        role: "assistant",
        text: `Error: ${err}`,
        timestamp: Date.now()
      });
      this.postToWebview({ type: "streamDone", runId });
      this.setBusy(false);
    }
  }

  /**
   * Send a message without adding it to local history (used for auto-continue).
   * Note: do NOT call setBusy(true) here -- the parent send is already busy.
   * The parent busyCount will be decremented when the final/aborted/error state arrives.
   */
  private async sendContinueMessage() {
    if (!this.gateway.connected) return;
    const runId = this.genId();
    this.postToWebview({ type: "streamStart", runId });
    try {
      await this.gateway.request("chat.send", {
        sessionKey: this.gwSessionKey(),
        message: "Continue",
        deliver: false,
        idempotencyKey: runId
      }) as any;
    } catch {
      // If sending fails, don't add anything to history
      this.postToWebview({ type: "streamDone", runId });
      this.setBusy(false);
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

      let pattern: string;
      // 清理 query：去掉末尾的路径分隔符，用于过滤匹配
      const cleanQuery = query ? query.replace(/[/\\]+$/, "") : "";
      
      // isRootFolder 提升到外层作用域，供二次过滤使用
      let isRootFolder = false;
      
      if (!query) {
        pattern = "**/*";
      } else {
        // Check if query contains path separator (directory prefix)
        const lastSlashIndex = Math.max(query.lastIndexOf("/"), query.lastIndexOf("\\"));
        if (lastSlashIndex > 0) {
          // Query has directory prefix: split into dirPrefix and fileKeyword
          let dirPrefix = query.substring(0, lastSlashIndex).replace(/\\/g, "/").replace(/^\/+|\/+$/g, "");
          const fileKeyword = query.substring(lastSlashIndex + 1);
          
          // 检查 dirPrefix 是否是工作区根目录名
          const rootFolderNames = folders.map(f => f.name.toLowerCase());
          isRootFolder = rootFolderNames.includes(dirPrefix.toLowerCase());
          
          if (isRootFolder) {
            // dirPrefix 是工作区根目录名：只搜索该工作区文件夹下的文件
            // 使用 RelativePattern 限制搜索范围到指定工作区
            const targetFolder = folders.find(f => f.name.toLowerCase() === dirPrefix.toLowerCase());
            const basePattern = fileKeyword ? `**/*${fileKeyword}*` : `**/*`;
            const relativePattern = new vscode.RelativePattern(targetFolder, basePattern);
            const uris = await vscode.workspace.findFiles(relativePattern, "**/node_modules/**", 200);
            
            // 直接处理结果并返回
            return this.processSearchResults(uris, folders, cleanQuery, requestId, isRootFolder);
          } else if (fileKeyword) {
            // Search for files matching keyword under the specified directory
            pattern = `${dirPrefix}/**/*${fileKeyword}*`;
          } else if (lastSlashIndex === query.length - 1) {
            // Query ends with '/' (e.g., "src/components/"): list all files in that directory
            pattern = `${dirPrefix}/**/*`;
          }
        } else {
          // No directory prefix: global fuzzy search (original behavior)
          pattern = `**/*${query.replace(/[/\\]/g, "*")}*`;
        }
      }
      const uris = await vscode.workspace.findFiles(pattern, "**/node_modules/**", 200);
      return this.processSearchResults(uris, folders, cleanQuery, requestId, isRootFolder);
    } catch {
      this.postToWebview({ type: "fileResults", requestId, files: [] });
    }
  }

  private async processSearchResults(uris: vscode.Uri[], folders: vscode.WorkspaceFolder[], cleanQuery: string, requestId: string, isRootFolder: boolean): Promise<void> {
    const files: { path: string; isDir: boolean }[] = [];
    const seen = new Set<string>();

    // 读取当前浏览目录的直接子目录和文件（用于目录导航）
    if (cleanQuery) {
      let browseUri: vscode.Uri | undefined;
      let displayPrefix: string;
      if (folders.length === 1) {
        const folder = folders[0];
        if (isRootFolder) {
          browseUri = folder.uri;
          displayPrefix = '';
        } else {
          browseUri = vscode.Uri.joinPath(folder.uri, cleanQuery);
          displayPrefix = cleanQuery;
        }
      } else {
        const sep = cleanQuery.indexOf('/');
        if (sep > 0) {
          const folderName = cleanQuery.substring(0, sep);
          const folder = folders.find(f => f.name.toLowerCase() === folderName.toLowerCase());
          if (folder) {
            const relPath = cleanQuery.substring(sep + 1);
            browseUri = vscode.Uri.joinPath(folder.uri, relPath);
            displayPrefix = cleanQuery; // 已包含 folderName/relPath
          }
        } else if (isRootFolder) {
          const folder = folders.find(f => f.name.toLowerCase() === cleanQuery.toLowerCase());
          if (folder) {
            browseUri = folder.uri;
            displayPrefix = folder.name;
          }
        }
      }
      if (browseUri) {
        try {
          const entries = await vscode.workspace.fs.readDirectory(browseUri);
          for (const [name, type] of entries) {
            if (name.startsWith('.')) continue; // 跳过隐藏目录
            const isDir = (type & vscode.FileType.Directory) !== 0;
            const fullPath = displayPrefix ? `${displayPrefix}/${name}` : name;
            if (!seen.has(fullPath)) {
              seen.add(fullPath);
              files.push({ path: fullPath, isDir });
            }
          }
        } catch {
          // 忽略读取目录错误
        }
      }
    }

    for (const uri of uris) {
      // Get workspace folder to support multi-root workspaces
      const workspaceFolder = vscode.workspace.getWorkspaceFolder(uri);
      const relativePath = vscode.workspace.asRelativePath(uri, false).replace(/\\/g, "/");
      
      // In multi-root workspaces, prepend workspace folder name for uniqueness
      let fullPath: string;
      if (folders.length > 1 && workspaceFolder) {
        fullPath = `${workspaceFolder.name}/${relativePath}`;
      } else {
        fullPath = relativePath;
      }
      
      if (seen.has(fullPath)) continue;
      seen.add(fullPath);

      const parts = fullPath.split("/");
      let isDir = false;
      try {
        const stat = await vscode.workspace.fs.stat(uri);
        isDir = (stat.type & vscode.FileType.Directory) !== 0;
      } catch {
        // Ignore stat errors (e.g., file deleted during search)
        isDir = false;
      }

      // 当查询是工作区根目录名时，跳过二次过滤（显示所有文件）
      if (cleanQuery && !isRootFolder) {
        const q = cleanQuery.toLowerCase();
        const name = parts[parts.length - 1].toLowerCase();
        const full = fullPath.toLowerCase();
        if (!name.includes(q) && !full.includes(q)) continue;
      }

      files.push({ path: fullPath, isDir });
      if (files.length >= 30) break;
    }

    // 当 isRootFolder 时，不显示工作区文件夹名本身（它不是自己的子目录）
    const folders2: { path: string; isDir: boolean }[] = [];
    if (!isRootFolder) {
      for (const folder of folders) {
        const folderName = folder.name;
        if (cleanQuery && !folderName.toLowerCase().includes(cleanQuery.toLowerCase())) continue;
        folders2.push({ path: folderName, isDir: true });
      }
    }

    this.postToWebview({
      type: "fileResults",
      requestId,
      files: [...folders2.slice(0, 5), ...files.slice(0, 30)]
    });
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

  private async handleOpenWorkdir() {
    try {
      const agentListRes = await this.gateway.request("agents.list", {});
      const agents = agentListRes?.agents || [];
      const agent = agents.find((a: any) => a.id === this.activeAgent.id);
      let workspace = agent?.workspace || "";
      
      if (!workspace) {
        const configRes = await this.gateway.request("config.get", {});
        const config = configRes?.config || configRes || {};
        workspace = config?.agents?.defaults?.workspace || config?.workspace || "";
      }
      
      if (!workspace) {
        vscode.window.showWarningMessage(vscode.l10n.t("Could not determine working directory"));
        return;
      }
      
      // Normalize path: uppercase drive letter for Windows (e.g. l:\ → L:\)
      const normalizedPath = workspace.replace(/^[a-z]:/i, (match) => match.toUpperCase());
      const workspaceUri = vscode.Uri.file(normalizedPath);
      const folders = vscode.workspace.workspaceFolders;
      
      // Check if the folder is already in the workspace
      let alreadyExists = false;
      if (folders) {
        for (const folder of folders) {
          if (folder.uri.fsPath.toLowerCase() === workspaceUri.fsPath.toLowerCase()) {
            alreadyExists = true;
            break;
          }
        }
      }
      
      if (alreadyExists) {
        // 文件夹已存在，聚焦并在 Explorer 中展开该文件夹
        await vscode.commands.executeCommand('workbench.view.explorer');
        await vscode.commands.executeCommand('revealInExplorer', workspaceUri);
        // 展开当前选中的树节点（显示子内容）
        await vscode.commands.executeCommand('list.expand');
        vscode.window.showInformationMessage(vscode.l10n.t("Expanded workspace folder: {0}", workspaceUri.fsPath));
        return;
      }
      
      // 统一逻辑：无论单根、多根还是无工作区，都以友好方式添加 agent 工作目录
      const currentFolders = vscode.workspace.workspaceFolders;
      const replaceFolders = currentFolders ? currentFolders.map(f => ({ uri: f.uri })) : [];
      replaceFolders.push({ uri: workspaceUri });

      const success = vscode.workspace.updateWorkspaceFolders(
        0,
        currentFolders ? currentFolders.length : 0,
        ...replaceFolders
      );
      
      if (success) {
        vscode.window.showInformationMessage(vscode.l10n.t("Added folder to workspace: {0}", workspaceUri.fsPath));
      } else {
        vscode.window.showErrorMessage(
          `Failed to add folder to workspace: ${workspaceUri.fsPath}. ` +
          `You may need to open a workspace (.code-workspace) file first.`
        );
      }
    } catch (err: any) {
      this.log(`openWorkdir error: ${err.message}`);
      vscode.window.showErrorMessage(vscode.l10n.t("Failed to open working directory: {0}", err.message));
    }
  }

  private async handleToggleSupervision(enabled: boolean) {
    this.log(`handleToggleSupervision called with enabled=${enabled}`);
    this.supervisionEnabled = enabled;
    this.log(`Supervision ${enabled ? 'enabled' : 'disabled'}`);
    // Notify webview of the new state
    this.postToWebview({ type: 'supervisionState', enabled });
    
    if (enabled) {
      this.log("About to call startSupervision()");
      await this.startSupervision();
      this.log("startSupervision() returned");
    } else {
      this.log("About to call stopSupervision()");
      this.stopSupervision();
      this.log("stopSupervision() returned");
    }
  }

  private async startSupervision() {
    this.log(`startSupervision called, supervisionEnabled=${this.supervisionEnabled}, timer=${this.supervisionTimer !== null}`);
    if (this.supervisionTimer) {
      this.log("Timer already running, skipping start");
      return;
    }
    
    const config = vscode.workspace.getConfiguration("openclaw");
    const intervalMinutes = config.get<number>("supervisor.intervalMinutes", 5) || 5;
    const reminderMessage = config.get<string>("supervisor.reminderMessage", "") || "";
    const agentId = config.get<string>("supervisor.agentId", "") || "";
    const stopInquiryMethod = config.get<string>("supervisor.stopInquiryMethod", "") || "";
    const stopSignalReply = config.get<string>("supervisor.stopSignalReply", "yes") || "yes";
    const stopSignalContent = config.get<string>("supervisor.stopSignalContent", "") || "";
    
    this.log(`Config read: interval=${intervalMinutes}min, agentId=${agentId}, reminder=${reminderMessage.substring(0, 30)}, inquiryMethod=${stopInquiryMethod}, stopSignal=${stopSignalReply}, stopSignalContent=${stopSignalContent.substring(0, 30)}`);
    
    if (!agentId) {
      this.log("ERROR: agentId is empty! Cannot start supervision.");
      vscode.window.showWarningMessage(vscode.l10n.t("OpenClaw: Supervisor agent ID not configured"));
      this.supervisionEnabled = false;
      return;
    }
    
    this.log(`Starting supervision with interval ${intervalMinutes}min, agent=${agentId}`);
    
    // --- Hello handshake: connect the supervisor agent (one-time) ---
    const supervisorSessionKey = `agent:${agentId}:main`;
    const HELLO_MESSAGE = "hello， Next, we are ready to have a dialogue on supervision and judgment.Do not reply to the previous sentence.";
    this.log(`Sending supervisor handshake: ${HELLO_MESSAGE}`);
    try {
      const runId = this.genId();
      await this.gateway.request("chat.send", {
        sessionKey: supervisorSessionKey,
        message: HELLO_MESSAGE,
        deliver: false,
        idempotencyKey: runId
      });
      const handshakeReply = await this.waitForSupervisorResponse(supervisorSessionKey, 30000);
      this.log(`Supervisor handshake completed. Supervisor agent reply: ${handshakeReply ? handshakeReply : "(no reply within timeout)"}`);
    } catch (err: any) {
      this.log(`Supervisor handshake failed: ${err?.message || err}`);
    }
    
    // Run immediately, then on interval
    this.supervisionTimer = setInterval(async () => {
      this.log("Interval timer fired, calling runSupervisionCheck...");
      await this.runSupervisionCheck(intervalMinutes, reminderMessage, agentId, stopInquiryMethod, stopSignalReply, stopSignalContent);
      this.log("runSupervisionCheck completed");
    }, intervalMinutes * 60 * 1000);
    
    // Also run once immediately
    this.log("Running immediate supervision check...");
    this.runSupervisionCheck(intervalMinutes, reminderMessage, agentId, stopInquiryMethod, stopSignalReply, stopSignalContent).then(() => {
      this.log("Immediate supervision check completed");
    }).catch((err) => {
      this.log(`Immediate supervision check error: ${err.message}`);
    });
  }

  private stopSupervision() {
    this.log(`stopSupervision called, timer=${this.supervisionTimer !== null}`);
    if (this.supervisionTimer) {
      clearInterval(this.supervisionTimer);
      this.supervisionTimer = null;
      this.log("Supervision timer cleared");
    }
    if (this.supervisorBusy) {
      this.log("WARNING: supervisorBusy is still true, clearing it");
      this.supervisorBusy = false;
    }
    // Always clear the pending request timeout to prevent stale resolves
    if (this.supervisorTimeout) {
      clearTimeout(this.supervisorTimeout);
      this.supervisorTimeout = null;
      this.log("Supervisor request timeout cleared");
    }
    this.supervisorPendingSessionKey = null;
    this.supervisorResponseResolver = null;
    this.supervisorAccumulated = "";
    this.log("Supervision stopped");
  }

  private async runSupervisionCheck(intervalMinutes: number, reminderMessage: string, agentId: string, stopInquiryMethod: string, stopSignalReply: string, stopSignalContent: string) {
    this.log(`runSupervisionCheck called: supervisionEnabled=${this.supervisionEnabled}, supervisorBusy=${this.supervisorBusy}`);
    if (!this.supervisionEnabled) {
      this.log("Supervision not enabled, returning");
      return;
    }
    
    try {
      this.log(`Fetching chat history for session: ${this.gwSessionKey()}`);
      // Get the last assistant message from the current session
      const res = await this.gateway.request("chat.history", {
        sessionKey: this.gwSessionKey(),
        limit: 10
      });
      const msgs = res?.messages || [];
      this.log(`chat.history returned ${msgs.length} messages`);
      
      // Find the last assistant message
      let lastContent = "";
      for (let i = msgs.length - 1; i >= 0; i--) {
        const m = msgs[i];
        this.log(`  Checking message ${i}: role=${m.role}, hasContent=${!!m.content}`);
        if (m.role === "assistant") {
          const text = this.extractHistoryContent(m.content);
          this.log(`  Assistant message text length: ${text?.length || 0}`);
          if (text && !text.startsWith("HEARTBEAT")) {
            lastContent = text;
            this.log(`  Found last assistant content (length=${lastContent.length}), breaking`);
            break;
          }
        }
      }
      
      this.log(`Supervision check: last content length=${lastContent.length}, previous=${this.lastSupervisedContent.length}`);
      
      const isFirstCheck = this.lastSupervisedContent.length === 0;
      
      // --- Every check performs supervisor inquiry ---
      // Guard against concurrent inquiries
      if (this.supervisorBusy) {
        this.log(`Supervisor inquiry skipped: already busy`);
        return;
      }
      
      this.supervisorBusy = true;
      this.log(`Inquiring supervisor every check: ${agentId}`);
      const inquiry = `${stopInquiryMethod}：${lastContent}`;
      const supervisorSessionKey = `agent:${agentId}:main`;
      this.log(`Sending inquiry to supervisor session ${supervisorSessionKey}: ${inquiry.substring(0, 50)}...`);
      
      const runId = this.genId();
      try {
        // Send inquiry to supervisor agent via chat.send to its session
        await this.gateway.request("chat.send", {
          sessionKey: supervisorSessionKey,
          message: inquiry,
          deliver: false,
          idempotencyKey: runId
        });
        
        // Wait for supervisor response via chat event listener
        this.log(`Waiting for supervisor response (timeout 120s)...`);
        const reply = await this.waitForSupervisorResponse(supervisorSessionKey);
        
        if (reply && reply.toLowerCase().trim() === stopSignalReply.toLowerCase().trim()) {
          this.log(`Supervisor replied with stop signal: "${reply}"`);
          this.supervisionEnabled = false;
          this.stopSupervision();
          this.postToWebview({ type: 'supervisionState', enabled: false });
          vscode.window.showInformationMessage(vscode.l10n.t("Supervision stopped by supervisor agent"));
          this.supervisorBusy = false;
          return;
        } else {
          this.log(`Supervisor replied: ${reply?.substring(0, 50)}... (not stop signal, continuing)`);
        }
        this.supervisorBusy = false;
      } catch (err: any) {
        this.log(`Supervisor inquiry failed: ${err.message}`);
        this.supervisorBusy = false;
      }
      
      // First check: store baseline, skip comparison (no previous content)
      if (isFirstCheck) {
        this.log(`First check, storing content baseline (length=${lastContent.length})`);
        this.lastSupervisedContent = lastContent;
        return;
      }
      
      // --- Content comparison ---
      if (lastContent === this.lastSupervisedContent && lastContent.length > 0) {
        // Content unchanged, send reminder
        this.log(`Content SAME (length=${lastContent.length}) → sending reminder`);
        if (reminderMessage) {
          this.log(`Sending reminder to active agent: ${reminderMessage.substring(0, 50)}...`);
          const runId = this.genId();
          try {
            await this.gateway.request("chat.send", {
              sessionKey: this.gwSessionKey(),
              message: reminderMessage,
              deliver: false,
              idempotencyKey: runId
            });
            this.log(`Reminder sent successfully`);
          } catch (err: any) {
            this.log(`Reminder send failed: ${err.message}`);
          }
        } else {
          this.log(`WARNING: reminderMessage is empty, skip sending`);
        }
      } else if (lastContent !== this.lastSupervisedContent && lastContent.length > 0) {
        // Content changed, check for stop signal content
        this.log(`Content DIFFERENT: previous=${this.lastSupervisedContent.length}, current=${lastContent.length}`);
        if (stopSignalContent) {
          const stopSignals = stopSignalContent.split("|").map(s => s.trim()).filter(s => s.length > 0);
          if (stopSignals.some(signal => lastContent.includes(signal))) {
            this.log(`stopSignalContent matched in changed content: "${stopSignalContent.substring(0, 30)}"`);
            this.supervisionEnabled = false;
            this.stopSupervision();
            this.postToWebview({ type: 'supervisionState', enabled: false });
            vscode.window.showInformationMessage(vscode.l10n.t("Supervision stopped: stop signal content detected"));
            return;
          } else {
            this.log(`stopSignalContent not matched (or empty), continuing`);
          }
        }
      } else {
        // Empty content, just update
        this.log(`Last content is empty, updating baseline`);
      }
      
      // Update last supervised content
      this.lastSupervisedContent = lastContent;
    } catch (err: any) {
      this.log(`Supervision check error: ${err.message}`);
    }
  }

  private waitForSupervisorResponse(supervisorSessionKey: string, timeoutMs = 120000): Promise<string | null> {
    return new Promise((resolve) => {
      // Set up state for intercepting the supervisor's reply
      this.supervisorPendingSessionKey = supervisorSessionKey;
      this.supervisorResponseResolver = resolve;
      this.supervisorAccumulated = "";
      
      const timeout = setTimeout(() => {
        this.log(`Supervisor response timeout after ${timeoutMs}ms (accumulated=${this.supervisorAccumulated.length})`);
        this.supervisorTimeout = null;
        this.supervisorPendingSessionKey = null;
        this.supervisorResponseResolver = null;
        resolve(this.supervisorAccumulated || null);
      }, timeoutMs);
      
      this.supervisorTimeout = timeout;
    });
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

  private setBusy(active: boolean) {
    if (active) this.busyCount = Math.max(1, this.busyCount + 1);
    else this.busyCount = Math.max(0, this.busyCount - 1);
    const n = this.busyCount;
    this.postToWebview({
      type: "busyState",
      busy: n > 0,
      label: n > 1
        ? vscode.l10n.t("Processing ({0} queued)", n)
        : vscode.l10n.t("Processing...")
    });
    this.updateYieldState();
  }

  /**
   * Start (or reset) the subagent activity timeout timer.
   * When no subagent event arrives within SUBAGENT_ACTIVITY_TIMEOUT_MS,
   * the indicator is hidden automatically.
   */
  private startSubagentTimer() {
    if (this.subagentTimer) clearTimeout(this.subagentTimer);
    this.subagentTimer = setTimeout(() => {
      this.subagentTimer = null;
      this.activeSubagentCount = 0;
      this.postToWebview({
        type: 'subagentState',
        active: false,
        label: '',
        state: ''
      });
      this.updateYieldState();
    }, OpenClawChatView.SUBAGENT_ACTIVITY_TIMEOUT_MS);
  }

  /**
   * Requirement B: heuristic sessions_yield detection.
   * Yield state = busyCount > 0 AND there is recent subagent activity.
   */
  private updateYieldState() {
    const shouldYield = this.busyCount > 0 &&
      (Date.now() - this.lastSubagentEventMs) < OpenClawChatView.SUBAGENT_ACTIVITY_TIMEOUT_MS &&
      this.activeSubagentCount > 0;
    if (shouldYield === this.yieldState) return;
    this.yieldState = shouldYield;
    this.postToWebview({
      type: 'yieldState',
      active: shouldYield,
      label: shouldYield ? vscode.l10n.t('Waiting for subagent…') : ''
    });
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
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline' https://cdnjs.cloudflare.com https://unpkg.com; script-src 'nonce-${nonce}' https://cdnjs.cloudflare.com https://unpkg.com; img-src data: https: blob:; media-src data: https:;">
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

/* Reconnect 按钮样式：位于 agent-status 右侧，离线时显示 */
.btn-reconnect {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 4px;
  border: 1px solid var(--border);
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
  margin-left: 8px;
  line-height: 1.4;
  flex-shrink: 0;
}
.btn-reconnect:hover {
  background: rgba(128, 128, 128, 0.2);
}

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
.hud-section-value { flex: 1; min-width: 0; text-align: right; color: var(--text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-size: 12px; display: flex; align-items: center; gap: 6px; }
.hud-section-chevron { color: var(--text-muted); opacity: 0.35; font-size: 13px; flex: 0 0 auto; }
.hud-section-toggle:disabled .hud-section-chevron { visibility: hidden; }
.open-workdir-btn {
  width: 24px; height: 24px; border-radius: 4px; border: 1px solid var(--border);
  background: transparent; color: var(--text-muted); cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  font-size: 12px;
}
.open-workdir-btn:hover { background: var(--hover); color: var(--text); }
.open-workdir-btn:disabled { opacity: 0.5; cursor: not-allowed; }

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
.busy-indicator {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  margin: 0 10px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: rgba(128, 128, 128, 0.06);
  color: var(--text-muted);
  font-size: 12px;
  font-weight: 500;
}
.busy-indicator::before {
  content: "";
  width: 12px;
  height: 12px;
  border: 2px solid var(--border);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  flex-shrink: 0;
}
.busy-indicator.hidden { display: none; }

/* Subagent activity indicator (Requirement A) */
.subagent-indicator {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  margin: 0 10px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: rgba(100, 160, 255, 0.06);
  color: var(--text-muted);
  font-size: 11px;
  font-weight: 500;
  transition: opacity 0.3s ease, max-height 0.3s ease, padding 0.3s ease, margin 0.3s ease;
  opacity: 1;
  max-height: 40px;
  overflow: hidden;
}
.subagent-indicator::before {
  content: "";
  width: 10px;
  height: 10px;
  border: 2px solid var(--border);
  border-top-color: #6aa0ff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  flex-shrink: 0;
}
.subagent-indicator.hidden {
  opacity: 0;
  max-height: 0;
  padding-top: 0;
  padding-bottom: 0;
  margin-top: 0;
  margin-bottom: 0;
  border-width: 0;
}

/* sessions_yield indicator (Requirement B) */
.yield-indicator {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  margin: 0 10px;
  border: 1px solid rgba(230, 190, 60, 0.35);
  border-radius: 8px;
  background: rgba(230, 190, 60, 0.08);
  color: #e6be3c;
  font-size: 11px;
  font-weight: 500;
  transition: opacity 0.3s ease, max-height 0.3s ease, padding 0.3s ease, margin 0.3s ease;
  opacity: 1;
  max-height: 40px;
  overflow: hidden;
}
.yield-indicator::before {
  content: "";
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #e6be3c;
  animation: yield-pulse 1.2s ease-in-out infinite;
  flex-shrink: 0;
}
@keyframes yield-pulse {
  0%, 100% { opacity: 0.4; transform: scale(0.8); }
  50% { opacity: 1; transform: scale(1.2); }
}
.yield-indicator.hidden {
  opacity: 0;
  max-height: 0;
  padding-top: 0;
  padding-bottom: 0;
  margin-top: 0;
  margin-bottom: 0;
  border-width: 0;
}

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
.msg-attachments { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px; }
.msg-attachment-img { max-width: 200px; max-height: 200px; border-radius: 8px; border: 1px solid var(--border); object-fit: cover; }
.msg-bubble a { color: inherit; text-decoration: underline; }

.tool-call { display: flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: 8px; background: rgba(128, 128, 128, 0.06); border: 1px solid var(--border); font-size: 12px; color: var(--text-muted); }

.typing { display: none; align-items: center; gap: 8px; padding: 8px 14px; font-size: 12px; color: var(--text-muted); }
.typing.active { display: flex; }
.typing-dots { display: flex; gap: 3px; }
.typing-dots span { width: 5px; height: 5px; border-radius: 50%; background: var(--text-muted); animation: blink 1.4s infinite; }
.typing-dots span:nth-child(2) { animation-delay: 0.2s; }
.typing-dots span:nth-child(3) { animation-delay: 0.4s; }
@keyframes blink { 0%, 80%, 100% { opacity: 0.3; } 40% { opacity: 1; } }

.input-area { padding: 8px 10px 12px; border-top: 1px solid var(--border); flex-shrink: 0; min-height: 80px; max-height: 50vh; position: relative; }
.input-meta { display: flex; align-items: center; gap: 6px; margin-bottom: 6px; }
.bar-chip { font-size: 11px; color: var(--text-muted); padding: 2px 6px; border-radius: 4px; cursor: pointer; }
.bar-chip:hover { background: var(--hover); color: var(--text); }
.bar-sep { color: var(--border); font-size: 10px; }
.input-row { display: flex; align-items: flex-end; gap: 6px; }
.input-box { flex: 1; background: var(--input-bg); border: 1px solid var(--input-border); color: var(--text); border-radius: 10px; padding: 10px 14px; font-size: 13px; font-family: inherit; resize: none; outline: none; min-height: 40px; line-height: 1.4; }
.input-box:focus { border-color: var(--accent); }
.resize-handle { height: 4px; cursor: ns-resize; background: transparent; flex-shrink: 0; transition: background 0.15s; }
.resize-handle:hover { background: var(--accent); opacity: 0.5; }
.resize-handle.dragging { background: var(--accent); opacity: 0.7; }
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
.msg-assistant .msg-bubble img { max-width: 100%; border-radius: 4px; display: block; margin: 4px 0; }
.msg-assistant .msg-bubble video { max-width: 100%; max-height: 400px; border-radius: 4px; display: block; margin: 4px 0; }
.msg-assistant .msg-bubble p:has(img), .msg-assistant .msg-bubble p:has(video) { margin: 0; }

/* Mermaid diagram container */
.msg-assistant .msg-bubble .mermaid-wrapper {
  margin: 8px 0;
  border: 1px solid var(--border);
  border-radius: 8px;
  overflow: hidden;
}
.msg-assistant .msg-bubble .mermaid-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 12px;
  background: rgba(128,128,128,0.08);
  border-bottom: 1px solid var(--border);
}
.msg-assistant .msg-bubble .mermaid-label {
  font-size: 12px;
  color: var(--text-muted);
  font-weight: 500;
}
.msg-assistant .msg-bubble .mermaid-copy {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 4px;
  border: 1px solid var(--border);
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.2s;
}
.msg-assistant .msg-bubble .mermaid-copy:hover {
  background: var(--accent);
  border-color: var(--accent);
  color: #fff;
}
.msg-assistant .msg-bubble .mermaid-btn-group {
  display: flex;
  align-items: center;
  gap: 4px;
}
/* 通用 Mermaid 按钮样式（图像/源码/复制/导出 统一） */
.msg-assistant .msg-bubble .mermaid-btn,
.msg-assistant .msg-bubble .mermaid-copy-btn {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 4px;
  border: 1px solid var(--border);
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.2s;
}
.msg-assistant .msg-bubble .mermaid-btn:hover,
.msg-assistant .msg-bubble .mermaid-copy-btn:hover {
  background: var(--accent);
  border-color: var(--accent);
  color: #fff;
}
.msg-assistant .msg-bubble .mermaid-btn.active,
.msg-assistant .msg-bubble .mermaid-copy-btn.copied {
  background: var(--accent);
  border-color: var(--accent);
  color: #fff;
}
.msg-assistant .msg-bubble .mermaid-container {
  padding: 12px;
  text-align: center;
  overflow-x: auto;
}
/* 让含 Mermaid 的 bubble 不受 msg-bubble 全局 max-width 限制，自动撑满 */
.msg-assistant .msg-bubble:has(.mermaid-full-width) {
  max-width: 100%;
}
.msg-assistant .msg-bubble .mermaid-container svg {
  width: 100%;
  height: auto;
}
.msg-assistant .msg-bubble .mermaid-wrapper {
  width: 100%;
}
.msg-assistant .msg-bubble .mermaid-source {
  margin: 0 !important;
  padding: 0 !important;
}
.msg-assistant .msg-bubble .mermaid-error {
  background: rgba(0,0,0,0.2);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 12px;
  color: var(--text-muted);
}
  padding: 8px 10px;
  font-family: monospace;
  font-size: 0.85em;
  color: #cc4444;
  overflow-x: auto;
  white-space: pre-wrap;
}

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

/* Attachment Preview */
.attachment-preview {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 6px;
  max-height: 120px;
  overflow-y: auto;
}
.attachment-preview::-webkit-scrollbar { width: 4px; }
.attachment-preview::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }
.attachment-preview:empty { display: none; }
.attachment-chip {
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(128, 128, 128, 0.1);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 4px 8px;
  font-size: 11px;
  color: var(--text);
  max-width: 200px;
}
.attachment-chip-icon { flex-shrink: 0; font-size: 10px; font-family: Consolas, monospace; font-weight: bold; color: var(--accent, #3794ff); }
.attachment-chip-info { min-width: 0; flex: 1; overflow: hidden; }
.attachment-chip-name {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 500;
}
.attachment-chip-size { color: var(--text-muted); font-size: 10px; }
.attachment-chip-remove {
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 0 2px;
  font-size: 14px;
  line-height: 1;
  border-radius: 3px;
  flex-shrink: 0;
}
.attachment-chip-remove:hover { color: #cc4444; background: rgba(204,68,68,0.1); }
.attach-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 18px;
}
.attach-btn:hover { background: var(--hover); color: var(--text); }

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
.slash-separator {
  padding: 4px 12px;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  color: var(--text-muted);
  letter-spacing: 0.5px;
  border-bottom: 1px solid rgba(128,128,128,0.08);
  cursor: default;
}
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
        <div style="display:flex;align-items:center;">
          <div class="agent-status" id="agentStatus">Connecting...</div>
          <button class="btn-reconnect" id="btnReconnect" style="display:none;">${vscode.l10n.t('Reconnect')}</button>
        </div>
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
    <button class="hud-toggle" id="hudToggle" title="${vscode.l10n.t('Toggle HUD Panel')}">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
    </button>
    <div class="tab-item active" data-session="main">Chat</div>
    <button class="tab-add" id="btnAddTab" title="${vscode.l10n.t('New chat')}">+</button>
  </div>
  <div class="messages" id="messages">
    <div class="empty-state" id="emptyState">
      <div class="empty-icon">💬</div>
      <div class="empty-text">${vscode.l10n.t('Start a conversation with your AI agent')}</div>
    </div>
  </div>
  <div class="typing" id="typing">
    <div class="typing-dots"><span></span><span></span><span></span></div>
    <span id="typingText">${vscode.l10n.t('Thinking...')}</span>
  </div>
  <div id="busyIndicator" class="busy-indicator hidden"></div>
  <div id="subagentIndicator" class="subagent-indicator hidden"></div>
  <div id="yieldIndicator" class="yield-indicator hidden"></div>
  <div class="resize-handle" id="resizeHandle" title="${vscode.l10n.t('Drag to resize')}"></div>
  <div class="input-area">
    <div class="input-meta">
      <span class="bar-chip" id="thinkingChip">think: default</span>
      <span class="bar-sep">·</span>
      <span class="bar-chip" id="verboseChip">steps: default</span>
      <label class="supervision-check" title="${vscode.l10n.t('Automatic supervision agent.\nAutomatically disable after task execution is completed')}" style="margin-left:6px;cursor:pointer;display:flex;align-items:center;gap:4px;">
        <input type="checkbox" id="supervisionCheck" title="${vscode.l10n.t('Supervision')}">
        <span>${vscode.l10n.t('Supervision')}</span>
      </label>
      <button class="open-workdir-btn" id="openWorkdirBtn" title="${vscode.l10n.t('Open the current agent workspace')}" style="display:none;">📁</button>
    </div>
    <div class="attachment-preview" id="attachmentPreview"></div>
    <div class="input-row" style="position:relative;">
      <button class="stop-btn" id="stopBtn" title="${vscode.l10n.t('Stop')}">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="4" y="4" width="16" height="16" rx="2"/></svg>
      </button>
      <button class="attach-btn" id="attachBtn" title="${vscode.l10n.t('Attach files')}">📎</button>
      <input type="file" id="attachInput" multiple style="visibility:hidden;position:absolute;left:-9999px;top:-9999px;" accept="*/*">
      <div style="flex:1;position:relative;">
        <div class="at-dropdown" id="atDropdown"></div>
        <div class="at-dropdown" id="slashDropdown"></div>
        <textarea class="input-box" id="inputBox" placeholder="${vscode.l10n.t('Message OpenClaw...')}" rows="1" style="width:100%;"></textarea>
      </div>
      <button class="send-btn" id="sendBtn" title="${vscode.l10n.t('Send')}">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
      </button>
    </div>
  </div>
</div>

<script nonce="${nonce}" src="https://cdnjs.cloudflare.com/ajax/libs/marked/15.0.7/marked.min.js"></script>
<script nonce="${nonce}" src="https://unpkg.com/mermaid@11.4.1/dist/mermaid.min.js"></script>
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
  const openWorkdirBtn = $('#openWorkdirBtn');
  const supervisionCheck = $('#supervisionCheck');

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

  // Initialize mermaid
  if (typeof mermaid !== 'undefined') {
    mermaid.initialize({ startOnLoad: false, theme: 'dark', securityLevel: 'loose', flowchart: { htmlLabels: false }, htmlLabels: false });
  }

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
    { separator: true, label: 'SESSION' },
    { cmd: '/new', desc: 'Start a new chat session' },
    { cmd: '/stop', desc: 'Stop the current response' },
    { cmd: '/reset', desc: 'Reset session context' },
    { cmd: '/compact', desc: 'Compact session messages' },
    { separator: true, label: 'MODEL & STATUS' },
    { cmd: '/status', desc: 'Show session status' },
    { cmd: '/models', desc: 'List available models' },
    { cmd: '/model', desc: 'Switch active model' },
    { separator: true, label: 'HELP' },
    { cmd: '/commands', desc: 'List available commands' },
    { cmd: '/help', desc: 'Show help information' },
  ];

  // Tab management: each tab = { id, label, agentId, sessionKey, messages[] }
  let tabs = [{ id: 'tab-main', label: 'Chat', agentId: 'main', sessionKey: 'main', messages: [] }];
  let activeTabId = 'tab-main';
  let streamEl = null;
  let activeTabMessages = [];

  // Attachment state (independent from fileRefs/@mention)
  const MAX_ATTACH_SIZE = 10 * 1024 * 1024; // 10MB per file
  let attachments = []; // [{name, size, mimeType, data(base64)}]
  const attachmentPreview = document.getElementById('attachmentPreview');
  const attachBtnEl = document.getElementById('attachBtn');
  const attachInputEl = document.getElementById('attachInput');

  function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  function getFileIcon(mimeType) {
    // Use ASCII text tags instead of emoji for reliable rendering across all webview themes/fonts
    if (!mimeType) return '[FILE]';
    if (mimeType.startsWith('image/')) return '[IMG]';
    if (mimeType.startsWith('video/')) return '[VID]';
    if (mimeType.startsWith('audio/')) return '[AUD]';
    if (mimeType.startsWith('text/') || mimeType.includes('json') || mimeType.includes('xml') || mimeType.includes('yaml') || mimeType.includes('javascript') || mimeType.includes('typescript')) return '[TXT]';
    if (mimeType === 'application/pdf') return '[PDF]';
    if (mimeType.startsWith('application/zip') || mimeType.startsWith('application/gzip') || mimeType.startsWith('application/x-')) return '[ZIP]';
    return '[FILE]';
  }

  function renderAttachments() {
    if (!attachmentPreview) return;
    if (attachments.length === 0) {
      attachmentPreview.innerHTML = '';
      return;
    }
    attachmentPreview.innerHTML = '';
    for (let i = 0; i < attachments.length; i++) {
      const a = attachments[i];
      const chip = document.createElement('div');
      chip.className = 'attachment-chip';
      chip.innerHTML = '<span class="attachment-chip-icon">' + getFileIcon(a.mimeType) + '</span>' +
        '<div class="attachment-chip-info"><div class="attachment-chip-name">' + a.name + '</div>' +
        '<div class="attachment-chip-size">' + formatFileSize(a.size) + '</div></div>' +
        '<button class="attachment-chip-remove" data-index="' + i + '" title="Remove">×</button>';
      attachmentPreview.appendChild(chip);
    }
  }

  function addAttachments(files) {
    console.log('[Attach] addAttachments called, files.count:', files.length);
    if (!files || files.length === 0) {
      console.warn('[Attach] No files provided');
      return;
    }
    let pending = 0;
    let loaded = 0;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      console.log('[Attach] Processing file:', file.name, 'size:', file.size, 'type:', file.type);
      if (file.size > MAX_ATTACH_SIZE) {
        console.warn('[Attach] File exceeds limit, skipping:', file.name);
        alert('"' + file.name + '" exceeds 10MB limit and was skipped.');
        continue;
      }
      pending++;
      const reader = new FileReader();
      reader.onload = () => {
        const data = reader.result;
        console.log('[Attach] FileReader.onload for:', file.name, 'data.length:', data ? String(data).length : 'null');
        if (typeof data === 'string') {
          const base64Part = data.split(',')[1] || '';
          attachments.push({
            name: file.name,
            size: file.size,
            mimeType: file.type || 'application/octet-stream',
            data: base64Part
          });
          loaded++;
          console.log('[Attach] File loaded successfully:', file.name, 'loaded=', loaded, '/', pending);
          if (loaded === pending) {
            console.log('[Attach] All files loaded, calling renderAttachments');
            renderAttachments();
          }
        }
      };
      reader.onerror = (err) => {
        console.error('[Attach] FileReader.onerror for:', file.name, 'error:', err);
        loaded++;
        if (loaded === pending) {
          console.log('[Attach] All files done (some may have failed), calling renderAttachments');
          renderAttachments();
        }
      };
      reader.readAsDataURL(file);
    }
  }

  function removeAttachment(index) {
    attachments.splice(index, 1);
    renderAttachments();
  }

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

  // Resize handle logic
  const resizeHandle = document.getElementById('resizeHandle');
  const inputArea = document.querySelector('.input-area');
  let isResizing = false;
  let startY = 0;
  let startHeight = 0;

  // Load saved height from localStorage
  const savedHeight = localStorage.getItem('openclaw.inputAreaHeight');
  if (savedHeight) {
    inputArea.style.height = savedHeight + 'px';
    adjustInputBoxHeight();
  }

  function adjustInputBoxHeight() {
    const inputMeta = document.querySelector('.input-meta');
    const metaHeight = inputMeta ? inputMeta.offsetHeight + 6 : 0;
    const inputRow = document.querySelector('.input-row');
    const rowPadding = 20; // approximate padding
    const availableHeight = inputArea.offsetHeight - metaHeight - rowPadding;
    inputBox.style.height = Math.max(40, availableHeight) + 'px';
  }

  if (resizeHandle) {
    resizeHandle.addEventListener('mousedown', (e) => {
      isResizing = true;
      startY = e.clientY;
      startHeight = inputArea.offsetHeight;
      resizeHandle.classList.add('dragging');
      document.body.style.cursor = 'ns-resize';
      document.body.style.userSelect = 'none';
      e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
      if (!isResizing) return;
      const delta = startY - e.clientY;
      let newHeight = startHeight + delta;
      const minHeight = 80;
      const maxHeight = window.innerHeight * 0.5;
      newHeight = Math.max(minHeight, Math.min(maxHeight, newHeight));
      inputArea.style.height = newHeight + 'px';
      adjustInputBoxHeight();
    });

    document.addEventListener('mouseup', () => {
      if (isResizing) {
        isResizing = false;
        resizeHandle.classList.remove('dragging');
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
        localStorage.setItem('openclaw.inputAreaHeight', inputArea.offsetHeight.toString());
      }
    });
  }

  inputBox.addEventListener('input', () => {
    inputBox.style.height = 'auto';
    inputBox.style.height = Math.max(inputBox.scrollHeight, 40) + 'px';
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
      const commandsOnly = filtered.filter((c) => !c.separator);
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (commandsOnly.length > 0) {
          slashSelectedIndex = (slashSelectedIndex + 1) % commandsOnly.length;
          updateSlashActive();
        }
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (commandsOnly.length > 0) {
          slashSelectedIndex = (slashSelectedIndex - 1 + commandsOnly.length) % commandsOnly.length;
          updateSlashActive();
        }
        return;
      }
      if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          if (commandsOnly.length > 0) {
            selectSlashCommand(commandsOnly[slashSelectedIndex]);
          } else {
            // No matching commands - send as message to gateway for processing
            hideSlashDropdown();
            sendMessage();
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
        inputBox.style.height = Math.max(inputBox.scrollHeight, 40) + 'px';
      }
    }
    if (e.ctrlKey && e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        historyIndex--;
        inputBox.value = messageHistory[messageHistory.length - 1 - historyIndex];
        inputBox.style.height = 'auto';
        inputBox.style.height = Math.max(inputBox.scrollHeight, 40) + 'px';
      } else if (historyIndex === 0) {
        historyIndex = -1;
        inputBox.value = '';
        inputBox.style.height = 'auto';
      }
    }
  });
  sendBtn.addEventListener('click', sendMessage);
  stopBtn.addEventListener('click', () => {
    inputBox.value = '/stop';
    sendMessage();
  });

  // Attachment button: trigger hidden file input
  if (attachBtnEl) {
    attachBtnEl.addEventListener('click', () => {
      console.log('[Attach] attachBtn clicked, attachInputEl exists:', !!attachInputEl);
      if (attachInputEl) {
        attachInputEl.click();
      }
    });
  }
  // File input change: add selected files as attachments
  if (attachInputEl) {
    attachInputEl.addEventListener('change', (e) => {
      console.log('[Attach] change event fired, files.length:', e.target.files ? e.target.files.length : 0);
      if (attachInputEl.files && attachInputEl.files.length > 0) {
        addAttachments(attachInputEl.files);
        attachInputEl.value = ''; // reset for next selection
      }
    });
  }
  // Attachment preview: handle remove button clicks (event delegation)
  if (attachmentPreview) {
    attachmentPreview.addEventListener('click', (e) => {
      const target = e.target;
      if (target && target.classList && target.classList.contains('attachment-chip-remove')) {
        const idx = parseInt(target.getAttribute('data-index') || '0', 10);
        removeAttachment(idx);
      }
    });
  }
  // Paste: capture pasted files (e.g. screenshots)
  inputBox.addEventListener('paste', (e) => {
    console.log('[Attach] paste event fired');
    const items = e.clipboardData && e.clipboardData.items;
    if (!items) return;
    const files = [];
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.kind === 'file') {
        const file = item.getAsFile();
        if (file) files.push(file);
      }
    }
    console.log('[Attach] paste: files found:', files.length);
    if (files.length > 0) {
      e.preventDefault();
      addAttachments(files);
    }
  });
  // Drag & drop: capture dropped files onto the input area
  const inputAreaEl = document.querySelector('.input-area');
  if (inputAreaEl) {
    inputAreaEl.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy';
    });
    inputAreaEl.addEventListener('drop', (e) => {
      console.log('[Attach] drop event fired, files.count:', e.dataTransfer ? e.dataTransfer.files.length : 0);
      e.preventDefault();
      e.stopPropagation();
      if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        addAttachments(e.dataTransfer.files);
      }
    });
  }
  thinkingChip.addEventListener('click', () => vscode.postMessage({ type: 'cycleThinking' }));
  verboseChip.addEventListener('click', () => vscode.postMessage({ type: 'cycleVerbose' }));

  // Supervision checkbox: toggle and notify extension host
  if (supervisionCheck) {
    supervisionCheck.addEventListener('change', () => {
      vscode.postMessage({ 
        type: 'toggleSupervision', 
        enabled: supervisionCheck.checked 
      });
    });
  }

  // Open workdir button: send message to extension host
  if (openWorkdirBtn) {
    openWorkdirBtn.addEventListener('click', () => {
      vscode.postMessage({ type: 'openWorkdir' });
    });
  }

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
    inputBox.style.height = Math.max(inputBox.scrollHeight, 40) + 'px';
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
        serverValue.textContent = (gatewayUrl && gatewayUrl.indexOf('://') >= 0) ? gatewayUrl.slice(gatewayUrl.indexOf('://') + 3) : '${vscode.l10n.t('not configured')}';
        if (msg.sessionKey) currentSession = msg.sessionKey;
        // Show open-workdir button on init if connected
        if (openWorkdirBtn) {
          openWorkdirBtn.style.display = connected ? '' : 'none';
        }
        // Set supervision checkbox state
        if (supervisionCheck) {
          supervisionCheck.checked = !!msg.supervisionEnabled;
        }
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
        // Show open-workdir button only when connected (local gateway)
        if (openWorkdirBtn) {
          openWorkdirBtn.style.display = connected ? '' : 'none';
        }
        // Set supervision checkbox state
        if (supervisionCheck) {
          supervisionCheck.checked = !!msg.supervisionEnabled;
        }
        if (connected) {
          vscode.postMessage({ type: 'requestModels' });
          vscode.postMessage({ type: 'requestSessions' });
          vscode.postMessage({ type: 'requestAgents' });
          pairingBanner.style.display = 'none';
        }
        break;
      case 'supervisionState':
        if (supervisionCheck) {
          supervisionCheck.checked = !!msg.enabled;
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
        // Clean up any leftover streamEl (fix for residual content interfering with new stream)
        if (streamEl) {
          streamEl.remove();
          streamEl = null;
        }
        streaming = true;
        showTyping(true, '${vscode.l10n.t('Thinking...')}');
        sendBtn.style.display = 'none';
        stopBtn.classList.add('active');
        attachBtnEl.style.display = 'none';
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
        // Capture bubble content BEFORE clearing streamEl
        let finalText = '';
        if (streamEl) {
          const bubble = streamEl.querySelector('.msg-bubble');
          if (bubble) finalText = bubble.textContent || '';
        }
        // Do NOT call updateStream('', true) as it clears the content
        showTyping(false);
        sendBtn.style.display = '';
        stopBtn.classList.remove('active');
        attachBtnEl.style.display = '';
        // Handle empty response
        if (!finalText.trim()) {
          // Empty response: remove the streamEl to avoid empty bubble
          if (streamEl) {
            streamEl.remove();
          }
        } else {
          // Non-empty response: content is already in DOM, just add to history
          activeTabMessages.push({
            role: 'assistant',
            text: finalText,
            timestamp: Date.now()
          });
          // streamEl remains in DOM with correct content
        }
        // Clear the streamEl reference (but not the DOM content)
        streamEl = null;
        // 流式输出完成后渲染 Mermaid 图表（否则需要刷新才能渲染）
        renderMermaidBlocks();
        break;
      case 'streamError':
        streaming = false;
        appendMessage({ role: 'assistant', text: 'Error: ' + msg.error, timestamp: Date.now() });
        showTyping(false);
        sendBtn.style.display = '';
        stopBtn.classList.remove('active');
        attachBtnEl.style.display = '';
        // Store error message in activeTabMessages
        activeTabMessages.push({ role: 'assistant', text: 'Error: ' + msg.error, timestamp: Date.now() });
        break;
      case 'toolCall':
        emptyState.style.display = 'none';
        showTyping(true, msg.phase === 'start' ? msg.label : '${vscode.l10n.t('Thinking...')}');
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
      case 'autoContinueFailed':
        streaming = false;
        appendMessage({ role: 'assistant', text: '${vscode.l10n.t('Auto-continue failed after {0} attempts')}'.replace('{0}', msg.count), timestamp: Date.now() });
        showTyping(false);
        sendBtn.style.display = '';
        stopBtn.classList.remove('active');
        attachBtnEl.style.display = '';
        activeTabMessages.push({ role: 'assistant', text: '${vscode.l10n.t('Auto-continue failed after {0} attempts')}'.replace('{0}', msg.count), timestamp: Date.now() });
        this.setBusy(false);
        break;
      case 'busyState': {
        const busyEl = document.getElementById('busyIndicator');
        if (busyEl) {
          busyEl.textContent = msg.label || '';
          busyEl.classList.toggle('hidden', !msg.busy);
        }
        break;
      }
      case 'subagentState': {
        const el = document.getElementById('subagentIndicator');
        if (el) {
          el.textContent = msg.label || '';
          el.classList.toggle('hidden', !msg.active);
        }
        break;
      }
      case 'yieldState': {
        const el = document.getElementById('yieldIndicator');
        if (el) {
          el.textContent = msg.label || '';
          el.classList.toggle('hidden', !msg.active);
        }
        break;
      }
      case 'setInputText':
        if (inputBox && msg.text) {
          inputBox.value = msg.text;
          inputBox.dispatchEvent(new Event('input', { bubbles: true }));
          inputBox.focus();
        }
        break;
    }
  });

  function sendMessage() {
    const text = inputBox.value.trim();
    if (!text || !connected) return;
    // 解析 fileRefs 中的 #L行号 或 #L行号-#K行号 格式
    const refs = atFileRefs.map(ref => {
      const rangeMatch = ref.match(/^(.+?)#L(\d+)-#L?(\d+)$/);
      if (rangeMatch) return { path: rangeMatch[1], startLine: parseInt(rangeMatch[2]), endLine: parseInt(rangeMatch[3]) };
      const singleMatch = ref.match(/^(.+?)#L(\d+)$/);
      if (singleMatch) return { path: singleMatch[1], line: parseInt(singleMatch[2]) };
      return { path: ref };
    });
    inputBox.value = '';
    inputBox.style.height = 'auto';
    historyIndex = -1;
    atFileRefs = [];
    hideAtDropdown();
    vscode.postMessage({ type: 'sendMessage', text, fileRefs: refs, attachments: attachments.slice() });
    attachments = [];
    renderAttachments();
  }

  function checkAtTrigger() {
    const val = inputBox.value;
    const pos = inputBox.selectionStart;
    if (pos < 0) { hideAtDropdown(); return; }
    const before = val.substring(0, pos);
    const atIndex = before.lastIndexOf('@');
    if (atIndex >= 0) {
      const rawQuery = before.slice(atIndex + 1);
      // 去掉 #L行号 或 #L行号-#K行号 后缀用于搜索
      const hashIndex = rawQuery.indexOf('#L');
      const query = hashIndex > 0 ? rawQuery.substring(0, hashIndex) : rawQuery;
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
      atDropdown.innerHTML = '<div class="at-empty">${vscode.l10n.t('No matching files')}</div>';
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
    // 检查用户是否已输入 #L行号 或 #L行号-#K行号
    const currentQuery = val.substring(atTriggerPos + 1, pos);
    const hashMatch = currentQuery.match(/#L(\d+)(?:-#L?(\d+))?$/);
    let lineSuffix = '';
    if (hashMatch) {
      lineSuffix = '#L' + hashMatch[1];
      if (hashMatch[2]) {
        lineSuffix += '-#L' + hashMatch[2];
      }
    }
    const basePath = file.isDir ? file.path + '/' : file.path + ' ';
    const insert = '@' + basePath + lineSuffix;
    inputBox.value = before + insert + after;
    const newPos = before.length + insert.length;
    inputBox.setSelectionRange(newPos, newPos);
    inputBox.focus();
    
    // 目录选择后不隐藏下拉框，而是触发 checkAtTrigger 显示子目录内容
    // 隐藏逻辑移到 checkAtTrigger 中处理
    if (!file.isDir) {
      const refPath = lineSuffix ? file.path + lineSuffix : file.path;
      if (!atFileRefs.includes(refPath)) atFileRefs.push(refPath);
      hideAtDropdown();
      inputBox.style.height = 'auto';
      inputBox.style.height = Math.max(inputBox.scrollHeight, 40) + 'px';
    } else {
      // 目录：手动触发 checkAtTrigger 以搜索子目录内容
      // JS 设置 value 不会自动触发 input 事件
      atVisible = false;
      atDropdown.classList.remove('visible');
      checkAtTrigger();
    }
  }

  // ─── / Command Dropdown ───
  function getFilteredSlashCommands() {
    if (!slashFilter) return SLASH_COMMANDS;
    const q = slashFilter.toLowerCase();
    // Filter commands; keep separators only if they have matching commands after them
    const result = [];
    let pendingSep = null;
    for (const c of SLASH_COMMANDS) {
      if (c.separator) { pendingSep = c; continue; }
      const hit = c.cmd.toLowerCase().includes(q) || c.desc.toLowerCase().includes(q);
      if (hit) {
        if (pendingSep) { result.push(pendingSep); pendingSep = null; }
        result.push(c);
      }
    }
    return result;
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
      slashDropdown.innerHTML = '<div class="at-empty">${vscode.l10n.t('No matching commands')}</div>';
      return;
    }
    slashDropdown.innerHTML = '';
    // Only count command items for max show and navigation
    const commandsOnly = filtered.filter((c) => !c.separator);
    const maxShow = Math.min(commandsOnly.length, 10);
    let cmdIdx = 0;
    for (let i = 0; i < filtered.length && cmdIdx < maxShow; i++) {
      const c = filtered[i];
      if (c.separator) {
        const sepDiv = document.createElement('div');
        sepDiv.className = 'slash-separator';
        sepDiv.textContent = c.label || '';
        slashDropdown.appendChild(sepDiv);
        continue;
      }
      const div = document.createElement('div');
      div.className = 'at-item' + (cmdIdx === slashSelectedIndex ? ' active' : '');
      div.dataset.cmd = c.cmd;
      div.innerHTML = '<span class="at-icon">⚡</span><span class="at-label">' + c.cmd + '</span><span style="font-size:11px;color:var(--text-muted);margin-left:8px;white-space:nowrap;">' + c.desc + '</span>';
      slashDropdown.appendChild(div);
      cmdIdx++;
    }
    const activeItem = slashDropdown.querySelector('.at-item.active');
    if (activeItem) activeItem.scrollIntoView({ block: 'center' });
  }

  function updateSlashActive() {
    const items = slashDropdown.querySelectorAll('.at-item');
    items.forEach((el, i) => el.classList.toggle('active', i === slashSelectedIndex));
    const activeItem = slashDropdown.querySelector('.at-item.active');
    if (activeItem) activeItem.scrollIntoView({ block: 'center' });
  }

  function selectSlashCommand(cmd) {
    inputBox.value = cmd.cmd + ' ';
    inputBox.setSelectionRange(inputBox.value.length, inputBox.value.length);
    inputBox.focus();
    hideSlashDropdown();
    inputBox.style.height = 'auto';
    inputBox.style.height = Math.max(inputBox.scrollHeight, 40) + 'px';
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
    
    // Render attachments (for user-sent images)
    if (msg.attachments && msg.attachments.length > 0) {
      const attachDiv = document.createElement('div');
      attachDiv.className = 'msg-attachments';
      for (const att of msg.attachments) {
        if (att.data && att.mimeType && att.mimeType.startsWith('image/')) {
          const img = document.createElement('img');
          img.src = 'data:' + att.mimeType + ';base64,' + att.data;
          img.className = 'msg-attachment-img';
          img.alt = att.name || '${vscode.l10n.t('attachment')}';
          attachDiv.appendChild(img);
        } else if (att.data) {
          const link = document.createElement('a');
          link.href = 'data:' + att.mimeType + ';base64,' + att.data;
          link.textContent = att.name || '${vscode.l10n.t('attachment')}';
          link.download = att.name || 'download';
          attachDiv.appendChild(link);
        }
      }
      if (attachDiv.children.length > 0) {
        div.appendChild(attachDiv);
      }
    }
    
    if (msg.timestamp) {
      const time = document.createElement('div');
      time.className = 'msg-time';
      time.textContent = new Date(msg.timestamp).toLocaleTimeString();
      div.appendChild(time);
    }
    messagesEl.appendChild(div);
    if (msg.role === 'assistant') renderMermaidBlocks();
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function clearMessages() {
    messagesEl.innerHTML = '';
    messagesEl.appendChild(emptyState);
    emptyState.style.display = '';
  }

  // 复制纯文本到剪贴板（带“已复制”反馈）
  async function copyTextToClipboard(text, btnEl) {
    try {
      await navigator.clipboard.writeText(text);
      showCopied(btnEl);
    } catch (err) {
      console.error('Copy source failed:', err);
    }
  }

  // 将渲染后的 SVG 转为 PNG dataUrl，交给宿主弹出保存对话框写入本地文件
  async function exportSvgToPng(svgContainer, btnEl) {
    const svgEl = svgContainer ? svgContainer.querySelector('svg') : null;
    console.log('[Mermaid Export] start, svgEl=', !!svgEl);
    if (!svgEl) {
      console.error('[Mermaid Export] No SVG found');
      vscode.postMessage({ type: 'notify', text: '${vscode.l10n.t('SVG not found, cannot export')}' });
      return;
    }
    try {
      const xml = new XMLSerializer().serializeToString(svgEl);
      const svgBlob = new Blob([xml], { type: 'image/svg+xml;charset=utf-8' });
      let dataUrl;
      // 复用与复制相同的 createImageBitmap 优先 + DOMParser 兜底逻辑
      const rect = svgEl.getBoundingClientRect();
      const w = Math.max(1, Math.round(rect.width));
      const h = Math.max(1, Math.round(rect.height));
      try {
        const bitmap = await createImageBitmap(svgBlob);
        const canvas = document.createElement('canvas');
        canvas.width = w * 2;
        canvas.height = h * 2;
        const ctx = canvas.getContext('2d');
        ctx.scale(2, 2);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, w, h);
        ctx.drawImage(bitmap, 0, 0, w, h);
        bitmap.close();
        dataUrl = canvas.toDataURL('image/png');
        console.log('[Mermaid Export] dataUrl len (bitmap)=', dataUrl.length);
      } catch (bmpErr) {
        console.log('[Mermaid Export] createImageBitmap failed:', bmpErr.message);
        const parser = new DOMParser();
        const svgDoc = parser.parseFromString(xml, 'image/svg+xml');
        svgDoc.querySelectorAll('foreignObject').forEach(fo => {
          const text = fo.textContent || '';
          if (text) {
            const g = svgDoc.createElement('g');
            const t = svgDoc.createElementNS('http://www.w3.org/2000/svg', 'text');
            t.setAttribute('x', fo.getAttribute('x') || '0');
            t.setAttribute('y', fo.getAttribute('y') || '1em');
            t.textContent = text;
            g.appendChild(t);
            fo.parentNode.replaceChild(g, fo);
          }
        });
        const cleanBlob = new Blob([new XMLSerializer().serializeToString(svgDoc.documentElement)], { type: 'image/svg+xml;charset=utf-8' });
        const cleanUrl = URL.createObjectURL(cleanBlob);
        const img = new Image();
        await new Promise((resolve, reject) => {
          const timer = setTimeout(() => reject(new Error('SVG image load timeout')), 5000);
          img.onload = () => { clearTimeout(timer); resolve(null); };
          img.onerror = () => { clearTimeout(timer); reject(new Error('SVG image load failed')); };
          img.src = cleanUrl;
        });
        const canvas = document.createElement('canvas');
        canvas.width = w * 2;
        canvas.height = h * 2;
        const ctx = canvas.getContext('2d');
        ctx.scale(2, 2);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, w, h);
        ctx.drawImage(img, 0, 0, w, h);
        dataUrl = canvas.toDataURL('image/png');
        console.log('[Mermaid Export] dataUrl len (domparser)=', dataUrl.length);
        URL.revokeObjectURL(cleanUrl);
      }
      vscode.postMessage({ type: 'exportImage', dataUrl: dataUrl });
      console.log('[Mermaid Export] postMessage sent');
      if (btnEl) {
        const orig = btnEl.dataset.originalText || btnEl.textContent;
        btnEl.dataset.originalText = orig;
        btnEl.textContent = '${vscode.l10n.t('Exported')}';
        btnEl.classList.add('copied');
        setTimeout(() => { btnEl.textContent = orig; btnEl.classList.remove('copied'); }, 1500);
      }
    } catch (err) {
      console.error('[Mermaid Export] catch:', err);
      if (btnEl) {
        const orig = btnEl.dataset.originalText || btnEl.textContent;
        btnEl.dataset.originalText = orig;
        btnEl.textContent = '${vscode.l10n.t('Export failed')}';
        btnEl.classList.add('copied');
        setTimeout(() => { btnEl.textContent = orig; btnEl.classList.remove('copied'); }, 1500);
      }
      vscode.postMessage({ type: 'notify', text: '${vscode.l10n.t('Export failed')}: ' + (err && err.message ? err.message : String(err)) });
    }
  }

  // 将渲染后的 SVG 转为 PNG，经扩展宿主写入系统剪贴板（webview 无法直接写图片剪贴板）
  async function copySvgToClipboard(svgContainer, btnEl) {
    const svgEl = svgContainer ? svgContainer.querySelector('svg') : null;
    console.log('[Mermaid Copy] start, svgEl=', !!svgEl);
    if (!svgEl) {
      console.error('[Mermaid] No SVG found for copy');
      return;
    }
    try {
      // 诊断：检测 SVG 是否含会导致 canvas 污染的节点
      const hasForeign = svgEl.querySelector('foreignObject') !== null;
      const hasImage = svgEl.querySelector('image') !== null;
      const styleCount = svgEl.querySelectorAll('style').length;
      console.log('[Mermaid Copy] svg diagnostics:', JSON.stringify({ hasForeign, hasImage, styleCount, childNodes: svgEl.childNodes.length }));
      const xml = new XMLSerializer().serializeToString(svgEl);
      const svgBlob = new Blob([xml], { type: 'image/svg+xml;charset=utf-8' });
      let dataUrl;
      try {
        const rect = svgEl.getBoundingClientRect();
        const w = Math.max(1, Math.round(rect.width));
        const h = Math.max(1, Math.round(rect.height));
        console.log('[Mermaid Copy] rect=', JSON.stringify({w, h}));
        
        // 方案A：尝试 createImageBitmap（绕过 CSP blob: 限制）
        try {
          const bitmap = await createImageBitmap(svgBlob);
          const canvas = document.createElement('canvas');
          canvas.width = w * 2;
          canvas.height = h * 2;
          const ctx = canvas.getContext('2d');
          ctx.scale(2, 2);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, w, h);
          ctx.drawImage(bitmap, 0, 0, w, h);
          bitmap.close();
          dataUrl = canvas.toDataURL('image/png');
          console.log('[Mermaid Copy] dataUrl len (bitmap)=', dataUrl.length);
        } catch (bmpErr) {
          console.log('[Mermaid Copy] createImageBitmap failed:', bmpErr.message);
          
          // 方案B：DOMParser 解析 SVG → foreignObject 转 g 组渲染
          const parser = new DOMParser();
          const svgDoc = parser.parseFromString(xml, 'image/svg+xml');
          const foNodes = svgDoc.querySelectorAll('foreignObject');
          foNodes.forEach(fo => {
            const textContent = fo.textContent || '';
            if (textContent) {
              const g = svgDoc.createElement('g');
              const tspan = svgDoc.createElementNS('http://www.w3.org/2000/svg', 'text');
              tspan.setAttribute('x', fo.getAttribute('x') || '0');
              tspan.setAttribute('y', fo.getAttribute('y') || '1em');
              tspan.textContent = textContent;
              g.appendChild(tspan);
              fo.parentNode.replaceChild(g, fo);
            }
          });
          
          const sanitizedXml = new XMLSerializer().serializeToString(svgDoc.documentElement);
          const cleanBlob = new Blob([sanitizedXml], { type: 'image/svg+xml;charset=utf-8' });
          const cleanUrl = URL.createObjectURL(cleanBlob);
          const img = new Image();
          await new Promise((resolve, reject) => {
            const timer = setTimeout(() => reject(new Error('SVG image load timeout')), 5000);
            img.onload = () => { clearTimeout(timer); resolve(null); };
            img.onerror = (e) => { clearTimeout(timer); reject(new Error('SVG image load failed: ' + (e.message || ''))); };
            img.src = cleanUrl;
          });
          
          const canvas = document.createElement('canvas');
          canvas.width = w * 2;
          canvas.height = h * 2;
          const ctx = canvas.getContext('2d');
          ctx.scale(2, 2);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, w, h);
          ctx.drawImage(img, 0, 0, w, h);
          dataUrl = canvas.toDataURL('image/png');
          console.log('[Mermaid Copy] dataUrl len (domparser)=', dataUrl.length);
          URL.revokeObjectURL(cleanUrl);
        }
      } catch (err) {
        console.error('[Mermaid Copy] inner try/catch failed:', err);
        throw err;
      }
      vscode.postMessage({ type: 'copyImage', dataUrl: dataUrl });
      console.log('[Mermaid Copy] postMessage sent');
      showCopied(btnEl);
    } catch (err) {
      console.error('[Mermaid Copy] catch:', err);
      if (btnEl) {
        const orig = btnEl.dataset.originalText || btnEl.textContent;
        btnEl.dataset.originalText = orig;
        btnEl.textContent = '${vscode.l10n.t('Copy failed')}';
        btnEl.classList.add('copied');
        setTimeout(() => { btnEl.textContent = orig; btnEl.classList.remove('copied'); }, 1500);
      }
    }
  }

  function showCopied(btnEl) {
    if (!btnEl) return;
    const originalText = btnEl.dataset.originalText || btnEl.textContent;
    btnEl.dataset.originalText = originalText;
    btnEl.textContent = '${vscode.l10n.t('Copied')}';
    btnEl.classList.add('copied');
    setTimeout(() => {
      btnEl.textContent = originalText;
      btnEl.classList.remove('copied');
    }, 1000);
  }

  function renderMermaidBlocks() {
    if (typeof mermaid === 'undefined') return;
    // 使用 requestAnimationFrame 确保 DOM 已渲染
    requestAnimationFrame(() => {
      setTimeout(() => {
        // 匹配所有 code 块（包括 user 和 assistant 消息）
        const allBlocks = document.querySelectorAll('pre code');
        allBlocks.forEach((block) => {
          const codeText = (block.textContent || '').trim();
          console.log('[Mermaid] Block content preview:', JSON.stringify(codeText.substring(0, 80)));
          // 检测 mermaid 语法关键字
          if (!codeText.match(/^(flowchart|graph|sequenceDiagram|classDiagram|stateDiagram|erDiagram|gantt|pie|journey|C4|requirements|gitGraph|mindmap|quadrantChart)/m)) return;
          const pre = block.parentElement;
          // 防止重复渲染：渲染过的 pre 会加 mermaid-source 类
          if (!pre || pre.classList.contains('mermaid-source')) return;
          const svgId = 'mermaid-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6);
          mermaid.render(svgId, codeText)
          .then(svgResult => {
            // v11.4.1: render 返回 {id, svg} 对象，用 svgResult.svg 获取 SVG 字符串
            const svgCode = svgResult.svg;
            // 保留原始代码块，并在其上方插入渲染结果 + 复制按钮
            const wrapper = document.createElement('div');
            wrapper.className = 'mermaid-wrapper mermaid-full-width';
            
            const header = document.createElement('div');
            header.className = 'mermaid-header';
            const label = document.createElement('span');
            label.className = 'mermaid-label';
            label.textContent = '${vscode.l10n.t('Mermaid')}';
            
            const svgContainer = document.createElement('div');
            svgContainer.className = 'mermaid-container';
            svgContainer.innerHTML = svgCode;
            
            // 视图切换按钮组
            const viewToggle = document.createElement('div');
            viewToggle.className = 'mermaid-view-toggle';
            const btnGraphic = document.createElement('button');
            btnGraphic.className = 'mermaid-btn mermaid-btn-graphic active';
            btnGraphic.textContent = '${vscode.l10n.t('Image')}';
            btnGraphic.type = 'button';
            const btnSource = document.createElement('button');
            btnSource.className = 'mermaid-btn mermaid-btn-source';
            btnSource.textContent = '${vscode.l10n.t('Source')}';
            btnSource.type = 'button';
            
            // 切换显示逻辑
            function toggleView(showGraphic) {
              svgContainer.style.display = showGraphic ? '' : 'none';
              pre.style.display = showGraphic ? 'none' : '';
              btnGraphic.classList.toggle('active', showGraphic);
              btnSource.classList.toggle('active', !showGraphic);
            }
            
            btnGraphic.addEventListener('click', () => toggleView(true));
            btnSource.addEventListener('click', () => toggleView(false));
            
            // 复制按钮（根据当前激活视图复制对应内容）
            const copyBtn = document.createElement('button');
            copyBtn.className = 'mermaid-btn mermaid-copy-btn';
            copyBtn.textContent = '${vscode.l10n.t('Copy')}';
            copyBtn.type = 'button';
            copyBtn.addEventListener('click', () => {
              if (btnGraphic.classList.contains('active')) {
                copySvgToClipboard(svgContainer, copyBtn);
              } else {
                copyTextToClipboard(codeText, copyBtn);
              }
            });
            
            // 导出按钮（图模式 → PNG 导出为本地文件；源码模式禁用）
            const exportBtn = document.createElement('button');
            exportBtn.className = 'mermaid-btn mermaid-export-btn';
            exportBtn.textContent = '${vscode.l10n.t('Export')}';
            exportBtn.type = 'button';
            exportBtn.title = '${vscode.l10n.t('Export current Mermaid diagram as PNG file')}';
            exportBtn.addEventListener('click', () => {
              if (!btnGraphic.classList.contains('active')) {
                vscode.postMessage({ type: 'notify', text: '${vscode.l10n.t('Please switch to diagram mode before exporting')}' });
                return;
              }
              exportSvgToPng(svgContainer, exportBtn);
            });
            
            header.appendChild(label);
            viewToggle.appendChild(btnGraphic);
            viewToggle.appendChild(btnSource);
            header.appendChild(viewToggle);
            
            // 按钮组（复制 + 导出）
            const btnGroup = document.createElement('div');
            btnGroup.className = 'mermaid-btn-group';
            btnGroup.appendChild(copyBtn);
            btnGroup.appendChild(exportBtn);
            header.appendChild(btnGroup);
            
            wrapper.appendChild(header);
            wrapper.appendChild(svgContainer);
            
            // 用 wrapper 包裹，保留原 pre 在下方（默认显示图，源码可通过按钮切换）
            pre.parentNode.insertBefore(wrapper, pre);
            pre.classList.add('mermaid-source');
            pre.style.display = 'none';
          })
          .catch(err => {
            console.error('Mermaid render error:', err);
            const errorDiv = document.createElement('div');
            errorDiv.className = 'mermaid-error';
            // ⚠️ 重要：必须使用 createTextNode 而非字符串拼接，
            // 因为 Mermaid v11.x 错误对象可能包含内嵌的 HTML/SVG 片段
            // （如 <script>、<svg>、CSS 样式等），直接拼接到 textContent 虽不会
            // 被浏览器解析为 HTML，但为了保险起见，显式使用文本节点确保零风险。
            const prefix = document.createTextNode('${vscode.l10n.t('Mermaid diagram render failed: ')}');
            const messageText = document.createTextNode(String(err && err.message ? err.message : (typeof err === 'string' ? err : JSON.stringify(err))));
            errorDiv.appendChild(prefix);
            errorDiv.appendChild(messageText);
            pre.parentNode.insertBefore(errorDiv, pre);
          });
      });
    }, 100);  // 增加延迟，确保 DOM 完全渲染
    });
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
    if (done) {
      renderMermaidBlocks();
      streamEl = null;
    }
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
    agentNameEl.textContent = agent.name || agent.id || '${vscode.l10n.t('Agent')}';
    agentStatusEl.textContent = connected ? '${vscode.l10n.t('online')}' : '${vscode.l10n.t('disconnected')}';
    agentStatusEl.className = 'agent-status' + (connected ? ' online' : '');
    const btnReconnectEl = document.getElementById('btnReconnect');
    if (btnReconnectEl) {
      btnReconnectEl.style.display = connected ? 'none' : '';
      // 点击重连：向 extension 发送 reconnect 消息（idempotent，重复赋值安全）
      btnReconnectEl.onclick = () => {
        if (typeof vscode !== 'undefined') {
          vscode.postMessage({ type: 'reconnect' });
        }
      };
    }
  }

  function updateChips() {
    thinkingChip.textContent = '${vscode.l10n.t('think: ')}' + (thinkingLevel || '${vscode.l10n.t('default')}');
    verboseChip.textContent = '${vscode.l10n.t('steps: ')}' + (verboseLevel || '${vscode.l10n.t('default')}');
    reliabilityValue.textContent = (thinkingLevel || '${vscode.l10n.t('default')}') + ' · ' + (verboseLevel || '${vscode.l10n.t('default')}');
  }

  function renderModels(models) {
    modelValue.textContent = currentModel ? currentModel.split('/').pop() : '${vscode.l10n.t('default')}';
  }

  function renderSessions() {
    sessionsList.innerHTML = '';
    if (sessions.length === 0) {
      sessionsList.innerHTML = '<div style="padding:8px 12px;font-size:12px;color:var(--text-muted);">${vscode.l10n.t('No sessions')}</div>';
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

