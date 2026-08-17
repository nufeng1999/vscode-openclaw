import * as WebSocket from "ws";
import { EventEmitter } from "events";
import * as crypto from "crypto";
import type { OutputChannel } from "vscode";

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
          this.sendConnect();
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

    const summary = raw.length > 200 ? raw.substring(0, 200) + "..." : raw;
    this.log(`← ${summary}`);

    if (msg.type === "event" && msg.event === "connect.challenge") {
      const nonce = (msg.payload as any)?.nonce;
      this.log(`Challenge received, nonce=${nonce ? nonce.substring(0, 8) + "..." : "none"}`);
      if (typeof nonce === "string") {
        this.connectNonce = nonce;
      }
      if (!this.connectSent) {
        this.log("Sending connect (v2, with nonce)...");
        this.sendConnect();
      }
      return;
    }

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

    if (msg.type === "event") {
      this.log(`EVENT: ${msg.event} seq=${msg.seq}`);
      this.emit("event", msg);
      if (msg.event) {
        this.emit(msg.event, { payload: msg.payload, seq: msg.seq });
      }
      return;
    }
  }

  private async sendConnect() {
    if (this.connectSent) return;
    this.connectSent = true;

    const clientId = "gateway-client";
    const clientMode = "ui";
    const role = "operator";
    const scopes = ["operator.admin", "operator.write", "operator.read"];
    const signedAt = Date.now();

    const params: any = {
      minProtocol: 4,
      maxProtocol: 4,
      client: {
        id: clientId,
        version: "0.1.0",
        platform: "vscode",
        mode: clientMode
      },
      role,
      scopes,
      auth: this.token ? { token: this.token } : undefined,
      caps: ["tool-events"]
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
      this.log("Sending connect request...");
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

  async request(method: string, params: any = {}): Promise<any> {
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
      }, 30000);
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

  private genId(): string {
    return Math.random().toString(36).substring(2, 12);
  }
}

function base64UrlEncode(buffer: Buffer | ArrayBuffer | Uint8Array): string {
  const buf = Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer);
  return buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlDecode(str: string): Buffer {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) base64 += "=";
  return Buffer.from(base64, "base64");
}
