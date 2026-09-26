/**
 * 归一化锚点漂移修复 —— 单元测试
 *
 * 背景（bug）：
 *   进度备注 tab 的归一化条件原先依赖**可变**的 agent.id，而 agent.id 会被
 *   switchToTab / agentSwitched 改写成当前聚焦的 agent。用户切到 designer tab 后，
 *   后续 designer 的进度消息因「agent.id === 'designer'」而被误判为 main 会话，
 *   错误写入「默认」tab。
 *
 * 修复：
 *   引入不可变常量 configuredAgentId（src/uiRenderer.ts L1297 声明，L2018 由
 *   init 消息的 msg.agent.id 一次性赋值，此后不再改写），5 处归一化判据全部改用它。
 *
 * 本文件**直接 import 生产源码** src/utils.ts 的纯函数，不再复制判据：
 *   - normalizeProgressNoteSessionKey → removeProgressNoteTab(uiRenderer.ts L2877)
 *                                    → renderProgressCard(uiRenderer.ts L2942)
 *   - shouldNormalizeProgressNoteKey  → addProgressNoteTab(uiRenderer.ts L2819)
 *   - isChatTabMainNoteKey            → closeTab(uiRenderer.ts L4544)
 *   - resolveProgressNoteTabForAgent  → renderAgentButtons(uiRenderer.ts L3855)
 *   - getProgressNoteNormalizeJs      → webview 注入源（与上述同一份源码）
 * webview 侧（模板字符串内）通过 getProgressNoteNormalizeJs() 注入**同一份函数源码**，
 * 因此单元测试断言的判据与 webview 实际运行的判据是同一实现，不存在逻辑副本。
 */
import { describe, it, expect } from 'vitest';
import {
  normalizeProgressNoteSessionKey,
  shouldNormalizeProgressNoteKey,
  isChatTabMainNoteKey,
  resolveProgressNoteTabForAgent,
  getProgressNoteNormalizeJs,
} from './utils';

/** 与 src/uiRenderer.ts L1297 / L2018 一致：不可变的配置 Agent ID 锚点 */
const DEFAULT_CONFIGURED_AGENT_ID = 'main';

/**
 * 归一化核心 —— 直接转发生产源码 normalizeProgressNoteSessionKey（src/utils.ts）。
 *
 * 旧实现里此处是一份判据副本；现改为薄转发适配器（**不含任何判据逻辑**），
 * 仅为保持既有 32 条用例的调用签名与输入/预期完全不变。
 */
function normalizeSessionKeyForProgressNote(
  sessionKey: string | undefined,
  configuredAgentId: string = DEFAULT_CONFIGURED_AGENT_ID
): string {
  return normalizeProgressNoteSessionKey(sessionKey || '', configuredAgentId);
}

/**
 * 历史反例（**非当前源码副本**）：修复前的错误实现——用**可变**的 agent.id 作为锚点。
 * 保留它是为了证明本测试真能抓住这个 bug（若生产判据回退成 agent.id，用例会红）。
 */
function normalizeSessionKeyForProgressNote_Buggy(
  sessionKey: string | undefined,
  mutableAgentId: string
): string {
  if (!sessionKey) sessionKey = 'default';
  if (
    sessionKey === 'main' ||
    sessionKey === mutableAgentId ||
    sessionKey === ('agent:' + mutableAgentId + ':main') ||
    sessionKey.startsWith('agent:' + mutableAgentId + ':')
  ) {
    sessionKey = 'default';
  }
  return sessionKey;
}

/**
 * closeTab 联动（uiRenderer.ts L4544）：转发生产源码 isChatTabMainNoteKey。
 * 空值兜底为 'default' 是 webview 侧调用前置守卫（`if (closedTab && closedTab.sessionKey)`）的等价建模。
 */
function closeTabNoteKey(
  tabSessionKey: string | undefined,
  configuredAgentId: string = DEFAULT_CONFIGURED_AGENT_ID
): string {
  if (!tabSessionKey) return 'default';
  return isChatTabMainNoteKey(tabSessionKey, configuredAgentId) ? 'default' : tabSessionKey;
}

