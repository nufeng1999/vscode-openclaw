# CQClaw - OpenClaw Client for VSCode

AI chat sidebar and node host for [OpenClaw](https://github.com/openclaw) gateway. Connects to your OpenClaw instance via WebSocket and provides a native chat interface directly in VSCode.

## Features

- **Agent HUD** — Connection status, model settings, session management
- **Multi-Agent** — Switch between agents with one click, each agent gets its own chat tab
- **Streaming Responses** — Real-time markdown rendering of AI responses
- **Context Meter** — Visual indicator of token usage per session
- **Session Management** — Create, switch, and delete chat sessions
- **Device Identity** — Ed25519 signed authentication (compatible with OpenClaw pairing)
- **Message History** — Persistent input history, cycle with `Ctrl+Up` / `Ctrl+Down`
- **@path File Context** — Type `@` to search and attach workspace files as context to your message
- **Node Capabilities** — Runs as a paired node, enabling `exec`, `read`, `write`, `edit` tool calls from the agent
- **Exec Approval** — Commands are executed locally with a cwd-based approval dialog (Allow Once / Always Allow / Deny)

## Requirements

- A running [OpenClaw](https://github.com/openclaw) gateway (default: `ws://127.0.0.1:18789`)
- VSCode 1.80 or newer
- An open workspace folder (for file search and node tool execution)

## Install

### From VS Marketplace

Search for **CQClaw** in the VS Code Extensions panel, or visit the [Marketplace page](https://marketplace.visualstudio.com/items?itemName=CQCBIT-nufeng1999.nufeng1999-OpenClaw-vscode).

### From Source

```bash
git clone <repo-url>
cd openclaw-vscode
npm install
npm run build
```

Then copy the folder to `~/.vscode/extensions/`.

## Configuration

Open VSCode Settings and search for `openclaw`:

| Setting | Default | Description |
|---------|---------|-------------|
| `openclaw.gatewayUrl` | `ws://127.0.0.1:18789` | WebSocket URL of the gateway |
| `openclaw.token` | _(empty)_ | Auth token for the gateway |
| `openclaw.sessionKey` | `main` | Default session key |
| `openclaw.agentId` | `main` | Default agent ID |

## Usage

1. Start the OpenClaw gateway
2. Open the OpenClaw sidebar from the Activity Bar
3. The extension connects automatically (operator + node)
4. Click **Chat** in the tabs bar to start chatting
5. Click agent buttons in the HUD to switch agents

### HUD Panel

Toggle with the grid button (⊞) in the tabs bar. Contains:

- **Agent Card** — Name, emoji, connection status
- **Agent Buttons** — Switch between agents (shown when multiple agents exist)
- **Settings** — Model defaults, reliability settings, server info
- **Sessions** — List of chat sessions with token usage

### Chat Panel

- **Tabs** — Each agent gets its own tab, click to switch
- **Messages** — Markdown-rendered assistant responses
- **Input** — Type and press Enter to send, Shift+Enter for newline
- **Stop** — Abort a running response

### Message History

Your sent messages are saved automatically (up to 200 entries, persisted across sessions).

| Shortcut | Action |
|----------|--------|
| `Ctrl+Up` | Cycle backward through message history |
| `Ctrl+Down` | Cycle forward through message history |

History resets when you send a new message.

### @path File Context

Type `@` in the input box to trigger file search. A dropdown shows workspace files and folders matching your query.

| Action | Result |
|--------|--------|
| Type `@` | Show all workspace files |
| Type `@app` | Filter files containing "app" |
| `↑` / `↓` | Navigate the dropdown |
| `Enter` | Select and insert `@filepath` |
| `Escape` | Close the dropdown |

When you send a message containing `@path`, the referenced file's content is automatically read and attached as context to the AI. The `@path` text remains visible in the message so the AI knows which files you referenced.

- Text files: content sent as UTF-8
- Binary files (images, etc.): sent as base64 with correct MIME type
- Size limit: 20 MB total per message

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

### Commands

| Command | Description |
|---------|-------------|
| `OpenClaw: Open Chat` | Open the chat sidebar |
| `OpenClaw: Reconnect` | Reconnect to the gateway |
| `OpenClaw: New Chat` | Start a new chat session |
| `OpenClaw: Settings` | Open extension settings |
| `OpenClaw: Approve Node Pairing` | Manually trigger node pairing approval |

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

### Node Pairing

The node is auto-approved on first connect. If pairing is needed:

1. The extension sends `node.pair.requested` to the gateway
2. Run `openclaw devices approve --latest` on the server, or
3. Use the **Approve Node Pairing** command in VSCode

## Development

```bash
npm install
npm run build        # one-time build
npm run watch        # rebuild on change
```

Reload VSCode after each build to test changes.

## License

MIT
