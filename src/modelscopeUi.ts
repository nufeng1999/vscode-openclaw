export function getModelscopeCss(): string {
    return `
/* ═══════════════════════════════════════════
   Agents SUB-TABS (本地 / ModelScope)
   ═══════════════════════════════════════════ */
.agents-sub-tabs {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}
.agents-sub-tab {
  padding: 4px 12px;
  border: 1px solid var(--border);
  border-radius: 4px;
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
  font-size: 12px;
  font-family: inherit;
  line-height: 1.4;
  transition: background 0.15s, color 0.15s, border-color 0.15s;
  white-space: nowrap;
}
.agents-sub-tab:hover {
  background: rgba(128, 128, 128, 0.14);
  color: var(--text);
}
.agents-sub-tab.active {
  background: var(--accent);
  border-color: var(--accent);
  color: #fff;
}
.agents-sub-panel {
  display: none;
  flex-direction: column;
  min-height: 0;
}
.agents-sub-panel.active {
  display: flex;
}

/* ═══════════════════════════════════════════
   ModelScope Panel
   ═══════════════════════════════════════════ */
.modelscope-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  padding: 8px;
}
.modelscope-agent-card {
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 12px;
  background: rgba(128, 128, 128, 0.04);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 6px;
  transition: transform 0.15s, box-shadow 0.15s, border-color 0.15s;
  overflow: hidden;
  min-width: 0;
}
.modelscope-agent-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  border-color: var(--accent);
}
.modelscope-card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}
.modelscope-card-logo {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  object-fit: cover;
  background: rgba(128, 128, 128, 0.12);
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  color: var(--text-muted);
}
.modelscope-card-title {
  font-weight: 600;
  font-size: 13px;
  color: var(--text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
  flex: 1;
}
.modelscope-card-desc {
  font-size: 12px;
  color: var(--text-muted);
  line-height: 1.45;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 3.2em;
  position: relative;
}
/* ── Custom hover tooltip for truncated description ── */
.ms-desc-tooltip {
  display: none;
  position: fixed;
  max-width: 26ch;
  min-width: 120px;
  background: var(--bg2, #252526);
  border: 1px solid var(--border, #444);
  border-radius: 8px;
  padding: 10px 12px;
  font-size: 12px;
  color: var(--text, #cccccc);
  line-height: 1.55;
  word-break: break-word;
  white-space: normal;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.35);
  z-index: 10000;
  pointer-events: none;
}
.modelscope-card-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 11px;
  color: var(--text-muted);
  flex-wrap: wrap;
}
.modelscope-card-meta .ms-meta-item {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  white-space: nowrap;
}
.modelscope-card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 4px;
}
.modelscope-tag {
  font-size: 10px;
  padding: 1px 6px;
  border-radius: 3px;
  background: rgba(128, 128, 128, 0.12);
  color: var(--text-muted);
  white-space: nowrap;
}
.modelscope-tag.cat {
  background: rgba(55, 148, 255, 0.15);
  color: var(--accent);
}
/* 卡片内部小按钮条 */
.modelscope-card-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: auto;
  padding-top: 2px;
}
.modelscope-open-btn {
  font-size: 11px;
  color: var(--accent);
  border: 1px solid var(--accent);
  background: transparent;
  padding: 2px 10px;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}
.modelscope-open-btn:hover {
  background: var(--accent);
  color: #fff;
}

.modelscope-loading {
  text-align: center;
  padding: 24px 12px;
  color: var(--text-muted);
  font-size: 12px;
}
.modelscope-loading-spinner {
  width: 24px;
  height: 24px;
  border: 3px solid var(--border);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 10px;
}
.modelscope-error {
  text-align: center;
  padding: 24px 12px;
  color: #cc4444;
  font-size: 12px;
  line-height: 1.6;
}
.modelscope-error .retry-btn {
  display: inline-block;
  margin-top: 8px;
  padding: 4px 14px;
  border: 1px solid var(--border);
  border-radius: 4px;
  background: transparent;
  color: var(--text);
  cursor: pointer;
  font-size: 12px;
  font-family: inherit;
}
.modelscope-error .retry-btn:hover {
  background: var(--hover);
}
.modelscope-empty {
  text-align: center;
  padding: 24px 12px;
  color: var(--text-muted);
  font-size: 12px;
}
/* 搜索框样式 */
.modelscope-search {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px 4px;
}
.modelscope-search-input {
  flex: 1;
  padding: 6px 12px;
  border: 1px solid var(--input-border);
  border-radius: 6px;
  background: var(--input-bg);
  color: var(--text);
  font-size: 12px;
  font-family: inherit;
  outline: none;
  transition: border-color 0.15s;
}
.modelscope-search-input:focus {
  border-color: var(--accent);
}
.modelscope-search-clear {
  padding: 6px 12px;
  border: 1px solid var(--input-border);
  border-radius: 6px;
  background: transparent;
  color: var(--text-muted);
  font-size: 12px;
  font-family: inherit;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
  white-space: nowrap;
}
.modelscope-search-clear:hover {
  background: var(--hover);
  color: var(--text);
}
/* 分类标签区：搜索框下方，横向排列，可滚动 */
.modelscope-categories {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  overflow-x: auto;
  flex-shrink: 0;
}
.modelscope-categories::-webkit-scrollbar { height: 4px; }
.modelscope-categories::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }
.modelscope-cat-tag {
  padding: 4px 12px;
  border: 1px solid var(--input-border);
  border-radius: 999px;
  background: transparent;
  color: var(--text-muted);
  font-size: 12px;
  font-family: inherit;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.15s, color 0.15s, border-color 0.15s;
}
.modelscope-cat-tag:hover {
  background: var(--hover);
  color: var(--text);
}
.modelscope-cat-tag.active {
  background: var(--accent);
  border-color: var(--accent);
  color: #fff;
}
.modelscope-pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 8px;
  border-top: 1px solid var(--border);
  margin-top: 4px;
  flex-shrink: 0;
}
.modelscope-page-btn {
  padding: 4px 12px;
  border: 1px solid var(--border);
  border-radius: 4px;
  background: transparent;
  color: var(--text);
  cursor: pointer;
  font-size: 12px;
  font-family: inherit;
  transition: background 0.15s, color 0.15s;
}
.modelscope-page-btn:hover:not(:disabled) {
  background: rgba(128, 128, 128, 0.14);
}
.modelscope-page-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
.modelscope-page-info {
  font-size: 12px;
  color: var(--text-muted);
  white-space: nowrap;
}
.modelscope-page-input {
  width: 50px;
  text-align: center;
  padding: 2px 4px;
  border: 1px solid var(--input-border);
  border-radius: 4px;
  background: var(--input-bg);
  color: var(--text);
  font-size: 12px;
  font-family: inherit;
  outline: none;
  transition: border-color 0.15s;
}
.modelscope-page-input:focus {
  border-color: var(--accent);
}
`;
}