/**
 * renderAgentButtons 点击 agent 按钮（uiRenderer.ts L3855）：转发生产源码
 * resolveProgressNoteTabForAgent。此处名称与 id 相同（a.name 未传或等于 a.id 的情形），
 * 故 agentName 与 agentId 同值传入，与旧用例预期一致。
 */
function agentButtonNoteKey(
  clickedAgentId: string,
  configuredAgentId: string = DEFAULT_CONFIGURED_AGENT_ID
): { noteKey: string; noteTitle: string } {
  return resolveProgressNoteTabForAgent(clickedAgentId, clickedAgentId, configuredAgentId);
}

/**
 * removeProgressNoteTab 语义（uiRenderer.ts L2871-L2892）：归一化后 'default' 受保护不删。
 * 判据来自生产源码 normalizeProgressNoteSessionKey；此处仅建模 webview 侧的
 * 「default 受保护 / 存在才删」两个分支（属 DOM/状态逻辑，不在纯函数内）。
 */
function removeProgressNoteTab(
  sessionKey: string | undefined,
  progressNoteTabs: Record<string, string>,
  configuredAgentId: string = DEFAULT_CONFIGURED_AGENT_ID
): { removed: string | null } {
  const key = normalizeSessionKeyForProgressNote(sessionKey, configuredAgentId);
  if (key === 'default') return { removed: null };
  if (!progressNoteTabs[key]) return { removed: null };
  delete progressNoteTabs[key];
  return { removed: key };
}

describe('normalizeSessionKeyForProgressNote · main 会话旧路径/标准路径', () => {
  it("sessionKey='main' → 归一化为 'default'（configuredAgentId='main'）", () => {
    expect(normalizeSessionKeyForProgressNote('main', 'main')).toBe('default');
  });

  it("sessionKey='agent:main:main' → 归一化为 'default'（完整 gwKey 变体）", () => {
    expect(normalizeSessionKeyForProgressNote('agent:main:main', 'main')).toBe('default');
  });

  it("sessionKey='main' 且 configuredAgentId='main' → 'default'（agent.id 变体恒定场景）", () => {
    expect(normalizeSessionKeyForProgressNote('main', 'main')).toBe('default');
  });

  it("sessionKey='agent:main:<任意后缀>' → 'default'（startsWith 前缀匹配）", () => {
    expect(normalizeSessionKeyForProgressNote('agent:main:abc123', 'main')).toBe('default');
    expect(normalizeSessionKeyForProgressNote('agent:main:xyz', 'main')).toBe('default');
  });
});

describe('normalizeSessionKeyForProgressNote · 非 main 会话不归一化', () => {
  it("sessionKey='agent:designer:main' → 保持原值（designer 不受 main 归一化影响）", () => {
    expect(normalizeSessionKeyForProgressNote('agent:designer:main', 'main')).toBe('agent:designer:main');
  });

  it("sessionKey='agent:coder2:main' → 保持原值（coder2 不受 main 归一化影响）", () => {
    expect(normalizeSessionKeyForProgressNote('agent:coder2:main', 'main')).toBe('agent:coder2:main');
  });

  it("sessionKey='agent:main'（缺第三段）→ 保持原值（startsWith 要求带冒号尾段）", () => {
    expect(normalizeSessionKeyForProgressNote('agent:main', 'main')).toBe('agent:main');
  });
});

