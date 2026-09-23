import * as vscode from 'vscode';
import { OpenClawGateway } from './gateway';

/**
 * 任务管理相关方法
 * 设计模式与 agentTree.ts 一致：以 chatView 实例为第一个参数导出独立函数
 * ChatViewLike 为结构化类型（鸭子类型），避免在 taskManager.ts 中引入循环依赖
 */
export interface ChatViewLike {
  gateway: OpenClawGateway;
  log: (msg: string) => void;
  postToWebview: (msg: any) => void;
  agents: any[];
  activeAgent: { id: string };
  extractHistoryContent: (content: any) => Promise<string>;
  buildRemoteMediaTag: (url: string) => Promise<string>;
  buildAttachments: (fileRefs?: string[]) => Promise<any[]>;
  sendContinueMessage: () => Promise<void>;
  resolveActiveAgent: () => void;
}

export async function handleRequestTasks(cv: ChatViewLike) {
  cv.log(`handleRequestTasks called`);
  try {
    // 获取活跃任务（通过 status 过滤 pending/running 不被接受，改为获取全部后前端过滤）
    const res = await cv.gateway.request("tasks.list", {
      limit: 50
    });
    // 全部任务按创建/更新时间倒序，取最近 50 条（含 completed/failed），前端据实渲染
    const allTasks = res?.tasks || [];
    const recentTasks = [...allTasks]
      .sort((a: any, b: any) => (b.createdAt || b.updatedAt || 0) - (a.createdAt || a.updatedAt || 0))
      .slice(0, 50);
    cv.log(`tasks.list: ${recentTasks.length} 条 (总 ${allTasks.length} 条)`);
    cv.postToWebview({ type: "tasksList", tasks: recentTasks });
  } catch (err: any) {
    cv.log(`tasks.list error: ${err.message}`);
    cv.postToWebview({ type: "tasksList", tasks: [] });
  }
}

export async function handleRequestModels(cv: ChatViewLike) {
  cv.log(`handleRequestModels called`);
  try {
    const res = await cv.gateway.request("models.list", {});
    const models = res?.models || [];
    cv.log(`models.list: ${models.length} models`);
    cv.postToWebview({ type: "modelsList", models });
  } catch (err: any) {
    cv.log(`models.list error: ${err.message}`);
    cv.postToWebview({ type: "modelsList", models: [] });
  }
}

export async function handleRequestAgents(cv: ChatViewLike) {
  cv.log(`handleRequestAgents called`);
  try {
    const res = await cv.gateway.request("agents.list", {});
    const agents = res?.agents || [];
    if (agents.length === 0) agents.push({ id: "main", name: "Agent" });
    cv.agents = agents;  // 同步到 chatView 实例
    cv.log(`agents.list: ${agents.length} agents`);
    cv.postToWebview({ type: "agentsList", agents });
    cv.postToWebview({ type: "agentSwitched", agent: cv.activeAgent });
    // 同步 activeAgent 解析（与原 chatView 行为等价）
    if (typeof cv.resolveActiveAgent === "function") cv.resolveActiveAgent();
  } catch (err: any) {
    cv.log(`agents.list error: ${err.message}`);
    cv.postToWebview({ type: "agentsList", agents: [] });
  }
}