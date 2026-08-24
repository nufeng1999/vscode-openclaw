import * as WebSocket from "ws";
import { EventEmitter } from "events";
import * as crypto from "crypto";
import type { OutputChannel, ExtensionContext } from "vscode";

export interface GatewayMessage {
  type: string;
  id?: string;
  method?: string;
  params?: any;
  payload?: any;
  ok?: boolean;
  error?: any;
  event?: string;
  seq?: number;
}

interface DeviceIdentity {
  deviceId: string;
  publicKey: string;
  privateKey: string;
}

export class OpenClawGateway extends EventEmitter {
  private ws: WebSocket.WebSocket | null = null;
  private url: string;
  private token: string;
  private log: (msg: string) => void;
  private pending = new Map<string, { resolve: Function; reject: Function }>();
  private _connected = false;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private reconnectDelay = 800;
  private maxReconnectDelay = 15000;
  private connectSent = false;
  private connectNonce: string | null = null;
  private connectTimer: ReturnType<typeof setTimeout> | null = null;
  private deviceIdentity: DeviceIdentity | null = null;
  private deviceKeyObject: crypto.KeyObject | null = null;
  private closed = false;

  constructor(url: string, token: string, channel?: OutputChannel) {
    super();
    this.url = url;
    this.token = token;
    this.log = channel
      ? (msg: string) => channel.appendLine(msg)
      : () => {};
  }

  get connected(): boolean {
    return this._connected;
  }

  getDeviceIdentity(): DeviceIdentity | null {
    return this.deviceIdentity;
  }

  getDeviceKeyObject(): crypto.KeyObject | null {
    return this.deviceKeyObject;
  }

  async initDeviceIdentity(store: { get(key: string): any; update(key: string, value: any): void }) {
    let identity = store.get("deviceIdentityV2") as DeviceIdentity | undefined;

    if (!identity) {
      this.log("Generating new device identity...");
      const { publicKey, privateKey } = crypto.generateKeyPairSync("ed25519");
      const pubSpki = publicKey.export({ type: "spki", format: "der" });
      const pubRaw = pubSpki.subarray(pubSpki.length - 32);
      const privRaw = privateKey.export({ type: "pkcs8", format: "der" });
      const deviceId = crypto.createHash("sha256").update(pubRaw).digest("hex");

      identity = {
        deviceId,
        publicKey: base64UrlEncode(pubRaw),
        privateKey: base64UrlEncode(privRaw)
      };
      store.update("deviceIdentityV2", identity);
      this.log(`New device ID: ${deviceId}`);
    } else {
      this.log(`Loaded existing device ID: ${identity.deviceId}`);
    }

    this.deviceIdentity = identity;
    const derBuffer = base64UrlDecode(identity.privateKey);
    this.deviceKeyObject = crypto.createPrivateKey({
      key: Buffer.from(derBuffer),
      format: "der",
      type: "pkcs8"
    });
  }

  connect() {
    this.closed = false;
    if (this.ws) {
      try { this.ws.close(); } catch {}
      this.ws = null;
    }
    this.connectSent = false;
    this.connectNonce = null;
    if (this.connectTimer) {
      clearTimeout(this.connectTimer);
      this.connectTimer = null;
    }

    const wsUrl = this.normalizeUrl(this.url);
    if (!wsUrl) {
      this.log(`ERROR: Invalid gateway URL: ${this.url}`);
      this.emit("error", "Invalid gateway URL");
      return;
    }

    this.log(`Connecting to ${wsUrl}...`);
    try {
      this.ws = new WebSocket.WebSocket(wsUrl);
    } catch (err: any) {
      this.log(`ERROR: WebSocket constructor failed: ${err.message}`);
      this.emit("error", err.message);
      this.scheduleReconnect();
      return;
    }

    this.ws.on("open", () => {
      this.log("WebSocket opened, waiting for challenge or sending connect in 750ms...");
      this.connectTimer = setTimeout(() => {
        this.connectTimer = null;
        if (!this.connectSent) {
          this.log("No challenge received, sending connect (v1)...");
          this.sendConnect().catch(err => {
            this.log(`ERROR: sendConnect failed: ${err.message}`);
          });
        }
      }, 750);
    });

    this.ws.on("message", (data: WebSocket.Data) => {
      this.handleRawMessage(data.toString());
    });

    this.ws.on("close", (code: number, reason: Buffer) => {
      const reasonStr = reason.toString();
      this.log(`WebSocket closed: code=${code} reason=${reasonStr}`);
      this._connected = false;
      this.connectSent = false;
      if (this.connectTimer) {
        clearTimeout(this.connectTimer);
        this.connectTimer = null;
      }
      this.emit("disconnected");
      this.emit("close", code, reasonStr);
      if (!this.closed) {
        this.scheduleReconnect();
      }
    });

    this.ws.on("error", (err: Error) => {
      this.log(`ERROR: WebSocket error: ${err.message}`);
      this.emit("error", err.message);
    });
  }

