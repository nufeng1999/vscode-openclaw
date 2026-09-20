import * as vscode from "vscode";
import { OpenClawGateway, NodeHost } from "./gateway";
import { OpenClawChatView } from "./chatView";
import { setLogLevel, getLogLevel } from "./logLevel";
import * as https from "https";
import * as http from "http";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import AdmZip from "adm-zip";

let gateway: OpenClawGateway;
let nodeHost: NodeHost;
let chatView: OpenClawChatView;
let outputChannel: vscode.OutputChannel;

export async function activate(context: vscode.ExtensionContext) {
  outputChannel = vscode.window.createOutputChannel("OpenClaw");
  outputChannel.appendLine("Extension activating...");
  outputChannel.show(true);

  const config = vscode.workspace.getConfiguration("openclaw");
  const url = config.get<string>("gatewayUrl", "ws://127.0.0.1:18789");
  const token = config.get<string>("token", "");

  gateway = new OpenClawGateway(url, token, outputChannel);
  chatView = new OpenClawChatView(context, gateway, outputChannel);
  chatView.onDownloadModelscopeAgent = async (agentId: string, destType: string) => {
    await _handleDownloadModelscopeAgent({
      postToWebview: (msg: any) => chatView.postToWebview(msg),
      agentsDir: chatView.agentsDirectory,
      log: (m: string) => outputChannel.appendLine(m)
    }, agentId, destType as 'local' | 'select');
  };

  await gateway.initDeviceIdentity({
    get(key: string) {
      return context.globalState.get(key);
    },
    update(key: string, value: any) {
      context.globalState.update(key, value);
    }
  });

  // NodeHost: 第二个连接 (role=node)，处理 node.invoke.request
  nodeHost = new NodeHost(url, token, outputChannel);
  await nodeHost.initDeviceIdentity({
    get(key: string) {
      return context.globalState.get(key);
    },
    update(key: string, value: any) {
      context.globalState.update(key, value);
    }
  });

  // 更新 agent 配置 + 自动审批节点配对
  const nodeDeviceId = nodeHost.getDeviceId();
  let nodeApproved = false;

  async function doApproveAndReconnect() {
    if (nodeApproved) return;
    outputChannel.appendLine(`doApproveAndReconnect: nodeDeviceId=${nodeDeviceId?.substring(0, 16)}...`);
    try {
      const result = await approveNodePairing(gateway, nodeDeviceId || "", outputChannel);
      if (result.approved || result.alreadyPaired) {
        nodeApproved = true;
        // 更新 agent name 为配对信息里的 displayName
        if (result.displayName) {
          await updateNodeAgentName(gateway, nodeDeviceId || "", result.displayName, outputChannel);
        }
        if (result.approved) {
          outputChannel.appendLine("Pairing approved! Reconnecting node in 2s...");
          await sleep(2000);
          nodeHost.disconnect();
          await sleep(500);
          nodeHost.connect();
        } else {
          outputChannel.appendLine("Already paired, no reconnect needed");
        }
      }
    } catch (err: any) {
      outputChannel.appendLine(`WARNING: approveNodePairing failed: ${err.message}`);
    }
  }

  // gateway 连接后：更新 agent 配置
  gateway.on("connected", async (result: any) => {
    nodeApproved = false;
    // 从 connect RPC 响应（hello-ok payload）中提取服务器版本号（防御性提取）
    const version = result?.server?.version ?? result?.payload?.server?.version ?? '';
    chatView.updateConnectionStatus(true, version);
    if (nodeDeviceId) {
      try {
        await updateNodeAgentConfig(gateway, nodeDeviceId, outputChannel);
      } catch (err: any) {
        outputChannel.appendLine(`WARNING: updateNodeAgentConfig failed: ${err.message}`);
      }
      // 延迟 3 秒等 node 也连上并创建配对请求
      setTimeout(() => doApproveAndReconnect(), 3000);
    }
  });

  // 监听 node.pair.requested 事件（node 连上后 gateway 会发此事件）
  gateway.on("node.pair.requested", (msg: any) => {
    outputChannel.appendLine(`[EVENT] node.pair.requested: ${JSON.stringify(msg).substring(0, 300)}`);
    // 收到事件后立即审批
    setTimeout(() => doApproveAndReconnect(), 500);
  });

  // node 连接成功后也触发审批（双保险）
  nodeHost.on("connected", () => {
    outputChannel.appendLine("[NodeHost] connected, checking pairing in 3s...");
    setTimeout(() => doApproveAndReconnect(), 3000);
  });

  context.subscriptions.push(
    vscode.commands.registerCommand("openclaw.openChat", () => {
      chatView.show();
    }),
    vscode.commands.registerCommand("openclaw.reconnect", () => {
      gateway.disconnect();
      nodeHost.disconnect();
      gateway.connect();
      nodeHost.connect();
    }),
    vscode.commands.registerCommand("openclaw.approvePairing", () => {
      doApproveAndReconnect();
    }),
    vscode.commands.registerCommand("openclaw.newChat", () => {
      chatView.newChat();
    }),
    vscode.commands.registerCommand("openclaw.settings", () => {
      vscode.commands.executeCommand("workbench.action.openSettings", "openclaw");
    }),
    vscode.commands.registerCommand("openclaw.resetDevice", () => {
      gateway.resetDeviceIdentity({
        get(key: string) { return context.globalState.get(key); },
        update(key: string, value: any) { context.globalState.update(key, value); }
      });
      // 也清除 node 设备身份
      context.globalState.update("nodeDeviceIdentityV2", undefined);
      gateway.disconnect();
      nodeHost.disconnect();
      vscode.window.showInformationMessage(vscode.l10n.t("Device identities cleared. Reconnecting..."));
      gateway.connect();
      nodeHost.connect();
    }),
    vscode.window.registerWebviewViewProvider("openclaw.chatView", chatView, {
      webviewOptions: { retainContextWhenHidden: true }
    }),
    vscode.commands.registerCommand("openclaw.switchWorkdir", (uri: vscode.Uri) => {
      const folderPath = uri.fsPath;
      chatView.sendText(`Switch the working directory to ${folderPath}`);
      chatView.show();
    }),
    vscode.commands.registerCommand("openclaw.analyzeProject", (uri: vscode.Uri) => {
      const folderPath = uri.fsPath;
      chatView.sendText(vscode.l10n.t('Analyze the code structure, file organization and tech stack of the project at {0}', folderPath));
      chatView.show();
    }),
    vscode.commands.registerCommand("openclaw.setInputText", (text: string) => {
      chatView.setInputText(text);
    }),
    vscode.commands.registerCommand("openclaw.setLogLevel", async () => {
      const levels = ["None", "Error", "Warn", "Info", "Debug", "Trace"];
      const currentLevel = levels[getLogLevel()] || "Info";
      const selected = await vscode.window.showQuickPick(levels, {
        placeHolder: vscode.l10n.t("Select log level (current: {0})", currentLevel),
        title: vscode.l10n.t("OpenClaw: Set Log Level")
      });
      if (selected) {
        const levelMap: Record<string, number> = {
          "None": 0, "Error": 1, "Warn": 2, "Info": 3, "Debug": 4, "Trace": 5
        };
        setLogLevel(levelMap[selected]);
        await config.update("logLevel", selected, vscode.ConfigurationTarget.Global);
        vscode.window.showInformationMessage(vscode.l10n.t("Log level changed to: {0}", selected));
      }
    })
  );

  gateway.on("disconnected", () => {
    chatView.updateConnectionStatus(false);
  });

  // Handle node notifications
  gateway.on("notification", (notif: { title: string; message: string }) => {
    outputChannel.appendLine(`NOTIFY: ${notif.title} - ${notif.message}`);
    vscode.window.showInformationMessage(`${notif.title}: ${notif.message}`);
  });

  // Handle gateway events (matching Obsidian plugin's onEvent handler)
  gateway.on("event", (msg: any) => {
    const event = msg.event;
    const payload = msg.payload || {};

    // Skip heartbeat/tick/health events from logging
    if (event === "heartbeat" || event === "tick" || event === "health") {
      return;
    }

    outputChannel.appendLine(`Event: ${event} state=${payload.state || "-"} session=${payload.sessionKey || "-"}`);

    if (event === "chat") {
      chatView.handleChatEvent(payload);
    } else if (event === "stream" || event === "agent") {
      chatView.handleStreamEvent(payload);
    } else if (event === "progressCard.changed") {
      // 收到 progressCard.changed 事件后，调用 API 获取完整卡片内容
      const changedSessionKey = payload?.sessionKey || '';
      outputChannel.appendLine(`progressCard.changed: sessionKey=${changedSessionKey} revision=${payload?.revision ?? 'null'}`);
      // 延迟一小段时间确保 Gateway 已完成写入
      setTimeout(async () => {
        try {
          const result = await gateway.request('progressCard.get', {
            sessionKey: changedSessionKey
          }) as any;
          const card = result?.card;
          if (card) {
            outputChannel.appendLine(`progressCard.get: got card (revision=${card.revision}, markdown=${(card.markdown || '').substring(0, 80)}...)`);
            chatView.handleProgressCardUpdate(card);
          } else {
            outputChannel.appendLine('progressCard.get: card is null (cleared)');
            chatView.handleProgressCardUpdate(null);
          }
        } catch (err: any) {
          outputChannel.appendLine(`progressCard.get failed: ${err.message}`);
        }
      }, 100);
    }
  });

  // 从配置读取初始日志等级
  const logLevelConfig = config.get<string>("logLevel", "Info");
  const logLevelMap: Record<string, number> = {
    "None": 0, "Error": 1, "Warn": 2, "Info": 3, "Debug": 4, "Trace": 5
  };
  setLogLevel(logLevelMap[logLevelConfig] ?? 3);
  outputChannel.appendLine(`Log level set to: ${logLevelConfig} (${getLogLevel()})`);

  gateway.connect();
  nodeHost.connect();
}

