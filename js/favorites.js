/**
 * yingjideng — 收藏功能
 * 使用 localStorage 存储用户收藏的工具
 * V2: 集成 Cloudflare D1 云端同步
 */

// ============================================
// 云端同步配置
// ============================================
const USE_CLOUD_SYNC = true;  // 设置为 false 可禁用云端同步

// ============================================
// 收藏管理
// ============================================

const FAVORITES_KEY = 'yingjideng_favorites';
let cloudSyncReady = false;

/**
 * 初始化云端同步
 */
async function initCloudSync() {
    if (!USE_CLOUD_SYNC || cloudSyncReady) return;
    
    try {
        // 检查 API 是否可用
        const res = await fetch('/api/favorites', { method: 'GET' });
        if (res.ok) {
            cloudSyncReady = true;
            // 从云端拉取收藏
            const { data } = await res.json();
            const cloudIds = new Set(data.map(item => item.tool_id));
            
            // 合并云端和本地收藏
            const local = getFavorites();
            const merged = [...new Set([...local, ...cloudIds])];
            localStorage.setItem(FAVORITES_KEY, JSON.stringify(merged));
            
            console.log('[Favorites] 云端同步完成，共', merged.length, '个收藏');
            
            // 刷新收藏页面
            if (typeof renderFavorites === 'function') {
                renderFavorites();
            }
        }
    } catch (e) {
        console.warn('[Favorites] 云端同步不可用，使用本地存储');
    }
}

/**
 * 获取所有收藏的工具 ID
 */
function getFavorites() {
    try {
        const data = localStorage.getItem(FAVORITES_KEY);
        return data ? JSON.parse(data) : [];
    } catch (e) {
        return [];
    }
}

/**
 * 检查工具是否已收藏
 */
function isFavorite(toolId) {
    return getFavorites().includes(toolId);
}

/**
 * 添加收藏
 */
async function addFavorite(toolId) {
    const favorites = getFavorites();
    if (!favorites.includes(toolId)) {
        favorites.push(toolId);
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
        showFavoriteToast(toolId, 'add');
        updateFavoriteButton(toolId, true);
        
        // 云端同步
        if (cloudSyncReady) {
            syncToCloud(toolId, 'add');
        }
    }
    return favorites.length;
}

/**
 * 移除收藏
 */
async function removeFavorite(toolId) {
    const favorites = getFavorites().filter(id => id !== toolId);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    showFavoriteToast(toolId, 'remove');
    updateFavoriteButton(toolId, false);
    
    // 云端同步
    if (cloudSyncReady) {
        syncToCloud(toolId, 'remove');
    }
    
    return favorites.length;
}

/**
 * 清空全部收藏
 */
function clearFavorites() {
    localStorage.removeItem(FAVORITES_KEY);
    // 刷新页面更新 UI
    if (typeof renderFavorites === 'function') {
        renderFavorites();
    }
    // 更新所有收藏按钮
    document.querySelectorAll('.favorite-btn').forEach(btn => {
        const toolId = btn.dataset.toolId;
        if (toolId) {
            updateFavoriteButton(toolId, false);
        }
    });
}

/**
 * 更新收藏按钮状态
 */
function updateFavoriteButton(toolId, isFav) {
    const btn = document.querySelector(`.favorite-btn[data-tool-id="${toolId}"]`);
    if (btn) {
        btn.classList.toggle('is-favorite', isFav);
        btn.innerHTML = isFav ? '<i class="fas fa-heart"></i>' : '<i class="far fa-heart"></i>';
        btn.title = isFav ? '取消收藏' : '收藏';
    }
}

/**
 * 显示收藏提示
 */
function showFavoriteToast(toolId, action) {
    const toolsData = window.yingjideng ? window.yingjideng.allTools : (typeof allTools !== 'undefined' ? allTools : []);
    const tool = toolsData.find(t => t.id === toolId);
    if (!tool) return;
    
    let toast = document.getElementById('favorite-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'favorite-toast';
        toast.className = 'favorite-toast';
        document.body.appendChild(toast);
    }
    
    const actionText = action === 'add' ? '已收藏' : '已移除';
    toast.innerHTML = `<i class="fas fa-${action === 'add' ? 'check' : 'times'}"></i> ${tool.name} ${actionText}`;
    toast.className = `favorite-toast show ${action === 'add' ? 'success' : 'remove'}`;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 2000);
}

/**
 * 渲染收藏页面
 */