  private handleRawMessage(raw: string) {
    let msg: GatewayMessage;
    try {
      msg = JSON.parse(raw);
    } catch {
      return;
    }

    // Skip heartbeat/tick/health events from logging
    if (msg.type === "event" && (msg.event === "heartbeat" || msg.event === "tick" || msg.event === "health")) {
      this.emit("event", msg);
      if (msg.event) {
        this.emit(msg.event, { payload: msg.payload, seq: msg.seq });
      }
      return;
    }

    const summary = raw.length > 300 ? raw.substring(0, 300) + "..." : raw;
    this.log(`← ${summary}`);

    // Handle connect.challenge event
    if (msg.type === "event" && msg.event === "connect.challenge") {
      const nonce = (msg.payload as any)?.nonce;
      this.log(`Challenge received, nonce=${nonce ? nonce.substring(0, 8) + "..." : "none"}`);
      if (typeof nonce === "string") {
        this.connectNonce = nonce;
      }
      if (!this.connectSent) {
        this.log("Sending connect (v2, with nonce)...");
        this.sendConnect().catch(err => {
          this.log(`ERROR: sendConnect failed: ${err.message}`);
        });
      }
      return;
    }

    // Handle response to our requests
    if (msg.type === "res") {
      const id = msg.id || "";
      const p = this.pending.get(id);
      if (p) {
        this.pending.delete(id);
        if (msg.ok) {
          this.log(`RES OK [${id}]: ${JSON.stringify(msg.payload).substring(0, 100)}`);
          p.resolve(msg.payload);
        } else {
          this.log(`RES ERR [${id}]: ${JSON.stringify(msg.error)}`);
          p.reject(new Error(msg.error?.message || "request failed"));
        }
      } else {
        this.log(`RES for unknown id [${id}], ignoring`);
      }
      return;
    }

    // Handle events
    if (msg.type === "event") {
      this.log(`EVENT: ${msg.event} seq=${msg.seq}`);
      this.emit("event", msg);
      if (msg.event) {
        this.emit(msg.event, { payload: msg.payload, seq: msg.seq });
      }
      return;
    }
  }

  // ─── Auto Configure ───

  private async configureExecHost() {
    const nodeId = this.deviceIdentity?.deviceId;
    if (!nodeId) return;
    const agentId = `node:${nodeId}`;
    try {
      this.log(`configureExecHost: agentId=${agentId}`);

      const configResult = await this.request("config.get", {}) as any;
      const baseHash = configResult?.hash;
      let config = configResult?.config;
      if (!config && configResult?.raw) {
        try { config = JSON.parse(configResult.raw); } catch {}
      }
      if (!config) config = configResult;

      const agentList: any[] = config?.agents?.list || [];
      this.log(`agents.list has ${agentList.length} entries`);

      const existing = agentList.find((a: any) => a.id === agentId);
      if (existing) {
        if (existing.tools?.exec?.host === "node") {
          this.log(`Agent ${agentId} already has tools.exec.host=node, skipping.`);
          return;
        }
        if (!existing.tools) existing.tools = {};
        if (!existing.tools.exec) existing.tools.exec = {};
        existing.tools.exec.host = "node";
      } else {
        agentList.push({
          id: agentId,
          tools: { exec: { host: "node" } }
        });
      }

      const patch = {
        raw: JSON.stringify({ agents: { list: agentList } }),
        baseHash: baseHash || undefined,
        replacePaths: ["agents.list"]
      };
      this.log(`config.patch agents.list with replacePaths (count=${agentList.length})...`);
      const result = await this.request("config.patch", patch, 90000) as any;
      this.log(`config.patch result: ${JSON.stringify(result).substring(0, 300)}`);
    } catch (err: any) {
      this.log(`WARNING: configureExecHost failed: ${err.message}`);
    }
  }

