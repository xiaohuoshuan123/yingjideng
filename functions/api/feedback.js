// Cloudflare Pages Function: Feedback API
// 路径: functions/api/feedback.js
// 处理用户反馈提交 + 邮件通知

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
                return await getFeedback(url, env.yingjideng_db);
            case 'POST':
                            return await submitFeedback(request, env.yingjideng_db, env, waitUntil);
            default:
                return jsonResponse({ error: 'Method not allowed' }, 405);
        }
    } catch (error) {
        console.error('Feedback API error:', error);
        return jsonResponse({ error: error.message }, 500);
    }
}

// 获取反馈列表（管理员用）
async function getFeedback(url, db) {
    const searchParams = url.searchParams;
    const limit = parseInt(searchParams.get('limit')) || 50;
    const offset = parseInt(searchParams.get('offset')) || 0;
    const status = searchParams.get('status'); // pending, resolved, closed

    let query = 'SELECT * FROM feedback';
    const params = [];
    
    if (status) {
        query += ' WHERE status = ?';
        params.push(status);
    }
    
    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const stmt = db.prepare(query);
    const { results } = await stmt.bind(...params).all();

    // 获取总数
    let countQuery = 'SELECT COUNT(*) as total FROM feedback';
    const countParams = [];
    if (status) {
        countQuery += ' WHERE status = ?';
        countParams.push(status);
    }
    const countStmt = db.prepare(countQuery);
    const { results: countResults } = await countStmt.bind(...countParams).all();

    return jsonResponse({
        total: countResults[0]?.total || 0,
        data: results
    });
}

// 提交反馈
async function submitFeedback(request, db, env, waitUntil) {
    const body = await request.json();
    const { 
        feedback_type, 
        tool_id, 
        tool_name, 
        email, 
        content 
    } = body;

    // 验证必填字段
    if (!feedback_type || !content) {
        return jsonResponse({ 
            success: false, 
            error: '缺少必填字段: feedback_type, content' 
        }, 400);
    }

    if (content.trim().length < 2) {
        return jsonResponse({ 
            success: false, 
            error: '反馈内容至少需要 2 个字符' 
        }, 400);
    }

    // 获取用户 IP（用于简单去重/限制）
    const userIp = request.headers.get('CF-Connecting-IP') || 'unknown';
    const userAgent = request.headers.get('User-Agent') || '';

    const typeLabels = {
        'bug': '🐛 工具故障',
        'suggestion': '💡 功能建议',
        'content': '📝 内容问题',
        'other': '🔹 其他问题'
    };

    const stmt = db.prepare(
        `INSERT INTO feedback 
         (feedback_type, tool_id, tool_name, email, content, user_ip, user_agent, status, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', CURRENT_TIMESTAMP)`
    );

    const result = await stmt.bind(
        feedback_type, 
        tool_id || '', 
        tool_name || '', 
        email || '', 
        content.trim(),
        userIp,
        userAgent
    ).run();

    const feedbackId = result.meta.last_row_id;

        // 异步发送邮件通知（不阻塞响应，但确保完成）
        waitUntil(sendEmailNotification(env, {
            id: feedbackId,
            feedback_type,
            typeLabel: typeLabels[feedback_type] || feedback_type,
            tool_id: tool_id || '',
            tool_name: tool_name || '',
            email: email || '',
            content: content.trim(),
            userIp,
            userAgent,
            created_at: new Date().toISOString()
        }).catch(err => console.error('Email notification failed:', err)));

    return jsonResponse({
        success: true,
        message: '反馈提交成功，感谢您的支持！',
        data: { id: feedbackId }
    }, 201);
}

