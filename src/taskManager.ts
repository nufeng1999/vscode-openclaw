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
}

export async function handleRequestTasks(cv: ChatViewLike) {
  cv.log(`handleRequestTasks called`);
  try {
    // 获取活跃任务（通过 status 过滤 pending/running 不被接受，改为获取全部后前端过滤）
    const res = await cv.gateway.request("tasks.list", {
      limit: 500
    });
    // 后端过滤：只保留 queued 和 running 状态的任务
    const allTasks = res?.tasks || [];
    
    const activeTasks = allTasks.filter((t: any) => t.status === "queued" || t.status === "running");
    cv.log(`tasks.list: ${activeTasks.length} 条 (总 ${allTasks.length} 条)`);
    cv.postToWebview({ type: "tasksList", tasks: activeTasks });
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
  } catch (err: any) {
    cv.log(`agents.list error: ${err.message}`);
    cv.postToWebview({ type: "agentsList", agents: [] });
  }
}