// Cloudflare Pages Function: Favorites API
// 路径: functions/api/favorites.js
// 处理收藏的 CRUD 操作

export async function onRequest(context) {
    const { request, env } = context;
    const url = new URL(request.url);
    const method = request.method;

    // CORS 预检
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        // 获取用户 ID（简化版：用随机 ID，实际应使用认证系统）
        let userId = request.headers.get('X-User-ID');
        if (!userId) {
            // 从 localStorage 获取或生成
            userId = 'guest_' + Math.random().toString(36).substr(2, 9);
        }

        const path = url.pathname.replace('/api/favorites', '');

        switch (method) {
            case 'GET':
                return await getFavorites(userId, path, env.yingjideng_db);

            case 'POST':
                return await addFavorite(userId, path, request, env.yingjideng_db);

            case 'DELETE':
                return await removeFavorite(userId, path, env.yingjideng_db);

            default:
                return jsonResponse({ error: 'Method not allowed' }, 405);
        }
    } catch (error) {
        console.error('Favorites API error:', error);
        return jsonResponse({ error: error.message }, 500);
    }
}

// 获取用户收藏列表
async function getFavorites(userId, path, db) {
    const toolId = path.startsWith('/') ? path.slice(1) : path;

    if (toolId) {
        // 检查单个工具是否已收藏
        const stmt = db.prepare(
            'SELECT * FROM favorites WHERE user_id = ? AND tool_id = ?'
        );
        const { results } = await stmt.bind(userId, toolId).all();
        return jsonResponse({
            isFavorite: results.length > 0,
            data: results[0] || null
        });
    } else {
        // 获取所有收藏
        const stmt = db.prepare(
            'SELECT * FROM favorites WHERE user_id = ? ORDER BY created_at DESC'
        );
        const { results } = await stmt.bind(userId).all();
        return jsonResponse({
            count: results.length,
            data: results
        });
    }
}

// 添加收藏
async function addFavorite(userId, path, request, db) {
    const body = await request.json();
    const { tool_id, tool_name, tool_url, category, icon } = body;

    if (!tool_id || !tool_name || !tool_url) {
        return jsonResponse({ error: '缺少必填字段: tool_id, tool_name, tool_url' }, 400);
    }

    const stmt = db.prepare(
        `INSERT OR REPLACE INTO favorites 
         (user_id, tool_id, tool_name, tool_url, category, icon, created_at)
         VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`
    );

    await stmt.bind(userId, tool_id, tool_name, tool_url, category || '', icon || '').run();

    return jsonResponse({
        success: true,
        message: '已添加到收藏',
        data: { tool_id, tool_name }
    }, 201);
}

// 移除收藏
async function removeFavorite(userId, path, db) {
    const toolId = path.startsWith('/') ? path.slice(1) : path;

    if (!toolId) {
        return jsonResponse({ error: '需要指定 tool_id' }, 400);
    }

    const stmt = db.prepare(
        'DELETE FROM favorites WHERE user_id = ? AND tool_id = ?'
    );
    const { changes } = await stmt.bind(userId, toolId).run();

    return jsonResponse({
        success: changes > 0,
        message: changes > 0 ? '已移除收藏' : '未找到收藏记录'
    });
}

// 工具函数
function jsonResponse(data, status = 200) {
    return new Response(JSON.stringify(data), {
        status,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
        }
    });
}
