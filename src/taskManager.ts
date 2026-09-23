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
    // 获取所有任务（包括运行中、已完成、失败等）
    const res = await cv.gateway.request("tasks.list", {
      limit: 200
    });
    const allTasks = res?.tasks || [];
    // 按创建/更新时间倒序排序
    const sortedTasks = [...allTasks]
      .sort((a: any, b: any) => (b.createdAt || b.updatedAt || 0) - (a.createdAt || a.updatedAt || 0))
      .slice(0, 200);
    cv.log(`tasks.list: ${sortedTasks.length} 条 (运行中 ${sortedTasks.filter(t => t.status === 'running').length} / 总 ${allTasks.length} 条)`);
    cv.postToWebview({ type: "tasksList", tasks: sortedTasks });
  } catch (err: any) {
    cv.log(`tasks.list error: ${err.message}`);
    cv.postToWebview({ type: "tasksList", tasks: [] });
  }
}

export async function handleRequestCancelTask(cv: ChatViewLike, taskId: string) {
  cv.log(`handleRequestCancelTask called for taskId: ${taskId}`);
  try {
    // 调用后端取消任务接口
    const res = await cv.gateway.request("tasks.cancel", {
      taskId: taskId
    });
    cv.log(`tasks.cancel result: ${JSON.stringify(res)}`);
    // 成功取消后向webview回传结果
    cv.postToWebview({ type: "requestCancelTaskResult", ok: true, taskId, message: "Task cancelled" });
    // 取消后刷新任务列表
    await handleRequestTasks(cv);
    return res;
  } catch (err: any) {
    cv.log(`tasks.cancel error: ${err.message}`);
    // 失败时向webview回传结果
    cv.postToWebview({ type: "requestCancelTaskResult", ok: false, taskId, message: `Cancel failed: ${err.message}` });
    // 不再抛出错误，避免未捕获的promise rejection
    return;
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