  // ─── Connect ───

  private async sendConnect() {
    if (this.connectSent) return;
    this.connectSent = true;

    const clientId = "gateway-client";
    const clientMode = "ui";
    const role = "operator";
    const scopes = ["operator.admin", "operator.write", "operator.read", "operator.pairing"];
    const signedAt = Date.now();

    this.log(`sendConnect: starting, deviceIdentity=${!!this.deviceIdentity}, keyObject=${!!this.deviceKeyObject}`);

    const params: any = {
      minProtocol: 4,
      maxProtocol: 4,
      client: {
        id: clientId,
        version: "0.0.1",
        platform: "vscode",
        mode: clientMode
      },
      role,
      scopes,
      auth: this.token ? { token: this.token } : undefined
    };

    if (this.deviceIdentity && this.deviceKeyObject) {
      try {
        const messageToSign = this.buildSignMessage(
          this.connectNonce,
          this.deviceIdentity.deviceId,
          clientId,
          clientMode,
          role,
          scopes,
          signedAt,
          this.token
        );
        this.log(`Sign: ${messageToSign.substring(0, 80)}...`);

        const signature = this.signMessage(messageToSign);
        params.device = {
          id: this.deviceIdentity.deviceId,
          publicKey: this.deviceIdentity.publicKey,
          signature,
          signedAt,
          nonce: this.connectNonce || undefined
        };
        this.log(`Device: ${this.deviceIdentity.deviceId}`);
      } catch (err: any) {
        this.log(`ERROR: Device signing failed: ${err}`);
      }
    } else {
      this.log("WARNING: No device identity, connecting without device auth");
    }

    try {
      this.log(`Sending connect request (role=${role}, mode=${clientMode})...`);
      const msgStr = JSON.stringify({ type: "req", id: "__connect__", method: "connect", params });
      this.log(`CONNECT REQ: ${msgStr.substring(0, 300)}`);
      const result = await this.request("connect", params);
      this.log(`CONNECT SUCCESS! ${JSON.stringify(result).substring(0, 200)}`);
      this._connected = true;
      this.reconnectDelay = 800;
      this.emit("connected", result);
    } catch (err: any) {
      this.log(`ERROR: Connect FAILED: ${err.message}`);
      this.emit("error", `Connect failed: ${err.message}`);
      if (this.ws) {
        this.ws.close(4008, "connect failed");
      }
    }
  }

  private buildSignMessage(
    nonce: string | null,
    deviceId: string,
    clientId: string,
    clientMode: string,
    role: string,
    scopes: string[],
    signedAtMs: number,
    token?: string
  ): string {
    const version = nonce ? "v2" : "v1";
    const parts = [
      version, deviceId, clientId, clientMode, role,
      scopes.join(","), String(signedAtMs), token || ""
    ];
    if (version === "v2") {
      parts.push(nonce || "");
    }
    return parts.join("|");
  }

  private signMessage(message: string): string {
    if (!this.deviceKeyObject) {
      throw new Error("Device key not initialized");
    }
    const data = Buffer.from(message, "utf-8");
    const signature = crypto.sign(null, data, this.deviceKeyObject);
    return base64UrlEncode(signature);
  }

  async request(method: string, params: any = {}, timeoutMs = 60000): Promise<any> {
    if (!this.ws || this.ws.readyState !== WebSocket.WebSocket.OPEN) {
      throw new Error("not connected");
    }

    return new Promise((resolve, reject) => {
      const id = this.genId();
      this.pending.set(id, { resolve, reject });

      const msg = { type: "req", id, method, params };
      const msgStr = JSON.stringify(msg);
      this.log(`→ ${method} [${id}]: ${msgStr.length > 200 ? msgStr.substring(0, 200) + "..." : msgStr}`);

      this.ws!.send(msgStr);

      setTimeout(() => {
        if (this.pending.has(id)) {
          this.pending.delete(id);
          reject(new Error(`Request timed out: ${method}`));
        }
      }, timeoutMs);
    });
  }

  private normalizeUrl(url: string): string | null {
    let p = url.trim();
    if (p.startsWith("https://")) p = "wss://" + p.slice(8);
    else if (p.startsWith("http://")) p = "ws://" + p.slice(7);
    if (!p.startsWith("ws://") && !p.startsWith("wss://")) return null;
    return p.replace(/\/+$/, "");
  }

