import * as vscode from "vscode";
import { OpenClawGateway } from "./gateway";
import { OpenClawChatView } from "./chatView";

let gateway: OpenClawGateway;
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

  context.subscriptions.push(
    vscode.commands.registerCommand("openclaw.openChat", () => {
      chatView.show();
    }),
    vscode.commands.registerCommand("openclaw.reconnect", () => {
      gateway.disconnect();
      gateway.connect();
    }),
    vscode.commands.registerCommand("openclaw.newChat", () => {
      chatView.newChat();
    }),
    vscode.commands.registerCommand("openclaw.settings", () => {
      vscode.commands.executeCommand("workbench.action.openSettings", "openclaw");
    }),
    vscode.window.registerWebviewViewProvider("openclaw.chatView", chatView, {
      webviewOptions: { retainContextWhenHidden: true }
    })
  );

  gateway.on("connected", () => {
    chatView.updateConnectionStatus(true);
  });

  gateway.on("disconnected", () => {
    chatView.updateConnectionStatus(false);
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
}

export function deactivate() {
  gateway?.disconnect();
}