function renderFavorites() {
    // 获取 allTools，优先使用 window.yingjideng.allTools
    const toolsData = window.yingjideng ? window.yingjideng.allTools : (typeof allTools !== 'undefined' ? allTools : []);
    if (!toolsData || toolsData.length === 0) {
        console.warn('[Favorites] allTools 未就绪，稍后重试');
        return false;  // 返回 false 表示数据未就绪
    }
    
    const favorites = getFavorites();
    const grid = document.getElementById('favorites-grid');
    const noFavorites = document.getElementById('no-favorites');
    const countEl = document.getElementById('result-count');
    const clearBtn = document.getElementById('clear-favorites-btn');
    
    // 更新计数
    if (countEl) {
        countEl.textContent = `共 ${favorites.length} 个收藏`;
    }
    
    // 显示清空按钮
    if (clearBtn) {
        clearBtn.style.display = favorites.length > 0 ? 'inline-block' : 'none';
        clearBtn.onclick = function() {
            if (confirm('确定要清空全部收藏吗？')) {
                clearFavorites();
            }
        };
    }
    
    if (favorites.length === 0) {
        grid.innerHTML = '';
        if (noFavorites) noFavorites.style.display = 'block';
        return;
    }
    
    if (noFavorites) noFavorites.style.display = 'none';

    // 获取收藏的工具详情（使用 toolsData 而非 allTools）
    const favoriteTools = favorites
        .map(id => toolsData.find(t => t.id === id))
        .filter(t => t !== undefined);
    
    grid.innerHTML = favoriteTools.map(tool => {
        const aiInfo = AI_TYPE_LABELS[tool.ai_type];
        const priceInfo = tool.is_free ? PRICE_LABELS[tool.is_free] : null;
        
        return `
            <div class="tool-card" data-tool-id="${tool.id}" onclick="showToolDetail('${tool.id}')">
                <button class="favorite-btn is-favorite" data-tool-id="${tool.id}" onclick="event.stopPropagation(); toggleFavorite('${tool.id}')">
                    <i class="fas fa-heart"></i>
                </button>
                <div class="tool-card-header">
                    <div class="tool-icon">${tool.icon || '🔧'}</div>
                    <div class="tool-title-with-badge">
                        <span class="tool-title">${tool.name}</span>
                        <span class="ai-badge ${aiInfo.class}">${aiInfo.label}</span>
                        ${priceInfo ? `<span class="tool-price ${priceInfo.class}">${priceInfo.label}</span>` : ''}
                    </div>
                </div>
                <div class="tool-card-body">
                    <p class="tool-description">${escapeHtml(tool.description)}</p>
                    ${tool.ai_type === 'traditional' && tool.ai_alternative ? `
                        <div class="ai-recommend-box">
                            <span class="label">💡 AI 替代:</span>
                            <a href="${tool.ai_alternative.url}" target="_blank">${tool.ai_alternative.name}</a>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }).join('');
}

/**
 * 切换收藏状态
 */
async function toggleFavorite(toolId) {
    if (isFavorite(toolId)) {
        await removeFavorite(toolId);
    } else {
        await addFavorite(toolId);
    }
}

/**
 * 云端同步
 */
async function syncToCloud(toolId, action) {
    if (!cloudSyncReady) return;
    
    try {
        const toolsData = window.yingjideng ? window.yingjideng.allTools : (typeof allTools !== 'undefined' ? allTools : []);
        const tool = toolsData.find(t => t.id === toolId);
        if (!tool) return;
        
        const url = `/api/favorites/${encodeURIComponent(toolId)}`;
        const method = action === 'add' ? 'POST' : 'DELETE';
        
        const res = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: method === 'POST' ? JSON.stringify({
                tool_id: tool.id,
                tool_name: tool.name,
                tool_url: tool.url,
                category: tool.category || '',
                icon: tool.icon || ''
            }) : undefined
        });
        
        if (!res.ok) {
            console.warn('[Favorites] 云端同步失败:', res.status);
        }
    } catch (e) {
        console.warn('[Favorites] 云端同步错误:', e.message);
    }
}