export function getModelscopeHtml(): string {
    return `
        <div id="agents-panel-header" style="display:flex;justify-content:space-between;align-items:center;padding:6px 10px;border-bottom:1px solid var(--border);flex-shrink:0;">
          <span id="agents-panel-title" style="font-weight:600;color:var(--text);font-size:13px;text-transform:uppercase;letter-spacing:0.5px;">Agents</span>
          <div class="agents-sub-tabs">
            <button type="button" class="agents-sub-tab active" data-subtab="local">本地</button>
            <button type="button" class="agents-sub-tab" data-subtab="modelscope">ModelScope</button>
          </div>
        </div>
        <div id="tabAgentsContent" style="padding:8px 12px;overflow-y:auto;flex:1;">
          <div id="agents-local-panel" class="agents-sub-panel active"></div>
          <div id="agents-modelscope-panel" class="agents-sub-panel">
            <div id="modelscope-search" class="modelscope-search" style="display:none;">
              <input type="text" id="modelscope-search-input" class="modelscope-search-input" placeholder="搜索 Modelscope Agents (名称、描述、标签...)">
              <button type="button" id="modelscope-search-clear" class="modelscope-search-clear" title="清除搜索">清除搜索</button>
            </div>
            <div id="modelscope-categories" class="modelscope-categories" style="display:none;"></div>
            <div id="modelscope-grid" class="modelscope-grid"></div>
            <div id="modelscope-loading" class="modelscope-loading" style="display:none;"><div class="modelscope-loading-spinner"></div>正在加载 ModelScope 智能体...</div>
            <div id="modelscope-error" class="modelscope-error" style="display:none;"></div>
            <div id="modelscope-empty" class="modelscope-empty" style="display:none;">暂无智能体</div>
            <div id="modelscope-no-results" class="modelscope-empty" style="display:none;">无匹配结果</div>
            <div id="modelscope-pagination" class="modelscope-pagination" style="display:none;">
              <button id="modelscope-prev" class="modelscope-page-btn" disabled>上一页</button>
              <span class="modelscope-page-info">第 <input type="number" id="modelscope-page-input" class="modelscope-page-input" value="1" min="1" max="1" style="width:50px;text-align:center;"> / <span id="modelscope-page-total">1</span> 页 (共 <span id="modelscope-page-count">0</span>)</span>
              <button id="modelscope-next" class="modelscope-page-btn" disabled>下一页</button>
            </div>
          </div>
        </div>
`;
}