  private scheduleReconnect() {
    if (this.reconnectTimer || this.closed) return;
    this.log(`Reconnecting in ${this.reconnectDelay}ms...`);
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, this.reconnectDelay);
    this.reconnectDelay = Math.min(this.reconnectDelay * 1.7, this.maxReconnectDelay);
  }

  disconnect() {
    this.closed = true;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.connectTimer) {
      clearTimeout(this.connectTimer);
      this.connectTimer = null;
    }
    if (this.ws) {
      try { this.ws.close(); } catch {}
      this.ws = null;
    }
    this._connected = false;
  }

  updateConfig(url: string, token: string) {
    this.url = url;
    this.token = token;
  }

  resetDeviceIdentity(store: { get(key: string): any; update(key: string, value: any): void }) {
    store.update("deviceIdentityV2", undefined);
    this.deviceIdentity = null;
    this.deviceKeyObject = null;
    this.log("Device identity cleared. Will regenerate on next connect.");
  }

  private genId(): string {
    return Math.random().toString(36).substring(2, 12);
  }
}

// ─── NodeHost: role=node 连接，处理 node.invoke.request ───

export class NodeHost extends EventEmitter {
  private ws: WebSocket.WebSocket | null = null;
  private url: string;
  private token: string;
  private log: (msg: string) => void;
  private pending = new Map<string, { resolve: Function; reject: Function }>();
  private _connected = false;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private reconnectDelay = 1000;
  private maxReconnectDelay = 30000;
  private connectSent = false;
  private connectNonce: string | null = null;
  private connectTimer: ReturnType<typeof setTimeout> | null = null;
  private deviceIdentity: DeviceIdentity | null = null;
  private deviceKeyObject: crypto.KeyObject | null = null;
  private closed = false;
  private alwaysApprovedCommands: Set<string> = new Set();
  private alwaysApprovedCwds: Set<string> = new Set();

  constructor(url: string, token: string, channel?: OutputChannel) {
    super();
    this.url = url;
    this.token = token;
    this.log = channel
      ? (msg: string) => channel.appendLine(`[NodeHost] ${msg}`)
      : () => {};
  }

  get connected(): boolean { return this._connected; }

  getDeviceId(): string | null { return this.deviceIdentity?.deviceId ?? null; }

  setToken(token: string) { this.token = token; }
  getToken(): string { return this.token; }

  async initDeviceIdentity(store: { get(key: string): any; update(key: string, value: any): void }) {
    let identity = store.get("nodeDeviceIdentityV2") as DeviceIdentity | undefined;

    if (!identity) {
      this.log("Generating new node device identity...");
      const { publicKey, privateKey } = crypto.generateKeyPairSync("ed25519");
      const pubSpki = publicKey.export({ type: "spki", format: "der" });
      const pubRaw = pubSpki.subarray(pubSpki.length - 32);
      const privRaw = privateKey.export({ type: "pkcs8", format: "der" });
      const deviceId = crypto.createHash("sha256").update(pubRaw).digest("hex");

      identity = {
        deviceId,
        publicKey: base64UrlEncode(pubRaw),
        privateKey: base64UrlEncode(privRaw)
      };
      store.update("nodeDeviceIdentityV2", identity);
      this.log(`New node device ID: ${deviceId}`);
    } else {
      this.log(`Loaded node device ID: ${identity.deviceId}`);
    }

    this.deviceIdentity = identity;
    const derBuffer = base64UrlDecode(identity.privateKey);
    this.deviceKeyObject = crypto.createPrivateKey({
      key: Buffer.from(derBuffer),
      format: "der",
      type: "pkcs8"
    });
  }

