import * as vscode from "vscode";
import { OpenClawGateway } from "./gateway";
import { log as viewLog, LOG_INFO } from "./logLevel";
import type { OutputChannel } from "vscode";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { resolveAgentsDir, getMediaInfo, formatFileSize, formatTokens, getFileIcon, simplifyDeviceName, truncate, relTime, getNonce, genId, MIME_MAP, getMimeType, stripMedia, normText, isPreamble } from "./utils";
import { handleWebviewMessage } from "./webviewHandler";
import { handleRequestModels, handleRequestAgents, handleRequestTasks } from "./taskManager";
import { getHtml } from "./uiRenderer";

export interface ChatMessage {
  role: "user" | "assistant";
  text: string;
  timestamp: number;
  contentBlocks?: any[];
}

interface Session {
  key: string;
  sessionId?: string;
  derivedTitle?: string;
  'device-info'?: { 'device-name'?: string; [key: string]: any };
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
  // 存储 webview 消息处理器的 Disposable，用于清理旧监听器
  private _messageHandlerDisposable?: vscode.Disposable;
  private messages: ChatMessage[] = [];
  private sessions: Session[] = [];
  private agents: Agent[] = [];
  private activeAgent: Agent = { id: "main", name: "Agent", emoji: "🤖" };
  private currentModel = "";
  private currentSessionKey = "main";
  private thinkingLevel = "";
  private verboseLevel = "";
  private gatewayUrl = "";
  private agentsDir = "";
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
  private serverVersion: string = '';
  private seenPreambleTexts: string[] = [];
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
    const ch = channel;
    this.log = (msg: string) => viewLog(msg, LOG_INFO, ch);
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

    // AgentsDIR：保存各种 agent 资料的目录。
    // 留空时使用跨平台默认值：用户主目录下的 .openclaw/agents（Windows: C:\Users\<name>\.openclaw\agents, macOS/Linux: ~/.openclaw/agents）。
    const configAgentsDir = config.get<string>("agentsDir", "");
    this.agentsDir = resolveAgentsDir(configAgentsDir);
    try {
      if (!fs.existsSync(this.agentsDir)) {
        fs.mkdirSync(this.agentsDir, { recursive: true });
        viewLog(`AgentsDIR created: ${this.agentsDir}`, LOG_INFO, ch);
      }
    } catch (mkdirErr: any) {
      viewLog(`AgentsDIR create failed: ${mkdirErr?.message || mkdirErr}`, LOG_INFO, ch);
    }

