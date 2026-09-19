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
            <div id="modelscope-grid" class="modelscope-grid"></div>
            <div id="modelscope-loading" class="modelscope-loading" style="display:none;"><div class="modelscope-loading-spinner"></div>正在加载 ModelScope 智能体...</div>
            <div id="modelscope-error" class="modelscope-error" style="display:none;"></div>
            <div id="modelscope-empty" class="modelscope-empty" style="display:none;">暂无智能体</div>
            <div id="modelscope-pagination" class="modelscope-pagination" style="display:none;">
              <button id="modelscope-prev" class="modelscope-page-btn" disabled>上一页</button>
              <span id="modelscope-page-info" class="modelscope-page-info">第 1 / 1 页</span>
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
    console.log('[MS-DOM] switchAgentsSubTab: panelId=' + panelId, 'panel class=' + (panel ? panel.className : 'null'), 'panel display=' + (panel ? getComputedStyle(panel).display : 'null'));
    if (tab === 'modelscope') {
      if (!modelscopeState.loaded && !modelscopeState.loading) {
        console.log('[MS] calling fetchModelscopeAgents(1)');
        fetchModelscopeAgents(1);
      }
    }
  }

  // Fetch ModelScope agents from extension host
  function fetchModelscopeAgents(page) {
    console.log('[MS] fetchModelscopeAgents called, page:', page);
    modelscopeState.loading = true;
    modelscopeState.page = page;
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
    console.log('[MS] posting fetchModelscopeAgents message');
    vscode.postMessage({ type: 'fetchModelscopeAgents', page: page, pageSize: modelscopeState.pageSize });
  }

  // Open agent detail on modelscope.cn
  function openModelscopeAgent(agentId) {
    vscode.postMessage({ type: 'openModelscopeAgent', agentId: agentId });
  }

  // Render agent cards grid (event delegation, no inline handlers)
  function renderModelscopeGrid(agents) {
    var grid = document.getElementById('modelscope-grid');
    if (!grid) return;
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
        + '<div class="modelscope-card-desc">' + escapeHtml((a.description || '').substring(0, 120)) + '</div>'
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
    // Event delegation for card clicks
    grid.addEventListener('click', function(e) {
      var openBtn = e.target.closest('.modelscope-open-btn');
      if (openBtn) {
        e.stopPropagation();
        openModelscopeAgent(openBtn.dataset.agentId);
        return;
      }
      var card = e.target.closest('.modelscope-agent-card');
      if (card) openModelscopeAgent(card.dataset.agentId);
    });
  }

  // Render pagination controls
  function renderModelscopePagination() {
    var totalPages = Math.max(1, Math.ceil(modelscopeState.totalCount / modelscopeState.pageSize));
    var pageInfoEl = document.getElementById('modelscope-page-info');
    var prevBtn = document.getElementById('modelscope-prev');
    var nextBtn = document.getElementById('modelscope-next');
    var paginationEl = document.getElementById('modelscope-pagination');
    if (pageInfoEl) pageInfoEl.textContent = '\u7b2c ' + modelscopeState.page + ' / ' + totalPages + ' \u9875 (\u5171 ' + modelscopeState.totalCount + ')';
    if (prevBtn) prevBtn.disabled = modelscopeState.page <= 1;
    if (nextBtn) nextBtn.disabled = modelscopeState.page >= totalPages;
    if (paginationEl) paginationEl.style.display = 'flex';
  }
  // ModelScope pagination buttons
  var msPrevBtn = document.getElementById('modelscope-prev');
  var msNextBtn = document.getElementById('modelscope-next');
  if (msPrevBtn) {
    msPrevBtn.addEventListener('click', function() {
      if (modelscopeState.page > 1) fetchModelscopeAgents(modelscopeState.page - 1);
    });
  }
  if (msNextBtn) {
    msNextBtn.addEventListener('click', function() {
      fetchModelscopeAgents(modelscopeState.page + 1);
    });
  }

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
