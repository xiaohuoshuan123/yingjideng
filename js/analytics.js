/**
 * yingjideng — 数据分析模块
 * Cloudflare Web Analytics + localStorage 本地统计
 * 
 * Cloudflare Web Analytics: 自动收集页面浏览、流量来源
 * 本地统计: 工具点击、搜索关键词、分类热度等自定义事件
 */

// ============================================
// Cloudflare Web Analytics (自动加载)
// ============================================
// 在 HTML 中添加以下 script 即可启用：
// <script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='{"token": "YOUR_TOKEN"}'></script>
// 
// 获取 Token: Cloudflare 后台 → Analytics → Web Analytics → 添加站点 → 复制 Token

// ============================================
// localStorage 存储键
// ============================================
const STATS_STORAGE_KEY = 'yingjideng_stats';

// ============================================
// 初始化本地统计
// ============================================
function initLocalStats() {
    if (!localStorage.getItem(STATS_STORAGE_KEY)) {
        localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify({
            pageViews: 0,
            uniqueVisitors: {},
            toolClicks: {},
            searchKeywords: {},
            categoryHits: {},
            firstVisit: Date.now(),
            lastVisit: Date.now()
        }));
    }
}

// ============================================
// 获取统计数据
// ============================================
function getStats() {
    try {
        return JSON.parse(localStorage.getItem(STATS_STORAGE_KEY)) || {};
    } catch {
        return {};
    }
}

// ============================================
// 保存统计数据
// ============================================
function saveStats(stats) {
    localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(stats));
}

// ============================================
// 记录页面访问（本地统计）
// ============================================
function recordPageView() {
    const stats = getStats();
    const today = new Date().toISOString().slice(0, 10);

    // PV
    stats.pageViews = (stats.pageViews || 0) + 1;

    // UV（按天）
    if (!stats.uniqueVisitors) stats.uniqueVisitors = {};
    if (!stats.uniqueVisitors[today]) {
        stats.uniqueVisitors[today] = 0;
    }
    stats.uniqueVisitors[today]++;

    stats.lastVisit = Date.now();
    saveStats(stats);

    // Cloudflare Web Analytics 自动记录页面浏览，无需手动调用
}

// ============================================
// 记录工具点击
// ============================================
function recordToolClick(toolId, toolName, category) {
    const stats = getStats();

    // 工具点击
    if (!stats.toolClicks) stats.toolClicks = {};
    stats.toolClicks[toolId] = (stats.toolClicks[toolId] || 0) + 1;

    // 分类热度
    if (category) {
        if (!stats.categoryHits) stats.categoryHits = {};
        stats.categoryHits[category] = (stats.categoryHits[category] || 0) + 1;
    }

    saveStats(stats);

    // 如果有 Cloudflare beacon，发送自定义事件
    if (window.cloudflareBeacon) {
        window.cloudflareBeacon('event', 'tool_click', {
            tool_id: toolId,
            tool_name: toolName,
            category: category || 'unknown'
        });
    }
}

// ============================================
// 记录搜索
// ============================================
function recordSearch(keyword, resultCount) {
    if (!keyword || !keyword.trim()) return;

    const stats = getStats();
    const cleanKeyword = keyword.trim().slice(0, 50);

    if (!stats.searchKeywords) stats.searchKeywords = {};
    stats.searchKeywords[cleanKeyword] = (stats.searchKeywords[cleanKeyword] || 0) + 1;

    saveStats(stats);

    // 如果有 Cloudflare beacon，发送自定义事件
    if (window.cloudflareBeacon) {
        window.cloudflareBeacon('event', 'search', {
            keyword: cleanKeyword,
            result_count: resultCount || 0
        });
    }
}

// ============================================
// 事件处理器
// ============================================
function handleToolClick(e) {
    const card = e.target.closest('.tool-card');
    if (!card) return;

    const toolId = card.dataset.toolId;
    if (!toolId) return;

    const toolNameEl = card.querySelector('.tool-name');
    const categoryEl = card.querySelector('.tool-category');

    const toolName = toolNameEl ? toolNameEl.textContent.trim() : toolId;
    const category = categoryEl ? categoryEl.textContent.trim() : null;

    recordToolClick(toolId, toolName, category);
}

function handleSearch(e) {
    const btn = e.target.closest('#search-btn');
    if (!btn) return;

    const input = document.getElementById('search-input');
    if (!input) return;

    const keyword = input.value.trim();
    if (!keyword) return;

    setTimeout(() => {
        const results = document.querySelectorAll('.tool-card');
        recordSearch(keyword, results.length);
    }, 100);
}

// ============================================
// 导出数据（用于备份/迁移）
// ============================================
function exportStats() {
    const stats = getStats();
    const dataStr = JSON.stringify(stats, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `yingjideng-stats-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

// ============================================
// 导入数据
// ============================================
function importStats(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(data));
            alert('数据导入成功！');
            location.reload();
        } catch {
            alert('数据格式错误，请检查 JSON 文件');
        }
    };
    reader.readAsText(file);
}

// ============================================
// 初始化（DOMContentLoaded）
// ============================================
function initAnalytics() {
    initLocalStats();
    recordPageView();

    // 工具点击追踪
    document.addEventListener('click', handleToolClick);

    // 搜索追踪
    document.addEventListener('click', handleSearch);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAnalytics);
} else {
    initAnalytics();
}

// ============================================
// 导出 API（供其他模块调用）
// ============================================
window.yingjidengAnalytics = {
    recordPageView,
    recordToolClick,
    recordSearch,
    getStats,
    exportStats,
    importStats
};