// ============================================
// 页面初始化
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    // 初始化云端同步
    initCloudSync();
    
    // 如果是收藏页面，渲染收藏列表
    if (window.location.pathname.includes('favorites.html')) {
        // 等待数据加载完成 - 使用 window.yingjideng.allTools
        const checkData = setInterval(() => {
            const toolsData = window.yingjideng ? window.yingjideng.allTools : (typeof allTools !== 'undefined' ? allTools : []);
            // 检查数据是否就绪（either dataReady flag or allTools has content）
            if ((window.yingjideng && window.yingjideng.dataReady) || (toolsData && toolsData.length > 0)) {
                renderFavorites();
                clearInterval(checkData);
            }
        }, 50);  // 缩短间隔到 50ms
        setTimeout(() => clearInterval(checkData), 15000);
    }
    
    // 绑定清空收藏按钮
    const clearBtn = document.getElementById('clear-favorites-btn');
    if (clearBtn) {
        clearBtn.addEventListener('click', function() {
            if (confirm('确定要清空全部收藏吗？')) {
                clearFavorites();
            }
        });
    }
});

// ============================================
// 评价功能
// ============================================

const REVIEWS_KEY = 'yingjideng_reviews';

/**
 * 获取工具的所有评价（云端优先）
 */
async function getToolReviews(toolId) {
    // 尝试从云端获取
    try {
        const response = await fetch(`/api/reviews/${encodeURIComponent(toolId)}`);
        if (response.ok) {
            const data = await response.json();
            return data.reviews || [];
        }
    } catch (e) {
        console.warn('[Reviews] 云端获取失败，使用本地存储');
    }
    
    // 降级到本地存储
    try {
        const reviews = JSON.parse(localStorage.getItem(REVIEWS_KEY) || '[]');
        return reviews.filter(r => r.toolId === toolId);
    } catch (e) {
        return [];
    }
}

/**
 * 获取工具的平均评分（云端优先）
 */
async function getToolAverageRating(toolId) {
    const reviews = await getToolReviews(toolId);
    if (reviews.length === 0) return null;
    const sum = reviews.reduce((acc, r) => acc + (r.rating || 0), 0);
    return (sum / reviews.length).toFixed(1);
}

/**
 * 提交评价（云端 + 本地）
 */
async function submitReview(toolId, rating, comment, author = '匿名') {
    if (!toolId || !rating || rating < 1 || rating > 5) {
        return { success: false, error: '评分必须在 1-5 之间' };
    }
    if (!comment || comment.trim().length < 5) {
        return { success: false, error: '评价内容至少 5 个字符' };
    }
    
    // 尝试云端提交
    try {
        const response = await fetch('/api/reviews', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                toolId: toolId,
                toolName: toolId, // 简化处理
                rating: parseInt(rating),
                comment: comment.trim(),
                author: author
            })
        });
        
        const result = await response.json();
        if (result.success) {
            // 云端成功，也保存到本地
            const localReviews = JSON.parse(localStorage.getItem(REVIEWS_KEY) || '[]');
            localReviews.push({
                id: result.id,
                toolId: toolId,
                rating: parseInt(rating),
                comment: comment.trim(),
                author: author,
                createdAt: new Date().toISOString()
            });
            localStorage.setItem(REVIEWS_KEY, JSON.stringify(localReviews));
            return { success: true };
        } else {
            throw new Error(result.error);
        }
    } catch (e) {
        // 云端失败，降级到本地存储
        console.warn('[Reviews] 云端提交失败，使用本地存储:', e.message);
        const reviews = JSON.parse(localStorage.getItem(REVIEWS_KEY) || '[]');
        reviews.push({
            id: Date.now().toString(36) + Math.random().toString(36).substr(2),
            toolId: toolId,
            rating: parseInt(rating),
            comment: comment.trim(),
            author: author,
            createdAt: new Date().toISOString()
        });
        localStorage.setItem(REVIEWS_KEY, JSON.stringify(reviews));
        return { success: true, local: true };
    }
}

/**
 * 渲染评价面板（模态框内）- 异步版本
 */