    // 监听任务状态变化，自动刷新任务列表
    this.gateway.on('task.ended', () => {
      this.handleRequestTasks();
    });
    this.gateway.on('task.updated', () => {
      this.handleRequestTasks();
    });
    // 监听会话状态变化，自动刷新会话列表
    this.gateway.on('session.updated', () => {
      this.handleRequestSessions();
    });
    this.gateway.on('session.created', () => {
      this.handleRequestSessions();
    });
    this.gateway.on('session.deleted', () => {
      this.handleRequestSessions();
    });
  }

  public show() {
    this.view?.webview.postMessage({ type: "show" });
  }

  /** 已解析的 AgentsDIR（绝对路径，默认 <home>/.openclaw/agents），已确保目录存在 */
  public get agentsDirectory(): string {
    return this.agentsDir;
  }

  public setInputText(text: string) {
    this.postToWebview({ type: "setInputText", text });
  }

  public newChat() {
    this.messages = [];
    this.currentSessionKey = "main";
    this.postToWebview({ type: "clearMessages" });
  }

  public updateConnectionStatus(connected: boolean, serverVersion?: string) {
    // 缓存版本号，供 webviewReady 时携带（防止后到的 init 覆盖版本号）
    this.serverVersion = serverVersion || this.serverVersion;
    // 发送完整的 init 消息，确保 webview 拿到权威状态
    this.postToWebview({
      type: "init",
      sessionKey: this.currentSessionKey,
      gwSessionKey: this.gwSessionKey(),
      model: this.currentModel,
      connected,
      agent: this.activeAgent,
      gatewayUrl: this.gatewayUrl,
      thinkingLevel: this.thinkingLevel,
      verboseLevel: this.verboseLevel,
      messageHistory: this.messageHistory,
      supervisionEnabled: this.supervisionEnabled,
      version: this.serverVersion
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
      this.handleRequestTasks().catch(() => {});  // 新增：连接成功时触发任务拉取
      this.handleLoadMessages(this.currentSessionKey).catch(() => {});
    } else {
      // agent 断连/终止时，强制清除 busyIndicator 和 subagent 状态
      this.busyCount = 0;
      this.postToWebview({ type: "busyState", busy: false, label: "" });
      this.activeSubagentCount = 0;
      this.postToWebview({ type: "subagentState", active: false, label: "", state: "" });
      this.updateYieldState();
    }
  }

  /**
   * Public method to send text to the chat view
   * @param text The text to send
   */
  public async sendText(text: string) {
    await this.handleSendMessage(text);
  }

  /**
   * 处理进度卡片更新
   * @param card 进度卡片对象，null 表示清除
   */
  public handleProgressCardUpdate(card: any) {
    if (!this.view) return;
    if (card) {
      // 发送给 webview 渲染
      this.postToWebview({
        type: 'progressCard',
        data: {
          title: card.title,
          description: card.description,
          progress: card.progress,
          status: card.status,
          steps: card.steps || card.plan,  // 优先使用 card.steps，回退到 card.plan
          plan: card.plan,
          markdown: card.markdown,
          revision: card.revision
        }
      });
    } else {
      // 清除进度卡片
      this.postToWebview({ type: 'progressCard', data: null });
    }
  }

  // Match Obsidian plugin's handleChatEvent
  public async handleChatEvent(payload: any) {
    const sessionKey = this.resolveSession(payload?.sessionKey);
    const rawSessionKey = payload?.sessionKey || "";
    const state = typeof payload?.state === "string" ? payload.state : "";
    
    // Intercept supervisor agent responses
    if (this.supervisorPendingSessionKey && rawSessionKey === this.supervisorPendingSessionKey) {
      if (state === "delta") {
        const text = await this.extractDeltaText(payload?.message);
        if (text) {
          this.supervisorAccumulated += text;
          this.log(`Supervisor delta chunk: +${text.length} chars (total=${this.supervisorAccumulated.length})`);
        }
      } else if (state === "final") {
        const finalText = await this.extractDeltaText(payload?.message);
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
      const text = await this.extractDeltaText(payload?.message);
      this.log(`delta len=${text.length} preview=${text.substring(0, 80)}`);
      if (text) {
        this.postToWebview({ type: "streamDelta", sessionKey, agentId: this.activeAgent.id, text });
      }
    } else if (state === "final") {
      this.log(`stream final`);
      // Extract final message text and display it
      const finalMsg = payload?.message;
      if (finalMsg) {
        const finalText = await this.extractDeltaText(finalMsg);
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
              this.postToWebview({ type: "streamDelta", sessionKey, agentId: this.activeAgent.id, text: finalText });
              this.postToWebview({ type: "streamDone", sessionKey, agentId: this.activeAgent.id });
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
            this.postToWebview({ type: "streamDelta", sessionKey, agentId: this.activeAgent.id, text: finalText });
          }
        }
      }
      this.postToWebview({ type: "streamDone", sessionKey, agentId: this.activeAgent.id });
      this.setBusy(false);
      // 立即重新拉取历史，让服务端最终消息（含语音/音频）马上呈现在 messages 里
      this.scheduleHistoryReload(sessionKey, this.activeAgent.id);
    } else if (state === "aborted") {
      this.log(`stream aborted`);
      this.postToWebview({ type: "streamDone", sessionKey, agentId: this.activeAgent.id });
      this.setBusy(false);
      this.scheduleHistoryReload(sessionKey, this.activeAgent.id);
    } else if (state === "error") {
      const errorMsg = payload?.errorMessage || "unknown error";
      this.log(`stream error: ${errorMsg}`);
      this.postToWebview({ type: "streamError", sessionKey, agentId: this.activeAgent.id, error: errorMsg });
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

    if (data.kind === "preamble" && typeof data.progressText === "string" && data.progressText.trim()) {
      const t = data.progressText.trim();
      if (!this.seenPreambleTexts.includes(t)) {
        this.seenPreambleTexts.push(t);
        if (this.seenPreambleTexts.length > 50) this.seenPreambleTexts.shift();
      }
      return;
    }

    if (toolName && (phase === "start" || state === "tool_use")) {
      const label = `${toolName}`;
      this.postToWebview({ type: "toolCall", label, phase: "start" });
    } else if (toolName && phase === "result") {
      this.postToWebview({ type: "toolCall", label: toolName, phase: "result" });
    }
  }

  private async extractDeltaText(message: any): Promise<string> {
    if (typeof message === "string") return await this.resolveMediaPaths(message);
    if (!message) return "";

    const content = message.content ?? message;
    let text = "";
    if (Array.isArray(content)) {
      for (const item of content) {
        if (typeof item === "string") {
          text += item;
        } else if (item && typeof item === "object" && "text" in item) {
          text += (text ? "\n" : "") + String(item.text);
        }
      }
    } else if (typeof content === "string") {
      text = content;
    } else {
      text = message.text || "";
    }

    // 提取 openclawDelivery.mediaUrls 中的音频文件并转换为 <audio> 标签
    const mediaUrls = message.openclawDelivery?.mediaUrls as string[] | undefined;
    if (mediaUrls && mediaUrls.length > 0) {
      const audioParts: string[] = [];
      for (const mediaPath of mediaUrls) {
        const audioTag = await this.convertMediaToMarkdown(mediaPath);
        if (audioTag) {
          audioParts.push(audioTag);
        }
      }
      if (audioParts.length > 0) {
        text = text + "\n" + audioParts.join("\n");
      }
    }

    return await this.resolveMediaPaths(text);
  }

  private async resolveMediaPaths(text: string): Promise<string> {
    if (!text || text.indexOf("MEDIA:") === -1) return text;
    
    const segments = text.split("\n");
    const resolvedSegments: string[] = [];
    
    for (const segment of segments) {
      if (segment.indexOf("MEDIA:") === 0) {
        const rest = segment.slice(6).trim();
        // 支持带类型前缀的格式：MEDIA:<type>:<path>（如 MEDIA:audio:/api/chat/media/...）
        const typePrefixMatch = rest.match(/^(audio|video|img|image):(.+)$/);
        let mediaPath: string;
        let forcedTag: string | undefined;
        if (typePrefixMatch) {
          forcedTag = typePrefixMatch[1] === "image" ? "img" : typePrefixMatch[1];
          mediaPath = typePrefixMatch[2].trim();
        } else {
          mediaPath = rest;
        }
        const result = await this.convertMediaToMarkdown(mediaPath, forcedTag);
        if (result) {
          resolvedSegments.push(result);
        }
      } else {
        resolvedSegments.push(segment);
      }
    }
    
    return resolvedSegments.join("\n");
  }

  private async convertMediaToMarkdown(mediaPath: string, forcedTag?: string): Promise<string | null> {
    try {
      if (!mediaPath) return null;

      // ── 远程 URL 支持：http://、https:// 或网关媒体相对路径 /api/chat/media/ ──
      if (mediaPath.startsWith("http://") || mediaPath.startsWith("https://") || mediaPath.startsWith("/api/chat/media/")) {
        const tag = await this.buildRemoteMediaTag(mediaPath);
        // forcedTag 优先（如 MEDIA:audio: 前缀强制音频），相对路径同样转绝对 HTTP URL
        if (forcedTag && (forcedTag === "audio" || forcedTag === "video")) {
          const absoluteUrl = mediaPath.startsWith("/api/chat/media/") ? await this.toAbsoluteMediaUrl(mediaPath) : mediaPath;
          return this.buildMediaTag(forcedTag, absoluteUrl);
        }
        return tag;
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
      const mediaInfo = getMediaInfo(ext);
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
     * 将网关媒体相对路径（/api/chat/media/...）转为带 mediaTicket 的绝对 HTTP URL。
   * webview 中相对路径会解析到 vscode-webview:// 基址（非 HTTP 服务器），无法加载媒体；
   * 网关地址为 ws:// 或 wss://，据此推导出对应 http/https 基址。
   * 通过 RPC artifacts.download 获取包含 mediaTicket 鉴权的完整 URL。
   */
  private async toAbsoluteMediaUrl(url: string): Promise<string> {
    if (!url.startsWith("/api/chat/media/")) return url;
    
    // 解析 sessionKey 和 attachmentId
    // 格式：/api/chat/media/outgoing/{sessionKey}/{attachmentId}/full
    const match = url.match(/\/api\/chat\/media\/outgoing\/([^/]+)\/([^/]+)\/full/);
    if (!match) {
      // 格式不匹配，降级为原始绝对 URL
      const httpBase = this.gatewayUrl
        .replace(/^ws:\/\//, "http://")
        .replace(/^wss:\/\//, "https://")
        .replace(/\/+$/, "");
      return `${httpBase}${url}`;
    }
    
    const [, sessionKeyEncoded, attachmentId] = match;
    const sessionKey = decodeURIComponent(sessionKeyEncoded);
    
    const httpBase = this.gatewayUrl
      .replace(/^ws:\/\//, "http://")
      .replace(/^wss:\/\//, "https://")
      .replace(/\/+$/, "");

    // 尝试通过 artifacts.download 获取带 mediaTicket 的 URL。
    // artifactId 需要带前缀：TTS 语音为 artifact_managed_media_<uuid>，
    // 图片类为 artifact_managed_image_<uuid>，分别尝试。
    for (const prefix of ["artifact_managed_media_", "artifact_managed_image_"]) {
      try {
        const artifactId = prefix + attachmentId;
        const result = await this.gateway.request("artifacts.download", {
          artifactId,
          sessionKey
        });
        if (result?.url) {
          // artifacts.download 返回的相对路径（/api/chat/media/...）必须拼上
          // 网关 HTTP 基址，否则 webview 会解析到 vscode-webview:// 基址并被 CSP 拦截
          const absoluteUrl = result.url.startsWith("/") ? httpBase + result.url : result.url;
          this.log(`toAbsoluteMediaUrl: resolved ${sessionKey}/${attachmentId} -> ${absoluteUrl}`);
          return absoluteUrl;
        }
      } catch (err: any) {
        this.log(`toAbsoluteMediaUrl: artifacts.download(${prefix}) failed for ${sessionKey}/${attachmentId}: ${err?.message || err}`);
      }
    }
    
    // 降级：返回原始绝对 URL（无 ticket），播放器会尝试加载
    return `${httpBase}${url}`;
  }

  /**
   * 为远程 URL 直接生成 HTML 标签（video/audio/img）。
   * 外部 URL 直接作为 src 使用，webview 需开启 enableResourceLoading 才能加载。
   * 网关媒体相对路径（/api/chat/media/...）自动转绝对 HTTP URL，避免解析到 vscode-webview:// 基址。
   */
  private async buildRemoteMediaTag(url: string): Promise<string> {
    // 去除 URL 中可能携带的查询参数后再取扩展名
    const cleanUrl = url.split("#")[0].split("?")[0];
    const ext = path.extname(cleanUrl).toLowerCase();
    let { tag } = getMediaInfo(ext);
    // 网关媒体 URL 通常无扩展名：/api/chat/media/{incoming|outgoing}/{chatId}/{mediaId}/full
    // 若 extname 为空，按 URL 路径关键词推断类型
    if (!ext) {
      const lower = url.toLowerCase();
      if (lower.includes("/audio/") || lower.endsWith("/audio")) {
        tag = "audio";
      } else if (lower.includes("/video/") || lower.endsWith("/video")) {
        tag = "video";
      } else {
        // 无路径关键词时默认 audio（TTS / 语音消息场景居多）
        tag = "audio";
      }
    }
    // 相对网关媒体路径转绝对 HTTP URL（webview 中相对路径会解析到 vscode-webview:// 基址，无法加载）
    const src = await this.toAbsoluteMediaUrl(url);
    return this.buildMediaTag(tag, src);
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

  private async extractHistoryContent(content: any): Promise<string> {
    if (typeof content === "string") return await this.resolveMediaPaths(content);
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
        } else if ((block.type === "audio" || block.type === "file" || block.type === "media") && (block.content || block.url)) {
          // 处理音频/文件/媒体块：提取路径并转为 MEDIA: 标记
          // 兼容 Web UI 实际结构：{type:'audio', url:'/api/chat/media/...'}
          // 以及旧结构：{type:'audio', content:{path|url}}
          let mediaPath = "";
          if (typeof block.url === "string" && block.url) {
            // 优先读取顶层 url 字段（Web UI 实际音频块结构）
            mediaPath = block.url;
          } else if (typeof block.content === "string") {
            mediaPath = block.content;
          } else if (block.content && typeof block.content === "object") {
            mediaPath = block.content.path || block.content.url || "";
          }
          if (mediaPath) {
            // 对于网关媒体 URL（无扩展名），携带 block.type 信息以便准确判断
            if (mediaPath.startsWith("/api/chat/media/")) {
              // 格式：MEDIA:<type>:<path>，如 MEDIA:audio:/api/chat/media/outgoing/...
              text += (text ? "\n" : "") + "MEDIA:" + block.type + ":" + mediaPath;
            } else {
              text += (text ? "\n" : "") + "MEDIA:" + mediaPath;
            }
          }
        }
      }
      // 处理顶层 openclawDelivery.mediaUrls（TTS 语音播放条支持）
      const mediaUrls = (content as any)?.openclawDelivery?.mediaUrls as string[] | undefined;
      if (mediaUrls && mediaUrls.length > 0) {
        const audioParts: string[] = [];
        for (const mediaPath of mediaUrls) {
          const audioTag = await this.convertMediaToMarkdown(mediaPath);
          if (audioTag) audioParts.push(audioTag);
        }
        if (audioParts.length > 0) {
          text += (text ? "\n" : "") + audioParts.join("\n");
        }
      }
      return await this.resolveMediaPaths(text);
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
      localResourceRoots: []
    };

    webviewView.webview.html = this.getHtml();

    // 清理旧的监听器（如果存在），防止多次面板刷新时累积
    if (this._messageHandlerDisposable) {
      this._messageHandlerDisposable.dispose();
      this._messageHandlerDisposable = undefined;
    }

    this._messageHandlerDisposable = webviewView.webview.onDidReceiveMessage(async (msg) => {
      handleWebviewMessage(msg, this as any);
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
    this.postToWebview({ type: "userMessage", message: msgWithAttachments, agentId: this.activeAgent.id, gwKey: this.gwSessionKey() });
    this.postToWebview({ type: "historyUpdated", messageHistory: this.messageHistory });

    const runId = genId();
    this.postToWebview({ type: "streamStart", runId, agentId: this.activeAgent.id });

    try {
      let res: any;
      try {
        res = await this.gateway.request("chat.send", {
          sessionKey: this.gwSessionKey(),
          message: text,
          deliver: false,
          idempotencyKey: runId,
          ...(attachments.length > 0 ? { attachments } : {})
        });
      } catch (sendErr: any) {
        const errMsg = sendErr?.message || "";
        if (errMsg.includes("ended during restart recovery")) {
          this.log(`Session ended, sending /new to create replacement...`);
          try {
            await this.gateway.request("chat.send", {
              sessionKey: this.gwSessionKey(),
              message: "/new",
              deliver: false,
              idempotencyKey: genId()
            });
            await new Promise(r => setTimeout(r, 1000));
            this.log(`Retrying send after /new...`);
            res = await this.gateway.request("chat.send", {
              sessionKey: this.gwSessionKey(),
              message: text,
              deliver: false,
              idempotencyKey: runId,
              ...(attachments.length > 0 ? { attachments } : {})
            });
          } catch (retryErr: any) {
            this.log(`Retry after /new failed: ${retryErr?.message}`);
            throw sendErr;
          }
        } else {
          throw sendErr;
        }
      }
      this.setBusy(true);
      // If gateway didn't start a stream (e.g. /stop returns aborted:false, runIds:[]),
      // clear the "Thinking" state and show the gateway's reply as assistant message
      if (res && typeof res === 'object' && 
          res.aborted === false && 
          (!Array.isArray(res.runIds) || res.runIds.length === 0)) {
        this.postToWebview({ type: "streamDone", runId, agentId: this.activeAgent.id });
        // Format slash command response for display
        const replyText = this.formatCommandResponse(text, res);
        const assistantMsg: ChatMessage = {
          role: "assistant",
          text: replyText,
          timestamp: Date.now()
        };
        this.messages.push(assistantMsg);
        this.postToWebview({ type: "userMessage", message: assistantMsg, agentId: this.activeAgent.id, gwKey: this.gwSessionKey() });
        this.setBusy(false);  // fix: close busy state for slash commands that don't produce streaming runs
      }
    } catch (err: any) {
      this.messages.push({
        role: "assistant",
        text: `Error: ${err}`,
        timestamp: Date.now()
      });
      this.postToWebview({ type: "streamDone", runId, agentId: this.activeAgent.id });
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
    const runId = genId();
    this.postToWebview({ type: "streamStart", runId, agentId: this.activeAgent.id });
    try {
      try {
        await this.gateway.request("chat.send", {
          sessionKey: this.gwSessionKey(),
          message: "Continue",
          deliver: false,
          idempotencyKey: runId
        });
      } catch (sendErr: any) {
        const errMsg = sendErr?.message || "";
        if (errMsg.includes("ended during restart recovery")) {
          this.log(`Continue: session ended, sending /new...`);
          await this.gateway.request("chat.send", {
            sessionKey: this.gwSessionKey(),
            message: "/new",
            deliver: false,
            idempotencyKey: genId()
          });
          await new Promise(r => setTimeout(r, 1000));
          await this.gateway.request("chat.send", {
            sessionKey: this.gwSessionKey(),
            message: "Continue",
            deliver: false,
            idempotencyKey: runId
          });
        } else {
          throw sendErr;
        }
      }
    } catch {
      this.postToWebview({ type: "streamDone", runId, agentId: this.activeAgent.id });
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

      let pattern: string = '**/*';
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
            if (!targetFolder) {
              // 如果找不到目标文件夹，返回空结果
              return this.processSearchResults([], [...folders], cleanQuery, requestId, isRootFolder);
            }
            const basePattern = fileKeyword ? `**/*${fileKeyword}*` : `**/*`;
            const relativePattern = new vscode.RelativePattern(targetFolder, basePattern);
            const uris = await vscode.workspace.findFiles(relativePattern, "**/node_modules/**", 200);
            
            // 直接处理结果并返回
            return this.processSearchResults(uris, [...folders], cleanQuery, requestId, isRootFolder);
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
      return this.processSearchResults(uris, [...folders], cleanQuery, requestId, isRootFolder);
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
      let displayPrefix: string = '';
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
    // 委托给 taskManager 统一实现（避免自实现重复逻辑）
    return handleRequestModels(this as any);
  }

  private async handleRequestSessions() {
    try {
      // 获取未归档会话（活跃会话）
      const res = await this.gateway.request("sessions.list", {
        archived: false,
        includeGlobal: true,
        includeUnknown: true,
        includeDerivedTitles: true,
        limit: 100
      });
      this.sessions = res?.sessions || [];
      this.log(`sessions.list: ${this.sessions.length} 条`);
      for (const s of this.sessions || []) {
        this.log(`  session: key=${JSON.stringify(s?.key || '')} id=${s?.sessionId || '-'} name=${JSON.stringify(s?.['device-info']?.['device-name'] || s?.displayName || s?.derivedTitle || '')}`);
      }
      // 发送完整会话数据给 webview，包含 device-info 等字段
      this.postToWebview({ type: "sessionsList", sessions: this.sessions });
    } catch (err: any) {
      this.log(`sessions.list error: ${err.message}`);
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
    // 委托给 taskManager 统一实现（避免自实现重复逻辑）
    return handleRequestAgents(this as any);
  }

  private async handleRequestTasks() {
    // 委托给 taskManager 统一实现（避免自实现重复逻辑）
    return handleRequestTasks(this as any);
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
      const normalizedPath = workspace.replace(/^[a-z]:/i, (match: string) => match.toUpperCase());
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
      const runId = genId();
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
          const text = await this.extractHistoryContent(m.content);
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
      
      const runId = genId();
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
          const runId = genId();
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

  private async handleLoadMessages(sessionKey: string, agentId?: string, sessionId?: string) {
    const targetAgentId = agentId || this.activeAgent.id;
    try {
      const res = await this.gateway.request("chat.history", {
        sessionKey: `agent:${targetAgentId}:${sessionKey}`,
        limit: 200
      });
      const msgs = res?.messages || [];
      this.log(`history: ${msgs.length} messages (key=agent:${targetAgentId}:${sessionKey} id=${res?.sessionId || sessionId || '-'})`);
      const parsed: ChatMessage[] = await Promise.all(
        msgs
          .filter((m: any) => m.role === "user" || m.role === "assistant")
          .map(async (m: any) => ({
            role: m.role,
            text: await this.extractHistoryContent(m.content),
            timestamp: m.timestamp || Date.now(),
            contentBlocks: Array.isArray(m.content) ? m.content : undefined
          }))
      );
      let filtered = parsed.filter((m: ChatMessage) => typeof m.text === "string" && m.text.trim() && !m.text.startsWith("HEARTBEAT"));
      // Remove leading orphan user message (from failed send)
      if (filtered.length > 0 && filtered[0].role === "user") {
        filtered.shift();
      }
      // Filter runtime-captured preamble messages (e.g. TTS planning text)
      const preambleFiltered = filtered.filter((m: ChatMessage) => {
        if (m.role !== "assistant" || !this.seenPreambleTexts.length) return true;
        return !isPreamble(m.text, this.seenPreambleTexts);
      });
      // Deduplicate assistant messages: prefer the media/audio version over a plain-text copy.
      // 注意顺序：必须先判断 isMedia，否则同一 key 的音频版会被纯文本版抢先 seen 而丢弃。
      const seen = new Set<string>();
      const merged: ChatMessage[] = [];
      for (const m of preambleFiltered) {
        const cleanText = normText(stripMedia(m.text));
        if (!cleanText && /<audio/i.test(m.text)) {
          // 纯音频消息（无文本）：key 为空字符串，多条历史会共享，
          // 但必须保留（否则播放条永远不出现）。
          merged.push(m);
          continue;
        }
        const key = m.role + "\u0000" + cleanText;
        const isMedia = /<audio/i.test(m.text) || m.text.indexOf("MEDIA:") === 0;
        if (isMedia) {
          // 音频版优先：若已存在相同 key 的纯文本版，替换为音频版
          const idx = merged.findIndex((x) => x.role + "\u0000" + normText(stripMedia(x.text)) === key);
          if (idx >= 0) {
            merged[idx] = m;
          } else {
            merged.push(m);
          }
          seen.add(key);
        } else {
          if (seen.has(key)) continue;
          seen.add(key);
          merged.push(m);
        }
      }
      this.log(`history dedup: ${parsed.length} parsed -> ${merged.length} shown (audio=${merged.filter((m) => /<audio/i.test(m.text)).length})`);
      this.postToWebview({ type: "loadMessages", sessionKey, gwKey: `agent:${targetAgentId}:${sessionKey}`, agentId: targetAgentId, sessionId, messages: merged });
    } catch (err: any) {
      this.log(`history error: ${err.message}`);
      this.postToWebview({ type: "loadMessages", sessionKey, gwKey: `agent:${targetAgentId}:${sessionKey}`, agentId: targetAgentId, sessionId, messages: [] });
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

  private historyReloadTimer: NodeJS.Timeout | null = null;

  /**
   * 运行结束后延迟重新拉取历史，使服务端最终消息（含 TTS 语音/音频）立即呈现。
   * 使用防抖，避免同一 run 的 final/aborted 触发多次重复刷新。
   */
  private scheduleHistoryReload(sessionKey: string, agentId?: string) {
    if (this.historyReloadTimer) clearTimeout(this.historyReloadTimer);
    const localKey = this.resolveSession(sessionKey) || this.currentSessionKey;
    const targetAgentId = agentId || this.activeAgent.id;
    this.historyReloadTimer = setTimeout(async () => {
      this.historyReloadTimer = null;
      try {
        await this.handleLoadMessages(localKey, targetAgentId);
      } catch {}
    }, 900);
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

  private getHtml(): string {
    return getHtml();
  }
}

