import * as fs from "fs";
import * as path from "path";
import { log as viewLog, LOG_INFO } from "./logLevel";
import type { OutputChannel } from "vscode";

/**
 * 智能体目录树相关功能
 * - host 侧：buildAgentsTree、handleRequestAgentsTree
 * - webview 侧：renderAgentsTab
 */

/**
 * 构建目录树（host 侧，使用 Node fs API）
 * - 隐藏 dotfile（文件名以 . 开头的条目跳过）
 * - 递归深度限制由 maxDepth 控制（默认 3 层）
 * - 目录读取失败时返回空数组（不中断调用）
 */
export function buildAgentsTree(
  dir: string,
  maxDepth: number = 3,
  depth: number = 0,
  log: (msg: string) => void = (msg: string) => viewLog(msg, LOG_INFO)
): {
  name: string;
  path: string;
  type: string;
  children?: any[];
  hasAgentsMd?: boolean;
} {
  const children: any[] = [];
  // 先检查当前目录是否包含 AGENTS.md（用于返回的根节点）
  let hasAgentsMd = false;
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    hasAgentsMd = entries.some((e: any) => e.name === "AGENTS.md");
    for (const entry of entries) {
      // 跳过 dotfile（隐藏文件/目录）
      if (entry.name.startsWith(".")) continue;
      const fullPath = path.join(dir, entry.name);
      const node: any = { name: entry.name, path: fullPath };
      if (entry.isDirectory()) {
        node.type = "directory";
        // 为子目录节点计算并附加 hasAgentsMd（检查子目录自身是否包含 AGENTS.md）
        let childHasAgentsMd = false;
        try {
          const childEntries = fs.readdirSync(fullPath, { withFileTypes: true });
          childHasAgentsMd = childEntries.some((e: any) => e.name === "AGENTS.md");
        } catch (e) { /* 子目录不可读时默认为 false */ }
        node.hasAgentsMd = childHasAgentsMd;
        if (depth < maxDepth) {
          // Fix: extract children array from recursive result, not the whole tree node
          node.children = buildAgentsTree(fullPath, maxDepth, depth + 1, log).children;
        } else {
          node.children = [];
        }
      } else if (entry.isFile()) {
        node.type = "file";
        node.children = undefined;
      } else {
        // symlink / other：按文件处理，不递归
        node.type = "file";
        node.children = undefined;
      }
      children.push(node);
    }
  } catch (err: any) {
    // 目录不可读时返回空数组，不抛出
    log(`buildAgentsTree: read ${dir} failed: ${err?.message || err}`);
  }
  // 按名称排序（目录在前，文件在后，各自按字母序）
  children.sort((a, b) => {
    if (a.type === "directory" && b.type !== "directory") return -1;
    if (a.type !== "directory" && b.type === "directory") return 1;
    return a.name.localeCompare(b.name);
  });
  return { name: path.basename(dir) || dir, path: dir, type: "directory", children, hasAgentsMd };
}

/**
 * 处理 requestAgentsTree 消息：读取 agentsDir 并构建目录树，发送给 webview
 */
export function handleRequestAgentsTree(
  agentsDir: string,
  postToWebview: (msg: any) => void,
  log: (msg: string) => void
): void {
  try {
    const dir = agentsDir;
    if (!dir || !fs.existsSync(dir)) {
      postToWebview({ type: "agentsTree", tree: null, dir: dir || "" });
      return;
    }
    const tree = buildAgentsTree(dir, 3, 0, log);
    postToWebview({ type: "agentsTree", tree, dir });
  } catch (err: any) {
    log(`handleRequestAgentsTree error: ${err?.message || err}`);
    postToWebview({ type: "agentsTree", tree: null, dir: agentsDir });
  }
}

/**
 * 渲染 Agents Tab（webview 侧）
 * 此函数需要在 webview 中执行，所以作为字符串模板返回
 */
export function getAgentsTabRenderer(): string {
  return `
  function renderAgentsTab() {
    const container = document.getElementById('tabAgentsContent');
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
          childrenWrapper.style.display = 'none';
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
          });
        } else {
          // Empty directory: no arrow, just a spacer to align with files
          var spacer = document.createElement('span');
          spacer.className = 'agents-tree-arrow';
          spacer.innerHTML = '&nbsp;';
          item.insertBefore(spacer, iconSpan);
          item.title = t('Empty directory');
          item.classList.add('empty-dir');
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
      }
      return wrapper;
    }
    var rootWrapper = createItem(agentsTreeData, 0);
    container.appendChild(rootWrapper);
    return rootWrapper;
  }
  `;
}