async function renderReviewsModal(toolId, toolName) {
    const reviews = await getToolReviews(toolId);
    const avgRating = await getToolAverageRating(toolId);
    
    let html = `
        <div class="feedback-rating-summary mb-4">
            <div class="row">
                <div class="col-md-6">
                    <div class="text-center">
                        <div class="feedback-rating-number">${avgRating || '暂无'}</div>
                        <div class="feedback-rating-stars">
                            ${renderStars(avgRating || 0, true)}
                        </div>
                        <div class="feedback-review-count">${reviews.length}条评价</div>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="feedback-rating-input-box">
                        <h5>写下你的评价</h5>
                        <div class="mb-3">
                            <label>评分：</label>
                            <div class="star-rating-input" id="review-rating-input">
                                ${renderStarsInput(0)}
                            </div>
                        </div>
                        <div class="form-group">
                            <textarea id="review-comment" class="form-control" rows="3" placeholder="分享你的使用体验..."></textarea>
                        </div>
                        <button class="btn btn-primary btn-sm" onclick="handleReviewSubmit('${toolId}')">提交评价</button>
                    </div>
                </div>
            </div>
        </div>
        <div class="feedback-reviews-list">
            <h5>用户评价</h5>
    `;
    
    if (reviews.length === 0) {
        html += `<p class="text-muted text-center py-4">暂无评价，快来抢沙发吧！</p>`;
    } else {
        reviews.slice().reverse().forEach(review => {
            html += `
                <div class="feedback-review-card mb-3">
                    <div class="feedback-review-header">
                        <span class="feedback-review-author">${escapeHtml(review.author)}</span>
                        <span class="feedback-review-rating">${renderStars(review.rating)}</span>
                        <span class="feedback-review-date">${formatDate(review.createdAt)}</span>
                    </div>
                    <div class="feedback-review-comment">${escapeHtml(review.comment)}</div>
                </div>
            `;
        });
    }
    
    html += '</div>';
    return html;
}

/**
 * 渲染星星（只读）
 */
function renderStars(rating, showHalf = false) {
    let html = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= Math.floor(rating)) {
            html += '<i class="fas fa-star text-warning"></i> ';
        } else if (showHalf && i === Math.ceil(rating) && rating !== Math.floor(rating)) {
            html += '<i class="fas fa-star-half-alt text-warning"></i> ';
        } else {
            html += '<i class="far fa-star text-muted"></i> ';
        }
    }
    return html;
}

/**
 * 渲染星星输入（可点击）
 */
function renderStarsInput(rating) {
    let html = '';
    for (let i = 1; i <= 5; i++) {
        html += `<i class="star-input far fa-star" data-rating="${i}" style="cursor:pointer;font-size:24px;"></i> `;
    }
    return html;
}

/**
 * 格式化日期
 */
function formatDate(isoString) {
    const date = new Date(isoString);
    return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'short', day: 'numeric' });
}

/**
 * HTML 转义
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * 初始化评价事件绑定
 */
function initFeedback() {
    // 星星点击事件
    const starInputs = document.querySelectorAll('.star-input');
    starInputs.forEach(star => {
        star.addEventListener('click', function() {
            const rating = parseInt(this.dataset.rating);
            // 更新所有星星显示
            const container = this.parentElement;
            container.querySelectorAll('.star-input').forEach((s, idx) => {
                if (idx < rating) {
                    s.classList.remove('far');
                    s.classList.add('fas', 'text-warning');
                } else {
                    s.classList.remove('fas', 'text-warning');
                    s.classList.add('far');
                }
            });
            // 存储当前评分
            container.dataset.selectedRating = rating;
        });
    });
}

/**
 * 处理评价提交
 */
async function handleReviewSubmit(toolId) {
    const container = document.getElementById('review-rating-input');
    const rating = container.dataset.selectedRating || 0;
    const comment = document.getElementById('review-comment').value;
    
    const result = await submitReview(toolId, rating, comment);
    if (result.success) {
        alert(result.local ? '评价已本地保存（云端暂不可用）' : '评价提交成功！');
        // 刷新评价面板
        const currentToolId = window.currentFeedbackToolId;
        if (currentToolId) {
            const toolsData = window.yingjideng ? window.yingjideng.allTools : (typeof allTools !== 'undefined' ? allTools : []);
            const tool = toolsData.find(t => t.id === currentToolId);
            if (tool) {
                document.getElementById('modal-feedback-body').innerHTML = await renderReviewsModal(currentToolId, tool.name);
                initFeedback();
            }
        }
    } else {
        alert('提交失败：' + result.error);
    }
}

/**
 * 绑定反馈事件（模态框内）
 */
function bindFeedbackEvents() {
    initFeedback();
}

// ============================================
// 全局导出（供 app.js 和其他页面调用）
// ============================================
window.yingjideng = {
    // 评价相关
    getToolReviews,
    getToolAverageRating,
    renderReviewsModal,
    handleReviewSubmit,
    initFeedback,
    submitReview,
    
    // 收藏相关
    getFavorites,
    isFavorite,
    addFavorite,
    removeFavorite,
    clearFavorites,
    updateFavoriteButton,
    showFavoriteToast,
    renderFavorites,
    toggleFavorite,
    syncToCloud,
    initCloudSync
};
