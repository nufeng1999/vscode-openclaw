import * as fs from "fs";
import * as os from "os";
import * as path from "path";

/**
 * 解析 AgentsDIR 配置（跨平台）：
 * - 留空 → 用户主目录下的 .openclaw/agents（Windows: C:\Users\<name>\.openclaw\agents；macOS/Linux: ~/.openclaw/agents）
 * - 支持 "~" 与 "~/..." 展开；相对路径基于当前工作区/进程目录解析为绝对路径
 */
export function resolveAgentsDir(configValue?: string): string {
  const value = (configValue || "").trim();
  if (!value) {
    return path.join(os.homedir(), ".openclaw", "agents");
  }
  let expanded = value;
  if (expanded === "~") {
    expanded = os.homedir();
  } else if (expanded.startsWith("~/") || expanded.startsWith("~\\")) {
    expanded = path.join(os.homedir(), expanded.slice(2));
  }
  return path.resolve(expanded);
}

/**
 * 根据扩展名解析媒体类型信息（MIME 类型与 HTML 标签名）。
 * 统一用于本地文件与远程 URL 两种路径，保证行为一致。
 */
export function getMediaInfo(ext: string): { mimeType: string; tag: string } {
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
      return { mimeType: "application/octet-stream", tag: "video" };
  }
}

/**
 * 格式化文件大小
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

/**
 * 格式化 Token 数量
 */
export function formatTokens(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(0) + 'K';
  return n.toString();
}

/**
 * 获取文件图标（用于附件预览）
 */
export function getFileIcon(mimeType: string): string {
  if (!mimeType) return '[FILE]';
  if (mimeType.startsWith('image/')) return '[IMG]';
  if (mimeType.startsWith('video/')) return '[VID]';
  if (mimeType.startsWith('audio/')) return '[AUD]';
  if (mimeType.startsWith('text/') || mimeType.includes('json') || mimeType.includes('xml') || mimeType.includes('yaml') || mimeType.includes('javascript') || mimeType.includes('typescript')) return '[TXT]';
  if (mimeType === 'application/pdf') return '[PDF]';
  if (mimeType.startsWith('application/zip') || mimeType.startsWith('application/gzip') || mimeType.startsWith('application/x-')) return '[ZIP]';
  return '[FILE]';
}

/**
 * 简化设备名称：从完整字符串中提取有意义的部分
 * 格式示例："hostname:macaddress:pid" → 取冒号分隔的第一段
 * 如果太短（< 5字符），直接返回原值
 */
export function simplifyDeviceName(name: string): string {
  if (!name) return '';
  // 优先取冒号分隔的第一段（hostname 部分）
  const parts = name.split(':');
  const firstPart = parts[0].trim();
  // 如果第一段有意义（至少2个字符且不超过15个字符），使用它
  if (firstPart.length >= 2 && firstPart.length <= 15) return firstPart;
  // 否则使用整个字符串，但截断到20字符
  return name.length > 20 ? name.substring(0, 20) + '…' : name;
}

/**
 * 截断字符串
 */
export function truncate(str: string, maxLen: number): string {
  if (!str) return '';
  return str.length > maxLen ? str.substring(0, maxLen) + '…' : str;
}

/**
 * 相对时间格式化
 */
export function relTime(ts: number, t: (str: string, ...args: any[]) => string): string {
  if (!ts) return '';
  const diff = Date.now() - ts;
  if (diff < 0) return '';
  const m = Math.floor(diff / 60000);
  if (m < 1) return t('Just now');
  if (m < 60) return t('{0}m ago', m);
  const h = Math.floor(m / 60);
  if (h < 24) return t('{0}h ago', h);
  return t('{0}d ago', Math.floor(h / 24));
}

/**
 * 生成随机 nonce
 */