  connect() {
    this.closed = false;
    if (this.ws) {
      try { this.ws.close(); } catch {}
      this.ws = null;
    }
    this.connectSent = false;
    this.connectNonce = null;
    if (this.connectTimer) {
      clearTimeout(this.connectTimer);
      this.connectTimer = null;
    }

    let wsUrl = this.url.trim();
    if (wsUrl.startsWith("https://")) wsUrl = "wss://" + wsUrl.slice(8);
    else if (wsUrl.startsWith("http://")) wsUrl = "ws://" + wsUrl.slice(7);
    if (!wsUrl.startsWith("ws://") && !wsUrl.startsWith("wss://")) {
      this.log(`ERROR: Invalid URL: ${this.url}`);
      return;
    }
    wsUrl = wsUrl.replace(/\/+$/, "");

    this.log(`Connecting to ${wsUrl} (role=node)...`);
    try {
      this.ws = new WebSocket.WebSocket(wsUrl);
    } catch (err: any) {
      this.log(`ERROR: WebSocket failed: ${err.message}`);
      this.scheduleReconnect();
      return;
    }

    this.ws.on("open", () => {
      this.log("WebSocket opened, waiting for challenge...");
      this.connectTimer = setTimeout(() => {
        this.connectTimer = null;
        if (!this.connectSent) {
          this.sendConnect();
        }
      }, 750);
    });

    this.ws.on("message", (data: WebSocket.Data) => {
      this.handleRawMessage(data.toString());
    });

    this.ws.on("close", (code: number, reason: Buffer) => {
      this.log(`Closed: code=${code} reason=${reason.toString()}`);
      this._connected = false;
      this.connectSent = false;
      if (this.connectTimer) {
        clearTimeout(this.connectTimer);
        this.connectTimer = null;
      }
      this.emit("disconnected");
      if (!this.closed) {
        this.scheduleReconnect();
      }
    });

    this.ws.on("error", (err: Error) => {
      this.log(`ERROR: ${err.message}`);
    });
  }

  private handleRawMessage(raw: string) {
    let msg: GatewayMessage;
    try { msg = JSON.parse(raw); } catch { return; }

    // Skip heartbeat/tick/health events from logging
    if (msg.type === "event" && (msg.event === "heartbeat" || msg.event === "tick" || msg.event === "health")) {
      this.emit("event", msg);
      if (msg.event) {
        this.emit(msg.event, { payload: msg.payload, seq: msg.seq });
      }
      return;
    }

    const summary = raw.length > 300 ? raw.substring(0, 300) + "..." : raw;
    this.log(`← ${summary}`);

    // connect.challenge
    if (msg.type === "event" && msg.event === "connect.challenge") {
      const nonce = (msg.payload as any)?.nonce;
      if (typeof nonce === "string") {
        this.connectNonce = nonce;
      }
      if (!this.connectSent) {
        this.sendConnect();
      }
      return;
    }

    // response
    if (msg.type === "res") {
      const id = msg.id || "";
      const p = this.pending.get(id);
      if (p) {
        this.pending.delete(id);
        if (msg.ok) { p.resolve(msg.payload); }
        else { p.reject(new Error(msg.error?.message || "request failed")); }
      }
      return;
    }

    // events
    if (msg.type === "event") {
      this.emit("event", msg);
      if (msg.event) {
        this.emit(msg.event, { payload: msg.payload, seq: msg.seq });
      }
      // node.invoke.request
      if (msg.event === "node.invoke.request") {
        this.handleInvokeRequest(msg.payload);
      }
      return;
    }
  }

  // ─── Node connect (role=node, scopes=[]) ───

  private async sendConnect() {
    if (this.connectSent) return;
    this.connectSent = true;

    const clientId = "node-host";
    const clientMode = "node";
    const role = "node";
    const scopes: string[] = [];
    const signedAt = Date.now();
    const nonce = this.connectNonce || crypto.randomBytes(16).toString("hex");

    this.log(`sendConnect: clientId=${clientId}, mode=${clientMode}, nonce=${nonce.substring(0, 8)}...`);

    const params: any = {
      minProtocol: 4,
      maxProtocol: 4,
      client: {
        id: clientId,
        displayName: "OpenClaw VSCode",
        version: "0.0.1",
        platform: "vscode",
        deviceFamily: "desktop",
        modelIdentifier: "VSCode",
        mode: clientMode,
        instanceId: this.deviceIdentity?.deviceId || ""
      },
      caps: ["system"],
      commands: [
        "system.run.prepare",
        "system.run",
        "system.which",
        "system.execApprovals.get",
        "system.execApprovals.set"
      ],
      role,
      scopes,
      auth: this.token ? { token: this.token } : undefined
    };

    if (this.deviceIdentity && this.deviceKeyObject) {
      try {
        const messageToSign = this.buildSignMessage(
          nonce,
          this.deviceIdentity.deviceId,
          clientId, clientMode, role, scopes, signedAt, this.token
        );
        const signature = this.signMessage(messageToSign);
        params.device = {
          id: this.deviceIdentity.deviceId,
          publicKey: this.deviceIdentity.publicKey,
          signature,
          signedAt,
          nonce
        };
      } catch (err: any) {
        this.log(`ERROR: Signing failed: ${err}`);
      }
    } else {
      this.log("WARNING: No device identity, connecting without device auth");
    }

    try {
      this.log(`Sending connect (role=${role}, commands=${params.commands.join(",")})...`);
      const result = await this.request("connect", params);
      this._connected = true;
      this.reconnectDelay = 1000;
      this.log(`Connected as node: ${JSON.stringify(result).substring(0, 200)}`);
      this.emit("connected", result);
    } catch (err: any) {
      this.log(`ERROR: Connect failed: ${err.message}`);
      if (this.ws) { this.ws.close(4008, "connect failed"); }
    }
  }

