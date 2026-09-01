# OpenClaw Client for VSCode

AI chat sidebar and node host for [OpenClaw](https://github.com/openclaw) gateway. Connects to your OpenClaw instance via WebSocket and provides a native chat interface directly in VSCode.

![](https://github.com/nufeng1999/imgs/blob/main/img/HikkX9mXOB.png?raw=true)

## Description

This extension integrates the OpenClaw AI agent system into VSCode, providing a real-time chat sidebar, multi-agent support, file context, Mermaid diagram rendering, and local tool execution capabilities — all connected to your local OpenClaw gateway.

## Features

- **Agent HUD** — Connection status, model settings, session management
- **Reconnect Button** — One-click reconnect button in the HUD panel that appears automatically when the gateway connection is lost (hidden while connected)
- **Multi-Agent Support** — Switch between agents (main, clerk, coder2, designer, manager, etc.) with one click; each agent gets its own chat tab and independent session pool
- **Session Management** — Each agent maintains multiple sessions; create, switch, and delete sessions independently per agent
- **Supervisor Mode** — Configure a supervisor agent to periodically check your current agent's output with customizable intervals, reminder messages, and stop signals
- **Streaming Responses** — Real-time markdown rendering of AI responses
- **Image & Video Support** — Automatically display images and videos embedded in gateway replies (base64-encoded data URLs)
- **Mermaid Diagram Support** — AI replies containing Mermaid code blocks are automatically rendered as SVG diagrams; supports flowchart, sequenceDiagram, classDiagram, stateDiagram, erDiagram, gantt, pie, and more
- **Mermaid View Toggle** — Switch between rendered **Image** view and **Source** view with a dedicated toggle button on each diagram
- **Mermaid Copy & Export** — Copy a diagram's source code or image (PNG to clipboard), and export it as a local PNG file via a save dialog
- **Full-Width Diagrams** — Mermaid charts automatically expand to the full chat panel width
- **Streaming Mermaid Rendering** — Diagrams are automatically rendered once a streaming response completes; no manual history refresh needed
- **Robust Image Copy** — Uses `createImageBitmap` with a `DOMParser`/`foreignObject` CSP fallback to reliably copy diagram images despite `blob:` restrictions
- **Auto-Retry on Agent Failure** — When the gateway returns an agent run failure error, the extension automatically sends "Continue" up to 3 times to resume the conversation
- **Busy Status Indicator** — UI shows "Processing..." or "Processing (N queued)" while messages are being processed or queued by the gateway
- **Slash Commands with Separator** — Type `/` to see categorized commands (`/stop`, `/new`, `/models`, `/help`, etc.); commands are grouped into SESSION / MODEL & STATUS / HELP sections with visual separators
- **Context Meter** — Visual indicator of token usage per session
- **Device Identity** — Ed25519 signed authentication (compatible with OpenClaw pairing)
- **Message History** — Persistent input history, cycle with `Ctrl+Up` / `Ctrl+Down`
- **@path File Context** — Type `@` to search and attach workspace files as context to your message
- **Directory Navigation** — Type `@folder/` to browse directory contents; selecting a directory auto-expands its children
- **Line Number References** — Attach file context with line numbers using `@path#L123` (single line) or `@path#L100-#L200` (line range)
- **Node Capabilities** — Runs as a paired node, enabling `exec`, `read`, `write`, `edit` tool calls from the agent
- **Exec Approval** — Commands are executed locally with a cwd-based approval dialog (Allow Once / Always Allow / Deny)
- **Configurable Agent/Session** — Set `agentId` and `sessionKey` in VSCode settings to control which agent and session the extension connects to
- **Open Agent Workspace** — Add the agent's workspace folder to VS Code Explorer with one click
- **Attachment Support** — Paste (`Ctrl+V`), click 📎, or drag & drop files into the chat input as attachments; preview chips show type tag, name, size, and a `×` remove button; attachments (name/size/mimeType/base64) are sent with your message (10 MB per-file limit)
- **Subagent Activity Tracking** — Shows "Subagent active: <label>" and "Waiting for subagent…" yield indicator
- **Internationalization Support** — UI string localization via VSCode's i10n system

## Installation

### From VS Marketplace

Search for **nufeng1999** in the VS Code Extensions panel, or visit the [Marketplace page](https://marketplace.visualstudio.com/items?itemName=CQCBIT.nufeng-OpenClaw-vscode&ssr=false#overview).

### From Source

```bash
git clone https://github.com/nufeng/openclaw-vscode.git
cd openclaw-vscode
npm install
npm run build
```

Then copy the folder to `~/.vscode/extensions/`.

## Usage

1. Start the OpenClaw gateway
2. Open the OpenClaw sidebar from the Activity Bar
3. The extension connects automatically (operator + node roles)
4. Click **Chat** in the tabs bar to start chatting
5. Click agent buttons in the HUD to switch agents

### HUD Panel

Toggle with the grid button (⊞) in the tabs bar. Contains:

- **Agent Card** — Name, emoji, connection status
- **Reconnect Button** — Shown next to the agent status when the extension is disconnected; hidden once connected. Clicking it sends a `reconnect` message to the extension host and triggers the `openclaw.reconnect` command to re-establish the gateway connection
- **Agent Buttons** — Switch between agents (shown when multiple agents exist)
- **Settings** — Model defaults, reliability settings, server info
- **Sessions** — List of chat sessions with token usage

### Chat Panel

- **Tabs** — Each agent gets its own tab; click to switch
- **Messages** — Markdown-rendered assistant responses
- **Input** — Type and press Enter to send, Shift+Enter for newline
- **Stop** — Abort a running response
- **Busy Indicator** — Shows "Processing..." during message processing; "Processing (N queued)" when multiple messages are queued

### Attachments

You can attach files to a chat message in three ways:

| Method | How |
| ------ | ---- |
| **📎 Button** | Click the 📎 button above the input box (`attachBtn`) to open the system file picker; multiple files can be selected at once |
| **Paste** | Press `Ctrl+V` in the input box to paste a file from the clipboard (e.g. a screenshot) as an attachment |
| **Drag & Drop** | Drag files onto the input area (`.input-area`) to add them as attachments |

**Preview chips:** Each attachment appears as a chip in the `#attachmentPreview` area above the input box, showing an ASCII type tag (`[IMG]` / `[VID]` / `[AUD]` / `[TXT]` / `[PDF]` / `[ZIP]` / `[FILE]`), the file name, and its size.

**Remove:** Click the `×` on a chip to remove that attachment before sending.

**Sending:** When you send the message, attachments (name, size, mimeType, base64) are posted to the agent together with the text as `{type:'sendMessage', text, fileRefs, attachments}`.

**Limits & behavior:**
- Maximum size per file is **10 MB** (`MAX_ATTACH_SIZE`); files larger than this trigger an alert and are skipped.
- While a streaming response is in progress, the 📎 button is hidden and reappears when the response completes.

### Attachments

You can attach files to a chat message in three ways:

| Method | How |
| ------ | ---- |
| **📎 Button** | Click the 📎 button above the input box to open the system file picker |
| **Paste** | Press `Ctrl+V` in the input box to paste a file from the clipboard |
| **Drag & Drop** | Drag files onto the input area to add them as attachments |

**Preview chips:** Each attachment appears as a chip showing an ASCII type tag (`[IMG]` / `[VID]` / `[AUD]` / `[TXT]` / `[PDF]` / `[ZIP]` / `[FILE]`), the file name, and its size.

**Limits:** Maximum size per file is **10 MB**; the 📎 button is hidden during streaming and reappears when the response completes.

### Slash Commands

Type `/` in the chat input to trigger the slash command dropdown. Commands are grouped into sections:

| Section | Commands |
|---------|----------|
| SESSION | `/stop`, `/new` |
| MODEL & STATUS | `/models`, `/status` |
| HELP | `/help`, `/reset`, `/compact` |

Navigate with `↑` / `↓`, press `Enter` to select, or `Escape` to cancel.

### @path File Context

Type `@` in the input box to trigger file search. A dropdown shows workspace files and folders matching your query.

| Action | Result |
|--------|--------|
| Type `@` | Show all workspace files |
| Type `@app` | Filter files containing "app" |
| `↑` / `↓` | Navigate the dropdown |
| `Enter` | Select and insert `@filepath` |
| `Escape` | Close the dropdown |

**Directory navigation:** Type `@folder/` to list directory contents; selecting a directory auto-expands it.

**Line number references:** Use `@path#L123` for a single line or `@path#L100-#L200` for a range. Line number info is sent as structured data to the gateway.

### Mermaid Diagram Support

When the AI returns a fenced Mermaid code block, the extension renders it as a live SVG diagram inside the chat.

**Controls (per diagram):**

| Button | Action |
|--------|--------|
| **Image / Source** | Toggle between rendered SVG and raw source code |
| **Copy** | Copy source code or diagram as PNG to clipboard |
| **Export** | Save the diagram as a local PNG file |

### Multi-Agent Support

Each agent has its own chat tab and independent session pool:

| Feature | Description |
|---------|-------------|
| Agent Switching | Click agent buttons in the HUD to switch between agents |
| Independent Tabs | Each agent gets its own chat tab; conversations are isolated |
| Independent Sessions | Each agent maintains its own set of sessions; state does not cross agents |
| Configurable Default | Set `openclaw.agentId` in VSCode settings to control the default agent |

**Common Agent IDs:** `main`, `clerk`, `coder2`, `designer`, `manager`

### Supervisor Feature

Configure a supervisor agent to periodically check your current agent's output and intervene if needed.

#### Enabling Supervision

Enable supervision via the checkbox in the chat HUD panel, or use the `toggleSupervision` command.

#### Configuration Example

```json
{
  "openclaw.supervisor.agentId": "manager",
  "openclaw.supervisor.intervalMinutes": 5,
  "openclaw.supervisor.stopInquiryMethod": "Judge",
  "openclaw.supervisor.reminderMessage": "Please continue your work.",
  "openclaw.supervisor.stopSignalContent": "done|finished|completed",
  "openclaw.supervisor.stopSignalReply": "yes"
}
```

#### How It Works

1. On enable, the extension sends a hello handshake to the supervisor agent (30s timeout)
2. Every `intervalMinutes`, the extension fetches the current agent's last output via `chat.history`
3. If output is unchanged, the extension sends `reminderMessage` to the current agent
4. The extension sends an inquiry to the supervisor agent and waits for a reply
5. If the supervisor replies with `stopSignalReply` (or output matches `stopSignalContent`), supervision stops
6. Otherwise, supervision continues until the user disables it or the output changes

### Message History

Your sent messages are saved automatically (up to 200 entries, persisted across sessions).

| Shortcut | Action |
|----------|--------|
| `Ctrl+Up` | Cycle backward through message history |
| `Ctrl+Down` | Cycle forward through message history |

History resets when you send a new message.

### Node Capabilities

On first connection, the extension registers as a **node** alongside its operator role. This enables the AI agent to call built-in tools:

- **`exec`** — Execute shell commands on your local machine
- **`read`** — Read files from your workspace
- **`write`** — Create or overwrite files
- **`edit`** — Apply targeted text replacements in files

### Exec Approval

When the agent tries to run a command, a VSCode QuickPick dialog appears:

| Option | Behavior |
|--------|----------|
| **Allow Once** | Execute this command once |
| **Always Allow** | Auto-approve all commands in this cwd and its subdirectories |
| **Deny** | Cancel the command |

Approval is based on the working directory (cwd), not the specific command. Subdirectories inherit approval from their parent.

### Open Agent Workspace

Clicking the **Open current agent workspace** button adds the agent's workspace folder to the VS Code Explorer sidebar as a multi-root entry. If the folder is already present in the workspace, the button focuses and expands it in the Explorer instead.

## Commands

| Command | Description |
|---------|-------------|
| `OpenClaw: Open Chat` | Open the chat sidebar |
| `OpenClaw: Reconnect` | Reconnect to the gateway |
| `OpenClaw: New Chat` | Start a new chat session |
| `OpenClaw: Settings` | Open extension settings |
| `OpenClaw: Approve Node Pairing` | Manually trigger node pairing approval |
| `OpenClaw: Reset Device Identity` | Reset the device identity and re-pair |
| `Switch workspace here` | Switch working directory to the selected folder (Explorer context menu) |
| `Analyze the project` | Analyze code structure, file organization and tech stack of the selected folder (Explorer context menu) |

## Configuration

Open VSCode Settings and search for `openclaw`:

### General Settings

| Setting | Default | Description |
|---------|---------|-------------|
| `openclaw.gatewayUrl` | `ws://127.0.0.1:18789` | WebSocket URL of the gateway |
| `openclaw.token` | _(empty)_ | Auth token for the gateway |
| `openclaw.sessionKey` | `OpenClaw VSCode` | Default session key |
| `openclaw.agentId` | `OpenClaw VSCode` | Default agent ID or node display name |

### Supervisor Settings

| Setting | Default | Description |
|---------|---------|-------------|
| `openclaw.supervisor.intervalMinutes` | `5` | How often (minutes) to check the current agent's output |
| `openclaw.supervisor.stopSignalContent` | `""` | Stop signal content — pipe-separated list (e.g. `done\|finished\|completed`) |
| `openclaw.supervisor.reminderMessage` | `""` | Reminder message sent when output is unchanged |
| `openclaw.supervisor.agentId` | `""` | Supervisor agent ID (e.g. `manager`, `main`) |
| `openclaw.supervisor.stopInquiryMethod` | `""` | Prompt method prefix for supervisor inquiry (e.g. `Judge`, `Evaluate`) |
| `openclaw.supervisor.stopSignalReply` | `"yes"` | Reply text that triggers stop (case-insensitive) |

## How It Works

The extension connects to the OpenClaw gateway with two roles:

1. **Operator** — UI client for chat, sessions, and agent management
2. **Node** — Paired node host for tool execution (exec, read, write, edit)

### Connection Flow

1. WebSocket opens → receives `connect.challenge` with nonce
2. Sends `connect` request with Ed25519 device identity signature
3. On success, loads agents, sessions, and defaults
4. Registers node capabilities (`system.run`, `system.which`, etc.)
5. Chat messages are sent via `chat.send` RPC
6. Responses stream in via `chat` events (`delta` → `final`)
7. On agent run failure responses, auto-sends "Continue" up to 3 times to resume conversation

### Node Pairing

The node is auto-approved on first connect. If pairing is needed:

1. The extension sends `node.pair.requested` to the gateway
2. Run `openclaw devices approve --latest` on the server, or
3. Use the **Approve Node Pairing** command in VSCode

## Troubleshooting

### Connection Refused

- Ensure the OpenClaw gateway is running (`ws://127.0.0.1:18789` by default)
- Check the VSCode Output panel (`OpenClaw` channel) for detailed connection logs
- Verify your firewall is not blocking the WebSocket connection
- If the connection drops while the extension is running, click the **Reconnect** button in the HUD panel to retry immediately, or run the **OpenClaw: Reconnect** command from the Command Palette

### Node Pairing Issues

- Use the **OpenClaw: Approve Node Pairing** command to manually trigger approval
- Alternatively, run `openclaw devices approve --latest` on the gateway server
- To reset the device identity, use **OpenClaw: Reset Device Identity**

### Mermaid Diagrams Not Rendering

- Ensure the AI response contains a fenced Mermaid code block (```` ```mermaid ````)
- Streaming responses render diagrams automatically upon completion

### Attachments Not Sending

- Verify the file is under the 10 MB per-file limit
- Check that the gateway supports file attachment handling

### Supervisor Not Responding

- Verify the supervisor `agentId` is correct and the agent exists on the gateway
- Check that `intervalMinutes` is greater than 0
- Review the Output channel for supervisor inquiry logs

## Development

```bash
npm install
npm run build        # one-time build
npm run watch        # rebuild on change
```

Reload VSCode after each build to test changes.

## Changelog

### v0.0.24
- Release preparation (version bump to 0.0.24)

### v0.0.23
- **Added** subagent status indicator: shows "Subagent active: <label>" and "Waiting for subagent…" yield indicator
- **Added** internationalization support (i18n): UI string localization
- **Fixed** chat history display issue
- **Fixed** media support (images/video)
- **Fixed** Mermaid diagram rendering bug

### v0.0.22
- Maintenance release with no feature changes

### v0.0.21
- **Added** busy status indicator: UI shows "Processing..." after sending a message, and "Processing (N queued)" when multiple messages are queued
- **Fixed** bug where slash commands (`/stop`, `/new`, etc.) caused busyCount leak
- **Added** slash command dropdown grouping (SESSION / MODEL & STATUS / HELP), keyboard navigation skips separators

### v0.0.20
- Improved message queue mechanism: no message loss during Gateway-side queuing
- Session failure notifications: extension can detect failure events pushed back by the Gateway and automatically retry
- Separator SLASH_COMMANDS feature reimplementation

## License

MIT