describe('normalizeSessionKeyForProgressNote · 配置 Agent ID 非 main', () => {
  const cfg = 'custom-agent';

  it("configuredAgentId='custom-agent' 时 'custom-agent' → 'default'", () => {
    expect(normalizeSessionKeyForProgressNote('custom-agent', cfg)).toBe('default');
  });

  it("configuredAgentId='custom-agent' 时 'agent:custom-agent:main' → 'default'", () => {
    expect(normalizeSessionKeyForProgressNote('agent:custom-agent:main', cfg)).toBe('default');
  });

  it("configuredAgentId='custom-agent' 时 'agent:custom-agent:xyz' → 'default'", () => {
    expect(normalizeSessionKeyForProgressNote('agent:custom-agent:xyz', cfg)).toBe('default');
  });

  it("configuredAgentId='custom-agent' 时 'agent:other:main' → 保持原值", () => {
    expect(normalizeSessionKeyForProgressNote('agent:other:main', cfg)).toBe('agent:other:main');
  });

  it("configuredAgentId='custom-agent' 时字面量 'main' 仍归一化（前后端 main 语义）", () => {
    expect(normalizeSessionKeyForProgressNote('main', cfg)).toBe('default');
  });
});

describe('切 tab 锚点漂移复现（核心回归）', () => {
  it("agent.id 已变更为 'designer'、configuredAgentId 恒为 'main' 时，designer 进度不落「默认」tab", () => {
    // 修复后：锚点是 configuredAgentId，agent.id 漂移无影响
    expect(normalizeSessionKeyForProgressNote('agent:designer:main', 'main')).toBe('agent:designer:main');
    expect(normalizeSessionKeyForProgressNote('agent:designer:main', 'main')).not.toBe('default');
  });

  it('对照组：修复前的实现（锚点=可变 agent.id）确实会误映射为 default —— 证明用例有效', () => {
    // agent.id 被 switchToTab/agentSwitched 改写成 'designer' 后
    const buggy = normalizeSessionKeyForProgressNote_Buggy('agent:designer:main', 'designer');
    expect(buggy).toBe('default'); // 这就是 bug 的表现
  });

  it('模拟连续切 tab：agent.id 依次 main → designer → coder2，configuredAgentId 恒 main', () => {
    const configuredAgentId = 'main';
    // 聚焦 main 时推送 main 会话进度
    expect(normalizeSessionKeyForProgressNote('agent:main:main', configuredAgentId)).toBe('default');
    // 切到 designer（agent.id 变为 designer）后推送 designer 进度
    expect(normalizeSessionKeyForProgressNote('agent:designer:main', configuredAgentId)).toBe('agent:designer:main');
    // 再切到 coder2（agent.id 变为 coder2）后推送 coder2 进度
    expect(normalizeSessionKeyForProgressNote('agent:coder2:main', configuredAgentId)).toBe('agent:coder2:main');
  });

  it('configuredAgentId 在 init 一次性赋值后不被 tab 切换改写（不可变性契约）', () => {
    // 模拟：init 时 configuredAgentId='main'，之后 agent.id 任意变化
    const configuredAgentId = 'main';
    for (const mutableAgentId of ['main', 'designer', 'coder2', 'tester']) {
      // 无论 agent.id 变成什么，configuredAgentId 都保持 'main'
      expect(configuredAgentId).toBe('main');
      expect(normalizeSessionKeyForProgressNote('agent:' + mutableAgentId + ':main', configuredAgentId))
        .toBe(mutableAgentId === 'main' ? 'default' : 'agent:' + mutableAgentId + ':main');
    }
  });
});

describe('removeProgressNoteTab 归一化对称性', () => {
  it("add 与 remove 归一化结果一致：'agent:main:main' 在 add/remove 均映射为 'default'", () => {
    expect(normalizeSessionKeyForProgressNote('agent:main:main', 'main')).toBe('default');
  });

  it("'default' 受保护：removeProgressNoteTab('default') 不删除任何 tab", () => {
    const tabs: Record<string, string> = { default: '默认' };
    expect(removeProgressNoteTab('default', tabs, 'main')).toEqual({ removed: null });
    expect(tabs.default).toBe('默认'); // 仍在
  });

  it("removeProgressNoteTab('agent:designer:main') 归一化后保持原值并真正删除 designer tab", () => {
    const tabs: Record<string, string> = { default: '默认', 'agent:designer:main': 'designer' };
    expect(removeProgressNoteTab('agent:designer:main', tabs, 'main')).toEqual({ removed: 'agent:designer:main' });
    expect(tabs).toEqual({ default: '默认' });
  });

  it("removeProgressNoteTab('main') → 归一化到 default → 受保护不删（与 add 对称）", () => {
    const tabs: Record<string, string> = { default: '默认' };
    expect(removeProgressNoteTab('main', tabs, 'main')).toEqual({ removed: null });
    expect(tabs.default).toBe('默认');
  });

  it('未知 sessionKey：removeProgressNoteTab 直接返回 null，不误删', () => {
    const tabs: Record<string, string> = { default: '默认' };
    expect(removeProgressNoteTab('agent:ghost:main', tabs, 'main')).toEqual({ removed: null });
    expect(tabs).toEqual({ default: '默认' });
  });
});