  // ─── node.invoke.request handler ───

  private async handleInvokeRequest(payload: any) {
    if (!payload || typeof payload !== "object") return;
    const id = payload.id;
    const nodeId = payload.nodeId;
    const command = payload.command;
    if (!id || !nodeId || !command) return;

    let params: any = {};
    if (typeof payload.paramsJSON === "string") {
      try { params = JSON.parse(payload.paramsJSON); } catch {}
    } else if (payload.params) {
      params = payload.params;
    }

    this.log(`INVOKE: ${command} id=${id}`);

    try {
      const result = await this.executeCommand(command, params);
      await this.sendInvokeResult(id, nodeId, { ok: true, payload: result });
    } catch (err: any) {
      this.log(`INVOKE ERROR: ${command} → ${err.message}`);
      await this.sendInvokeResult(id, nodeId, {
        ok: false,
        error: { code: "COMMAND_ERROR", message: err.message }
      });
    }
  }

  private async sendInvokeResult(id: string, nodeId: string, result: { ok: boolean; payload?: any; error?: any }) {
    const params: any = { id, nodeId, ok: result.ok };
    if (result.ok && result.payload !== undefined) {
      params.payload = result.payload;
      params.payloadJSON = JSON.stringify(result.payload);
    } else if (!result.ok) {
      params.error = result.error;
    }
    await this.request("node.invoke.result", params);
  }

  // ─── Command execution ───

  private resolveCwd(cwd?: string): string {
    if (cwd) {
      // 统一路径分隔符
      const normalized = cwd.replace(/\\/g, "/");
      // Linux/macOS 绝对路径
      if (normalized.startsWith("/")) {
        try {
          const fs = require("fs");
          if (fs.existsSync(cwd)) return cwd;
        } catch {}
      }
      // Windows 绝对路径 (C:\...)
      if (/^[A-Za-z]:/.test(cwd)) {
        try {
          const fs = require("fs");
          if (fs.existsSync(cwd)) return cwd;
        } catch {}
      }
    }
    // 跨平台 HOME 目录
    const fallback = process.env.HOME || process.env.USERPROFILE || process.env.HOMEPATH || "/tmp";
    this.log(`CWD resolved: ${cwd || "(none)"} → ${fallback}`);
    return fallback;
  }

  private resolveCommand(params: any): string {
    // 优先使用 rawCommand（原始 shell 文本）
    const raw = params.rawCommand;
    if (raw && typeof raw === "string" && raw.trim()) return raw.trim();

    const cmd = params.command || params.cmd;
    if (!cmd) return "";

    if (Array.isArray(cmd)) {
      // Gateway (Linux) 发送 ["/bin/sh","-lc","command"] 或 ["sh","-c","command"]
      // Windows 节点可能收到 ["cmd","/c","command"] 或 ["powershell","-c","command"]
      if (cmd.length >= 3) {
        const shell = String(cmd[0] || "").toLowerCase();
        const flag = String(cmd[1] || "");
        const isUnixShell = shell.endsWith("/sh") || shell.endsWith("/bash") || shell === "sh" || shell === "bash";
        const isWinShell = shell === "cmd" || shell === "cmd.exe" || shell === "powershell" || shell === "pwsh";
        if ((flag === "-c" || flag === "-lc" || flag === "/c") && (isUnixShell || isWinShell)) {
          return cmd[2]; // 提取原始命令字符串
        }
      }
      return cmd.join(" ");
    }
    return String(cmd || "");
  }