export function getNonce(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * 生成随机 ID
 */
export function genId(): string {
  return Math.random().toString(36).substring(2, 12);
}

/**
 * MIME 类型映射表
 */
export const MIME_MAP: Record<string, string> = {
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

/**
 * 根据文件路径获取 MIME 类型
 */
export function getMimeType(filePath: string): string {
  const dot = filePath.lastIndexOf(".");
  if (dot === -1) return "text/plain";
  const ext = filePath.substring(dot).toLowerCase();
  return MIME_MAP[ext] || "text/plain";
}

/**
 * 剥离媒体标记
 */
export function stripMedia(text: string): string {
  if (!text) return "";
  let t = String(text);
  t = t.replace(/<audio[^>]*>[\s\S]*?<\/audio>/gi, "");
  t = t.replace(/<audio[\s\S]*?>/gi, "");
  t = t.split("\n").filter((line: string) => !line.startsWith("MEDIA:")).join("\n");
  return t.trim();
}

/**
 * 规范化文本（去除多余空白）
 */
export function normText(text: string): string {
  if (!text) return "";
  return String(text).replace(/\s+/g, " ").trim();
}

/**
 * 检查是否为 preamble 文本
 */
export function isPreamble(text: string, seenPreambleTexts: string[]): boolean {
  if (!seenPreambleTexts.length) return false;
  const norm = normText(stripMedia(text));
  if (!norm) return false;
  return seenPreambleTexts.some((p) => normText(p) === norm);
}

/* ────────────────────────────────────────────────────────────────────────────
 * 进度备注（Progress Note）tab 归一化判据 —— 纯函数单一事实源
 *
 * 背景（bug）：
 *   进度备注 tab 的归一化条件原先依赖**可变**的 agent.id，而 agent.id 会被
 *   switchToTab / agentSwitched 改写成当前聚焦的 agent。用户切到 designer tab 后，
 *   后续 designer 的进度消息因「agent.id === 'designer'」而被误判为 main 会话，
 *   错误写入「默认」tab。
 *
 * 修复：
 *   锚点改用不可变的 configuredAgentId（webview 内由 init 消息一次性赋值，此后不再改写）。
 *
 * 设计约束（重要）：
 *   src/uiRenderer.ts 中这 5 处逻辑位于 getHtml() 返回的**模板字符串**内
 *   （模板自 L12 起、至 L4584 止），属于注入 webview 的浏览器 JS，**无法 import**。
 *   为消除「逻辑副本」风险（源码改回 bug 而测试仍全绿），本文件是判据的唯一实现：
 *     - 单元测试（src/uiRenderer.normalize.test.ts）直接 import 本文件 → 测的是真实源码
 *     - webview 侧通过 getProgressNoteNormalizeJs() 取得同一函数的**源码文本**并注入
 *   因此下列函数必须保持**自包含**（不引用模块内其它符号），
 *   否则 Function.prototype.toString() 取出的源码在 webview 中会因缺少引用而报错。
 *   getProgressNoteNormalizeJs() 后的用例即为该约束的守卫。
 * ──────────────────────────────────────────────────────────────────────────── */

/**
 * 是否需要把 sessionKey 归一化到「默认」tab（4 变体判据）。
 *
 * 对应 webview 三处：addProgressNoteTab（还需连带改写 title/agentId，故取布尔值）、
 * removeProgressNoteTab、renderProgressCard。
 *
 * 4 个变体：'main'、configuredAgentId、'agent:<cfg>:main'、'agent:<cfg>:*'（startsWith 前缀）。
 *
 * @param sessionKey        后端推送 / 前端持有的 sessionKey
 * @param configuredAgentId 不可变锚点（配置 OpenClaw: Agent ID）
 */
export function shouldNormalizeProgressNoteKey(sessionKey: string, configuredAgentId: string): boolean {
  if (!sessionKey) return false;
  return sessionKey === 'main'
    || sessionKey === configuredAgentId
    || sessionKey === ('agent:' + configuredAgentId + ':main')
    || sessionKey.startsWith('agent:' + configuredAgentId + ':');
}

/**
 * 进度备注 tab 归一化：命中 main 会话变体 → 'default'，否则返回原值（空值先兜底为 'default'）。
 *
 * 保持与 webview 完全一致的执行顺序：先 `if (!sessionKey) sessionKey = 'default'`，
 * 再套用 4 变体判据。
 *
 * @param sessionKey        后端推送 / 前端持有的 sessionKey
 * @param configuredAgentId 不可变锚点（配置 OpenClaw: Agent ID）
 */
export function normalizeProgressNoteSessionKey(sessionKey: string, configuredAgentId: string): string {
  const key = sessionKey || 'default';
  if (key === 'main'
    || key === configuredAgentId
    || key === ('agent:' + configuredAgentId + ':main')
    || key.startsWith('agent:' + configuredAgentId + ':')) {
    return 'default';
  }
  return key;
}

/**
 * 聊天 tab 关闭联动（closeTab）所用的 main 会话判据 —— **3 变体，无 startsWith 前缀匹配**。
 *
 * 与 shouldNormalizeProgressNoteKey 的差异是有意保留的：
 * closeTab 只识别 'main' / configuredAgentId / 'agent:<cfg>:main' 三个精确形态，
 * 形如 'agent:<cfg>:<其它后缀>' 的 key 原样透传（其下游 removeProgressNoteTab 会再归一化一次）。
 *
 * @param tabSessionKey     被关闭 tab 的 sessionKey
 * @param configuredAgentId 不可变锚点（配置 OpenClaw: Agent ID）
 */
export function isChatTabMainNoteKey(tabSessionKey: string, configuredAgentId: string): boolean {
  if (!tabSessionKey) return false;
  return tabSessionKey === 'main'
    || tabSessionKey === configuredAgentId
    || tabSessionKey === ('agent:' + configuredAgentId + ':main');
}

/**
 * 点击 agent 按钮（renderAgentButtons）时推导进度备注 tab 的 key 与标题。
 *
 * 语义：被点击的 agent 就是 configuredAgentId 本身 → 复用「默认」tab；
 * 否则新建 'agent:<id>:main' tab，标题优先取「名称≠id 时的名称」，否则回落到 id。
 *
 * @param agentId           被点击 agent 的 id
 * @param agentName         被点击 agent 的显示名
 * @param configuredAgentId 不可变锚点（配置 OpenClaw: Agent ID）
 */
export function resolveProgressNoteTabForAgent(agentId: string, agentName: string, configuredAgentId: string): { noteKey: string; noteTitle: string } {
  if (agentId === configuredAgentId) return { noteKey: 'default', noteTitle: '默认' };
  return {
    noteKey: 'agent:' + agentId + ':main',
    noteTitle: (agentName && agentName !== agentId) ? agentName : agentId,
  };
}

/**
 * 取上述纯函数的**源码文本**，供 src/uiRenderer.ts 注入 webview 模板字符串。
 *
 * 这是「单一事实源」的关键：webview 里跑的判据与单元测试断言的判据是**同一份源码**
 * （经构建后 Function.prototype.toString() 取得），既不需要 import，也不再是逻辑副本。
 *
 * 注意：因此依赖的函数必须自包含——不得引用模块内其它顶层符号。
 */
export function getProgressNoteNormalizeJs(): string {
  return [
    shouldNormalizeProgressNoteKey.toString(),
    normalizeProgressNoteSessionKey.toString(),
    isChatTabMainNoteKey.toString(),
    resolveProgressNoteTabForAgent.toString(),
  ].join('\n');
}