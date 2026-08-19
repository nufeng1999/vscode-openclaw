import * as vscode from "vscode";
import { OpenClawGateway, NodeHost } from "./gateway";
import { OpenClawChatView } from "./chatView";

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
  gateway.on("connected", async () => {
    nodeApproved = false;
    chatView.updateConnectionStatus(true);
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
      vscode.window.showInformationMessage("Device identities cleared. Reconnecting...");
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
    outputChannel.appendLine(`Event: ${event} state=${payload.state || "-"} session=${payload.sessionKey || "-"}`);

    if (event === "chat") {
      chatView.handleChatEvent(payload);
    } else if (event === "stream" || event === "agent") {
      chatView.handleStreamEvent(payload);
    }
  });

  gateway.connect();
  nodeHost.connect();
}

export function deactivate() {
  gateway?.disconnect();
  nodeHost?.disconnect();
}

async function updateNodeAgentConfig(gw: OpenClawGateway, nodeDeviceId: string, channel: vscode.OutputChannel) {
  const agentId = `node:${nodeDeviceId}`;
  channel.appendLine(`updateNodeAgentConfig: ${agentId}`);

  const configResult = await gw.request("config.get", {}) as any;
  const baseHash = configResult?.hash;
  let config = configResult?.config;
  if (!config && configResult?.raw) {
    try { config = JSON.parse(configResult.raw); } catch {}
  }
  if (!config) config = configResult;

  const agentList: any[] = config?.agents?.list || [];

  // 移除所有旧的 node:* 条目
  const filtered = agentList.filter((a: any) => !a.id?.startsWith("node:"));
// 添加/更新 node 条目（直接设置 name 为 OpenClaw VSCode）
    filtered.push({
      id: agentId,
      name: "OpenClaw VSCode",
      tools: { exec: { host: "node", node: "OpenClaw VSCode", notifyOnExit: false } }
    });

  const patch = {
    raw: JSON.stringify({ agents: { list: filtered } }),
    baseHash: baseHash || undefined,
    replacePaths: ["agents.list"]
  };
  channel.appendLine(`config.patch agents.list (count=${filtered.length})...`);
  const result = await gw.request("config.patch", patch, 90000) as any;
  channel.appendLine(`config.patch result: ok=${result?.ok}`);
}

async function updateNodeAgentName(gw: OpenClawGateway, nodeDeviceId: string, displayName: string, channel: vscode.OutputChannel) {
  const agentId = `node:${nodeDeviceId}`;
  channel.appendLine(`updateNodeAgentName: ${agentId} -> ${displayName}`);

  const configResult = await gw.request("config.get", {}) as any;
  const baseHash = configResult?.hash;
  let config = configResult?.config;
  if (!config && configResult?.raw) {
    try { config = JSON.parse(configResult.raw); } catch {}
  }
  if (!config) config = configResult;

  const agentList: any[] = config?.agents?.list || [];

  let changed = false;
  const updated = agentList.map((agent: any) => {
    if (agent?.id === agentId && agent.name !== displayName) {
      changed = true;
      return { ...agent, name: displayName };
    }
    return agent;
  });

  if (!changed) {
    channel.appendLine(`updateNodeAgentName: no change needed`);
    return;
  }

  const patch = {
    raw: JSON.stringify({ agents: { list: updated } }),
    baseHash: baseHash || undefined,
    replacePaths: ["agents.list"]
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