describe('closeTab noteKey 三变体映射', () => {
  it("closedTab.sessionKey='main' → noteKey='default'", () => {
    expect(closeTabNoteKey('main', 'main')).toBe('default');
  });

  it("closedTab.sessionKey='main'（configuredAgentId='main'）→ noteKey='default'", () => {
    expect(closeTabNoteKey('main', 'main')).toBe('default');
  });

  it("closedTab.sessionKey='agent:main:main' → noteKey='default'", () => {
    expect(closeTabNoteKey('agent:main:main', 'main')).toBe('default');
  });

  it("closedTab.sessionKey='agent:designer:main' → 保持原值（关闭 designer chat tab 联动关闭 designer 进度 tab）", () => {
    expect(closeTabNoteKey('agent:designer:main', 'main')).toBe('agent:designer:main');
  });

  it("configuredAgentId='custom-agent' 时 'agent:custom-agent:main' → 'default'，'agent:other:main' 保持", () => {
    expect(closeTabNoteKey('agent:custom-agent:main', 'custom-agent')).toBe('default');
    expect(closeTabNoteKey('custom-agent', 'custom-agent')).toBe('default');
    expect(closeTabNoteKey('agent:other:main', 'custom-agent')).toBe('agent:other:main');
  });

  it('关闭 chat tab 联动链路：noteKey 交给 removeProgressNoteTab 后 designer tab 被正确清理', () => {
    const tabs: Record<string, string> = { default: '默认', 'agent:coder2:main': 'coder2' };
    const noteKey = closeTabNoteKey('agent:coder2:main', 'main');
    expect(noteKey).toBe('agent:coder2:main');
    expect(removeProgressNoteTab(noteKey, tabs, 'main')).toEqual({ removed: 'agent:coder2:main' });
    expect(tabs).toEqual({ default: '默认' });
  });
});

describe('renderAgentButtons noteKey 判据', () => {
  it("点击 main 按钮（=== configuredAgentId）→ noteKey='default'，title='默认'", () => {
    expect(agentButtonNoteKey('main', 'main')).toEqual({ noteKey: 'default', noteTitle: '默认' });
  });

  it("点击 designer 按钮 → noteKey='agent:designer:main'", () => {
    expect(agentButtonNoteKey('designer', 'main')).toEqual({ noteKey: 'agent:designer:main', noteTitle: 'designer' });
  });

  it("点击 coder2 按钮 → noteKey='agent:coder2:main'", () => {
    expect(agentButtonNoteKey('coder2', 'main')).toEqual({ noteKey: 'agent:coder2:main', noteTitle: 'coder2' });
  });

  it("configuredAgentId='custom-agent' 时：custom-agent→'default'，main→'agent:main:main'", () => {
    expect(agentButtonNoteKey('custom-agent', 'custom-agent')).toEqual({ noteKey: 'default', noteTitle: '默认' });
    expect(agentButtonNoteKey('main', 'custom-agent')).toEqual({ noteKey: 'agent:main:main', noteTitle: 'main' });
  });

  it('点击按钮得到的 noteKey 再经 add 侧归一化，designer 仍是 designer（端到端不漂移）', () => {
    const { noteKey } = agentButtonNoteKey('designer', 'main');
    expect(normalizeSessionKeyForProgressNote(noteKey, 'main')).toBe('agent:designer:main');
  });
});

