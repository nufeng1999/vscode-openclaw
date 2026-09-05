# OpenClaw Client for VS Code

AI chat sidebar for the OpenClaw gateway and VS Code node. The extension connects to an [OpenClaw](https://github.com/openclaw) gateway over WebSocket, providing real-time AI chat, multi-agent and session management, workspace context, media display, Mermaid diagram rendering, and local tool execution from inside VS Code.

![OpenClaw Client](https://github.com/nufeng1999/imgs/blob/main/img/HikkX9mXOB.png?raw=true)

## Features

- **Agent HUD**: View connection status, model settings, server information, reliability settings, and sessions.
- **Reconnect**: Use the HUD button or the `OpenClaw: Reconnect` command when the gateway connection is lost.
- **Multi-agent chat**: Switch between agents. Each agent has its own chat tab and session pool.
- **Session management**: Create, switch, and delete sessions independently for each agent, with token usage shown in the HUD.
- **Supervisor mode**: Periodically inspect the current agent output with a configurable supervisor, reminder, inquiry method, and stop signal.
- **Streaming responses**: Render assistant Markdown as responses arrive, with a busy indicator for processing and queued messages.
- **Media display**: Display images and videos embedded in gateway replies as base64 data URLs.
- **Mermaid diagrams**: Render fenced Mermaid blocks as SVG, switch between Image and Source views, copy source or PNG, and export PNG files.
- **Workspace context**: Search workspace files with `@`, browse directories, and attach single-line or line-range references.
- **Attachments**: Add files by picker, paste, or drag and drop. Each file is limited to 10 MB. Files are labeled with a type tag such as `[IMG]`, `[VID]`, `[AUD]`, `[TXT]`, `[PDF]`, `[ZIP]`, or `[FILE]`.
- **Paired node tools**: Expose `exec`, `read`, `write`, and `edit` to the agent through the paired VS Code node.
- **Command approval**: Approve local commands once, always for a working directory, or deny them.
- **Device identity**: Authenticate with an Ed25519 device identity compatible with OpenClaw pairing.
- **Subagent activity**: Show active subagent labels and waiting-for-subagent status in chat.
- **Internationalization**: Localize extension UI strings through the VS Code localization system.

## Installation

### VS Code Marketplace

Search for **nufeng1999** in the VS Code Extensions view, or open the [Marketplace page](https://marketplace.visualstudio.com/items?itemName=CQCBIT.nufeng-OpenClaw-vscode&ssr=false#overview).

### From source

```bash
git clone https://github.com/nufeng/openclaw-vscode.git
cd openclaw-vscode
npm install
npm run build
```

Install the resulting extension folder in `~/.vscode/extensions/`.

## Usage

1. Start the OpenClaw gateway.
2. Open **OpenClaw** from the VS Code Activity Bar.
3. The extension connects to the gateway as an operator and node.
4. Select **Chat** in the tab bar and send a message.
5. Use the HUD agent buttons to switch agents, or use **New Chat** to start a session.

### HUD and chat

Use the grid button in the tab bar to toggle the HUD. It contains the current agent card, connection state, reconnect control, agent switcher, settings, and sessions. In the chat panel, press Enter to send and Shift+Enter for a newline. Use **Stop** to abort a running response.

The attachment button opens a file picker. Files can also be pasted with `Ctrl+V` or dropped onto the input area. Attachments show a type label, name, and size; remove a file with its `x` control. Files over 10 MB are skipped. While a response is streaming, the attachment button is hidden until processing completes.

### Slash commands

Type `/` to open the command menu. It contains `/stop` and `/new` under SESSION, `/models` and `/status` under MODEL & STATUS, and `/help`, `/reset`, and `/compact` under HELP. Use the arrow keys to navigate, Enter to select, and Escape to close the menu.

### Workspace context

Type `@` in the input to search workspace files and folders. Use `@folder/` to browse a directory. A selected file is inserted as `@path`. Add `#L123` for one line or `#L100-#L200` for a line range; the reference is sent as structured context to the gateway.

### Supervisor mode

Enable supervision with the checkbox in the HUD. The supervisor checks the current agent at the configured interval. If output is unchanged, the optional reminder is sent, then the supervisor is asked whether work should stop. Supervision stops when configured output content or the supervisor reply matches its stop signal, or when supervision is disabled.

### Workspace commands

Right-click a folder in Explorer and select **Switch working directory to this folder** to make it the working directory, or select **Analyze this project** to ask the agent to analyze the folder's code structure, file organization, and technology stack.

## Commands

| Command | Description |
| --- | --- |
| `OpenClaw: Open Chat` | Open the chat sidebar. |
| `OpenClaw: Reconnect` | Reconnect to the gateway. |
| `OpenClaw: Approve Node Pairing` | Trigger node pairing approval. |
| `OpenClaw: New Chat` | Start a new chat session. |
| `OpenClaw: Settings` | Open extension settings. |
| `OpenClaw: Reset Device Identity` | Generate a new device identity and re-pair. |
| `OpenClaw: Set Input Text` | Set the chat input text programmatically. |
| `Switch working directory to this folder` | Set the selected folder as the working directory. |
| `Analyze this project` | Analyze the selected folder. |

## Configuration

Open VS Code Settings and search for `openclaw`.

### General settings

| Setting | Default | Description |
| --- | --- | --- |
| `openclaw.gatewayUrl` | `ws://127.0.0.1:18789` | WebSocket URL of the OpenClaw gateway. |
| `openclaw.token` | Empty | Gateway authentication token. |
| `openclaw.sessionKey` | `OpenClaw VSCode` | Session key used by the extension. |
| `openclaw.agentId` | `OpenClaw VSCode` | Default agent ID or node display name. |

### Supervisor settings

| Setting | Default | Description |
| --- | --- | --- |
| `openclaw.supervisor.intervalMinutes` | `5` | Minutes between checks. Set to `0` to disable supervision. |
| `openclaw.supervisor.stopSignalContent` | Empty | Pipe-separated output matches, such as `done\|finished\|completed`, that stop supervision. |
| `openclaw.supervisor.reminderMessage` | Empty | Message sent to the current agent when output is unchanged. Empty means no reminder. |
| `openclaw.supervisor.agentId` | Empty | Agent ID used for periodic supervision, such as `manager` or `main`. |
| `openclaw.supervisor.stopInquiryMethod` | Empty | Prefix for the supervisor inquiry, such as `Judge` or `Evaluate`. |
| `openclaw.supervisor.stopSignalReply` | `yes` | Case-insensitive supervisor reply that stops supervision. |

Example:

```json
{
  "openclaw.gatewayUrl": "ws://127.0.0.1:18789",
  "openclaw.agentId": "main",
  "openclaw.supervisor.agentId": "manager",
  "openclaw.supervisor.intervalMinutes": 5,
  "openclaw.supervisor.reminderMessage": "Please continue your work.",
  "openclaw.supervisor.stopSignalContent": "done|finished|completed",
  "openclaw.supervisor.stopInquiryMethod": "Judge",
  "openclaw.supervisor.stopSignalReply": "yes"
}
```

## How It Works

The extension uses the gateway as both an operator client and a paired node. The operator connection powers chat, agents, sessions, and model state. The node connection authorizes local tools such as `exec`, `read`, `write`, and `edit`.

On the first connection, the extension creates an Ed25519 device identity and stores it in VS Code global storage as `nodeDeviceIdentityV2`. The public identity is used to sign the gateway challenge. If pairing is required, approve the latest device with `openclaw devices approve --latest` or use **OpenClaw: Approve Node Pairing**. **OpenClaw: Reset Device Identity** clears the stored identity so the device can pair again.

After a successful connection, the extension loads agents, sessions, and model defaults. Chat messages use the `chat.send` RPC; streamed `chat` events update the UI from delta to final state. Agent-run failures are retried by sending `Continue`, up to three times. Disconnections trigger automatic reconnect with exponential backoff, and the HUD also provides manual reconnect.

## Troubleshooting

### Gateway connection fails

- Confirm that the gateway is running and that `openclaw.gatewayUrl` is the correct WebSocket URL.
- Check the **OpenClaw** channel in the VS Code Output panel.
- Check firewall and network access to the gateway port.
- Use **OpenClaw: Reconnect** or the HUD reconnect button after correcting the configuration.

### Node pairing fails

- Run `openclaw devices approve --latest` on the gateway host.
- Use **OpenClaw: Approve Node Pairing** and inspect pairing messages in the Output panel.
- Use **OpenClaw: Reset Device Identity**, then reconnect and approve the new device.

### Mermaid diagrams do not render

- Ensure the response contains a fenced block beginning with ` ```mermaid `.
- Wait for streaming to finish; diagrams render when the response completes.
- Check the Output panel for rendering errors, and use Source view to inspect the generated Mermaid text.

### Attachments fail

- Confirm that every file is below the 10 MB per-file limit.
- Check the file picker, paste, or drop operation and inspect the Output panel.
- Confirm that the gateway accepts the attachment payload and that the connection remains active.

### Supervisor does not respond

- Confirm that `openclaw.supervisor.intervalMinutes` is greater than `0` and that the supervisor agent exists.
- Check the supervisor agent ID, stop inquiry method, and stop signal reply.
- Configure `reminderMessage` if unchanged output should trigger a reminder.
- Review supervisor entries in the OpenClaw Output channel.

### Agent retries are exhausted

When an agent-run failure is reported, the extension sends `Continue` up to three times. If all retries fail, the error is displayed in chat. Inspect the gateway and OpenClaw Output logs for the original failure.

## Development

```bash
npm install
npm run build
npm run watch
```

`npm run build` runs the repository's esbuild entry point once. `npm run watch` rebuilds when source files change. Reload the VS Code window or extension after rebuilding to test the result.

For diagnostics, inspect the **OpenClaw** output channel. Connection and protocol code is in `src/gateway.ts`; chat and webview behavior is in `src/chatView.ts`; extension commands and activation are in `src/extension.ts`.

## License

MIT
