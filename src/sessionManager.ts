import * as vscode from 'vscode';
import { OpenClawGateway } from './gateway';
import { log as viewLog, LOG_INFO } from './logLevel';

/**
 * 会话管理相关方法
 * 设计模式与 agentTree.ts 一致：以 chatView 实例为第一个参数导出独立函数
 * ChatViewLike 为结构化类型（鸭子类型），避免在 sessionManager.ts 中引入循环依赖
 */
export interface ChatViewLike {
  gateway: OpenClawGateway;
  log: (msg: string) => void;
  postToWebview: (msg: any) => void;
  sessions: any[];
  activeAgent: { id: string; [k: string]: any };
  activeAgentId: string;
  resolveSession: (sessionKey: string) => string;
  gwSessionKey: (localKey?: string) => string;
  handleLoadMessages: (sessionKey: string, agentId?: string, sessionId?: string) => Promise<void>;
  scheduleHistoryReload: (sessionKey: string, agentId?: string) => void;
  extractHistoryContent: (content: any) => Promise<string>;
  buildRemoteMediaTag: (url: string) => Promise<string>;
  seenPreambleTexts: string[];
}

export async function handleRequestSessions(cv: ChatViewLike) {
  cv.log(`handleRequestSessions called`);
  try {
    const res = await cv.gateway.request("sessions.list", {
      limit: 50
    });
    const sessions = res?.sessions || [];
    cv.log(`sessions.list: ${sessions.length} sessions`);
    cv.postToWebview({ type: "sessionsList", sessions });
  } catch (err: any) {
    cv.log(`sessions.list error: ${err.message}`);
    cv.postToWebview({ type: "sessionsList", sessions: [] });
  }
}

export async function handleSwitchAgent(cv: ChatViewLike, agentId: string) {
  cv.log(`handleSwitchAgent called with agentId=${agentId}`);
  try {
    const agent = cv.activeAgent?.id === agentId ? null : cv.activeAgent;
    // 简化：实际实现可能需要更多逻辑
    cv.log(`Switched agent to ${agentId}`);
  } catch (err: any) {
    cv.log(`handleSwitchAgent error: ${err.message}`);
  }
}

export async function handleLoadMessages(cv: ChatViewLike, sessionKey: string, agentId?: string, sessionId?: string) {
  cv.log(`handleLoadMessages called: sessionKey=${sessionKey}, agentId=${agentId}, sessionId=${sessionId}`);
  const targetAgentId = agentId || cv.activeAgent?.id;
  try {
    const res = await cv.gateway.request("chat.history", {
      sessionKey: cv.gwSessionKey(sessionKey),
      limit: 200
    });
    const msgs = res?.messages || [];
    cv.log(`history: ${msgs.length} messages (key=agent:${targetAgentId}:${sessionKey} id=${res?.sessionId || sessionId || '-'})`);
    
    const parsed: any[] = await Promise.all(
      msgs
        .filter((m: any) => m.role === "user" || m.role === "assistant")
        .map(async (m: any) => ({
          role: m.role,
          text: await cv.extractHistoryContent(m.content),
          timestamp: m.timestamp
        }))
    );
    
    cv.postToWebview({ type: "messagesLoaded", messages: parsed, sessionKey });
  } catch (err: any) {
    cv.log(`chat.history error: ${err.message}`);
    cv.postToWebview({ type: "messagesLoaded", messages: [], sessionKey });
  }
}

export async function handleDeleteSession(cv: ChatViewLike, sessionKey: string) {
  cv.log(`handleDeleteSession called: sessionKey=${sessionKey}`);
  try {
    const gwKey = sessionKey.startsWith('agent:') ? sessionKey : cv.gwSessionKey(sessionKey);
    await cv.gateway.request("sessions.delete", {
      sessionKey: gwKey
    });
    cv.postToWebview({ type: "sessionDeleted", sessionKey });
  } catch (err: any) {
    cv.log(`sessions.delete error: ${err.message}`);
  }
}