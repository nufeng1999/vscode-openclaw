/**
 * ModelScope 相关类型定义
 * 从 webviewHandler.ts 迁移而来
 */

export interface ModelScopeAgentItem {
  id: string;
  name: string;
  display_name: string;
  description: string;
  categories: string[];
  custom_tags: string[];
  framework: string;
  downloads: number;
  likes: number;
  logo_url: string;
}

export interface ModelScopeAgentListResponse {
  Code: number;
  Message: string;
  Success: boolean;
  Data: {
    AgentList: Record<string, unknown>[];
    TotalCount: number;
  };
}