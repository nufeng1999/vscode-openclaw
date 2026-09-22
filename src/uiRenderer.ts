import { formatFileSize, formatTokens, getFileIcon, simplifyDeviceName, truncate, relTime, getNonce } from "./utils";
import * as fs from "fs";
import * as vscode from "vscode";
import { getModelscopeCss, getModelscopeHtml, getModelscopeJs } from "./modelscopeUi";

/**
 * Generate the complete webview HTML.
 * Extracted from OpenClawChatView.getHtml() (chatView.ts L1734–L5122).
 */
export function getHtml(): string {
    const nonce = getNonce();
    return /*html*/ `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline' https://cdnjs.cloudflare.com https://unpkg.com; script-src 'nonce-${nonce}' https://cdnjs.cloudflare.com https://unpkg.com; img-src data: https: blob: http:; media-src data: https: http:;">
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
.device-item:hover { background: rgba(128, 128, 128, 0.06); transform: scale(1.01); }
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

/* Top row: messages + progress panel side by side */
#top-row {
  flex: 1;
  display: flex;
  flex-direction: row;
  overflow: hidden;
  min-height: 0;
}

/* Left messages container */
#messages-container {
  flex: 1;
  min-width: 200px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 0;
}

/* Right progress note panel */
#progress-note-panel {
  width: 280px;
  min-width: 220px;
  max-width: 450px;
  background: var(--background);
  border-left: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  flex-shrink: 0;
}
#progress-note-panel.collapsed {
  width: 0 !important;
  min-width: 0 !important;
  max-width: 0 !important;
  border-left: none;
  overflow: hidden;
}
#progress-note-panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 10px;
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}
#progress-note-panel-title {
  font-weight: 600;
  color: var(--text);
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
#progress-note-panel-toggle {
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  font-size: 14px;
  padding: 2px 6px;
  border-radius: 4px;
  line-height: 1;
}
#progress-note-panel-toggle:hover {
  background: var(--hover);
  color: var(--text);
}
#progress-note-panel-content {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
}
#progress-note-panel-content::-webkit-scrollbar { width: 4px; }
#progress-note-panel-content::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }
.progress-resize-handle { width: 4px; cursor: ew-resize; background: transparent; flex-shrink: 0; }
.progress-resize-handle:hover { background: var(--accent); opacity: 0.5; }
.progress-resize-handle.dragging { background: var(--accent); opacity: 0.7; }
#progress-note-panel.collapsed + .progress-resize-handle { width: 4px; cursor: ew-resize; background: var(--accent); opacity: 0.3; }
/* 右侧 overlay 样式 */
#progress-note-panel.right-overlay { position: absolute; right: 0; top: 0; bottom: 0; z-index: 1000; }
#progress-note-panel.right-overlay .tab-pane { height: 100%; overflow-y: auto; }

/* Panel Tab 栏 */
.panel-tabs-wrap {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  border-bottom: 1px solid var(--border);
  background: var(--bg);
}
.panel-tabs-arrow {
  flex-shrink: 0;
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  font-size: 11px;
  padding: 6px 6px;
  line-height: 1;
  border-radius: 4px;
  user-select: none;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s;
}
.panel-tabs-arrow:hover {
  background: var(--hover);
  color: var(--text);
}
.scroll-left-visible {
  opacity: 1 !important;
  pointer-events: auto !important;
}
.scroll-right-visible {
  opacity: 1 !important;
  pointer-events: auto !important;
}
.panel-tabs {
  display: flex;
  gap: 0;
  flex: 1;
  min-width: 0;
  flex-shrink: 0;
  padding: 0 6px;
  flex-wrap: nowrap;
  overflow-x: auto;
  scroll-behavior: smooth;
}
/* Hide scrollbar for Chrome, Safari and Opera */
.panel-tabs::-webkit-scrollbar {
  height: 2px;
}
.panel-tabs::-webkit-scrollbar-thumb {
  background: var(--border);
  border-radius: 1px;
}
/* Hide scrollbar for IE and Edge */
.panel-tabs {
  -ms-overflow-style: none;
  scrollbar-width: thin;
}
.panel-tab {
  padding: 6px 12px;
  font-size: 12px;
  color: var(--text-muted);
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: color 0.15s, border-color 0.15s;
  white-space: nowrap;
  flex-shrink: 0;
}
.panel-tab:hover { color: var(--text); }
.panel-tab.active {
  color: var(--text);
  border-bottom-color: var(--accent);
  font-weight: 600;
}

/* Panel Tab 内容区 */
.panel-tab-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 0;
}
.tab-pane {
  display: none;
  flex: 1;
  flex-direction: column;
  overflow: hidden;
  min-height: 0;
}
.tab-pane.active { display: flex; }

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

#input-area { padding: 8px 10px 12px; border-top: 1px solid var(--border); flex-shrink: 0; min-height: 80px; max-height: 50vh; position: relative; }
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

/* 语音消息样式 */
.msg-audio-bubble audio { max-width: 100%; display: block; margin: 4px 0; }

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

/* Progress card styles - theme-adaptive */
.progress-card {
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 16px;
  margin: 12px 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
  transition: all 0.3s ease;
}
.progress-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}
.progress-card .title {
  font-weight: 600;
  color: var(--text);
  margin-bottom: 8px;
  font-size: 15px;
}
.progress-card .progress-bar {
  height: 6px;
  background: var(--border);
  border-radius: 3px;
  margin: 8px 0;
  overflow: hidden;
}
.progress-card .progress-fill {
  height: 100%;
  background: var(--accent);
  transition: width 0.4s ease;
}
.progress-card .status {
  font-size: 13px;
  color: var(--text-muted);
}
.progress-card .steps {
  margin-top: 12px;
  font-size: 13px;
  color: var(--text-muted);
}
/* Step status indicators */
.step-item { display: flex; align-items: flex-start; gap: 6px; margin: 3px 0; font-size: 12px; }
.step-icon { flex-shrink: 0; width: 16px; text-align: center; }
.step-icon.completed { color: #4ade80; }
.step-icon.in_progress { color: #facc15; }
.step-icon.pending { color: var(--text-muted); }
.step-text { flex: 1; word-break: break-word; }
/* Markdown elements inside progress-card (for marked.parse output) */
.progress-card h1, .progress-card h2, .progress-card h3,
.progress-card h4, .progress-card h5, .progress-card h6 {
  margin: 8px 0 4px 0; line-height: 1.3;
}
.progress-card h1 { font-size: 1.2em; }
.progress-card h2 { font-size: 1.1em; }
.progress-card h3 { font-size: 1em; }
.progress-card p { margin: 4px 0; }
.progress-card ul, .progress-card ol { margin: 4px 0; padding-left: 20px; }
.progress-card li { margin: 2px 0; }
.progress-card code {
  background: rgba(128,128,128,0.15); padding: 1px 4px; border-radius: 3px;
  font-family: var(--vscode-editor-font-family, monospace); font-size: 0.9em;
}
.progress-card pre {
  background: rgba(0,0,0,0.1); border: 1px solid var(--border); border-radius: 6px;
  padding: 8px 10px; overflow-x: auto; margin: 6px 0;
}
.progress-card pre code { background: none; padding: 0; font-size: 0.85em; line-height: 1.4; }
.progress-card blockquote {
  border-left: 3px solid var(--accent); padding-left: 10px; margin: 6px 0;
  color: var(--text-muted);
}
.progress-card table { border-collapse: collapse; margin: 6px 0; width: 100%; }
.progress-card th, .progress-card td {
  border: 1px solid var(--border); padding: 4px 8px; text-align: left; font-size: 12px;
}
.progress-card th { background: rgba(128,128,128,0.1); font-weight: 600; }
.progress-card td { }
.progress-card strong { font-weight: 600; }
.progress-card em { font-style: italic; }
.progress-card a { color: var(--accent); text-decoration: none; }
.progress-card a:hover { text-decoration: underline; }
.progress-card hr { border: none; border-top: 1px solid var(--border); margin: 8px 0; }
.progress-card-copy-btn { background: none; border: none; cursor: pointer; font-size: 16px; padding: 2px 4px; margin-left: 2px; }
.progress-card-md-btn { background: none; border: none; cursor: pointer; font-size: 16px; padding: 2px 4px; margin-left: 2px; }
.progress-card .copy-bar { display: flex; align-items: center; gap: 4px; padding-bottom: 6px; border-bottom: 1px solid var(--border); margin-bottom: 6px; }
/* Agents Tree Styles */
.agents-tree {
  padding: 8px;
}
${getModelscopeCss()}
.agents-tree-item {
  display: flex;
  align-items: center;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  user-select: none;
}
.agents-tree-item:hover {
  background-color: rgba(128, 128, 128, 0.1);
}
.agents-tree-item.active {
  background-color: rgba(0, 120, 215, 0.15);
  border-left: 2px solid var(--accent);
}
.agents-tree-item.folder {
  font-weight: 500;
}
.agents-tree-item.dragging {
  opacity: 0.4;
  background-color: rgba(0, 120, 215, 0.2);
}
.agents-tree-item.drag-over {
  background-color: rgba(0, 120, 215, 0.3);
  outline: 2px solid var(--accent, #3794ff);
  outline-offset: -2px;
}
.agents-tree-item.file {
  font-weight: normal;
  opacity: 0.8;
}
.agents-tree-item.file:hover {
  opacity: 1;
}
.agents-tree-icon {
  margin-right: 6px;
  flex-shrink: 0;
  width: 16px;
  text-align: center;
}
.agents-tree-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.agents-tree-depth-0 { margin-left: 0px; }
.agents-tree-depth-1 { margin-left: 16px; }
.agents-tree-depth-2 { margin-left: 32px; }
.agents-tree-depth-3 { margin-left: 48px; }
.agents-tree-depth-4 { margin-left: 64px; }
.agents-tree-node { display: flex; flex-direction: column; }
.agents-tree-arrow {
  width: 16px;
  text-align: center;
  flex-shrink: 0;
  cursor: pointer;
  user-select: none;
  color: var(--text-muted);
  font-size: 10px;
  line-height: 1;
}
.agents-tree-children {
  overflow: hidden;
}
.agents-tree-item.empty-dir {
  opacity: 0.5;
  color: var(--text-muted);
}
.agents-tree-item.folder {
  font-weight: 500;
}
/* Agents Tree Context Menu */
.agents-tree-context-menu {
  display: none;
  position: fixed;
  z-index: 99999;
  background: var(--bg2, #252526);
  border: 1px solid var(--border, #444);
  border-radius: 8px;
  box-shadow: 0 6px 24px rgba(0,0,0,0.45);
  min-width: 180px;
  padding: 4px 0;
  overflow: hidden;
  font-size: 12px;
}
.agents-tree-context-menu.visible {
  display: block;
}
.agents-tree-context-menu-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 14px;
  cursor: pointer;
  white-space: nowrap;
  color: var(--text, #cccccc);
  transition: background 0.12s;
}
.agents-tree-context-menu-item:hover {
  background: var(--hover, rgba(128,128,128,0.14));
}
.agents-tree-context-menu-item-disabled {
  color: var(--text-muted, #777777);
  cursor: default;
  pointer-events: none;
}
.agents-tree-context-menu-separator {
  height: 1px;
  margin: 4px 0;
  background: var(--border, #444);
}
/* Agents Tree Inline Rename（原地重命名输入框） */
.agents-tree-item.editing {
  background-color: rgba(0, 120, 215, 0.2);
  outline: 1px solid var(--accent, #3794ff);
  outline-offset: -1px;
  border-radius: 4px;
  transition: background-color 0.15s ease;
}
.agents-tree-rename-input {
  flex: 1;
  min-width: 0;
  font-family: inherit;
  font-size: inherit;
  font-weight: inherit;
  color: var(--text, #cccccc);
  background: var(--input-bg, #3c3c3c);
  border: 1px solid var(--accent, #3794ff);
  border-radius: 3px;
  padding: 1px 4px;
  margin: 0;
  outline: none;
  box-shadow: 0 0 0 2px rgba(0, 120, 215, 0.25);
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
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
      <span class="hud-footer-badge" id="footerVersion">OPENCLAW v...</span>
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
  <div id="top-row">
    <div id="messages-container">
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
  </div> <!-- /messages-container -->
    <div class="progress-resize-handle" id="progressResizeHandle" title="Drag to resize panel"></div>
    <div id="progress-note-panel">
      <div class="panel-tabs-wrap">
        <button class="panel-tabs-arrow" id="panelTabsArrowLeft" title="Scroll left" style="display:none;">◀</button>
        <div class="panel-tabs" id="panelTabsBar">
          <div class="panel-tab active" data-tab="notes">${vscode.l10n.t('Progress Notes')}</div>
          <div class="panel-tab" data-tab="tasks">${vscode.l10n.t('Tasks')}</div>
          <div class="panel-tab" data-tab="sessions">${vscode.l10n.t('Sessions')}</div>
          <div class="panel-tab" data-tab="agents">${vscode.l10n.t('Agents')}</div>
        </div>
        <button class="panel-tabs-arrow" id="panelTabsArrowRight" title="Scroll right" style="display:none;">▶</button>
        <button id="progress-note-panel-toggle" title="${vscode.l10n.t('Toggle progress note panel')}" style="margin-left:auto;background:none;border:none;color:var(--text-muted);cursor:pointer;font-size:14px;padding:4px 8px;border-radius:4px;line-height:1;">▶</button>
      </div>
      <div class="panel-tab-content">
        <div id="tab-notes" class="tab-pane active">
          <div id="progress-note-panel-header">
            <span id="progress-note-panel-title">${vscode.l10n.t('Progress Notes')}</span>
          </div>
          <div id="progress-note-panel-content">
            <div style="color:var(--text-muted);font-size:12px;text-align:center;padding:20px 10px;">${vscode.l10n.t('Progress notes will appear here')}</div>
          </div>
        </div>
        <div id="tab-tasks" class="tab-pane">
          <div id="tasksListContent" style="padding:8px 12px;overflow-y:auto;flex:1;">
            <div style="color:var(--text-muted);font-size:12px;text-align:center;padding:20px 10px;">${vscode.l10n.t('No tasks')}</div>
          </div>
        </div>
        <div id="tab-sessions" class="tab-pane">
          <div id="tabSessionsContent" style="padding:8px 12px;overflow-y:auto;flex:1;">
            <div style="color:var(--text-muted);font-size:12px;text-align:center;padding:20px 10px;">${vscode.l10n.t('No sessions')}</div>
          </div>
        </div>
        <div id="tab-agents" class="tab-pane">
${getModelscopeHtml()}
        </div>
      </div>
    </div>
  </div> <!-- /top-row -->
  <div id="input-area" class="input-area">
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
  let agentsTreeData = null;
  let agentsTreeDir = '';
  let agentTreeHasPendingClipboard = false;
  // 智能体目录树展开状态（key: 目录路径，value: true=展开）
  // 双端持久化：webview 侧先写入 localStorage，再同步给 host 存入 globalState
  let agentsTreeExpandedPaths = {};
  const AGENTS_TREE_EXPANDED_KEY = 'openclaw.agentsTreeExpandedPaths';
  function loadAgentsTreeExpandedPaths() {
    try {
      var raw = localStorage.getItem(AGENTS_TREE_EXPANDED_KEY);
      if (raw) {
        var parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') agentsTreeExpandedPaths = parsed;
      }
    } catch (e) { agentsTreeExpandedPaths = {}; }
  }
  function saveAgentsTreeExpandedPaths() {
    try {
      localStorage.setItem(AGENTS_TREE_EXPANDED_KEY, JSON.stringify(agentsTreeExpandedPaths));
    } catch (e) { /* localStorage 不可用时忽略 */ }
    if (typeof vscode !== 'undefined') {
      vscode.postMessage({ type: 'saveExpandedPaths', expandedPaths: agentsTreeExpandedPaths });
    }
  }
  loadAgentsTreeExpandedPaths();
  // ModelScope agents state
  let modelscopeState = {
    page: 1,
    pageSize: 12,
    totalCount: 0,
    agents: [],
    loading: false,
    loaded: false,
    searchKeyword: '',
    category: ''
  };
  // Inject ModelScope JS functions
  ${getModelscopeJs()}
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

  // 记录正在流式输出的 agent 绑定到哪个 tab（避免不同 agent 的消息互相串台）
  const streamAgentBindings = {};

  function tabForStreamEvent(msg) {
    const streamAgent = msg.agentId || (agent && agent.id) || 'main';
    const boundTabId = streamAgentBindings[streamAgent];
    const active = getActiveTab();
    // 有绑定：流只影响绑定 tab（若不在前台则忽略流式渲染；历史重载会补全消息）
    return boundTabId ? boundTabId === active.id : true;
  }

  // 点击会话列表 / 收到 loadMessages / userMessage 时的 tab 路由：
  // 1) 已有该 agent 的 tab → 直接复用；
  // 2) tab-main 仍是占位 'main'（尚未绑定配置的 OpenClaw: Agent ID）→ 复用它绑定到该 agent；
  // 3) 否则新建该 agent 的专属 tab。绝不把已绑定配置 agent 的 Chat tab 重新绑定到别的 agent。
  function getOrCreateTabByAgentId(agentId) {
    let tab = tabs.find(t => t.agentId === agentId);
    if (!tab) {
      const defaultTab = tabs.find(t => t.id === 'tab-main' && t.agentId === 'main');
      if (defaultTab) {
        tab = defaultTab;
        tab.agentId = agentId || 'main';
        tab.sessionKey = 'main';
        const ag = agents.find(a => a.id === tab.agentId);
        if (ag) tab.label = ag.name || ag.id;
      } else {
        const ag = agents.find(a => a.id === agentId);
        const resolvedAgentId = agentId || (agent && agent.id) || 'main';
        tab = {
          id: 'tab-agent-' + agentId + '-' + Date.now(),
          label: (ag && (ag.name || ag.id)) || agentId,
          agentId: agentId,
          sessionKey: 'agent:' + resolvedAgentId + ':main',
          messages: []
        };
        tabs.push(tab);
      }
      renderTabs();
    }
    return tab;
  }

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

  
  const progressNotePanel = document.getElementById('progress-note-panel');
  const progressResizeHandle = document.getElementById('progressResizeHandle');
  let isPanelResizing = false;
  let panelStartX = 0;
  let panelStartWidth = 0;
  const progressNoteToggle = document.getElementById('progress-note-panel-toggle');
  const messagesContainer = document.getElementById('messages-container');

  // Load saved panel state
  const savedPanelCollapsed = localStorage.getItem('openclaw.progressNoteCollapsed');
  if (progressNotePanel) {
    if (savedPanelCollapsed === 'true') {
      progressNotePanel.classList.add('collapsed');
    }
  }
  const savedPanelWidth = localStorage.getItem('openclaw.progressNotePanelWidth');
  if (savedPanelWidth && progressNotePanel) {
    progressNotePanel.style.width = savedPanelWidth + 'px';
  }

  if (progressNoteToggle) {
    progressNoteToggle.addEventListener('click', () => {
      if (!progressNotePanel) return;
      const isCollapsed = progressNotePanel.classList.toggle('collapsed');
      progressNoteToggle.textContent = isCollapsed ? '◀' : '▶';
      localStorage.setItem('openclaw.progressNoteCollapsed', isCollapsed.toString());
      updatePanelPosition();
    });
  }

  // 检测是否在最右侧（容器右边距 < 50px 视为右边界）
  function updatePanelPosition() {
    if (!progressNotePanel) return;
    const rect = progressNotePanel.getBoundingClientRect();
    const containerRect = document.querySelector('.chat-container')?.getBoundingClientRect();
    if (containerRect && (containerRect.right - rect.right) < 50) {
      progressNotePanel.classList.add('right-overlay');
    } else {
      progressNotePanel.classList.remove('right-overlay');
    }
  }
  // 在 panel 展开/折叠、窗口 resize 时调用
  window.addEventListener('resize', updatePanelPosition);

  // Tab 切换
  const panelTabsBar = document.getElementById('panelTabsBar');
  function updatePanelTabsArrows() {
    const left = document.getElementById('panelTabsArrowLeft');
    const right = document.getElementById('panelTabsArrowRight');
    if (!panelTabsBar || !left || !right) return;
    const canScroll = panelTabsBar.scrollWidth > panelTabsBar.clientWidth + 1;
    left.classList.toggle('scroll-left-visible', canScroll && panelTabsBar.scrollLeft > 1);
    right.classList.toggle('scroll-right-visible', canScroll && panelTabsBar.scrollLeft < panelTabsBar.scrollWidth - panelTabsBar.clientWidth - 1);
  }
  if (panelTabsBar) {
    panelTabsBar.addEventListener('scroll', updatePanelTabsArrows);
    window.addEventListener('resize', updatePanelTabsArrows);
    // 鼠标滚轮横向滚动：纵向 deltaY 转为横向 scrollLeft
    panelTabsBar.addEventListener('wheel', (e) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault();
        panelTabsBar.scrollLeft += e.deltaY;
      }
    }, { passive: false });
    updatePanelTabsArrows();
  }
  const panelTabsArrowLeft = document.getElementById('panelTabsArrowLeft');
  const panelTabsArrowRight = document.getElementById('panelTabsArrowRight');
  if (panelTabsArrowLeft) {
    panelTabsArrowLeft.addEventListener('click', () => {
      if (panelTabsBar) panelTabsBar.scrollLeft -= 120;
    });
  }
  if (panelTabsArrowRight) {
    panelTabsArrowRight.addEventListener('click', () => {
      if (panelTabsBar) panelTabsBar.scrollLeft += 120;
    });
  }
  document.querySelectorAll('.panel-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.panel-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById('tab-' + tab.dataset.tab).classList.add('active');
      // 激活 tab 自动滚动到可见区域中心
      tab.scrollIntoView({ inline: 'center', behavior: 'smooth', block: 'nearest' });
      
      // 刷新对应面板数据
      if (tab.dataset.tab === 'tasks') {
        vscode.postMessage({ type: 'requestTasks' });
      } else if (tab.dataset.tab === 'sessions') {
        vscode.postMessage({ type: 'requestSessions' });
      } else if (tab.dataset.tab === 'agents') {
        vscode.postMessage({ type: 'requestAgentsTree' });
      }
    });
  });
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

  // 面板拖拽调整宽度
  if (progressResizeHandle && progressNotePanel) {
    progressResizeHandle.addEventListener('mousedown', (e) => {
      // 如果面板是折叠状态，先展开面板
      if (progressNotePanel.classList.contains('collapsed')) {
        progressNotePanel.classList.remove('collapsed');
        progressNoteToggle.textContent = '▶';
        localStorage.setItem('openclaw.progressNoteCollapsed', 'false');
        updatePanelPosition();
      }
      
      isPanelResizing = true;
      panelStartX = e.clientX;
      panelStartWidth = progressNotePanel.offsetWidth;
      progressResizeHandle.classList.add('dragging');
      progressNotePanel.classList.add('resizing');
      document.body.style.cursor = 'ew-resize';
      document.body.style.userSelect = 'none';
      e.preventDefault();
    });

    // 双击展开面板
    progressResizeHandle.addEventListener('dblclick', (e) => {
      if (progressNotePanel.classList.contains('collapsed')) {
        progressNotePanel.classList.remove('collapsed');
        progressNoteToggle.textContent = '▶';
        localStorage.setItem('openclaw.progressNoteCollapsed', 'false');
        updatePanelPosition();
      }
      e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
      if (!isPanelResizing) return;
      const delta = panelStartX - e.clientX;
      let newWidth = panelStartWidth + delta;
      const minWidth = 180;
      const maxWidth = window.innerWidth * 0.6;
      newWidth = Math.max(minWidth, Math.min(maxWidth, newWidth));
      progressNotePanel.style.width = newWidth + 'px';
    });

    document.addEventListener('mouseup', () => {
      if (isPanelResizing) {
        isPanelResizing = false;
        progressResizeHandle.classList.remove('dragging');
        progressNotePanel.classList.remove('resizing');
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
        localStorage.setItem('openclaw.progressNotePanelWidth', progressNotePanel.offsetWidth.toString());
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
    console.log('[MS] Received message type:', msg.type);
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
        // 动态更新页脚版本号（服务器返回了版本信息时）
        if (msg.version) {
          const footerVersion = document.getElementById('footerVersion');
          if (footerVersion) footerVersion.textContent = 'OPENCLAW v' + msg.version;
        }
        updateAgentCard();
        updateChips();
        serverValue.textContent = (gatewayUrl && gatewayUrl.indexOf('://') >= 0) ? gatewayUrl.slice(gatewayUrl.indexOf('://') + 3) : '${vscode.l10n.t('not configured')}';
        if (msg.sessionKey) currentSession = msg.gwSessionKey || msg.sessionKey;
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
        // tab 统一保存完整 gwKey（如 agent:<id>:main），保证按 sessionKey 查重可匹配 Chat tab
        tabs[0].sessionKey = msg.gwSessionKey || msg.sessionKey || tabs[0].sessionKey;
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
      case 'tasksList':
        renderTasks(msg.tasks);
        break;
      case 'sessionsList':
        sessions = msg.sessions || [];
        renderSessions();
        updateContextMeter();
        break;
      case 'agentsList':
        agents = msg.agents || [];
        renderAgentButtons();
        renderLocalAgentsTree();
        break;
      case 'agentsTree':
        agentsTreeData = msg.tree;
        agentsTreeDir = msg.dir || '';
        agentTreeHasPendingClipboard = msg.hasPendingClipboard ?? false;
        // 接收 host 传来的展开状态（globalState 持久化），覆盖本地（含 localStorage）
        if (msg.expandedPaths && typeof msg.expandedPaths === 'object') {
          agentsTreeExpandedPaths = msg.expandedPaths;
          try {
            localStorage.setItem(AGENTS_TREE_EXPANDED_KEY, JSON.stringify(agentsTreeExpandedPaths));
          } catch (e) { /* ignore */ }
        }
        renderLocalAgentsTree();
        break;
      case 'clipboardState':
        // host 在 fileCut/fileCopy/filePaste 后推送剪贴板状态，仅更新粘贴菜单的可用性标志
        agentTreeHasPendingClipboard = msg.hasPendingClipboard ?? false;
        break;
      case 'modelscopeAgentsResult':
        console.log('[MS] modelscopeAgentsResult handler, agents count:', msg.agents ? msg.agents.length : 0);
        console.log('[MS] Received page:', msg.page, 'totalCount:', msg.totalCount);
        modelscopeState.loading = false;
        modelscopeState.loaded = true;
        modelscopeState.agents = msg.agents || [];
        modelscopeState.totalCount = msg.totalCount || 0;
        modelscopeState.page = msg.page || 1;
        // 同步后端实际返回的 pageSize（响应中携带），避免前端始终按初始值渲染
        if (msg.pageSize && msg.pageSize > 0) modelscopeState.pageSize = msg.pageSize;
        console.log('[MS] Updated state - page:', modelscopeState.page, 'agents length:', modelscopeState.agents.length);
        var msLoadingEl = document.getElementById('modelscope-loading');
        var msErrorEl = document.getElementById('modelscope-error');
        var msEmptyEl = document.getElementById('modelscope-empty');
        var msNoResultsEl = document.getElementById('modelscope-no-results');
        var msSearchEl = document.getElementById('modelscope-search');
        if (msLoadingEl) msLoadingEl.style.display = 'none';
        if (msErrorEl) msErrorEl.style.display = 'none';
        // 显示搜索框与分类标签区（数据到达后）
        if (msSearchEl) msSearchEl.style.display = 'flex';
        var msCatEl = document.getElementById('modelscope-categories');
        if (msCatEl) msCatEl.style.display = 'flex';
        updateModelscopeCategoryHighlight();
        // 若存在搜索关键词，应用本地过滤后再渲染
        var currentKeyword = modelscopeState.searchKeyword || '';
        var filteredAgents = filterAgentsByKeyword(currentKeyword, modelscopeState.agents);
        if (currentKeyword.trim()) {
          // 搜索激活状态：隐藏分页，按过滤结果渲染
          if (msEmptyEl) msEmptyEl.style.display = 'none';
          var msPagEl2 = document.getElementById('modelscope-pagination');
          if (msPagEl2) msPagEl2.style.display = 'none';
          if (filteredAgents.length === 0) {
            var msGridEl2 = document.getElementById('modelscope-grid');
            if (msGridEl2) msGridEl2.innerHTML = '';
            if (msNoResultsEl) msNoResultsEl.style.display = 'block';
          } else {
            if (msNoResultsEl) msNoResultsEl.style.display = 'none';
            renderModelscopeGrid(filteredAgents);
          }
        } else {
          // 无搜索关键词：正常渲染完整列表
          if (msNoResultsEl) msNoResultsEl.style.display = 'none';
          if (modelscopeState.agents.length === 0) {
            if (msEmptyEl) msEmptyEl.style.display = 'block';
            var msPagEl3 = document.getElementById('modelscope-pagination');
            if (msPagEl3) msPagEl3.style.display = 'none';
          } else {
            if (msEmptyEl) msEmptyEl.style.display = 'none';
            renderModelscopeGrid(modelscopeState.agents);
            renderModelscopePagination();
          }
        }
        var msGridEl = document.getElementById('modelscope-grid');
        var msPanelEl = document.getElementById('agents-modelscope-panel');
        console.log('[MS-DOM] result handler: grid exists=' + !!msGridEl, 'grid innerHTML length=' + (msGridEl ? msGridEl.innerHTML.length : 0), 'panel class=' + (msPanelEl ? msPanelEl.className : 'null'), 'panel display=' + (msPanelEl ? getComputedStyle(msPanelEl).display : 'null'));
        break;
      case 'modelscopeAgentsError':
        console.log('[MS] modelscopeAgentsError handler, error:', msg.error);
        modelscopeState.loading = false;
        var msLoadingEl2 = document.getElementById('modelscope-loading');
        var msErrorEl2 = document.getElementById('modelscope-error');
        if (msLoadingEl2) msLoadingEl2.style.display = 'none';
        if (msErrorEl2) {
          msErrorEl2.style.display = 'block';
          msErrorEl2.innerHTML = '加载失败: ' + escapeHtml(msg.error || '未知错误') + '<br><button class="retry-btn" onclick="fetchModelscopeAgents(' + modelscopeState.page + ', modelscopeState.category)">重试</button>';
        }
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
      case 'userMessage': {
        // 优先按 gwKey 匹配专属会话 tab；否则回退到 agentId 路由
        let tab = msg.gwKey ? tabs.find(t => t.sessionKey === msg.gwKey) : undefined;
        if (!tab) {
          const targetAgent = msg.agentId || (agent && agent.id) || 'main';
          tab = getOrCreateTabByAgentId(targetAgent);
        }
        if (tab.id === activeTabId) {
          appendMessage(msg.message);
          activeTabMessages.push(msg.message);
        } else {
          tab.messages.push(msg.message);
        }
        break;
      }
      case 'loadMessages': {
        // 优先按完整 sessionKey（gwKey）匹配专属 tab，避免同 agent 下多个会话路由错 tab
        let tab = msg.gwKey ? tabs.find(t => t.sessionKey === msg.gwKey) : undefined;
        if (!tab) {
          const targetAgent = msg.agentId || (agent && agent.id) || 'main';
          tab = getOrCreateTabByAgentId(targetAgent);
        }
        tab.sessionKey = msg.gwKey || msg.sessionKey || tab.sessionKey;
        tab.sessionId = msg.sessionId || tab.sessionId;
        tab.messages = (msg.messages || []).slice();
        if (tab.id === activeTabId) {
          currentSession = tab.sessionKey;
          clearMessages();
          activeTabMessages = tab.messages;
          for (const m of tab.messages) appendMessage(m);
        }
        break;
      }
      case 'activateAgentChat':
        // 切换到该 agent 的默认聊天界面（复用 agent 按钮切换逻辑）
        if (msg.agentId) {
          let tab = tabs.find(t => t.agentId === msg.agentId);
          if (!tab) {
            const ag = agents.find(a => a.id === msg.agentId);
            tab = {
              id: 'tab-' + msg.agentId + '-' + Date.now(),
              label: (ag && (ag.name || ag.id)) || msg.agentId,
              agentId: msg.agentId,
              sessionKey: 'agent:' + msg.agentId + ':main',
              messages: []
            };
            tabs.push(tab);
          }
          switchToTab(tab.id);
        }
        break;
      case 'addChatTab':
        if (msg.tab) {
          // 去重：同一 sessionKey 已有 tab 则直接切换
          const existing = tabs.find(t => t.sessionKey === msg.tab.sessionKey);
          if (existing) {
            switchToTab(existing.id);
          } else {
            tabs.push(msg.tab);
            switchToTab(msg.tab.id);
            renderTabs();
          }
        }
        break;
      case 'clearMessages':
        clearMessages();
        activeTabMessages = [];
        const ct = getActiveTab();
        if (ct) ct.messages = [];
        break;
      case 'streamStart': {
        const streamAgent = msg.agentId || (agent && agent.id) || 'main';
        streamAgentBindings[streamAgent] = getActiveTab().id;
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
      }
      case 'streamDelta':
        if (!tabForStreamEvent(msg)) break;
        streaming = true;
        emptyState.style.display = 'none';
        showTyping(false);
        updateStream(msg.text, false);
        break;
      case 'streamDone': {
        if (!tabForStreamEvent(msg)) break;
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
      }
      case 'streamError': {
        if (!tabForStreamEvent(msg)) break;
        streaming = false;
        appendMessage({ role: 'assistant', text: 'Error: ' + msg.error, timestamp: Date.now() });
        showTyping(false);
        sendBtn.style.display = '';
        stopBtn.classList.remove('active');
        attachBtnEl.style.display = '';
        // Store error message in activeTabMessages
        activeTabMessages.push({ role: 'assistant', text: 'Error: ' + msg.error, timestamp: Date.now() });
        break;
      }
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
      case 'autoContinueFailed': {
        if (!tabForStreamEvent(msg)) break;
        streaming = false;
        appendMessage({ role: 'assistant', text: '${vscode.l10n.t('Auto-continue failed after {0} attempts')}'.replace('{0}', msg.count), timestamp: Date.now() });
        showTyping(false);
        sendBtn.style.display = '';
        stopBtn.classList.remove('active');
        attachBtnEl.style.display = '';
        activeTabMessages.push({ role: 'assistant', text: '${vscode.l10n.t('Auto-continue failed after {0} attempts')}'.replace('{0}', msg.count), timestamp: Date.now() });
        this.setBusy(false);
        break;
      }
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
      case 'progressCard': {
        renderProgressCard(msg);
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

  function copyProgressCard(btn) {
    var card = btn.closest('.progress-card');
    if (!card) return;
    var clone = card.cloneNode(true);
    clone.querySelectorAll('.progress-card-copy-btn').forEach(function(b) { b.remove(); });
    var text = (clone.textContent || '').trim();
    if (!text) return;
    navigator.clipboard.writeText(text).then(function() {
      btn.textContent = '\u2705';
      setTimeout(function() { btn.textContent = '\u{1F4CB}'; }, 1500);
    }).catch(function() {});
  }

  function copyProgressCardAsMarkdown(btn) {
    var card = btn.closest('.progress-card');
    if (!card) return;
    
    var mdText = card.getAttribute('data-raw-markdown') || '';
    
    if (!mdText) {
      var clone = card.cloneNode(true);
      clone.querySelectorAll('.progress-card-copy-btn, .progress-card-md-btn').forEach(function(b) { b.remove(); });
      mdText = htmlToMarkdown(clone);
    }
    
    if (!mdText) return;
    
    navigator.clipboard.writeText(mdText).then(function() {
      btn.textContent = '\u2705';
      setTimeout(function() { btn.textContent = '\u{1F4DD}'; }, 1500);
    }).catch(function() {});
  }

  /** 将 HTML 元素递归转换为 Markdown 文本 */
  function htmlToMarkdown(el) {
    if (!el) return '';
    var BT = String.fromCharCode(96);
    var TBT = BT + BT + BT;
    function processNode(node) {
      if (node.nodeType === 3) return node.textContent || '';
      if (node.nodeType !== 1) return '';
      var tag = node.tagName.toLowerCase();
      var inner = '';
      for (var i = 0; i < node.childNodes.length; i++) {
        inner += processNode(node.childNodes[i]);
      }
      switch (tag) {
        case 'h1': return '# ' + inner.trim() + '\\n\\n';
        case 'h2': return '## ' + inner.trim() + '\\n\\n';
        case 'h3': return '### ' + inner.trim() + '\\n\\n';
        case 'h4': return '#### ' + inner.trim() + '\\n\\n';
        case 'h5': return '##### ' + inner.trim() + '\\n\\n';
        case 'h6': return '###### ' + inner.trim() + '\\n\\n';
        case 'p': return inner.trim() + '\\n\\n';
        case 'br': return '\\n';
        case 'hr': return '\\n---\\n\\n';
        case 'strong': case 'b': return '**' + inner.trim() + '**';
        case 'em': case 'i': return '*' + inner.trim() + '*';
        case 'code': {
          if (node.parentElement && node.parentElement.tagName.toLowerCase() === 'pre') return inner;
          return BT + inner + BT;
        }
        case 'pre': return '\\n' + TBT + '\\n' + inner.trim() + '\\n' + TBT + '\\n\\n';
        case 'blockquote': return inner.split('\\n').map(function(l) { return '> ' + l; }).join('\\n') + '\\n\\n';
        case 'ul': {
          var items = '';
          for (var j = 0; j < node.children.length; j++) {
            items += '- ' + processNode(node.children[j]).trim() + '\\n';
          }
          return items + '\\n';
        }
        case 'ol': {
          var items2 = '';
          var idx = 1;
          for (var j2 = 0; j2 < node.children.length; j2++) {
            items2 += idx + '. ' + processNode(node.children[j2]).trim() + '\\n';
            idx++;
          }
          return items2 + '\\n';
        }
        case 'li': return inner;
        case 'a': {
          var href = node.getAttribute('href') || '';
          return '[' + inner.trim() + '](' + href + ')';
        }
        case 'img': {
          var src = node.getAttribute('src') || '';
          var alt = node.getAttribute('alt') || '';
          return '![' + alt + '](' + src + ')';
        }
        case 'input': {
          if (node.type === 'checkbox') {
            return node.checked ? '- [x] ' : '- [ ] ';
          }
          return '';
        }
        case 'div': case 'section': case 'article': case 'main':
          return inner + '\\n';
        case 'table': {
          var rows = [];
          var trs = node.querySelectorAll('tr');
          for (var ti = 0; ti < trs.length; ti++) {
            var cells = [];
            var tds = trs[ti].querySelectorAll('td, th');
            for (var di = 0; di < tds.length; di++) {
              cells.push(processNode(tds[di]).trim());
            }
            rows.push(cells);
          }
          if (rows.length === 0) return inner;
          var md = '| ' + rows[0].join(' | ') + ' |\\n';
          var seps = [];
          for (var si = 0; si < rows[0].length; si++) seps.push('---');
          md += '| ' + seps.join(' | ') + ' |\\n';
          for (var ri = 1; ri < rows.length; ri++) {
            md += '| ' + rows[ri].join(' | ') + ' |\\n';
          }
          return md + '\\n';
        }
        default: return inner;
      }
    }
    var result = processNode(el);
    return result.replace(/\\n{3,}/g, '\\n\\n').trim();
  }

  // 复制 Notes 面板全部内容
  const progressCopyAllBtn = document.getElementById('progressCopyAllBtn');
  if (progressCopyAllBtn) {
    progressCopyAllBtn.addEventListener('click', () => {
      const noteContent = document.getElementById('progress-note-panel-content');
      if (!noteContent) return;
      const clone = noteContent.cloneNode(true);
      clone.querySelectorAll('.progress-card-copy-btn').forEach(b => b.remove());
      clone.querySelectorAll('#progressCopyAllBtn, #progressCopyMarkdownBtn').forEach(b => b.remove());
      const text = (clone.textContent || '').trim();
      if (!text) return;
      navigator.clipboard.writeText(text).then(() => {
        progressCopyAllBtn.textContent = '\u2705';
        setTimeout(() => { progressCopyAllBtn.textContent = '\u{1F4CB}'; }, 1500);
      }).catch(() => {});
    });
  }

  // 📝 按钮：复制 Markdown 格式
  const progressCopyMarkdownBtn = document.getElementById('progressCopyMarkdownBtn');
  if (progressCopyMarkdownBtn) {
    progressCopyMarkdownBtn.addEventListener('click', () => {
      const noteContent = document.getElementById('progress-note-panel-content');
      if (!noteContent) return;
      var mdCard = noteContent.querySelector('.progress-card[data-raw-markdown]');
      var mdText = '';
      if (mdCard) {
        mdText = mdCard.getAttribute('data-raw-markdown') || '';
      }
      if (!mdText) {
        var clone = noteContent.cloneNode(true);
        clone.querySelectorAll('.progress-card-copy-btn').forEach(b => b.remove());
        clone.querySelectorAll('#progressCopyAllBtn, #progressCopyMarkdownBtn').forEach(b => b.remove());
        mdText = htmlToMarkdown(clone);
      }
      if (!mdText) return;
      navigator.clipboard.writeText(mdText).then(() => {
        progressCopyMarkdownBtn.textContent = '\u2705';
        setTimeout(() => { progressCopyMarkdownBtn.textContent = '\u{1F4DD}'; }, 1500);
      }).catch(() => {});
    });
  }

  function renderProgressCard(msg) {
    const data = msg.data;
    const noteContent = document.getElementById('progress-note-panel-content');
    // vs10n: webview l10n helper with Chinese fallback
    const t = (str, ...args) => {
      if (vscode && vscode.l10n && typeof vscode.l10n.t === 'function') return vscode.l10n.t(str, ...args);
      // webview fallback dictionary (zh-CN)
      const dict = { 'No tasks': '无任务', 'No sessions': '无会话', 'Tasks': '任务', 'Sessions': '会话', 'Progress Notes': '进度备注', 'In progress': '进行中', 'Steps': '步骤', 'Processing...': '处理中...', 'Progress notes will appear here': '进度备注将显示在此处' };
      return dict[str] || str;
    };

    // ── 清除分支：data 为 null/undefined 时清空 Notes 面板 ──
    if (!data) {
        if (noteContent) {
            noteContent.innerHTML = '<div style="color:var(--text-muted);font-size:12px;text-align:center;padding:20px 10px;">' + t('Progress notes will appear here') + '</div>';
        }
        return;
    }

    // ── 优先支持纯 markdown 格式（Gateway 返回只有 markdown 字段的情况）──
    if (noteContent && data && data.markdown) {
      // 移除占位提示文本
      const placeholder = noteContent.querySelector('div[style*="text-align:center"]');
      if (placeholder && placeholder.textContent.includes('Progress notes will appear here')) {
        placeholder.remove();
      }
      // 使用 marked.parse() 将 markdown 转为 HTML，否则回退为 <pre> 文本
      const noteHTML = '<div class="progress-card" style="margin:8px 0;">' +
        (typeof marked !== 'undefined' ? marked.parse(data.markdown) : '<pre>' + data.markdown + '</pre>') +
        '</div>';
      noteContent.innerHTML = noteHTML;
      // 渲染 plan 列表（若 plan 字段存在且非空，优先于 steps）
      const stepList = (data.steps && data.steps.length > 0) ? data.steps : (data.plan && data.plan.length > 0 ? data.plan : null);
      if (stepList) {
        const stepsHTML = '<div style="margin-top:8px;font-size:12px;color:var(--text-muted);border-top:1px solid var(--border);padding-top:8px;">' +
          '<div style="margin-bottom:4px;font-weight:600;">' + t('Steps') + ':</div>' +
          stepList.map((s, i) => {
            const stepText = (typeof s === 'object' && s !== null) ? (s.step || JSON.stringify(s)) : String(s);
            const stepStatus = (typeof s === 'object' && s !== null) ? (s.status || '') : '';
            const icon = stepStatus === 'completed' ? '\u2705' : stepStatus === 'in_progress' ? '\u23F3' : '\u2B1C';
            const iconClass = stepStatus === 'completed' ? 'completed' : stepStatus === 'in_progress' ? 'in_progress' : 'pending';
            return '<div class="step-item"><span class="step-icon ' + iconClass + '">' + icon + '</span><span class="step-text">' + (i+1) + '. ' + stepText + '</span></div>';
          }).join('') +
          '</div>';
        noteContent.insertAdjacentHTML('beforeend', stepsHTML);
      }
      // 添加复制按钮和存储原始 Markdown
      const mdCard = noteContent.querySelector('.progress-card');
      if (mdCard) {
        mdCard.setAttribute('data-raw-markdown', data.markdown);
        const copyBtn = document.createElement('button');
        copyBtn.className = 'progress-card-copy-btn';
        copyBtn.textContent = '\u{1F4CB}';
        copyBtn.title = 'Copy content';
        copyBtn.onclick = function() { copyProgressCard(this); };
        // 创建 copy-bar 容器包裹两个按钮
        const bar = document.createElement('div');
        bar.className = 'copy-bar';
        mdCard.prepend(bar);
        bar.appendChild(copyBtn);
        // 添加 Copy as Markdown 按钮
        const mdCopyBtn = document.createElement('button');
        mdCopyBtn.className = 'progress-card-md-btn';
        mdCopyBtn.textContent = '\u{1F4DD}';
        mdCopyBtn.title = 'Copy as Markdown';
        mdCopyBtn.onclick = function() { copyProgressCardAsMarkdown(this); };
        bar.appendChild(mdCopyBtn);
      }
      noteContent.scrollTop = noteContent.scrollHeight;
      return;
    }

    // ── 原有结构化字段逻辑（保留向后兼容）──
    const { title, description, progress, status, steps: stepListFromData } = data || {};
    const steps = stepListFromData || data.steps || data.plan;
    const cardHTML = 
      '<div class="progress-card">' +
      '  <div class="title">' + (title || t('Processing...')) + '</div>' +
      (description ? '  <div style="margin-bottom:8px;color:var(--text-muted);font-size:14px;">' + description + '</div>' : '') +
      '  <div class="progress-bar">' +
      '    <div class="progress-fill" style="width: ' + (progress || 0) + '%"></div>' +
      '  </div>' +
      '  <div class="status">' +
      '    ' + (status || t('In progress')) + ' • ' + (progress || 0) + '%' +
      '  </div>' +
      (steps && steps.length ? '  <div style="margin-top:12px;font-size:13px;color:var(--text-muted);">' + t('Steps') + ' ' + steps.map((s, i) => {
            const stepText = (typeof s === 'object' && s !== null) ? (s.step || JSON.stringify(s)) : String(s);
            const stepStatus = (typeof s === 'object' && s !== null) ? (s.status || '') : '';
            const icon = stepStatus === 'completed' ? '\u2705' : stepStatus === 'in_progress' ? '\u23F3' : '\u2B1C';
            return '<span style="margin-right:8px;">">' + icon + ' ' + (i+1) + '. ' + stepText + '</span>';
          }).join('') + '</div>' : '') +
      '</div>';
    appendMessage({ role: 'assistant', text: cardHTML, timestamp: Date.now() });
    // Also update the side panel
    if (noteContent && title) {
      const noteHTML =
        '<div class="progress-card" style="margin:8px 0;">' +
        '  <div class="title">' + title + '</div>' +
        (description ? '  <div style="margin-bottom:6px;color:var(--text-muted);font-size:12px;">' + description + '</div>' : '') +
        '  <div class="progress-bar">' +
        '    <div class="progress-fill" style="width: ' + (progress || 0) + '%"></div>' +
        '  </div>' +
        '  <div class="status" style="font-size:12px;">' +
        '    ' + (status || t('In progress')) + ' • ' + (progress || 0) + '%' +
        '  </div>' +
        (steps && steps.length ? '  <div style="margin-top:8px;font-size:12px;color:var(--text-muted);">' + t('Steps') + ' ' + steps.map((s, i) => {
            const stepText = (typeof s === 'object' && s !== null) ? (s.step || JSON.stringify(s)) : String(s);
            const stepStatus = (typeof s === 'object' && s !== null) ? (s.status || '') : '';
            const icon = stepStatus === 'completed' ? '\u2705' : stepStatus === 'in_progress' ? '\u23F3' : '\u2B1C';
            return '<div class="step-item"><span class="step-icon ' + (stepStatus === 'completed' ? 'completed' : stepStatus === 'in_progress' ? 'in_progress' : 'pending') + '">' + icon + '</span><span class="step-text">' + (i+1) + '. ' + stepText + '</span></div>';
          }).join('') + '</div>' : '') +
        '</div>';
      // Remove placeholder text if present
      const placeholder2 = noteContent.querySelector('div[style*="text-align:center"]');
      if (placeholder2 && placeholder2.textContent.includes('Progress notes will appear here')) {
        placeholder2.remove();
      }
      noteContent.insertAdjacentHTML('beforeend', noteHTML);
      // 为最后一张结构化卡片添加 Copy as Markdown 按钮
      const lastCard = noteContent.querySelector('.progress-card:last-child');
      if (lastCard) {
        const existingBtn = lastCard.querySelector('.progress-card-copy-btn');
        if (existingBtn) {
          // 创建 copy-bar 容器包裹两个按钮
          const bar2 = document.createElement('div');
          bar2.className = 'copy-bar';
          existingBtn.parentNode.insertBefore(bar2, existingBtn);
          bar2.appendChild(existingBtn);
          const mdCopyBtn = document.createElement('button');
          mdCopyBtn.className = 'progress-card-md-btn';
          mdCopyBtn.textContent = '\u{1F4DD}';
          mdCopyBtn.title = 'Copy as Markdown';
          mdCopyBtn.onclick = function() { copyProgressCardAsMarkdown(this); };
          bar2.appendChild(mdCopyBtn);
        }
      }
      noteContent.scrollTop = noteContent.scrollHeight;
    }
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
    
    // 处理助手消息中的音频附件（TTS 语音回复）
    // 直接在 bubble 中查找 <audio> 元素（msg.text 已经过 resolveMediaPaths 转换，MEDIA: 已被替换为 <audio>）
    if (msg.role === 'assistant') {
      const audioElements = bubble.querySelectorAll('audio');
      if (audioElements.length > 0) {
        // 将带有音频的消息标记为语音消息样式
        bubble.classList.add('msg-audio-bubble');
        // 使用 <audio> 原生控制按钮
        for (let i = 0; i < audioElements.length; i++) {
          const audio = audioElements[i];
          audio.controls = true;
          audio.preload = 'metadata';
          audio.style.cssText = 'max-width:100%;display:block;margin:4px 0;';
        }
      }
    }
    
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
            // Mermaid v11.x 在语法错误时会 resolve 返回含错误文本的 SVG 而非 reject，
            // 需在 .then() 中过滤，避免错误文本污染 UI
            if (svgCode && (svgCode.includes('Syntax error') || svgCode.includes('Error:'))) {
              if (typeof vscode !== 'undefined') {
                vscode.postMessage({ type: 'mermaidError', text: 'Mermaid syntax error' });
              }
              return;
            }
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
            const errMsg = String(err && err.message ? err.message : (typeof err === 'string' ? err : JSON.stringify(err)));
            // 不再在webview中创建错误div，改为发送通知给扩展宿主
            if (typeof vscode !== 'undefined') {
              vscode.postMessage({ 
                type: 'mermaidError', 
                text: errMsg.substring(0, 200)
              });
            }
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

  function renderTasks(tasks) {
    const container = document.getElementById('tasksListContent');
    if (!container) return;
    // vs10n: webview's acquireVsCodeApi() does not expose l10n; use it only if available.
    const t = (str, ...args) => {
      if (vscode && vscode.l10n && typeof vscode.l10n.t === 'function') return vscode.l10n.t(str, ...args);
      const dict = { 'No tasks': '无任务', 'No sessions': '无会话', 'Tasks': '任务', 'Sessions': '会话', 'Progress Notes': '进度备注', 'In progress': '进行中', 'Steps': '步骤', 'Processing...': '处理中...', 'Progress notes will appear here': '进度备注将显示在此处', 'Running': '运行中', 'Queued': '排队中', 'Succeeded': '已完成', 'Failed': '失败', 'Cancelled': '已取消', 'Timed out': '超时', 'Blocked': '阻塞', 'Lost': '丢失', 'Unknown': '未知', 'Agent': '智能体', 'Just now': '刚刚', '{0}m ago': '{0}分钟前', '{0}h ago': '{0}小时前', '{0}d ago': '{0}天前', 'Subagent': '子智能体', 'Cron job': '定时任务' };
      return dict[str] || str;
    };
    if (!tasks || tasks.length === 0) {
      container.innerHTML = '<div style="color:var(--text-muted);font-size:12px;text-align:center;padding:20px 10px;">' + t('No tasks') + '</div>';
      return;
    }
    const statusMap = {
      running: { color: '#4caf50', text: t('Running') },
      queued: { color: '#ff9800', text: t('Queued') },
      succeeded: { color: '#2196f3', text: t('Succeeded') },
      failed: { color: '#f44336', text: t('Failed') },
      cancelled: { color: '#9e9e9e', text: t('Cancelled') },
      timed_out: { color: '#9e9e9e', text: t('Timed out') },
      blocked: { color: '#ff5722', text: t('Blocked') },
      lost: { color: '#9e9e9e', text: t('Lost') }
    };
    function truncate(str, maxLen) {
      if (!str) return '';
      return str.length > maxLen ? str.substring(0, maxLen) + '…' : str;
    }
    function relTime(ts) {
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
    let html = '';
    for (let i = 0; i < tasks.length; i++) {
      const task = tasks[i];
      const statusInfo = statusMap[task.status] || { color: '#ff9800', text: task.status || t('Unknown') };
      // 优先级：label > task（截断50字符）> sourceId
      const displayName = task.label || truncate(task.task, 50) || task.sourceId || task.taskId;
      const timeText = relTime(task.endedAt || task.createdAt);
      html += '<div style="padding:8px 0;border-bottom:1px solid var(--border);font-size:12px;">';
      // 第一行：名称 + 相对时间
      html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">';
      html += '<span style="font-weight:500;">' + displayName + '</span>';
      html += '<span style="color:var(--text-muted);font-size:11px;">' + timeText + '</span>';
      html += '</div>';
      // 第二行：● 状态 + runtime标签 + 智能体（同一行）
      const runtimeLabel = { cli: 'CLI', subagent: t('Subagent'), cron: t('Cron job'), acp: 'ACP' }[task.runtime] || task.runtime || '';
      let metaLine = '<span style="color:' + statusInfo.color + ';font-size:11px;">● ' + statusInfo.text + '</span>';
      if (runtimeLabel) metaLine += '<span style="color:var(--text-muted);font-size:11px;margin-left:8px;">' + runtimeLabel + '</span>';
      if (task.agentId) metaLine += '<span style="color:var(--text-muted);font-size:11px;margin-left:8px;">' + t('Agent') + ': ' + task.agentId + '</span>';
      html += '<div style="display:flex;align-items:center;margin-bottom:2px;">' + metaLine + '</div>';
      // 第三行：摘要 = terminalSummary || progressSummary
      const summaryText = task.terminalSummary || task.progressSummary || '';
      if (summaryText) {
        html += '<div style="color:var(--text-secondary);font-size:11px;margin-top:2px;">' + truncate(summaryText, 120) + '</div>';
      } else if (task.task && task.task !== task.label && task.task.length > 20) {
        html += '<div style="color:var(--text-secondary);font-size:11px;margin-top:2px;">' + truncate(task.task, 100) + '</div>';
      }
      html += '</div>';
    }
    container.innerHTML = html;
  }

  // 简化设备名称：从完整字符串中提取有意义的部分
  // 格式示例："hostname:macaddress:pid" → 取冒号分隔的第一段
  // 如果太短（< 5字符），直接返回原值
  function simplifyDeviceName(name) {
    if (!name) return '';
    // 优先取冒号分隔的第一段（hostname 部分）
    const parts = name.split(':');
    const firstPart = parts[0].trim();
    // 如果第一段有意义（至少2个字符且不超过15个字符），使用它
    if (firstPart.length >= 2 && firstPart.length <= 15) return firstPart;
    // 否则使用整个字符串，但截断到20字符
    return name.length > 20 ? name.substring(0, 20) + '…' : name;
  }

  function renderSessions() {
    const t = (str, ...args) => {
      if (vscode && vscode.l10n && typeof vscode.l10n.t === 'function') return vscode.l10n.t(str, ...args);
      const dict = { 'No tasks': '无任务', 'No sessions': '无会话', 'Tasks': '任务', 'Sessions': '会话', 'Progress Notes': '进度备注', 'In progress': '进行中', 'Steps': '步骤', 'Processing...': '处理中...', 'Progress notes will appear here': '进度备注将显示在此处' };
      return dict[str] || str;
    };
    // Build a single shared HTML list so both panels stay in sync
    const buildList = (activeKey) => {
      let html = '';
      for (const session of sessions) {
        const cls = 'device-item' + (session.key === activeKey ? ' active' : '');
        const dotCls = 'device-dot' + (session.key === activeKey ? ' active' : '');
        // 提取 device-info.device-name 用于显示
        const deviceName = session['device-info']?.['device-name'] || session.displayName || session.key;
        const simplifiedName = simplifyDeviceName(deviceName);
        html += '<div class="' + cls + '" data-key="' + session.key + '" data-sid="' + (session.sessionId || '') + '" data-device-name="' + deviceName + '">';
        html += '<div class="' + dotCls + '"></div>';
        html += '<div class="device-info"><div class="device-name">' + simplifiedName + '</div><div class="device-meta">' + (session.status ? '[' + session.status + '] ' : '') + (session.agentId || session.key) + (session.sessionId ? ' · ' + session.sessionId.slice(0, 8) : '') + '</div></div>';
        if (session.totalTokens) html += '<div class="device-tokens">' + formatTokens(session.totalTokens) + '</div>';
        html += '<button class="device-delete">×</button>';
        html += '</div>';
      }
      return html;
    };
    // Update HUD panel (sessionsList)
    sessionsList.innerHTML = '';
    if (sessions.length === 0) {
      sessionsList.innerHTML = '<div style="padding:8px 12px;font-size:12px;color:var(--text-muted);">' + t('No sessions') + '</div>';
    } else {
      sessionsList.innerHTML = buildList(currentSession);
      // Attach click handlers after DOM insertion
      sessionsList.querySelectorAll('.device-item[data-key]').forEach(el => {
        el.addEventListener('click', () => {
          const key = el.getAttribute('data-key') || '';
          const deviceName = el.getAttribute('data-device-name') || '';
          const sid = el.getAttribute('data-sid') || undefined;
          currentSession = key;
          // 会话点击：创建/切换该 sessionKey 的专属 tab，绝不复用 Chat tab
          vscode.postMessage({ type: 'addChatTabFromSession', sessionKey: key, deviceName: deviceName, sessionId: sid });
          renderSessions();
        });
        el.querySelector('.device-delete')?.addEventListener('click', (e) => {
          e.stopPropagation();
          vscode.postMessage({ type: 'deleteSession', sessionKey: el.getAttribute('data-key') });
        });
      });
    }
    // Also update the progress-note-panel tab-sessions content
    const tabSessionsEl = document.getElementById('tabSessionsContent');
    if (tabSessionsEl) {
      if (sessions.length === 0) {
        tabSessionsEl.innerHTML = '<div style="color:var(--text-muted);font-size:12px;text-align:center;padding:20px 10px;">' + t('No sessions') + '</div>';
      } else {
        tabSessionsEl.innerHTML = buildList(currentSession);
        tabSessionsEl.querySelectorAll('.device-item[data-key]').forEach(el => {
          el.addEventListener('click', () => {
            const sessionKey = el.getAttribute('data-key');
            const deviceName = el.getAttribute('data-device-name') || '';
            const sid = el.getAttribute('data-sid') || undefined;
            // 点击 tabSessionsContent 中的会话时，添加新的 chat tab 并加载历史
            vscode.postMessage({
              type: 'addChatTabFromSession',
              sessionKey: sessionKey,
              deviceName: deviceName,
              sessionId: sid
            });
          });
          el.querySelector('.device-delete')?.addEventListener('click', (e) => {
            e.stopPropagation();
            vscode.postMessage({ type: 'deleteSession', sessionKey: el.getAttribute('data-key') });
          });
        });
      }
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
            sessionKey: 'agent:' + a.id + ':main',
            messages: []
          };
          tabs.push(tab);
        }
        switchToTab(tab.id);
      });
      container.appendChild(btn);
    }
  }

  function renderLocalAgentsTree() {
    // 渲染到 agents-local-panel 内部（避免清空 modelscope 面板），若不存在则回退到 tabAgentsContent
    var container = document.getElementById('agents-local-panel');
    if (!container) container = document.getElementById('tabAgentsContent');
    if (!container) return;
    container.innerHTML = '';
    // vs10n: webview l10n helper with Chinese fallback
    const t = (str, ...args) => {
      if (vscode && vscode.l10n && typeof vscode.l10n.t === 'function') return vscode.l10n.t(str, ...args);
      // webview fallback dictionary (zh-CN)
      const dict = { 'No agents': '无智能体', 'Empty directory': '空目录' };
      return dict[str] || str;
    };
    if (!agentsTreeData) {
      const emptyDiv = document.createElement('div');
      emptyDiv.style.cssText = 'color:var(--text-muted);font-size:12px;text-align:center;padding:20px 10px;';
      emptyDiv.textContent = t('No agents');
      container.appendChild(emptyDiv);
      return;
    }
    function getIcon(node) {
      if (node.type === 'directory') {
        if (node.children && node.children.length > 0) return '📂';
        return '📁';
      }
      var name = (node.name || '').toLowerCase();
      if (name.endsWith('.md') || name.endsWith('.txt')) return '📄';
      if (name.endsWith('.json') || name.endsWith('.yaml') || name.endsWith('.yml')) return '⚙️';
      if (name.endsWith('.js') || name.endsWith('.ts')) return '📜';
      return '📄';
    }
    /**
     * 启动原地重命名编辑模式
     * @param nodeInfo 节点信息 { name, path, type }
     * @param itemNameSpan 显示名称的 span 元素
     */
    function startRename(nodeInfo, itemNameSpan) {
      // 如果已经在编辑其他节点，先取消
      stopRename();

      var item = itemNameSpan.parentElement;
      if (!item || !itemNameSpan) return;

      // 保存当前节点状态
      var currentName = nodeInfo.name;
      var currentPath = nodeInfo.path;
      var currentType = nodeInfo.type;

      // 标记编辑状态
      item.classList.add('editing');

      // 创建输入框，替换名称 span
      var input = document.createElement('input');
      input.type = 'text';
      input.className = 'agents-tree-rename-input';
      input.value = currentName;

      // 获取输入框应占用的宽度（与当前名称大致匹配）
      // 将输入框插入到名称位置
      itemNameSpan.style.display = 'none';
      item.insertBefore(input, itemNameSpan.nextElementSibling || null);

      // 自动选中文本
      var selectStart = 0;
      var selectEnd = currentName.length;
      // 去掉扩展名便于只编辑文件名部分（如 test.ts -> 只选 test）
      var dotIdx = currentName.lastIndexOf('.');
      if (dotIdx > 0 && currentType === 'file') {
        selectEnd = dotIdx;
      }
      input.setSelectionRange(selectStart, selectEnd);
      input.focus();

      // 确认重命名
      function confirmRename(newName) {
        if (!newName || newName === currentName) {
          // 取消：恢复原始状态
          cancelRename();
          return;
        }
        // 发送重命名请求到 host
        if (typeof vscode !== 'undefined') {
          vscode.postMessage({ type: 'fileRename', path: currentPath, name: currentName, newName: newName });
        }
        // 本地更新显示名称（乐观更新）
        currentName = newName;
        itemNameSpan.textContent = newName;
        input.remove();
        itemNameSpan.style.display = '';
        item.classList.remove('editing');
      }

      // 取消重命名
      function cancelRename() {
        input.remove();
        itemNameSpan.style.display = '';
        item.classList.remove('editing');
      }

      // 全局取消函数（用于 stopRename）
      window._currentRenameState = { confirm: confirmRename, cancel: cancelRename };

      // Enter 确认
      input.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
          e.preventDefault();
          confirmRename(input.value.trim());
        } else if (e.key === 'Escape') {
          e.preventDefault();
          cancelRename();
        }
      });

      // 失焦时自动确认（如果输入框还在）
      input.addEventListener('blur', function() {
        // 延迟一点检查，避免与 keydown 冲突
        setTimeout(function() {
          if (document.body.contains(input) && window._currentRenameState) {
            confirmRename(input.value.trim());
          }
        }, 100);
      });
    }

    /** 停止当前的重命名编辑状态 */
    function stopRename() {
      if (window._currentRenameState) {
        window._currentRenameState.cancel();
        delete window._currentRenameState;
      }
    }

    /**
     * 在目录树中插入内联新建文件/文件夹输入框（类似 startRename 的交互方式）
     * @param dirNode 目录节点数据 { path, type, name }
     * @param kind 'file' 或 'folder'
     * @param wrapperEl 目录节点的 DOM wrapper 元素 (.agents-tree-node)
     */
    function startNewItem(dirNode, kind, wrapperEl) {
      // 如果正在重命名，先取消
      stopRename();

      // 获取 item 元素（wrapper 的直接子元素中 class 含 agents-tree-item 者）
      var itemEl = null;
      for (var i = 0; i < wrapperEl.children.length; i++) {
        if (wrapperEl.children[i].classList.contains('agents-tree-item')) {
          itemEl = wrapperEl.children[i];
          break;
        }
      }
      if (!itemEl) return;

      // 查找或创建 childrenWrapper
      var childrenWrapper = null;
      for (var j = 0; j < wrapperEl.children.length; j++) {
        if (wrapperEl.children[j].classList.contains('agents-tree-children')) {
          childrenWrapper = wrapperEl.children[j];
          break;
        }
      }

      var wasHidden = false;
      var wasCreated = false;

      if (!childrenWrapper) {
        // 空目录：创建 childrenWrapper
        childrenWrapper = document.createElement('div');
        childrenWrapper.className = 'agents-tree-children';
        wrapperEl.appendChild(childrenWrapper);
        wasCreated = true;
      } else {
        // 已有 childrenWrapper：如果隐藏则临时显示
        wasHidden = childrenWrapper.style.display === 'none';
        if (wasHidden) {
          childrenWrapper.style.display = '';
          var arrowEl = itemEl.querySelector('.agents-tree-arrow');
          if (arrowEl) arrowEl.textContent = '▾';
        }
      }

      // 计算子节点的缩进（depth + 1）
      var currentPadding = parseInt(itemEl.style.paddingLeft, 10) || 8;
      var currentDepth = Math.round((currentPadding - 8) / 16);
      var childPadding = ((currentDepth + 1) * 16 + 8) + 'px';

      // 创建临时输入行
      var tempItem = document.createElement('div');
      tempItem.className = 'agents-tree-item editing';
      tempItem.style.paddingLeft = childPadding;

      var spacer = document.createElement('span');
      spacer.className = 'agents-tree-arrow';
      spacer.innerHTML = '&nbsp;';

      var iconSpan = document.createElement('span');
      iconSpan.className = 'agents-tree-icon';
      iconSpan.textContent = kind === 'file' ? '📄' : '📁';

      var input = document.createElement('input');
      input.type = 'text';
      input.className = 'agents-tree-rename-input';
      input.placeholder = kind === 'file' ? '输入文件名...' : '输入文件夹名...';

      tempItem.appendChild(spacer);
      tempItem.appendChild(iconSpan);
      tempItem.appendChild(input);

      // 插入到 childrenWrapper 最前面
      childrenWrapper.insertBefore(tempItem, childrenWrapper.firstChild);

      input.focus();

      // 确认创建
      function confirmNew() {
        var name = input.value.trim();
        if (!name) {
          cleanup();
          return;
        }
        if (typeof vscode !== 'undefined') {
          vscode.postMessage({ type: kind === 'file' ? 'fileNew' : 'folderNew', path: dirNode.path, name: name });
        }
        cleanup();
      }

      // 清理临时行及恢复状态
      function cleanup() {
        if (tempItem.parentElement) {
          tempItem.remove();
        }
        // 如果 childrenWrapper 是新建的且现在为空，移除它
        if (wasCreated && childrenWrapper && childrenWrapper.children.length === 0) {
          childrenWrapper.remove();
        }
        // 如果原来隐藏，恢复隐藏状态
        if (wasHidden && childrenWrapper && childrenWrapper.parentElement) {
          childrenWrapper.style.display = 'none';
          var arrowEl2 = itemEl.querySelector('.agents-tree-arrow');
          if (arrowEl2) arrowEl2.textContent = '▸';
        }
        if (window._currentRenameState) {
          delete window._currentRenameState;
        }
      }

      // 全局状态（与 stopRename 协调）
      window._currentRenameState = { confirm: confirmNew, cancel: cleanup };

      // Enter 确认 / Esc 取消
      input.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
          e.preventDefault();
          confirmNew();
        } else if (e.key === 'Escape') {
          e.preventDefault();
          cleanup();
        }
      });

      // 失焦自动确认（如果临时行还在 DOM 中）
      input.addEventListener('blur', function() {
        setTimeout(function() {
          if (document.body.contains(tempItem) && window._currentRenameState) {
            confirmNew();
          }
        }, 100);
      });
    }

    function createItem(node, depth) {
      var item = document.createElement('div');
      item.className = 'agents-tree-item ' + (node.type === 'directory' ? 'folder' : 'file');
      item.style.paddingLeft = (depth * 16 + 8) + 'px';
      var iconSpan = document.createElement('span');
      iconSpan.className = 'agents-tree-icon';
      iconSpan.textContent = getIcon(node);
      var nameSpan = document.createElement('span');
      nameSpan.className = 'agents-tree-name';
      nameSpan.textContent = node.name;
      item.appendChild(iconSpan);
      item.appendChild(nameSpan);
      // Wrap each node in a wrapper div so children nest properly
      var wrapper = document.createElement('div');
      wrapper.className = 'agents-tree-node';
      wrapper.appendChild(item);
      
      // Enable drag and drop for file/folder movement
      item.draggable = true;
      
      // Drag start - store source path and add visual feedback
      item.addEventListener('dragstart', function(e) {
        e.dataTransfer.setData('text/plain', node.path);
        item.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
      });
      
      // Drag end - clean up visual feedback
      item.addEventListener('dragend', function(e) {
        item.classList.remove('dragging');
        // Clean up all possible drag hover states
        document.querySelectorAll('.agents-tree-item.drag-over').forEach(function(el) {
          el.classList.remove('drag-over');
        });
      });
      
      // Drag enter - highlight target if it's a folder
      item.addEventListener('dragenter', function(e) {
        e.preventDefault(); // Must prevent default to allow drop
        if (node.type === 'directory') {
          item.classList.add('drag-over');
        }
      });
      
      // Dragover - maintain highlight
      item.addEventListener('dragover', function(e) {
        e.preventDefault(); // Must prevent default to allow drop
        if (node.type === 'directory') {
          item.classList.add('drag-over');
        }
      });
      
      // Drag leave - remove highlight
      item.addEventListener('dragleave', function(e) {
        if (node.type === 'directory') {
          item.classList.remove('drag-over');
        }
      });
      
      // Handle drop - process the move operation
      item.addEventListener('drop', function(e) {
        e.preventDefault();
        if (node.type === 'directory') {
          item.classList.remove('drag-over');
          // Get source path
          var sourcePath = e.dataTransfer.getData('text/plain');
          if (sourcePath && sourcePath.trim() !== '') {
            // Send move message to host
            var targetDir = node.path;
            vscode.postMessage({
              type: 'fileMove',
              sourcePath: sourcePath,
              targetDir: targetDir
            });
          }
        }
      });

      // 构建统一的文件操作右键菜单
      function buildContextMenu(e) {
        e.preventDefault();
        e.stopPropagation();

        // Remove any existing context menu
        var existingMenu = document.querySelector('.agents-tree-context-menu');
        if (existingMenu) existingMenu.remove();

        var menu = document.createElement('div');
        menu.className = 'agents-tree-context-menu';
        menu.style.left = e.clientX + 'px';
        menu.style.top = e.clientY + 'px';

        // 计算粘贴目标目录：目录节点自身，文件节点取父目录
        var targetDir = node.type === 'directory' ? node.path : (function() {
          // 取父目录路径，兼容 / 和 \ 分隔符
          var lastSlashPos = Math.max(node.path.lastIndexOf('/'), node.path.lastIndexOf('\\\\'));
          return lastSlashPos > 0 ? node.path.substring(0, lastSlashPos) : node.path;
        })();

        function addMenuAction(label, type, disabled) {
          var el = document.createElement('div');
          el.className = 'agents-tree-context-menu-item' + (disabled ? ' agents-tree-context-menu-item-disabled' : '');
          el.textContent = label;
          if (!disabled) {
            el.addEventListener('click', function() {
              menu.remove();
              if (typeof vscode === 'undefined') return;
              if (type === 'fileCut') {
                vscode.postMessage({ type: 'fileCut', path: node.path });
              } else if (type === 'fileCopy') {
                vscode.postMessage({ type: 'fileCopy', path: node.path });
              } else if (type === 'filePaste') {
                vscode.postMessage({ type: 'filePaste', path: node.path, nodeType: node.type, targetDir: targetDir });
              } else if (type === 'fileDelete') {
                vscode.postMessage({ type: 'fileDelete', path: node.path, name: node.name });
              } else if (type === 'fileRename') {
                startRename({ name: node.name, path: node.path, type: node.type }, nameSpan);
              } else if (type === 'copyPath') {
                vscode.postMessage({ type: 'copyPath', path: node.path });
              } else if (type === 'fileNew') {
                startNewItem(node, 'file', wrapper);
              } else if (type === 'folderNew') {
                startNewItem(node, 'folder', wrapper);
              }
            });
          }
          menu.appendChild(el);
          return el;
        }

        // 文件操作菜单项
        addMenuAction('剪切', 'fileCut', false);
        addMenuAction('复制', 'fileCopy', false);
        addMenuAction('粘贴', 'filePaste', false);
        addMenuAction('删除', 'fileDelete', false);
        addMenuAction('重命名', 'fileRename', false);
        addMenuAction('复制路径', 'copyPath', false);

        // 目录节点：新建文件/文件夹
        if (node.type === 'directory') {
          var sep2 = document.createElement('div');
          sep2.className = 'agents-tree-context-menu-separator';
          menu.appendChild(sep2);
          addMenuAction('新建文件...', 'fileNew', false);
          addMenuAction('新建文件夹...', 'folderNew', false);
        }

        // 目录节点：追加"创建智能体"（仅当目录包含 AGENTS.md 时）
        if (node.type === 'directory' && node.hasAgentsMd) {
          var sep = document.createElement('div');
          sep.className = 'agents-tree-context-menu-separator';
          menu.appendChild(sep);
          var createAgentItem = document.createElement('div');
          createAgentItem.className = 'agents-tree-context-menu-item';
          createAgentItem.textContent = '创建智能体';
          createAgentItem.addEventListener('click', function() {
            if (typeof vscode !== 'undefined') {
              vscode.postMessage({ type: 'createAgent', path: node.path });
            }
            menu.remove();
          });
          menu.appendChild(createAgentItem);
        }

        menu.classList.add('visible');
        document.body.appendChild(menu);

        // Close menu on click outside or ESC
        function closeMenu() {
          menu.remove();
          document.removeEventListener('click', closeMenu);
          document.removeEventListener('keydown', onKeyDown);
        }
        function onKeyDown(e) {
          if (e.key === 'Escape') closeMenu();
        }
        // Use setTimeout to avoid immediate closure from the current click
        setTimeout(function() {
          document.addEventListener('click', closeMenu);
          document.addEventListener('keydown', onKeyDown);
        }, 0);
      }

      if (node.type === 'directory') {
        var hasChildren = node.children && node.children.length > 0;
        if (hasChildren) {
          // Arrow indicator: collapsed = ▸, expanded = ▾
          var arrow = document.createElement('span');
          arrow.className = 'agents-tree-arrow';
          arrow.textContent = '▸';
          item.insertBefore(arrow, iconSpan);

          var childrenWrapper = document.createElement('div');
          childrenWrapper.className = 'agents-tree-children';
          // 从持久化的展开状态恢复：默认折叠，展开路径集含该目录路径时展开
          var isExpanded = false;
          try {
            isExpanded = agentsTreeExpandedPaths && agentsTreeExpandedPaths[node.path] === true;
          } catch (e) { isExpanded = false; }
          childrenWrapper.style.display = isExpanded ? '' : 'none';
          if (isExpanded) arrow.textContent = '▾';
          node.children.forEach(function(child) {
            var childWrapper = createItem(child, depth + 1);
            childrenWrapper.appendChild(childWrapper);
          });
          wrapper.appendChild(childrenWrapper);

          item.addEventListener('click', function(e) {
            e.stopPropagation();
            var isHidden = childrenWrapper.style.display === 'none';
            childrenWrapper.style.display = isHidden ? '' : 'none';
            arrow.textContent = isHidden ? '▾' : '▸';
            // 同步展开状态到 Set 结构并持久化（localStorage + postMessage 到 host globalState）
            try {
              if (isHidden) {
                agentsTreeExpandedPaths[node.path] = true;
              } else {
                delete agentsTreeExpandedPaths[node.path];
              }
              saveAgentsTreeExpandedPaths();
            } catch (err) { /* 持久化失败不影响展开/折叠交互 */ }
          });

          // Context menu for directory nodes (统一文件操作菜单)
          item.addEventListener('contextmenu', function(e) {
            buildContextMenu(e);
          });
        } else {
          // Empty directory: no arrow, just a spacer to align with files
          var spacer = document.createElement('span');
          spacer.className = 'agents-tree-arrow';
          spacer.innerHTML = '&nbsp;';
          item.insertBefore(spacer, iconSpan);
          item.title = t('Empty directory');
          item.classList.add('empty-dir');

          // Context menu for empty directory nodes (统一文件操作菜单)
          item.addEventListener('contextmenu', function(e) {
            buildContextMenu(e);
          });
        }
      } else {
        // File: no arrow, just a spacer to align with directories
        var spacer = document.createElement('span');
        spacer.className = 'agents-tree-arrow';
        spacer.innerHTML = '&nbsp;';
        item.insertBefore(spacer, iconSpan);
        item.addEventListener('click', function(e) {
          e.stopPropagation();
          if (typeof vscode !== 'undefined') {
            vscode.postMessage({ type: 'openFile', path: node.path });
          }
        });
        
        // Add context menu for file nodes
        item.addEventListener('contextmenu', function(e) {
          e.preventDefault();
          e.stopPropagation();

          // Remove any existing context menu
          var existingMenu = document.querySelector('.agents-tree-context-menu');
          if (existingMenu) existingMenu.remove();

          var menu = document.createElement('div');
          menu.className = 'agents-tree-context-menu';
          menu.style.left = e.clientX + 'px';
          menu.style.top = e.clientY + 'px';

          // 计算粘贴目标目录：文件节点取父目录
          var targetDir = (function() {
            // 取父目录路径，兼容 / 和 \ 分隔符
            var lastSlashPos = Math.max(node.path.lastIndexOf('/'), node.path.lastIndexOf('\\\\'));
            return lastSlashPos > 0 ? node.path.substring(0, lastSlashPos) : node.path;
          })();

          function addMenuAction(label, type, disabled) {
            var el = document.createElement('div');
            el.className = 'agents-tree-context-menu-item' + (disabled ? ' agents-tree-context-menu-item-disabled' : '');
            el.textContent = label;
            if (!disabled) {
              el.addEventListener('click', function() {
                menu.remove();
                if (typeof vscode === 'undefined') return;
                if (type === 'fileCut') {
                  vscode.postMessage({ type: 'fileCut', path: node.path });
                } else if (type === 'fileCopy') {
                  vscode.postMessage({ type: 'fileCopy', path: node.path });
                } else if (type === 'filePaste') {
                  vscode.postMessage({ type: 'filePaste', path: node.path, nodeType: node.type, targetDir: targetDir });
                } else if (type === 'fileDelete') {
                  vscode.postMessage({ type: 'fileDelete', path: node.path, name: node.name });
                } else if (type === 'fileRename') {
                  startRename({ name: node.name, path: node.path, type: node.type }, nameSpan);
                } else if (type === 'copyPath') {
                  vscode.postMessage({ type: 'copyPath', path: node.path });
                } else if (type === 'fileNew') {
                  startNewItem(node, 'file', wrapper);
                } else if (type === 'folderNew') {
                  startNewItem(node, 'folder', wrapper);
                }
              });
            }
            menu.appendChild(el);
            return el;
          }

          // 文件操作菜单项
          addMenuAction('剪切', 'fileCut', false);
          addMenuAction('复制', 'fileCopy', false);
          addMenuAction('粘贴', 'filePaste', false);
          addMenuAction('删除', 'fileDelete', false);
          addMenuAction('重命名', 'fileRename', false);
          addMenuAction('复制路径', 'copyPath', false);

          menu.classList.add('visible');
          document.body.appendChild(menu);

          // Close menu on click outside or ESC
          function closeMenu() {
            menu.remove();
            document.removeEventListener('click', closeMenu);
            document.removeEventListener('keydown', onKeyDown);
          }
          function onKeyDown(e) {
            if (e.key === 'Escape') closeMenu();
          }
          // Use setTimeout to avoid immediate closure from the current click
          setTimeout(function() {
            document.addEventListener('click', closeMenu);
            document.addEventListener('keydown', onKeyDown);
          }, 0);
        });
      }
      return wrapper;
    }
    var rootWrapper = createItem(agentsTreeData, 0);
    container.appendChild(rootWrapper);
    return rootWrapper;
  }

  function renderTabs() {
    const tabBar = document.getElementById('tabsBar');
    if (!tabBar) return;
    tabBar.querySelectorAll('.tab-item').forEach(el => el.remove());
    for (const t of tabs) {
      const div = document.createElement('div');
      div.className = 'tab-item' + (t.id === activeTabId ? ' active' : '');
      div.dataset.tabId = t.id;
      // 添加 tooltip 显示会话信息
      let tooltipText = t.label;
      if (t.sessionKey) {
        const agentObj = agents.find(a => a.id === t.agentId);
        const agentName = agentObj?.name || t.agentId;
        const shortKey = t.sessionKey.length > 25 ? t.sessionKey.substring(0, 22) + '...' : t.sessionKey;
        tooltipText = agentName + ' | ' + shortKey;
      }
      div.title = tooltipText;
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
    vscode.postMessage({ type: 'switchTab', agentId: tab.agentId, sessionKey: tab.sessionKey, sessionId: tab.sessionId });
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