export function getModelscopeJs(): string {
    return `
  // HTML escape utility
  function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/[&<>"']/g, function(c) {
      return ({'&':'&','<':'<','>':'>','"':'"',"'":'&#39;'})[c];
    });
  }

  // 分类映射表：中文标签 → 英文分类名（Criterion 查询用）
  // 文档来源：modelscope-categories-final.md 中英文映射表
  var MODELSCOPE_CATEGORIES = [
    { label: '全部', value: '' },
    { label: '开发工具', value: 'development-tools' },
    { label: '教育', value: 'education' },
    { label: '设计', value: 'design' },
    { label: '市场营销', value: 'marketing' },
    { label: '销售', value: 'sales' },
    { label: '产品', value: 'product' },
    { label: '金融', value: 'finance' },
    { label: '生活助理', value: 'life-assistant' },
    { label: '娱乐', value: 'entertainment' },
    { label: '其他', value: 'others' }
  ];

  // 渲染分类标签区（事件委托，绑定一次）
  function renderModelscopeCategories() {
    var el = document.getElementById('modelscope-categories');
    if (!el || el.children.length > 0) return; // 已渲染则跳过
    var html = '';
    for (var i = 0; i < MODELSCOPE_CATEGORIES.length; i++) {
      var c = MODELSCOPE_CATEGORIES[i];
      html += '<button type="button" class="modelscope-cat-tag' + (c.value === (modelscopeState.category || '') ? ' active' : '') + '"'
        + ' data-category="' + c.value + '" title="' + (c.value || '清除分类筛选，查看全部') + '">' + c.label + '</button>';
    }
    el.innerHTML = html;
  }

  // 高亮当前选中的分类标签
  function updateModelscopeCategoryHighlight() {
    var el = document.getElementById('modelscope-categories');
    if (!el) return;
    el.querySelectorAll('.modelscope-cat-tag').forEach(function(t) {
      t.classList.toggle('active', (t.getAttribute('data-category') || '') === (modelscopeState.category || ''));
    });
  }

  // 切换分类：重置 PageNumber=1，清除搜索关键词，按新分类重新拉取
  function selectModelscopeCategory(category) {
    if (modelscopeState.category === category) return; // 重复点击同一分类
    modelscopeState.category = category;
    updateModelscopeCategoryHighlight();
    var searchInputEl = document.getElementById('modelscope-search-input');
    if (searchInputEl && searchInputEl.value) {
      searchInputEl.value = '';
    }
    modelscopeState.searchKeyword = '';
    modelscopeState.page = 1;
    fetchModelscopeAgents(1, category);
  }

  // Switch between Local / ModelScope sub-panels
  function switchAgentsSubTab(tab) {
    console.log('[MS] switchAgentsSubTab called, tab:', tab);
    document.querySelectorAll('.agents-sub-tab').forEach(function(el) {
      el.classList.remove('active');
    });
    var btn = document.querySelector('[data-subtab="' + tab + '"]');
    if (btn) btn.classList.add('active');
    document.querySelectorAll('.agents-sub-panel').forEach(function(el) {
      el.classList.remove('active');
    });
    console.log('[MS] modelscopeState.loaded:', modelscopeState.loaded, 'loading:', modelscopeState.loading);
    var panelId = (tab === 'local') ? 'agents-local-panel' : 'agents-modelscope-panel';
    var panel = document.getElementById(panelId);
    if (panel) panel.classList.add('active');
    // 搜索框仅在 ModelScope 页签激活且已有数据时显示
    var searchEl = document.getElementById('modelscope-search');
    if (searchEl) searchEl.style.display = (tab === 'modelscope' && modelscopeState.agents && modelscopeState.agents.length > 0) ? 'flex' : 'none';
    console.log('[MS] switchAgentsSubTab: panelId=' + panelId, 'panel class=' + (panel ? panel.className : 'null'), 'panel display=' + (panel ? getComputedStyle(panel).display : 'null'));
    // 分类标签区与搜索框同步显示/隐藏（数据加载后才有意义）
    var catEl = document.getElementById('modelscope-categories');
    if (catEl) catEl.style.display = (tab === 'modelscope' && modelscopeState.loaded) ? 'flex' : 'none';
    if (tab === 'modelscope') {
      if (!modelscopeState.loaded && !modelscopeState.loading) {
        console.log('[MS] calling fetchModelscopeAgents(1)');
        fetchModelscopeAgents(1);
      }
    }
  }

  // Fetch ModelScope agents from extension host
  // category: 英文分类名（如 'finance'），空字符串/undefined = 全部
  function fetchModelscopeAgents(page, category) {
    console.log('[MS] fetchModelscopeAgents called, page:', page, 'category:', category, 'modelscopeState.page before:', modelscopeState.page);
    // 分页操作时自动清除搜索关键词，避免新页数据被旧搜索过滤
    var searchInputEl = document.getElementById('modelscope-search-input');
    if (searchInputEl && searchInputEl.value) {
      searchInputEl.value = '';
    }
    modelscopeState.searchKeyword = '';
    modelscopeState.loading = true;
    modelscopeState.page = page;
    // 分类：未传参则沿用当前 state.category（如从分页按钮进来）；传入空字符串表示切回全部
    if (category !== undefined) modelscopeState.category = category;
    var loadingEl = document.getElementById('modelscope-loading');
    var errorEl = document.getElementById('modelscope-error');
    var emptyEl = document.getElementById('modelscope-empty');
    var gridEl = document.getElementById('modelscope-grid');
    var paginationEl = document.getElementById('modelscope-pagination');
    if (loadingEl) loadingEl.style.display = 'block';
    if (errorEl) errorEl.style.display = 'none';
    if (emptyEl) emptyEl.style.display = 'none';
    if (gridEl) gridEl.innerHTML = '';
    if (paginationEl) paginationEl.style.display = 'none';
    console.log('[MS] posting fetchModelscopeAgents message, page:', page, 'pageSize:', modelscopeState.pageSize, 'category:', modelscopeState.category);
    var noResultsEl = document.getElementById('modelscope-no-results');
    if (noResultsEl) noResultsEl.style.display = 'none';
    var catEl = document.getElementById('modelscope-categories');
    if (catEl && modelscopeState.loaded) catEl.style.display = 'flex';
    vscode.postMessage({ type: 'fetchModelscopeAgents', page: page, pageSize: modelscopeState.pageSize, category: modelscopeState.category || '' });
  }

  // 按关键词本地过滤 Agent 列表（匹配 display_name/name/description/categories/custom_tags）
  function filterAgentsByKeyword(keyword, agents) {
    if (!keyword) return agents;
    var kw = keyword.toLowerCase().trim();
    return agents.filter(function(a) {
      var haystack = (a.display_name || '') + ' ' + (a.name || '') + ' ' +
        (a.description || '') + ' ' + (a.categories || []).join(' ') + ' ' +
        (a.custom_tags || []).join(' ');
      return haystack.toLowerCase().indexOf(kw) >= 0;
    });
  }

  // 执行本地搜索过滤：作用于当前页已加载列表；搜索激活时隐藏分页
  function applyModelscopeSearch() {
    var input = document.getElementById('modelscope-search-input');
    var keyword = input ? input.value : '';
    modelscopeState.searchKeyword = keyword;
    var agents = modelscopeState.agents || [];
    var filtered = filterAgentsByKeyword(keyword, agents);
    console.log('[MS-Search] keyword:', keyword, 'loaded:', agents.length, 'matched:', filtered.length);
    var noResultsEl = document.getElementById('modelscope-no-results');
    var emptyEl = document.getElementById('modelscope-empty');
    var paginationEl = document.getElementById('modelscope-pagination');
    if (keyword.trim()) {
      // 搜索激活：隐藏分页，显示过滤结果或"无匹配结果"占位
      if (paginationEl) paginationEl.style.display = 'none';
      if (emptyEl) emptyEl.style.display = 'none';
      if (filtered.length === 0) {
        var grid = document.getElementById('modelscope-grid');
        if (grid) grid.innerHTML = '';
        if (noResultsEl) noResultsEl.style.display = 'block';
      } else {
        if (noResultsEl) noResultsEl.style.display = 'none';
        renderModelscopeGrid(filtered);
      }
    } else {
      // 清除搜索：恢复完整列表与分页控件
      if (noResultsEl) noResultsEl.style.display = 'none';
      if (agents.length === 0) {
        if (emptyEl && modelscopeState.loaded) emptyEl.style.display = 'block';
      } else {
        if (emptyEl) emptyEl.style.display = 'none';
        renderModelscopeGrid(agents);
        renderModelscopePagination();
      }
    }
  }

  // 搜索输入防抖：300ms 后执行本地过滤，避免频繁触发
  var msSearchTimer = null;
  function onModelscopeSearchInput() {
    if (msSearchTimer) clearTimeout(msSearchTimer);
    msSearchTimer = setTimeout(applyModelscopeSearch, 300);
  }

  // Open agent detail on modelscope.cn
  function openModelscopeAgent(agentId) {
    vscode.postMessage({ type: 'openModelscopeAgent', agentId: agentId });
  }

  // Render agent cards grid (event delegation, no inline handlers)
  function renderModelscopeGrid(agents) {
    console.log('[MS] renderModelscopeGrid called with', agents.length, 'agents');
    if (agents.length > 0) {
      console.log('[MS] First agent:', JSON.stringify(agents[0]));
    }
    var grid = document.getElementById('modelscope-grid');
    if (!grid) {
      console.log('[MS] ERROR: modelscope-grid element not found');
      return;
    }
    var html = '';
    for (var i = 0; i < agents.length; i++) {
      var a = agents[i];
      var tags = (a.custom_tags || []).slice(0, 3).map(function(t) {
        return '<span class="modelscope-tag">' + escapeHtml(t) + '</span>';
      }).join('');
      var cats = (a.categories || []).slice(0, 2).map(function(c) {
        return '<span class="modelscope-tag cat">' + escapeHtml(c) + '</span>';
      }).join('');
      var safeId = String(a.id || ''); // escapeHtml will handle XSS
      html += '<div class="modelscope-agent-card" data-agent-id="' + escapeHtml(safeId) + '">'
        + '<div class="modelscope-card-header">'
        + (a.logo_url ? '<img class="modelscope-card-logo" src="' + escapeHtml(a.logo_url) + '" alt="">' : '<div class="modelscope-card-logo">&#129302;</div>')
        + '<div class="modelscope-card-title" title="' + escapeHtml(a.display_name || '') + '">' + escapeHtml(a.display_name || a.id || '') + '</div>'
        + '</div>'
        + '<div class="modelscope-card-desc"' + ((a.description || '').length > 40 ? ' data-full-desc="' + escapeHtml(a.description) + '"' : '') + '>'
        + escapeHtml((a.description || '').substring(0, 120))
        + '</div>'
        + '<div class="modelscope-card-meta">'
        + '<span class="ms-meta-item">&#11015; ' + (a.downloads || 0) + '</span>'
        + '<span class="ms-meta-item">&#9733; ' + (a.likes || 0) + '</span>'
        + (a.framework ? '<span class="ms-meta-item">' + escapeHtml(a.framework) + '</span>' : '')
        + '</div>'
        + '<div class="modelscope-card-tags">' + cats + tags + '</div>'
        + '<div class="modelscope-card-actions">'
        + '<button class="modelscope-open-btn" data-action="open" data-agent-id="' + escapeHtml(safeId) + '">&#25171;&#24320;&#35814;&#24773;</button>'
        + '</div></div>';
    }
    grid.innerHTML = html;
    console.log('[MS-DOM] renderModelscopeGrid: grid child count=' + grid.children.length, 'grid rect=' + JSON.stringify(grid.getBoundingClientRect()));
  }

  // Render pagination controls
  function renderModelscopePagination() {
    var totalPages = Math.max(1, Math.ceil(modelscopeState.totalCount / modelscopeState.pageSize));
    console.log('[MS] renderModelscopePagination, page:', modelscopeState.page, 'totalPages:', totalPages, 'totalCount:', modelscopeState.totalCount);
    var pageInputEl = document.getElementById('modelscope-page-input');
    var pageTotalEl = document.getElementById('modelscope-page-total');
    var pageCountEl = document.getElementById('modelscope-page-count');
    var prevBtn = document.getElementById('modelscope-prev');
    var nextBtn = document.getElementById('modelscope-next');
    var paginationEl = document.getElementById('modelscope-pagination');
    if (pageInputEl) {
      pageInputEl.value = modelscopeState.page;
      pageInputEl.max = String(totalPages);
    }
    if (pageTotalEl) pageTotalEl.textContent = String(totalPages);
    if (pageCountEl) pageCountEl.textContent = String(modelscopeState.totalCount);
    if (prevBtn) prevBtn.disabled = modelscopeState.page <= 1;
    if (nextBtn) nextBtn.disabled = modelscopeState.page >= totalPages;
    if (paginationEl) paginationEl.style.display = 'flex';
  }
  // ModelScope pagination buttons
  var msPrevBtn = document.getElementById('modelscope-prev');
  var msNextBtn = document.getElementById('modelscope-next');
  if (msPrevBtn) {
    msPrevBtn.addEventListener('click', function() {
      var pageInputEl = document.getElementById('modelscope-page-input');
      var currentPage = parseInt(pageInputEl.value, 10) || 1;
      if (currentPage > 1) fetchModelscopeAgents(currentPage - 1);
    });
  }
  if (msNextBtn) {
    msNextBtn.addEventListener('click', function() {
      var pageInputEl = document.getElementById('modelscope-page-input');
      var currentPage = parseInt(pageInputEl.value, 10) || 1;
      fetchModelscopeAgents(currentPage + 1);
    });
  }

  // 页码输入框：只允许数字 + 回车跳转指定页
  var msPageInput = document.getElementById('modelscope-page-input');
  if (msPageInput) {
    // 限制只能输入数字（type=number 也过滤 e/+/- 等字符）
    msPageInput.addEventListener('input', function() {
      this.value = this.value.replace(/[^0-9]/g, '');
    });
    // Enter 键：校验页码范围后跳页
    msPageInput.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') {
        var totalPages = Math.max(1, Math.ceil(modelscopeState.totalCount / modelscopeState.pageSize));
        var page = parseInt(this.value, 10);
        if (isNaN(page) || page < 1 || page > totalPages) {
          // 非法页码：恢复为当前页并失焦
          this.value = modelscopeState.page;
          this.blur();
          return;
        }
        if (page === modelscopeState.page) {
          // 页码未变化：仅失焦
          this.blur();
          return;
        }
        // 清除搜索状态，避免新页数据被旧搜索关键词过滤
        var searchInput = document.getElementById('modelscope-search-input');
        if (searchInput && searchInput.value) {
          searchInput.value = '';
        }
        modelscopeState.searchKeyword = '';
        // 保留当前分类筛选，跳转页码时使用
        fetchModelscopeAgents(page, modelscopeState.category);
        this.blur();
      }
    });
  }

  // 搜索输入框绑定：input 事件 + 300ms 防抖触发本地过滤
  var msSearchInput = document.getElementById('modelscope-search-input');
  if (msSearchInput) {
    msSearchInput.addEventListener('input', onModelscopeSearchInput);
  }
  // 清除搜索按钮：清空输入并恢复完整列表
  var msSearchClear = document.getElementById('modelscope-search-clear');
  if (msSearchClear) {
    msSearchClear.addEventListener('click', function() {
      var input = document.getElementById('modelscope-search-input');
      if (input) input.value = '';
      applyModelscopeSearch();
    });
  }

  // 分类标签点击事件（事件委托，绑定一次；标签内容由 renderModelscopeCategories 生成）
  var msCategories = document.getElementById('modelscope-categories');
  if (msCategories) {
    msCategories.addEventListener('click', function(e) {
      var tag = e.target.closest('.modelscope-cat-tag');
      if (!tag) return;
      selectModelscopeCategory(tag.getAttribute('data-category') || '');
    });
  }

  // Initialize event delegation for ModelScope grid (bind ONCE)
  var msGrid = document.getElementById('modelscope-grid');
  if (msGrid) {
    msGrid.addEventListener('click', function(e) {
      var openBtn = e.target.closest('.modelscope-open-btn');
      if (openBtn) {
        e.stopPropagation();
        openModelscopeAgent(openBtn.dataset.agentId);
        return;
      }
      var card = e.target.closest('.modelscope-agent-card');
      if (card) openModelscopeAgent(card.dataset.agentId);
    });

    // ── Tooltip hover handler for truncated descriptions ──
    // Tooltip is dynamically created and appended to document.body to escape
    // the parent's -webkit-line-clamp overflow:hidden clipping in webviews.
    var msTooltipEl = null;
    function _createMsTooltip(el) {
      if (!msTooltipEl) {
        msTooltipEl = document.createElement('div');
        msTooltipEl.className = 'ms-desc-tooltip';
        document.body.appendChild(msTooltipEl);
      }
      msTooltipEl.textContent = el.getAttribute('data-full-desc') || '';
    }
    function _positionMsTooltip(tipEl, descEl) {
      var rect = descEl.getBoundingClientRect();
      var tipRect = tipEl.getBoundingClientRect();
      var top = rect.bottom + 4;
      var left = rect.left;
      if (left + 220 > window.innerWidth) left = window.innerWidth - 230;
      if (left < 10) left = 10;
      if (top + tipRect.height > window.innerHeight - 10) {
        top = rect.top - tipRect.height - 4;
      }
      tipEl.style.top = Math.max(4, top) + 'px';
      tipEl.style.left = left + 'px';
    }
    msGrid.addEventListener('mouseover', function(e) {
      var desc = e.target.closest('.modelscope-card-desc[data-full-desc]');
      if (!desc) return;
      _createMsTooltip(desc);
      if (!msTooltipEl) return;
      _positionMsTooltip(msTooltipEl, desc);
      msTooltipEl.style.display = 'block';
    }, true);
    msGrid.addEventListener('mouseout', function(e) {
      var desc = e.target.closest('.modelscope-card-desc[data-full-desc]');
      if (!desc) return;
      var related = e.relatedTarget;
      if (related && desc.contains(related)) return;
      if (msTooltipEl) msTooltipEl.style.display = 'none';
    }, true);
  }
  // 初始化分类标签区
  renderModelscopeCategories();
  // Bind agents-sub-tab click events
  (function() {
    var btns = document.querySelectorAll('.agents-sub-tab');
    for (var i = 0; i < btns.length; i++) {
      btns[i].addEventListener('click', function() {
        var tab = this.getAttribute('data-subtab');
        switchAgentsSubTab(tab);
      });
    }
  })();
`;
}