async function _handleDownloadModelscopeAgent(
  ctx: {
    postToWebview: (msg: any) => void;
    agentsDir: string;
    log: (msg: string) => void;
  },
  agentId: string,
  destType: 'local' | 'select'
): Promise<void> {
  try {
    ctx.log(`[MS-Download] Starting download for agent: ${agentId}, destType: ${destType}`);

    // Build download URL
    const downloadUrl = `https://modelscope.cn/agents/${agentId}/archive/zip/master`;
    ctx.log(`[MS-Download] Download URL: ${downloadUrl}`);

    // Determine target directory
    let targetDir: string;
    if (destType === 'local') {
      // Use openclaw.agentsDir configuration
      targetDir = ctx.agentsDir;
      ctx.log(`[MS-Download] Using configured agentsDir: ${targetDir}`);
    } else {
      // "下载到...": Open directory selection dialog
      const selectedUri = await vscode.window.showOpenDialog({
        canSelectFiles: false,
        canSelectFolders: true,
        canSelectMany: false,
        openLabel: 'Download here'
      });
      if (!selectedUri || selectedUri.length === 0) {
        ctx.log(`[MS-Download] User cancelled directory selection`);
        ctx.postToWebview({ type: 'notify', text: 'Download cancelled' });
        return;
      }
      targetDir = selectedUri[0].fsPath;
      ctx.log(`[MS-Download] User selected directory: ${targetDir}`);
    }

    // Ensure target directory exists
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
      ctx.log(`[MS-Download] Created target directory: ${targetDir}`);
    }

    // Create agent-specific subdirectory
    const agentDirName = agentId.replace(/[\/\\:*?"<>|]/g, '_'); // Sanitize for filesystem
    const agentTargetDir = path.join(targetDir, agentDirName);
    ctx.log(`[MS-Download] Agent target directory: ${agentTargetDir}`);

    // Check if directory already exists
    const dirExists = fs.existsSync(agentTargetDir);
    if (dirExists && destType === 'local') {
      // Ask for overwrite confirmation
      const overwrite = await vscode.window.showWarningMessage(
        `Directory "${agentDirName}" already exists. Overwrite?`,
        { modal: true },
        'Yes', 'No'
      );

      if (overwrite !== 'Yes') {
        ctx.log(`[MS-Download] User cancelled overwrite`);
        ctx.postToWebview({ type: 'notify', text: 'Download cancelled' });
        return;
      }

      // Remove existing directory
      fs.rmSync(agentTargetDir, { recursive: true, force: true });
      ctx.log(`[MS-Download] Removed existing directory`);
    }

    // Download ZIP file
    ctx.log(`[MS-Download] Downloading ZIP...`);
    const zipBuffer = await downloadZip(downloadUrl);
    ctx.log(`[MS-Download] Download complete, size: ${zipBuffer.length} bytes`);

    // Extract ZIP
    ctx.log(`[MS-Download] Extracting ZIP...`);
    const zip = new AdmZip(zipBuffer);
    zip.extractAllTo(agentTargetDir, true /* overwrite */);
    ctx.log(`[MS-Download] Extraction complete to: ${agentTargetDir}`);

    // Show success message
    const relativePath = path.relative(os.homedir(), agentTargetDir);
    const displayPath = relativePath.startsWith('..') ? agentTargetDir : `~/${relativePath}`;
    ctx.log(`[MS-Download] Successfully downloaded to: ${displayPath}`);
    ctx.postToWebview({
      type: 'notify',
      text: `Successfully downloaded to ${displayPath}`
    });
    // VS Code 通知：下载成功
    vscode.window.showInformationMessage(`ModelScope 智能体已下载到: ${displayPath}`);

  } catch (error: any) {
    ctx.log(`[MS-Download] Error: ${error.message}`);
    ctx.postToWebview({
      type: 'notify',
      text: `Download failed: ${error.message}`
    });
    // VS Code 通知：下载失败
    vscode.window.showErrorMessage(`ModelScope 智能体下载失败: ${error.message}`);
  }
}

function downloadZip(url: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? https : http;
    const req = lib.get(url, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode}!`));
        res.resume();
        return;
      }

      const chunks: Buffer[] = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => {
        resolve(Buffer.concat(chunks));
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.setTimeout(30000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

// Export for use in webviewHandler.ts
export { _handleDownloadModelscopeAgent };

export function deactivate() {
  gateway?.disconnect();
  nodeHost?.disconnect();
}

async function updateNodeAgentConfig(gw: OpenClawGateway, nodeDeviceId: string, channel: vscode.OutputChannel) {
  const agentId = nodeDeviceId;
  channel.appendLine(`updateNodeAgentConfig: ${agentId}`);

  const configResult = await gw.request("config.get", {}) as any;
  const baseHash = configResult?.hash;
  let config = configResult?.config;
  if (!config && configResult?.raw) {
    try { config = JSON.parse(configResult.raw); } catch {}
  }
  if (!config) config = configResult;

  const agentEntries: Record<string, any> = config?.agents?.entries || {};

  // 移除所有旧的 node-* 条目
  for (const key of Object.keys(agentEntries)) {
    if (key.startsWith("node-")) delete agentEntries[key];
  }
  // 添加 node 条目（直接设置 name 为 OpenClaw VSCode）
  agentEntries[agentId] = {
    name: "OpenClaw VSCode",
    tools: { exec: { host: "node", node: "OpenClaw VSCode", notifyOnExit: false } }
  };

  const patch = {
    raw: JSON.stringify({ agents: { entries: agentEntries } }),
    baseHash: baseHash || undefined,
    replacePaths: ["agents.entries"]
  };
  channel.appendLine(`config.patch agents.entries (count=${Object.keys(agentEntries).length})...`);
  const result = await gw.request("config.patch", patch, 90000) as any;
  channel.appendLine(`config.patch result: ok=${result?.ok}`);
}

async function updateNodeAgentName(gw: OpenClawGateway, nodeDeviceId: string, displayName: string, channel: vscode.OutputChannel) {
  const agentId = nodeDeviceId;
  channel.appendLine(`updateNodeAgentName: ${agentId} -> ${displayName}`);

  const configResult = await gw.request("config.get", {}) as any;
  const baseHash = configResult?.hash;
  let config = configResult?.config;
  if (!config && configResult?.raw) {
    try { config = JSON.parse(configResult.raw); } catch {}
  }
  if (!config) config = configResult;

  const agentEntries: Record<string, any> = config?.agents?.entries || {};

  const existing = agentEntries[agentId];
  if (!existing || existing.name === displayName) {
    channel.appendLine(`updateNodeAgentName: no change needed`);
    return;
  }
  existing.name = displayName;

  const patch = {
    raw: JSON.stringify({ agents: { entries: agentEntries } }),
    baseHash: baseHash || undefined,
    replacePaths: ["agents.entries"]
  };
  const result = await gw.request("config.patch", patch, 90000) as any;
  channel.appendLine(`updateNodeAgentName result: ok=${result?.ok}`);
}

async function approveNodePairing(gw: OpenClawGateway, nodeDeviceId: string, channel: vscode.OutputChannel): Promise<{ approved: boolean; alreadyPaired: boolean; displayName?: string }> {
  channel.appendLine(`approveNodePairing: looking for pending pairs...`);
  let listResult: any;
  try {
    listResult = await gw.request("node.pair.list", {});
  } catch (err: any) {
    channel.appendLine(`node.pair.list failed: ${err.message}`);
    return { approved: false, alreadyPaired: false };
  }
  channel.appendLine(`node.pair.list: ${JSON.stringify(listResult).substring(0, 800)}`);

  let approved = false;
  let alreadyPaired = false;
  let displayName: string | undefined;

  // 处理不同的响应格式
  const allEntries: any[] = [];
  if (Array.isArray(listResult)) {
    allEntries.push(...listResult);
  } else if (listResult) {
    // 可能是 { pending: [...], paired: [...] } 或直接是数组
    const pending = listResult.pending || listResult.requests || [];
    const paired = listResult.paired || listResult.nodes || [];
    if (Array.isArray(pending)) allEntries.push(...pending);
    if (Array.isArray(paired)) allEntries.push(...paired);
    // 也检查顶层数组
    for (const key of Object.keys(listResult)) {
      if (Array.isArray(listResult[key])) {
        for (const item of listResult[key]) {
          if (item && typeof item === "object") {
            allEntries.push(item);
          }
        }
      }
    }
  }

  channel.appendLine(`Total entries found: ${allEntries.length}`);

  // 先检查已配对列表，获取 displayName
  for (const entry of allEntries) {
    if (!entry || typeof entry !== "object") continue;
    const entryNodeId = entry.nodeId || entry.deviceId || entry.device?.id || "";
    if (entryNodeId === nodeDeviceId) {
      if (entry.displayName) {
        displayName = entry.displayName;
        channel.appendLine(`Found displayName for paired node: ${displayName}`);
      }
    }
  }

  for (const entry of allEntries) {
    if (!entry || typeof entry !== "object") continue;
    const entryNodeId = entry.nodeId || entry.deviceId || entry.device?.id || "";
    const requestId = entry.requestId || entry.id || "";
    const status = entry.status || "";
    const token = entry.token || "";

    channel.appendLine(`  entry: id=${requestId} nodeId=${String(entryNodeId).substring(0, 16)}... status=${status} hasToken=${!!token}`);

    // 审批 pending 的配对请求
    if (status === "pending" || status === "awaiting_approval" || (!status && requestId)) {
      channel.appendLine(`Approving pairing: ${requestId} for node ${entryNodeId.substring(0, 16)}...`);
      try {
        const approveResult = await gw.request("node.pair.approve", {
          requestId: requestId
        }, 30000) as any;
        channel.appendLine(`node.pair.approve result: ${JSON.stringify(approveResult).substring(0, 500)}`);

        // 如果审批返回了 token，保存它
        const newToken = approveResult?.token || approveResult?.pairedNode?.token || "";
        if (newToken) {
          channel.appendLine(`Got pairing token: ${newToken.substring(0, 16)}...`);
          nodeHost.setToken(newToken);
        }
        // 如果审批结果里有 displayName，更新
        if (approveResult?.displayName) {
          displayName = approveResult.displayName;
        }
        approved = true;
      } catch (err: any) {
        channel.appendLine(`node.pair.approve failed: ${err.message}`);
      }
    }
  }

  if (!approved) {
    // 检查是否已经配对
    for (const entry of allEntries) {
      if (!entry || typeof entry !== "object") continue;
      const entryNodeId = entry.nodeId || entry.deviceId || entry.device?.id || "";
      if (entryNodeId === nodeDeviceId) {
        alreadyPaired = true;
        channel.appendLine(`Node ${nodeDeviceId.substring(0, 16)}... already paired`);
        break;
      }
    }
  }

  return { approved, alreadyPaired, displayName };
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
