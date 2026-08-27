# OpenClaw Client for VSCode

AI chat sidebar and node host for [OpenClaw](https://github.com/openclaw) gateway. Connects to your OpenClaw instance via WebSocket and provides a native chat interface directly in VSCode.

![](https://github.com/nufeng1999/imgs/blob/main/img/HikkX9mXOB.png?raw=true)

## Features

- **Agent HUD** — Connection status, model settings, session management
- **Multi-Agent Support** — Switch between agents (main, clerk, coder2, designer, manager, etc.) with one click; each agent gets its own chat tab and independent session pool
- **Session Management** — Each agent maintains multiple sessions; create, switch, and delete sessions independently per agent
- **Supervisor Mode** — Configure a supervisor agent to periodically check your current agent's output with customizable intervals, reminder messages, and stop signals
- **Streaming Responses** — Real-time markdown rendering of AI responses
- **Image & Video Support** — Automatically display images and videos embedded in gateway replies (base64-encoded data URLs)
- **Mermaid Diagram Support** — AI replies containing Mermaid code blocks are automatically rendered as SVG diagrams; supports flowchart, sequenceDiagram, classDiagram, stateDiagram, erDiagram, gantt, pie, and more
- **Mermaid View Toggle** — Switch between rendered **Image** view and **Source** view with a dedicated toggle button on each diagram
- **Mermaid Copy & Export** — Copy a diagram's source code or image (PNG to clipboard), and export it as a local PNG file via a save dialog
- **Full-Width Diagrams** — Mermaid charts automatically expand to the full chat panel width (92% constraint removed)
- **Streaming Mermaid Rendering** — Diagrams are automatically rendered once a streaming response completes; no manual history refresh needed
- **Robust Image Copy** — Uses `createImageBitmap` with a `DOMParser`/`foreignObject` CSP fallback to reliably copy diagram images despite `blob:` restrictions
- **Auto-Retry on Agent Failure** — When the gateway returns an agent run failure error, the extension automatically sends "Continue" up to 3 times to resume the conversation. Resets when a normal response is received or the user sends a new message.
- **Busy Status Indicator** — UI shows "处理中..." or "处理中 (N 条排队)" while messages are being processed or queued by the gateway
- **Slash Commands with Separator** — Type `/` to see categorized commands (`/stop`, `/new`, `/models`, `/help`, etc.); commands are grouped into SESSION / MODEL & STATUS / HELP sections with visual separators; keyboard navigation skips separators automatically
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

## Requirements

- A running [OpenClaw](https://github.com/openclaw) gateway (default: `ws://127.0.0.1:18789`)
- VSCode 1.80 or newer
- An open workspace folder (for file search and node tool execution)

## Install

### From VS Marketplace

Search for **nufeng1999** in the VS Code Extensions panel, or visit the [Marketplace page](https://marketplace.visualstudio.com/items?itemName=CQCBIT.nufeng-OpenClaw-vscode&ssr=false#overview).

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

### General Settings

| Setting               | Default                | Description                          |
| --------------------- | ---------------------- | ------------------------------------ |
| `openclaw.gatewayUrl` | `ws://127.0.0.1:18789` | WebSocket URL of the gateway         |
| `openclaw.token`      | _(empty)_              | Auth token for the gateway           |
| `openclaw.sessionKey` | `OpenClaw VSCode`      | Default session key                  |
| `openclaw.agentId`    | `OpenClaw VSCode`      | Default agent ID or node display name |

### Supervisor Settings

| Setting                              | Default  | Description                                                                  |
| ------------------------------------ | -------- | ---------------------------------------------------------------------------- |
| `openclaw.supervisor.intervalMinutes` | `5`     | How often (minutes) to check the current agent's output                      |
| `openclaw.supervisor.stopSignalContent` | `""`  | Stop signal content — pipe-separated list (e.g. `done\|finished\|completed`)  |
| `openclaw.supervisor.reminderMessage` | `""`    | Reminder message sent when output is unchanged                               |
| `openclaw.supervisor.agentId`        | `""`     | Supervisor agent ID (e.g. `manager`, `main`)                                |
| `openclaw.supervisor.stopInquiryMethod` | `""`  | Prompt method prefix for supervisor inquiry (e.g. `请判断`, `Judge`)          |
| `openclaw.supervisor.stopSignalReply` | `"yes"` | Reply text that triggers stop (case-insensitive)                             |

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
- **Busy Indicator** — Shows "处理中..." during message processing; "处理中 (N 条排队)" when multiple messages are queued

### Busy Status

When you send a message, the UI displays "处理中..." to indicate the agent is working. If you send multiple messages while the first is still being processed, the counter increments (e.g. "处理中 (2 条排队)"). The indicator disappears automatically when a response completes (final, error, or aborted).

### Slash Commands

Type `/` in the chat input to trigger the slash command dropdown. Commands are grouped into sections:

| Section | Commands |
|---------|----------|
| SESSION | `/stop`, `/new` |
| MODEL & STATUS | `/models`, `/status` |
| HELP | `/help`, `/reset`, `/compact` |

Navigate with `↑` / `↓`, press `Enter` to select, or `Escape` to cancel. Selecting a separator row has no effect — only commands are actionable.

### @path File Context

Type `@` in the input box to trigger file search. A dropdown shows workspace files and folders matching your query.

| Action      | Result                        |
| ----------- | ----------------------------- |
| Type `@`    | Show all workspace files      |
| Type `@app` | Filter files containing "app" |
| `↑` / `↓`   | Navigate the dropdown         |
| `Enter`     | Select and insert `@filepath` |
| `Escape`    | Close the dropdown            |

#### Directory Navigation

When you type `@folder/` (with a trailing slash), the dropdown lists the contents of that directory — subdirectories and files. Selecting a **directory** from the list inserts `@folder/subdir/` and automatically expands it, letting you drill down without re-typing. Selecting a **file** inserts `@filepath ` (with a trailing space) and closes the dropdown.

In **multi-root workspaces** (multiple folders in the workspace), file paths are prefixed with the workspace folder name to avoid ambiguity, e.g. `cqcbit.nufeng-openclaw-vscode-0.0.19/src/chatView.ts`.

#### Line Number References

You can attach file context with specific line numbers:

| Format | Example | Description |
| ------ | ------- | ----------- |
| `@path#L行号` | `@src/chatView.ts#L123` | Reference a single line |
| `@path#L起始-#L结束` | `@src/chatView.ts#L100-#L200` | Reference a line range |

When the message is sent, line number information is passed as structured data (`{path, line}` or `{path, startLine, endLine}`) to the OpenClaw gateway, allowing the AI to pinpoint exact code locations.

#### File Content Attachment

When you send a message containing `@path`, the referenced file's content is automatically read and attached as context to the AI. The `@path` text remains visible in the message so the AI knows which files you referenced.

- Text files: content sent as UTF-8
- Binary files (images, etc.): sent as base64 with correct MIME type
- Size limit: 20 MB total per message

### Mermaid Diagram Support

When the AI returns a fenced Mermaid code block (e.g. ```` ```mermaid ````), the extension renders it as a live SVG diagram inside the chat instead of plain source text.

**Supported diagram types:** `flowchart`, `sequenceDiagram`, `classDiagram`, `stateDiagram`, `erDiagram`, `gantt`, `pie`, and other Mermaid-supported syntax.

**Controls (per diagram):**

| Button            | Action                                                                                  |
| ----------------- | --------------------------------------------------------------------------------------- |
| **Image / Source** | Toggle between the rendered SVG diagram and the raw Mermaid source code                  |
| **Copy**           | Copy the source code, or copy the diagram as a PNG image to the clipboard                |
| **Export**         | Open a save dialog and export the diagram as a local PNG file                            |

The four buttons share a unified visual style for a consistent experience.

**Notes:**

- Diagrams auto-expand to the full chat panel width.
- After a streaming response finishes, any Mermaid blocks are rendered automatically — no need to refresh the chat history.
- Image copy uses `createImageBitmap` with a `DOMParser`/`foreignObject` fallback to work around CSP `blob:` restrictions.

### Multi-Agent Support

The extension supports multiple agents, each with its own chat tab and independent session pool:

| Feature           | Description                                                                        |
| ----------------- | ---------------------------------------------------------------------------------- |
| Agent Switching   | Click agent buttons in the HUD to switch between agents                            |
| Independent Tabs  | Each agent gets its own chat tab; conversations are isolated                       |
| Independent Sessions | Each agent maintains its own set of sessions; session state does not cross agents |
| Configurable Default | Set `openclaw.agentId` in VSCode settings to control the default agent           |

**Common Agent IDs:**

- `main` — General-purpose agent
- `clerk` — Administrative and coordination tasks
- `coder2` — Code-focused coding agent
- `designer` — Design and UI tasks
- `manager` — Project management and oversight

### Session Management

Each agent has its own session pool. Manage sessions in the **Sessions** panel:

- **New Session** — Create a fresh session for the current agent
- **Switch Session** — Click any session to switch to it
- **Delete Session** — Remove unwanted sessions

Session state (message history, context) is preserved per agent.

### Supervisor Feature

Configure a supervisor agent to periodically check your current agent's output and intervene if needed.

#### Enabling Supervision

Enable supervision via the checkbox in the chat HUD panel, or use the `toggleSupervision` command. When active, the extension periodically checks whether the current agent's output has changed, sends reminders if it hasn't, and asks the supervisor agent for a stop decision.

#### Configuration Example

```json
{
  "openclaw.supervisor.agentId": "manager",
  "openclaw.supervisor.intervalMinutes": 5,
  "openclaw.supervisor.stopInquiryMethod": "请判断",
  "openclaw.supervisor.reminderMessage": "Please continue your work.",
  "openclaw.supervisor.stopSignalContent": "done|finished|completed",
  "openclaw.supervisor.stopSignalReply": "yes"
}
```

#### Parameters

| Parameter              | Type   | Description                                                                              |
| ---------------------- | ------ | ---------------------------------------------------------------------------------------- |
| `agentId`              | string | Supervisor agent ID to perform periodic checks (e.g. `manager`, `main`)                 |
| `intervalMinutes`      | number | Check interval in minutes. Set to `0` to disable.                                        |
| `stopInquiryMethod`    | string | Prompt method prefix for supervisor inquiry (e.g. `请判断`, `Judge`, `Evaluate`)         |
| `reminderMessage`      | string | Custom reminder message sent to the current agent when output is unchanged (empty = no reminder) |
| `stopSignalContent`    | string | Stop signal content. Use `\|` to separate multiple signals (e.g. `done|finished|completed`) |
| `stopSignalReply`      | string | Reply text that triggers stop — case-insensitive match (default: `yes`)                  |

#### How It Works

1. On enable, the extension sends a hello handshake to the supervisor agent (30s timeout)
2. Every `intervalMinutes`, the extension fetches the current agent's last output via `chat.history`
3. If output is unchanged, the extension sends `reminderMessage` to the current agent
4. The extension sends an inquiry to the supervisor agent and waits for a reply
5. If the supervisor replies with `stopSignalReply` (or output matches `stopSignalContent`), supervision stops
6. Otherwise, supervision continues until the user disables it or the output changes

### Message History

Your sent messages are saved automatically (up to 200 entries, persisted across sessions).

| Shortcut    | Action                                 |
| ----------- | -------------------------------------- |
| `Ctrl+Up`   | Cycle backward through message history |
| `Ctrl+Down` | Cycle forward through message history  |

History resets when you send a new message.

### Node Capabilities

On first connection, the extension registers as a **node** alongside its operator role. This enables the AI agent to call built-in tools:

- **`exec`** — Execute shell commands on your local machine
- **`read`** — Read files from your workspace
- **`write`** — Create or overwrite files
- **`edit`** — Apply targeted text replacements in files

### Exec Approval

When the agent tries to run a command, a VSCode QuickPick dialog appears:

| Option           | Behavior                                                     |
| ---------------- | ------------------------------------------------------------ |
| **Allow Once**   | Execute this command once                                    |
| **Always Allow** | Auto-approve all commands in this cwd and its subdirectories |
| **Deny**         | Cancel the command                                           |

Approval is based on the working directory (cwd), not the specific command. Subdirectories inherit approval from their parent.

### Open Agent Workspace

Clicking the **Open current agent workspace** button adds the agent's workspace folder to the VS Code Explorer sidebar as a multi-root entry. If the folder is already present in the workspace, the button focuses and expands it in the Explorer instead. No dialogs are shown. This works regardless of whether VS Code is in single-root, multi-root, or no-workspace mode.

### Commands

| Command                          | Description                            |
| -------------------------------- | -------------------------------------- |
| `OpenClaw: Open Chat`            | Open the chat sidebar                  |
| `OpenClaw: Reconnect`            | Reconnect to the gateway               |
| `OpenClaw: New Chat`             | Start a new chat session               |
| `OpenClaw: Settings`             | Open extension settings                |
| `OpenClaw: Approve Node Pairing` | Manually trigger node pairing approval |
| `OpenClaw: Reset Device Identity` | Reset the device identity and re-pair |
| `切换工作目录到这里` | Switch working directory to the selected folder (Explorer context menu) |

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

## Development

```bash
npm install
npm run build        # one-time build
npm run watch        # rebuild on change
```

Reload VSCode after each build to test changes.

## Changelog

### v0.0.23
- **新增** 子代理状态指示器：显示 "Subagent active: <label>" 和 "Waiting for subagent…" yield 指示器
- **新增** 国际化支持 (i18n)：UI 字符串本地化
- **修复** 历史对话显示问题
- **修复** 多媒体支持（图片/视频）
- **修复** Mermaid 图表渲染 bug

### v0.0.22
- 维护性版本发布，无功能变更

### v0.0.21
- **新增** 忙状态指示器：发送消息后 UI 显示"处理中..."，多条消息排队时显示"处理中 (N 条排队)"
- **修复** slash 命令（`/stop`、`/new` 等）导致 busyCount 泄漏的 bug
- **新增** slash 命令下拉菜单分组显示（SESSION / MODEL & STATUS / HELP），键盘导航跳过分隔符

### v0.0.20
- 消息队列机制完善：Gateway 侧排队不丢消息
- Session 失败通知：插件可感知 Gateway 推回的失败事件并自动重试
- Separator SLASH_COMMANDS 功能重新实现

## License

MIT
