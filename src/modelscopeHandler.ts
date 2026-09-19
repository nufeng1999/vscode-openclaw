import * as vscode from "vscode";
import { ModelScopeAgentItem, ModelScopeAgentListResponse } from "./modelscopeTypes";

/**
 * ModelScope 智能体处理器（Extension Host 侧）
 * 从 webviewHandler.ts 迁移而来
 */

/**
 * 获取 ModelScope 智能体列表
 * @param ctx 上下文对象，包含 postToWebview 和 log 函数
 * @param page 页码
 * @param pageSize 每页数量
 * @param category 英文分类名（如 'finance'），空/undefined = 全部
 */
export async function handleFetchModelscopeAgents(
  ctx: { postToWebview: (msg: any) => void; log: (msg: string) => void },
  page: number,
  pageSize: number,
  category?: string
): Promise<void> {
  try {
    console.log('[MS-H] handleFetchModelscopeAgents called, page:', page, 'pageSize:', pageSize, 'category:', category);
    // 直接请求对应页码，不再循环拉取全量
    const url = `https://modelscope.cn/api/v1/dolphin/agents`;
    const criterion = category ? [{
      Category: 'Catalogues',
      Predicate: 'contains',
      StringValues: [category]
    }] : [];
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'https://modelscope.cn',
        'Referer': `https://modelscope.cn/agents?page=${page}`,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      body: JSON.stringify({
        PageSize: pageSize,
        PageNumber: page,
        Query: '',
        Sort: 'Default',
        Criterion: criterion,
        WithTopCollection: false
      })
    });
    console.log('[MS-H] API response status:', response.status, 'page:', page);
    const data = (await response.json()) as ModelScopeAgentListResponse;
    if (!data.Success || !data.Data || !Array.isArray(data.Data.AgentList)) {
      ctx.postToWebview({ type: "modelscopeAgentsError", error: String(data.Message || "请求失败") });
      return;
    }
    const apiTotalCount = data.Data.TotalCount;
    const batch: ModelScopeAgentItem[] = data.Data.AgentList.map((raw: Record<string, unknown>) => {
      const name = String(raw.Name || "");
      const path = String(raw.Path || "");
      // 完整 ID = Path/Name（如 ms-agent/yijing_divination_agent），用于拼接详情页 URL
      const fullId = path && name ? path + "/" + name : name;
      return {
        id: fullId,
        name: name,
        display_name: String(raw.DisplayName || raw.Name || ""),
        description: String(raw.Description || ""),
        categories: Array.isArray(raw.Catalogues) ? raw.Catalogues : [],
        custom_tags: Array.isArray(raw.CustomTags) ? raw.CustomTags : [],
        framework: String(raw.Framework || ""),
        downloads: Number(raw.Downloads || 0),
        likes: Number(raw.Stars || 0),
        logo_url: String(raw.LogoUrl || "")
      };
    });
    // 服务端已按 pageSize 返回数据，直接使用全部结果（避免多余截断）
    const agents = batch;
    console.log('[MS-H] Posting result, agents count:', agents.length, 'apiTotalCount:', apiTotalCount);
    ctx.postToWebview({
      type: "modelscopeAgentsResult",
      agents: agents,
      totalCount: apiTotalCount,
      page: page,
      pageSize: pageSize
    });
  } catch (error) {
    ctx.postToWebview({
      type: "modelscopeAgentsError",
      error: error instanceof Error ? error.message : "网络错误"
    });
  }
}

/**
 * 在浏览器中打开 ModelScope 智能体详情页
 * @param agentId 智能体 ID
 */
export function openModelscopeAgent(agentId: string): void {
  vscode.env.openExternal(vscode.Uri.parse("https://modelscope.cn/agents/" + agentId));
}