  private async executeCommand(command: string, params: any): Promise<any> {
    switch (command) {
      case "system.run":
        return this.handleSystemRun(params);
      case "system.run.prepare":
        return this.handleSystemRunPrepare(params);
      case "system.which":
        return this.handleSystemWhich(params);
      case "system.execApprovals.get":
        return { approved: this.isCwdApproved(params.cwd || "") };
      case "system.execApprovals.set":
        if (params.approved && params.cwd) {
          this.alwaysApprovedCwds.add(params.cwd);
        }
        return { approved: true };
      default:
        throw new Error(`Unknown command: ${command}`);
    }
  }

  private handleSystemRunPrepare(params: any): Promise<any> {
    const cmd = params.command || params.rawCommand || "";
    const cwd = this.resolveCwd(params.cwd);
    const argv = typeof cmd === "string" ? cmd.split(/\s+/) : (Array.isArray(cmd) ? cmd : [cmd]);
    return Promise.resolve({
      argv,
      cwd,
      execPolicy: "allow",
      allowAlwaysCoverage: "full"
    });
  }

  private handleSystemWhich(params: any): Promise<any> {
    const { execSync } = require("child_process");
    const name = params.name || params.command;
    if (!name) return Promise.resolve({ found: false });
    try {
      const which = process.platform === "win32" ? "where" : "which";
      const result = execSync(`${which} ${name}`, { encoding: "utf-8", timeout: 5000, shell: true }).trim();
      return Promise.resolve({ found: true, path: result.split("\n")[0].trim() });
    } catch {
      return Promise.resolve({ found: false });
    }
  }

  private async promptForApproval(command: string, cwd: string): Promise<"allowOnce" | "alwaysAllow" | "deny"> {
    const vscode = require("vscode") as typeof import("vscode");
    const items = [
      { label: `$(check) ${vscode.l10n.t("Allow Once")}`, description: vscode.l10n.t("Allow this command to run one time"), result: "allowOnce" as const },
      { label: `$(shield) ${vscode.l10n.t("Always Allow")}`, description: vscode.l10n.t("Remember this command and always allow"), result: "alwaysAllow" as const },
      { label: `$(close) ${vscode.l10n.t("Deny")}`, description: vscode.l10n.t("Block this command from running"), result: "deny" as const }
    ];
    const selected = await vscode.window.showQuickPick(items, {
      placeHolder: `Command: ${command}\nDirectory: ${cwd}`,
      title: vscode.l10n.t("OpenClaw Node: Command Approval")
    } as any);
    return (selected as any)?.result || "deny";
  }

  private isCwdApproved(cwd: string): boolean {
    const normalized = cwd.replace(/\\/g, "/").replace(/\/+$/, "");
    for (const approved of this.alwaysApprovedCwds) {
      const normalizedApproved = approved.replace(/\\/g, "/").replace(/\/+$/, "");
      if (normalized === normalizedApproved || normalized.startsWith(normalizedApproved + "/")) {
        return true;
      }
    }
    return false;
  }

