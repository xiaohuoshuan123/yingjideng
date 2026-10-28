/**
 * 收藏同步模块 — 本地 + 云端双轨
 * 使用 Cloudflare D1 数据库作为云端存储
 * 
 * 使用示例:
 *   await yingjidengFavorites.init();
 *   await yingjidengFavorites.toggle(tool);
 *   const favorites = await yingjidengFavorites.list();
 */

const yingjidengFavorites = (function() {
    // 配置
    const API_BASE = '/api/favorites';
    const STORAGE_KEY = 'yingjideng_favorites_local';
    
    // 状态
    let userId = null;
    let localFavorites = new Set();
    let isInitialized = false;
    let useCloudSync = true;  // 是否启用云端同步

    // ============================================
    // 初始化
    // ============================================
    async function init() {
        if (isInitialized) return;
        
        // 获取或生成用户 ID
        userId = localStorage.getItem('yingjideng_user_id');
        if (!userId) {
            userId = 'user_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
            localStorage.setItem('yingjideng_user_id', userId);
        }
        
        // 加载本地收藏
        const localData = localStorage.getItem(STORAGE_KEY);
        if (localData) {
            try {
                localFavorites = new Set(JSON.parse(localData));
            } catch (e) {
                localFavorites = new Set();
            }
        }
        
        // 尝试云端同步
        if (useCloudSync) {
            await syncFromCloud();
        }
        
        isInitialized = true;
        console.log('[Favorites] 初始化完成，用户ID:', userId);
    }

    // ============================================
    // 云端同步
    // ============================================
    async function syncFromCloud() {
        try {
            const res = await fetch(`${API_BASE}?userId=${encodeURIComponent(userId)}`);
            if (!res.ok) throw new Error('同步失败');
            
            const { data } = await res.json();
            const cloudIds = new Set(data.map(item => item.tool_id));
            
            // 合并本地和云端收藏
            cloudIds.forEach(id => localFavorites.add(id));
            saveLocal();
            
            console.log('[Favorites] 云端同步完成，共', localFavorites.size, '个收藏');
        } catch (e) {
            console.warn('[Favorites] 云端同步失败，使用本地数据:', e.message);
            useCloudSync = false;
        }
    }

    async function syncToCloud() {
        if (!useCloudSync) return;
        
        try {
            // 获取当前所有收藏的详细信息
            const favoritesList = Array.from(localFavorites);
            
            // 批量同步（简化版：逐个添加）
            for (const toolId of favoritesList) {
                const existing = await checkFavorite(toolId);
                if (!existing) {
                    // 从本地缓存获取工具信息
                    const toolInfo = getToolInfo(toolId);
                    if (toolInfo) {
                        await addFavorite(toolInfo);
                    }
                }
            }
        } catch (e) {
            console.warn('[Favorites] 云端同步失败:', e.message);
        }
    }

    // ============================================
    // 收藏操作
    // ============================================
    
    // 切换收藏状态
    async function toggle(tool) {
        await init();
        
        const toolId = tool.id || tool.tool_id;
        const isCurrentlyFavorite = localFavorites.has(toolId);
        
        if (isCurrentlyFavorite) {
            await remove(toolId);
            return false;
        } else {
            await add(tool);
            return true;
        }
    }

    // 添加收藏
    async function add(tool) {
        await init();
        
        const toolId = tool.id || tool.tool_id;
        localFavorites.add(toolId);
        saveLocal();
        
        // 云端同步
        if (useCloudSync) {
            const toolInfo = {
                tool_id: toolId,
                tool_name: tool.name || tool.tool_name,
                tool_url: tool.url || tool.tool_url,
                category: tool.category || '',
                icon: tool.icon || ''
            };
            await addFavorite(toolInfo);
        }
        
        // 触发事件
        triggerEvent('add', tool);
        return true;
    }

    // 移除收藏
    async function remove(toolId) {
        await init();
        
        localFavorites.delete(toolId);
        saveLocal();
        
        // 云端同步
        if (useCloudSync) {
            await removeFavorite(toolId);
        }
        
        // 触发事件
        triggerEvent('remove', { id: toolId });
        return true;
    }

    // 检查是否已收藏
    async function checkFavorite(toolId) {
        await init();
        
        if (localFavorites.has(toolId)) return true;
        
        if (useCloudSync) {
            try {
                const res = await fetch(`${API_BASE}/${encodeURIComponent(toolId)}`);
                const { isFavorite } = await res.json();
                return isFavorite;
            } catch (e) {
                return false;
            }
        }
        
        return false;
    }

    // 获取收藏列表
    async function list() {
        await init();
        
        if (useCloudSync) {
            try {
                const res = await fetch(`${API_BASE}`);
                const { data } = await res.json();
                return data;
            } catch (e) {
                console.warn('[Favorites] 获取云端列表失败，使用本地数据');
            }
        }
        
        // 返回本地收藏 ID 列表
        return Array.from(localFavorites);
    }

    // 获取收藏数量
    async function count() {
        await init();
        return localFavorites.size;
    }

    // ============================================
    // 本地存储
    // ============================================
    
    function saveLocal() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(localFavorites)));
    }

    function getToolInfo(toolId) {
        // 从当前页面数据获取工具信息
        // 实际使用时应传入工具数据或从全局缓存获取
        if (window.currentTools && window.currentTools[toolId]) {
            return window.currentTools[toolId];
        }
        return null;
    }

    // ============================================
    // API 调用
    // ============================================
    
    async function addFavorite(toolInfo) {
        const res = await fetch(API_BASE, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-User-ID': userId
            },
            body: JSON.stringify(toolInfo)
        });
        
        if (!res.ok) {
            const err = await res.json().catch(() => ({ error: '请求失败' }));
            throw new Error(err.error || '添加收藏失败');
        }
        
        return res.json();
    }

    async function removeFavorite(toolId) {
        const res = await fetch(`${API_BASE}/${encodeURIComponent(toolId)}`, {
            method: 'DELETE',
            headers: { 'X-User-ID': userId }
        });
        
        if (!res.ok) {
            const err = await res.json().catch(() => ({ error: '请求失败' }));
            throw new Error(err.error || '移除收藏失败');
        }
        
        return res.json();
    }

    // ============================================
    // 事件系统
    // ============================================
    
    const eventHandlers = {
        add: [],
        remove: [],
        sync: []
    };

    function on(event, handler) {
        if (eventHandlers[event]) {
            eventHandlers[event].push(handler);
        }
    }

    function triggerEvent(event, data) {
        if (eventHandlers[event]) {
            eventHandlers[event].forEach(handler => {
                try {
                    handler(data);
                } catch (e) {
                    console.error('[Favorites] 事件处理错误:', e);
                }
            });
        }
    }

    // ============================================
    // 公共 API
    // ============================================
    
    return {
        init,
        toggle,
        add,
        remove,
        checkFavorite,
        list,
        count,
        on,
        syncToCloud,
        get userId() { return userId; },
        get isInitialized() { return isInitialized; }
    };
})();

// 导出到全局
window.yingjidengFavorites = yingjidengFavorites;