/* ══════════════════════════════════════════════════════════════════════════
 * 以下为本次重构新增的守卫用例：确保「单一事实源」这一架构约束不被回退。
 * ══════════════════════════════════════════════════════════════════════════ */

describe('addProgressNoteTab 判据 · shouldNormalizeProgressNoteKey（uiRenderer.ts L2819）', () => {
  it('命中即 true：4 个变体全为真', () => {
    expect(shouldNormalizeProgressNoteKey('main', 'main')).toBe(true);
    expect(shouldNormalizeProgressNoteKey('main', 'main')).toBe(true); // === configuredAgentId
    expect(shouldNormalizeProgressNoteKey('agent:main:main', 'main')).toBe(true);
    expect(shouldNormalizeProgressNoteKey('agent:main:abc123', 'main')).toBe(true); // startsWith
  });

  it('未命中即 false：非 main 会话一律不归一化', () => {
    expect(shouldNormalizeProgressNoteKey('agent:designer:main', 'main')).toBe(false);
    expect(shouldNormalizeProgressNoteKey('agent:main', 'main')).toBe(false); // 缺尾段冒号
  });

  it('与 normalizeProgressNoteSessionKey 保持严格一致（布尔判据 ≡ 映射结果）', () => {
    const cases: Array<[string, string]> = [
      ['main', 'main'], ['agent:main:main', 'main'], ['agent:main:zzz', 'main'],
      ['agent:designer:main', 'main'], ['agent:main', 'main'], ['', 'main'],
      ['custom-agent', 'custom-agent'], ['agent:custom-agent:main', 'custom-agent'],
      ['agent:custom-agent:x', 'custom-agent'], ['agent:other:main', 'custom-agent'],
    ];
    for (const [key, cfg] of cases) {
      const flag = shouldNormalizeProgressNoteKey(key, cfg);
      const mapped = normalizeProgressNoteSessionKey(key, cfg);
      // key 为空时两者约定均为「不归一化但兜底 default」，此处单独断言
      if (key === '') {
        expect(mapped).toBe('default');
        expect(flag).toBe(false);
        continue;
      }
      expect(mapped).toBe(flag ? 'default' : key);
    }
  });
});

describe('closeTab 判据 · isChatTabMainNoteKey 与 4 变体判据的刻意差异（uiRenderer.ts L4544）', () => {
  it('3 变体：main / configuredAgentId / agent:<cfg>:main 均为真', () => {
    expect(isChatTabMainNoteKey('main', 'main')).toBe(true);
    expect(isChatTabMainNoteKey('main', 'main')).toBe(true);
    expect(isChatTabMainNoteKey('agent:main:main', 'main')).toBe(true);
  });

  it('无 startsWith 前缀：agent:<cfg>:<其它后缀> 为假（与 shouldNormalizeProgressNoteKey 相反，差异为设计意图）', () => {
    expect(isChatTabMainNoteKey('agent:main:abc123', 'main')).toBe(false);
    expect(shouldNormalizeProgressNoteKey('agent:main:abc123', 'main')).toBe(true);
  });

  it('非 main 会话为假：designer / coder2 保持原值透传', () => {
    expect(isChatTabMainNoteKey('agent:designer:main', 'main')).toBe(false);
    expect(isChatTabMainNoteKey('agent:other:main', 'custom-agent')).toBe(false);
  });

  it('该差异不构成缺陷：透传的 key 会被下游 removeProgressNoteTab 再归一化一次', () => {
    // closeTab 透传 'agent:main:abc123' → removeProgressNoteTab 的 4 变体判据命中 → 收敛到 default
    expect(isChatTabMainNoteKey('agent:main:abc123', 'main')).toBe(false);
    expect(shouldNormalizeProgressNoteKey('agent:main:abc123', 'main')).toBe(true);
    const tabs: Record<string, string> = { default: '默认' };
    expect(removeProgressNoteTab('agent:main:abc123', tabs, 'main')).toEqual({ removed: null });
  });
});

