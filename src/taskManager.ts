import * as vscode from 'vscode';
import { OpenClawGateway } from './gateway';

/**
 * 任务管理相关方法
 * 设计模式与 agentTree.ts 一致：以 chatView 实例为第一个参数导出独立函数
 * ChatViewLike 为结构化类型（鸭子类型），避免在 taskManager.ts 中引入循环依赖
 *
 * 注意：Gateway WS 协议中不存在 tasks.list 方法，实际使用 sessions.list（activeOnly:true）获取运行中的会话。
 * tasksList webview 消息类型保留不变，仅内部请求方法名调整。
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
    // Gateway WS 协议无 tasks.list；改用 sessions.list(activeOnly:true) 获取当前运行的会话/任务
    const res = await cv.gateway.request("sessions.list", {
      activeOnly: true,
      limit: 200
    });
    const sessions: any[] = res?.sessions || [];
    // 只保留运行中状态的任务（status === 'running'）
    const runningTasks = sessions.filter((s: any) => s.status === 'running');
    // 将会话映射为渲染期望的任务行格式
    const tasks = runningTasks.map(session => ({
      // 标题：优先使用 displayName，然后是 label，然后是 device-info 中的 device-name，最后使用 key
      label: session.displayName || session.label || session['device-info']?.['device-name'] || session.key || '',
      // 任务描述：与标题相同或可从其他字段推导
      task: session.displayName || session.label || session['device-info']?.['device-name'] || session.key || '',
      // 来源ID：用于显示名称的后备选项
      sourceId: session.key || '',
      // 任务ID：用于取消按钮和显示
      id: session.sessionId || session.id || session.key || '',
      taskId: session.sessionId || session.id || session.key || '',
      // 运行状态
      status: session.status,
      // 运行类型
      runtime: session.runtime || session.mode || '',
      // 智能体ID
      agentId: session.agentId,
      // 时间戳
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
      endedAt: session.endedAt,
      // 摘要字段（如果可用）
      terminalSummary: session.terminalSummary,
      progressSummary: session.progressSummary
    }));
    // 按创建/更新时间倒序排序
    const sortedTasks = [...tasks]
      .sort((a: any, b: any) => (b.createdAt || b.updatedAt || 0) - (a.createdAt || a.updatedAt || 0))
      .slice(0, 200);
    cv.log(`sessions.list: ${sortedTasks.length} 条 (运行中)`);
    cv.postToWebview({ type: "tasksList", tasks: sortedTasks });
  } catch (err: any) {
    cv.log(`sessions.list error: ${err.message}`);
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
    // Gateway WS 协议目前无 tasks.cancel；此处先保留原有逻辑，日志标记待确认
    cv.log(`tasks.cancel result: ${JSON.stringify(res)}`);
    // 成功取消后向webview回传结果
    cv.postToWebview({ type: "requestCancelTaskResult", ok: true, taskId, message: "Task cancelled" });
    // 取消后刷新任务列表
    await handleRequestTasks(cv);
    return res;
  } catch (err: any) {
    cv.log(`tasks.cancel error (method may be unimplemented in gateway): ${err.message}`);
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