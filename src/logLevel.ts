// 日志等级常量
export const LOG_NONE = 0;
export const LOG_ERROR = 1;
export const LOG_WARN = 2;
export const LOG_INFO = 3;
export const LOG_DEBUG = 4;
export const LOG_TRACE = 5;

// 等级名称映射（用于显示）
export const LOG_LEVEL_NAMES: Record<number, string> = {
  [LOG_NONE]: "None",
  [LOG_ERROR]: "Error",
  [LOG_WARN]: "Warn",
  [LOG_INFO]: "Info",
  [LOG_DEBUG]: "Debug",
  [LOG_TRACE]: "Trace",
};

// 当前全局日志等级（默认为 Info）
let _logLevel = LOG_INFO;

/**
 * 设置全局日志等级
 * @param level 日志等级数值
 */
export function setLogLevel(level: number): void {
  _logLevel = level;
}

/**
 * 获取当前全局日志等级
 */
export function getLogLevel(): number {
  return _logLevel;
}

/**
 * 判断是否应该输出该等级的日志
 * @param message 日志消息
 * @param level 消息等级，默认 LOG_INFO
 * @param channel VSCode OutputChannel
 */
export function log(
  message: string,
  level: number = LOG_INFO,
  channel?: { appendLine: (msg: string) => void }
): void {
  if (channel && _logLevel >= level) {
    channel.appendLine(message);
  }
}