  private async handleSystemRun(params: any): Promise<any> {
    const cmdStr = this.resolveCommand(params);
    const cwd = this.resolveCwd(params.cwd);
    const timeoutMs = params.timeoutMs || params.timeout || 120000;

    if (!cmdStr) {
      throw new Error("No command specified");
    }

    this.log(`EXEC input: command=${JSON.stringify(params.command)} rawCommand=${JSON.stringify(params.rawCommand)} cwd=${JSON.stringify(params.cwd)} type=${typeof params.command}`);
    this.log(`EXEC: ${cmdStr} (cwd=${cwd}, timeout=${timeoutMs})`);

    // 检查 cwd 是否已 Always Allow（含子目录）
    if (!this.isCwdApproved(cwd)) {
      const decision = await this.promptForApproval(cmdStr, cwd);
      this.log(`EXEC approval: ${decision}`);
      if (decision === "deny") {
        return {
          stdout: "",
          stderr: "Command denied by user",
          exitCode: 1,
          success: false,
          timedOut: false,
          error: "Command denied by user"
        };
      }
      if (decision === "alwaysAllow") {
        this.alwaysApprovedCwds.add(cwd);
        this.log(`EXEC: Always Allow registered for cwd=${cwd}`);
      }
    }

    return new Promise((resolve, reject) => {
      const { exec } = require("child_process");
      // 根据平台和命令选择合适的 shell
      let shellOpt: string | boolean = true;
      if (process.platform === "win32") {
        const lower = cmdStr.toLowerCase().trim();
        if (lower.startsWith("powershell ") || lower.startsWith("pwsh ")) {
          shellOpt = "powershell.exe";
        } else if (lower.startsWith("wsl ")) {
          shellOpt = "wsl.exe";
        }
        // 默认使用 cmd.exe (shell: true)
      }
      const child = exec(cmdStr, {
        cwd,
        timeout: timeoutMs,
        maxBuffer: 1024 * 1024 * 10,
        env: { ...process.env, ...params.env },
        shell: shellOpt
      }, (error: any, stdout: string, stderr: string) => {
        const hasOutput = !!(stdout || "").trim();
        if (error && error.killed) {
          resolve({
            stdout: stdout || "",
            stderr: stderr || "",
            exitCode: -1,
            success: false,
            timedOut: true,
            error: "Command timed out"
          });
        } else if (error && !hasOutput) {
          resolve({
            stdout: stdout || "",
            stderr: stderr || "",
            exitCode: error.code || 1,
            success: false,
            timedOut: false,
            error: error.message || ""
          });
        } else {
          // 有 stdout 输出时，视为成功（Windows dir 等命令可能返回非零退出码但有正常输出）
          resolve({
            stdout: stdout || "",
            stderr: stderr || "",
            exitCode: 0,
            success: true,
            timedOut: false,
            error: null
          });
        }
      });

      child.on("error", (err: Error) => {
        reject(err);
      });
    });
  }

  // ─── Helpers ───

  private buildSignMessage(
    nonce: string | null, deviceId: string, clientId: string,
    clientMode: string, role: string, scopes: string[],
    signedAtMs: number, token?: string
  ): string {
    const version = nonce ? "v2" : "v1";
    const parts = [
      version, deviceId, clientId, clientMode, role,
      scopes.join(","), String(signedAtMs), token || ""
    ];
    if (version === "v2") { parts.push(nonce || ""); }
    return parts.join("|");
  }

  private signMessage(message: string): string {
    if (!this.deviceKeyObject) throw new Error("Key not initialized");
    const data = Buffer.from(message, "utf-8");
    const signature = crypto.sign(null, data, this.deviceKeyObject);
    return base64UrlEncode(signature);
  }

  private async request(method: string, params: any = {}, timeoutMs = 60000): Promise<any> {
    if (!this.ws || this.ws.readyState !== WebSocket.WebSocket.OPEN) {
      throw new Error("not connected");
    }
    return new Promise((resolve, reject) => {
      const id = Math.random().toString(36).substring(2, 12);
      this.pending.set(id, { resolve, reject });
      const msg = { type: "req", id, method, params };
      this.ws!.send(JSON.stringify(msg));
      setTimeout(() => {
        if (this.pending.has(id)) {
          this.pending.delete(id);
          reject(new Error(`Request timed out: ${method}`));
        }
      }, timeoutMs);
    });
  }

  private scheduleReconnect() {
    if (this.reconnectTimer || this.closed) return;
    this.log(`Reconnecting in ${this.reconnectDelay}ms...`);
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, this.reconnectDelay);
    this.reconnectDelay = Math.min(this.reconnectDelay * 1.5, this.maxReconnectDelay);
  }

  disconnect() {
    this.closed = true;
    if (this.reconnectTimer) { clearTimeout(this.reconnectTimer); this.reconnectTimer = null; }
    if (this.connectTimer) { clearTimeout(this.connectTimer); this.connectTimer = null; }
    if (this.ws) { try { this.ws.close(); } catch {} this.ws = null; }
    this._connected = false;
  }
}

// ─── Utility ───

function base64UrlEncode(buffer: Buffer | ArrayBuffer | Uint8Array): string {
  let buf: Buffer;
  if (Buffer.isBuffer(buffer)) {
    buf = buffer;
  } else if (buffer instanceof Uint8Array) {
    buf = Buffer.from(buffer.buffer, buffer.byteOffset, buffer.byteLength);
  } else {
    buf = Buffer.from(buffer);
  }
  return buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlDecode(str: string): Buffer {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) base64 += "=";
  return Buffer.from(base64, "base64");
}
