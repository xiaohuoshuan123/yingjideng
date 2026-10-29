// Cloudflare Pages Function: Reviews API
// 路径: functions/api/reviews.js
// 处理工具评价/评论

import { sendEmailNotification } from './feedback.js';

export async function onRequest(context) {
    const { request, env, waitUntil } = context;
    const url = new URL(request.url);
    const method = request.method;

    // CORS 预检
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        switch (method) {
                    case 'GET':
                        return await getReviews(url, env.yingjideng_db);
                    case 'POST':
                        return await submitReview(request, env.yingjideng_db, env, waitUntil);
                    default:
                        return jsonResponse({ error: 'Method not allowed' }, 405);
                }
    } catch (error) {
        console.error('Reviews API error:', error);
        return jsonResponse({ error: error.message }, 500);
    }
}

// 获取工具评价列表
async function getReviews(url, db) {
    const searchParams = url.searchParams;
    const toolId = searchParams.get('tool_id');
    const limit = parseInt(searchParams.get('limit')) || 20;
    const offset = parseInt(searchParams.get('offset')) || 0;

    if (!toolId) {
        return jsonResponse({ error: '缺少 tool_id 参数' }, 400);
    }

    // 获取评价列表
    const stmt = db.prepare(
        'SELECT * FROM reviews WHERE tool_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?'
    );
    const { results } = await stmt.bind(toolId, limit, offset).all();

    // 获取统计信息
    const statsStmt = db.prepare(
        `SELECT 
            COUNT(*) as total_count,
            AVG(rating) as avg_rating,
            SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) as stars_5,
            SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) as stars_4,
            SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) as stars_3,
            SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) as stars_2,
            SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) as stars_1
         FROM reviews WHERE tool_id = ?`
    );
    const { results: statsResults } = await statsStmt.bind(toolId).all();
    const stats = statsResults[0] || {
        total_count: 0,
        avg_rating: 0,
        stars_5: 0,
        stars_4: 0,
        stars_3: 0,
        stars_2: 0,
        stars_1: 0
    };

    return jsonResponse({
        tool_id: toolId,
        stats: {
            total: stats.total_count,
            average: stats.avg_rating ? Math.round(stats.avg_rating * 10) / 10 : 0,
            distribution: {
                5: stats.stars_5 || 0,
                4: stats.stars_4 || 0,
                3: stats.stars_3 || 0,
                2: stats.stars_2 || 0,
                1: stats.stars_1 || 0
            }
        },
        data: results
    });
}

// 提交评价
async function submitReview(request, db, env, waitUntil) {
    const body = await request.json();
    const { tool_id, tool_name, rating, comment, author } = body;

    // 验证必填字段
    if (!tool_id || !rating || !comment) {
        return jsonResponse({
            success: false,
            error: '缺少必填字段: tool_id, rating, comment'
        }, 400);
    }

    if (rating < 1 || rating > 5 || !Number.isInteger(rating)) {
        return jsonResponse({
            success: false,
            error: '评分必须是 1-5 的整数'
        }, 400);
    }

    if (comment.trim().length < 5) {
        return jsonResponse({
            success: false,
            error: '评价内容至少需要 5 个字符'
        }, 400);
    }

    // 获取用户 IP（简单去重/限制）
    const userIp = request.headers.get('CF-Connecting-IP') || 'unknown';
    const userAgent = request.headers.get('User-Agent') || '';

    // 简单防刷：同 IP 同工具 1 小时内只能评价一次
    const recentStmt = db.prepare(
        `SELECT id FROM reviews 
         WHERE tool_id = ? AND user_ip = ? 
         AND created_at > datetime('now', '-1 hour')`
    );
    const { results: recent } = await recentStmt.bind(tool_id, userIp).all();
    if (recent.length > 0) {
        return jsonResponse({
            success: false,
            error: '您已提交过评价，请稍后再试'
        }, 429);
    }

    const stmt = db.prepare(
        `INSERT INTO reviews 
         (tool_id, tool_name, rating, comment, author, user_ip, user_agent, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))`
    );

    const result = await stmt.bind(
            tool_id,
            tool_name || '',
            rating,
            comment.trim(),
            author || '匿名用户',
            userIp,
            userAgent
        ).run();

        const reviewId = result.meta.last_row_id;

        // 异步发送邮件通知（不阻塞响应，但确保完成）
        waitUntil(sendEmailNotification(env, {
            id: reviewId,
            feedback_type: 'review',
            typeLabel: '⭐ 工具评价',
            tool_id,
            tool_name: tool_name || '',
            email: '',
            content: `评分: ${rating}/5\n评价: ${comment.trim()}`,
            userIp,
            userAgent,
            created_at: new Date().toISOString()
        }).catch(err => console.error('Review email failed:', err)));

        return jsonResponse({
            success: true,
            message: '评价提交成功，感谢您的分享！',
            data: { id: reviewId }
        }, 201);
}

// 工具函数
function jsonResponse(data, status = 200) {
    return new Response(JSON.stringify(data), {
        status,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        }
    });
}