// 发送邮件通知
async function sendEmailNotification(env, feedback) {
    // 支持多种邮件服务商：通过环境变量配置
    // RESEND_API_KEY, SENDGRID_API_KEY, MAILGUN_API_KEY, 等
    
    // 强制使用测试配置（绕过预览部署无法读取生产环境变量的问题）
    const adminEmail = env.ADMIN_EMAIL || 'fanhaobin@gmail.com';
    const fromEmail = env.FROM_EMAIL || 'onboarding@resend.dev';
    const apiKey = env.RESEND_API_KEY;
    if (!apiKey) {
        console.warn('RESEND_API_KEY 未配置，跳过邮件通知');
        return;
    }
    
    const subject = `[yingjideng] 新反馈: ${feedback.typeLabel} #${feedback.id}`;
    
    const htmlContent = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0;">
                <h2 style="margin: 0;">🔔 yingjideng 新反馈通知</h2>
            </div>
            <div style="background: #f8f9fa; padding: 20px; border-radius: 0 0 8px 8px; border: 1px solid #e9ecef;">
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="padding: 8px 0; font-weight: bold; color: #495057; width: 120px;">反馈类型</td>
                        <td style="padding: 8px 0; color: #212529;">${feedback.typeLabel}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; font-weight: bold; color: #495057;">反馈 ID</td>
                        <td style="padding: 8px 0; color: #212529;">#${feedback.id}</td>
                    </tr>
                    ${feedback.tool_name ? `
                    <tr>
                        <td style="padding: 8px 0; font-weight: bold; color: #495057;">相关工具</td>
                        <td style="padding: 8px 0; color: #212529;">${feedback.tool_name} (${feedback.tool_id})</td>
                    </tr>
                    ` : ''}
                    ${feedback.email ? `
                    <tr>
                        <td style="padding: 8px 0; font-weight: bold; color: #495057;">用户邮箱</td>
                        <td style="padding: 8px 0; color: #212529;">${feedback.email}</td>
                    </tr>
                    ` : ''}
                    <tr>
                        <td style="padding: 8px 0; font-weight: bold; color: #495057;">用户 IP</td>
                        <td style="padding: 8px 0; color: #212529; font-family: monospace;">${feedback.userIp}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; font-weight: bold; color: #495057;">提交时间</td>
                        <td style="padding: 8px 0; color: #212529;">${new Date(feedback.created_at).toLocaleString('zh-CN')}</td>
                    </tr>
                </table>
                <div style="margin-top: 20px; padding: 15px; background: white; border-radius: 4px; border-left: 4px solid #667eea;">
                    <div style="font-weight: bold; color: #495057; margin-bottom: 8px;">反馈内容：</div>
                    <div style="color: #212529; white-space: pre-wrap; line-height: 1.6;">${escapeHtml(feedback.content)}</div>
                </div>
                <div style="margin-top: 20px; text-align: center;">
                    <a href="https://yingjideng.dpdns.org/admin.html" style="display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 4px; font-weight: 500;">查看后台管理</a>
                </div>
            </div>
        </div>
    `;

    const textContent = `
[yingjideng] 新反馈通知

反馈类型: ${feedback.typeLabel}
反馈 ID: #${feedback.id}
${feedback.tool_name ? `相关工具: ${feedback.tool_name} (${feedback.tool_id})` : ''}
${feedback.email ? `用户邮箱: ${feedback.email}` : ''}
用户 IP: ${feedback.userIp}
提交时间: ${new Date(feedback.created_at).toLocaleString('zh-CN')}

反馈内容:
${feedback.content}

---
查看后台: https://yingjideng.dpdns.org/admin.html
    `.trim();

    // 尝试不同的邮件服务商
        // 优先级: Resend > SendGrid > Mailgun > 仅记录日志
    
        if (apiKey) {
            return await sendViaResend(apiKey, fromEmail, adminEmail, subject, htmlContent, textContent);
        }
    
        if (env.SENDGRID_API_KEY) {
            return await sendViaSendGrid(env.SENDGRID_API_KEY, fromEmail, adminEmail, subject, htmlContent, textContent);
        }
    
        if (env.MAILGUN_API_KEY && env.MAILGUN_DOMAIN) {
            return await sendViaMailgun(env.MAILGUN_API_KEY, env.MAILGUN_DOMAIN, fromEmail, adminEmail, subject, htmlContent, textContent);
        }

    // 没有配置邮件服务时，仅记录日志（生产环境建议配置）
    console.log('📧 [Feedback Email] No email service configured. Notification logged:', {
        to: adminEmail,
        subject,
        feedbackId: feedback.id
    });
    
    return { success: false, reason: 'No email service configured' };
}

// Resend API
async function sendViaResend(apiKey, from, to, subject, html, text) {
    const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ from, to, subject, html, text })
    });
    return response.json();
}

// SendGrid API
async function sendViaSendGrid(apiKey, from, to, subject, html, text) {
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            personalizations: [{ to: [{ email: to }], subject }],
            from: { email: from },
            content: [
                { type: 'text/plain', value: text },
                { type: 'text/html', value: html }
            ]
        })
    });
    return response.json();
}

// Mailgun API
async function sendViaMailgun(apiKey, domain, from, to, subject, html, text) {
    const formData = new FormData();
    formData.append('from', from);
    formData.append('to', to);
    formData.append('subject', subject);
    formData.append('text', text);
    formData.append('html', html);
    
    const response = await fetch(`https://api.mailgun.net/v3/${domain}/messages`, {
        method: 'POST',
        headers: {
            'Authorization': 'Basic ' + btoa(`api:${apiKey}`)
        },
        body: formData
    });
    return response.json();
}

function escapeHtml(text) {
    const map = { '&': '&', '<': '<', '>': '>', '"': '"', "'": '&#039;' };
    return text.replace(/[&<>"']/g, m => map[m]);
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

// Export for testing
export { sendEmailNotification };