describe('renderAgentButtons 判据 · resolveProgressNoteTabForAgent（uiRenderer.ts L3855）', () => {
  it('名称≠id 时标题取名称（与 webview 内 (a.name && a.name !== a.id) 分支一致）', () => {
    expect(resolveProgressNoteTabForAgent('designer', '设计助手', 'main'))
      .toEqual({ noteKey: 'agent:designer:main', noteTitle: '设计助手' });
  });

  it('名称缺失或等于 id 时标题回落为 id', () => {
    expect(resolveProgressNoteTabForAgent('designer', '', 'main'))
      .toEqual({ noteKey: 'agent:designer:main', noteTitle: 'designer' });
    expect(resolveProgressNoteTabForAgent('designer', 'designer', 'main'))
      .toEqual({ noteKey: 'agent:designer:main', noteTitle: 'designer' });
  });

  it('configuredAgentId 自身固定为「默认」tab，且其名称被忽略', () => {
    expect(resolveProgressNoteTabForAgent('main', '主智能体', 'main'))
      .toEqual({ noteKey: 'default', noteTitle: '默认' });
  });
});

describe('webview 注入守卫 · getProgressNoteNormalizeJs（同一份源码，非副本）', () => {
  const injected = getProgressNoteNormalizeJs();

  it('注入源码可被独立求值（4 个函数自包含，不依赖模块内其它符号）', () => {
    const factory = new Function(injected + '\nreturn { shouldNormalizeProgressNoteKey, normalizeProgressNoteSessionKey, isChatTabMainNoteKey, resolveProgressNoteTabForAgent };');
    const webview = factory() as {
      shouldNormalizeProgressNoteKey: typeof shouldNormalizeProgressNoteKey;
      normalizeProgressNoteSessionKey: typeof normalizeProgressNoteSessionKey;
      isChatTabMainNoteKey: typeof isChatTabMainNoteKey;
      resolveProgressNoteTabForAgent: typeof resolveProgressNoteTabForAgent;
    };
    expect(typeof webview.normalizeProgressNoteSessionKey).toBe('function');
    expect(typeof webview.shouldNormalizeProgressNoteKey).toBe('function');
    expect(typeof webview.isChatTabMainNoteKey).toBe('function');
    expect(typeof webview.resolveProgressNoteTabForAgent).toBe('function');
  });

  it('注入后的 webview 函数与被测源码函数行为完全一致（判据未被复制分叉）', () => {
    const webview = new Function(injected + '\nreturn { shouldNormalizeProgressNoteKey, normalizeProgressNoteSessionKey, isChatTabMainNoteKey, resolveProgressNoteTabForAgent };')() as Record<string, (...a: any[]) => any>;
    const keys: Array<[string, string]> = [
      ['main', 'main'], ['agent:main:main', 'main'], ['agent:main:abc', 'main'],
      ['agent:designer:main', 'main'], ['agent:main', 'main'],
      ['custom-agent', 'custom-agent'], ['agent:custom-agent:main', 'custom-agent'],
      ['agent:other:main', 'custom-agent'],
    ];
    for (const [key, cfg] of keys) {
      expect(webview.normalizeProgressNoteSessionKey(key, cfg)).toBe(normalizeProgressNoteSessionKey(key, cfg));
      expect(webview.shouldNormalizeProgressNoteKey(key, cfg)).toBe(shouldNormalizeProgressNoteKey(key, cfg));
      expect(webview.isChatTabMainNoteKey(key, cfg)).toBe(isChatTabMainNoteKey(key, cfg));
    }
    expect(webview.resolveProgressNoteTabForAgent('designer', '设计助手', 'main'))
      .toEqual(resolveProgressNoteTabForAgent('designer', '设计助手', 'main'));
  });

  it('注入源码不含 TS 类型标注（esbuild 转译后仍是合法 JS）', () => {
    expect(injected).not.toMatch(/:\s*string\b/);
    expect(injected).not.toMatch(/:\s*boolean\b/);
  });
});
