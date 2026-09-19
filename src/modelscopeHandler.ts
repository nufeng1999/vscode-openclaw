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
 */
export async function handleFetchModelscopeAgents(
  ctx: { postToWebview: (msg: any) => void; log: (msg: string) => void },
  page: number,
  pageSize: number
): Promise<void> {
  try {
    console.log('[MS-H] handleFetchModelscopeAgents called, page:', page, 'pageSize:', pageSize);
    const url = "https://modelscope.cn/api/v1/agents?PageNumber=" + page + "&PageSize=" + pageSize;
    const response = await fetch(url);
    console.log('[MS-H] API response status:', response.status);
    const data = (await response.json()) as ModelScopeAgentListResponse;
    if (data.Success && data.Data && Array.isArray(data.Data.AgentList)) {
      const agents: ModelScopeAgentItem[] = data.Data.AgentList.map((raw: Record<string, unknown>) => {
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
      console.log('[MS-H] Posting result, agents count:', agents.length);
      ctx.postToWebview({
        type: "modelscopeAgentsResult",
        agents: agents,
        totalCount: Number(data.Data.TotalCount || 0),
        page: page,
        pageSize: pageSize
      });
    } else {
      ctx.postToWebview({ type: "modelscopeAgentsError", error: String(data.Message || "请求失败") });
    }
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