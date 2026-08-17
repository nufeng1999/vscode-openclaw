# OpenClaw for VSCode

AI chat sidebar for [OpenClaw](https://github.com/openclaw) gateway. Connects to your OpenClaw instance via WebSocket and provides a native chat interface directly in VSCode.

## Features

- **Agent HUD** — Connection status, model settings, session management
- **Multi-Agent** — Switch between agents with one click, each agent gets its own chat tab
- **Streaming Responses** — Real-time markdown rendering of AI responses
- **Context Meter** — Visual indicator of token usage per session
- **Session Management** — Create, switch, and delete chat sessions
- **Device Identity** — Ed25519 signed authentication (compatible with OpenClaw pairing)

## Requirements

- A running [OpenClaw](https://github.com/openclaw) gateway (default: `ws://127.0.0.1:18789`)
- VSCode 1.80 or newer

## Install

### From VSIX

```bash
code --install-extension nufeng.openclaw-vscode-0.0.1.vsix
```

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
3. The extension connects automatically
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

### Commands

| Command | Description |
|---------|-------------|
| `OpenClaw: Open Chat` | Open the chat sidebar |
| `OpenClaw: Reconnect` | Reconnect to the gateway |
| `OpenClaw: New Chat` | Start a new chat session |
| `OpenClaw: Settings` | Open extension settings |

## How It Works

The extension connects to the OpenClaw gateway as a UI client node using the same WebSocket protocol as the Obsidian plugin:

1. WebSocket opens → receives `connect.challenge` with nonce
2. Sends `connect` request with Ed25519 device identity signature
3. On success, loads agents, sessions, and defaults
4. Chat messages are sent via `chat.send` RPC
5. Responses stream in via `chat` events (`delta` → `final`)

## Development

```bash
npm install
npm run build        # one-time build
npm run watch        # rebuild on change
```

Reload VSCode after each build to test changes.

## License

MIT
