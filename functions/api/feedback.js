// Cloudflare Pages Function: Feedback API
// 路径: functions/api/feedback.js
// 处理用户反馈提交 + 邮件通知
//
// 邮件投递诊断说明：
//   发件人默认 env.FROM_EMAIL || 'onboarding@resend.dev'
//   Resend 的 onboarding@resend.dev 只能投递给 Resend 账户注册邮箱（当前为 fanhaobin@gmail.com）
//   收件人默认 env.ADMIN_EMAIL || 'fanhaobin@gmail.com'
//
// 诊断接口（安全，需 EMAIL_TEST_SECRET）：
//   GET /api/feedback?action=email_diag&key=<EMAIL_TEST_SECRET>
//   返回：环境变量在位情况（脱敏）+ 实际发送一封测试邮件 + Resend 原始响应

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
                // 诊断模式：?action=email_diag&key=...
                if (url.searchParams.get('action') === 'email_diag') {
                    return await emailDiag(url, env);
                }
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
    
    const adminEmail = env.ADMIN_EMAIL || 'fanhaobin@gmail.com';
    const fromEmail = env.FROM_EMAIL || 'onboarding@resend.dev';
    const apiKey = env.RESEND_API_KEY;
    if (!apiKey) {
        console.warn('RESEND_API_KEY 未配置，跳过邮件通知');
        return { success: false, reason: 'RESEND_API_KEY not configured' };
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
    let emailResult;

    if (apiKey) {
        try {
            emailResult = await sendViaResend(apiKey, fromEmail, adminEmail, subject, htmlContent, textContent);
            console.log('📧 [Feedback Email] Resend 发送结果:', JSON.stringify(emailResult));
        } catch (err) {
            console.error('📧 [Feedback Email] Resend 发送异常:', err.message || err);
            return { success: false, provider: 'resend', error: err.message || String(err) };
        }
        return emailResult;
    }
    
    if (env.SENDGRID_API_KEY) {
        emailResult = await sendViaSendGrid(env.SENDGRID_API_KEY, fromEmail, adminEmail, subject, htmlContent, textContent);
        console.log('📧 [Feedback Email] SendGrid 发送结果:', JSON.stringify(emailResult));
        return emailResult;
    }
    
    if (env.MAILGUN_API_KEY && env.MAILGUN_DOMAIN) {
        emailResult = await sendViaMailgun(env.MAILGUN_API_KEY, env.MAILGUN_DOMAIN, fromEmail, adminEmail, subject, htmlContent, textContent);
        console.log('📧 [Feedback Email] Mailgun 发送结果:', JSON.stringify(emailResult));
        return emailResult;
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
    const data = await response.json();
    // 状态检查：非 2xx 时抛出，携带 Resend 错误正文，便于日志排查
    if (!response.ok) {
        const err = new Error(`Resend HTTP ${response.status}: ${JSON.stringify(data)}`);
        err.status = response.status;
        err.body = data;
        throw err;
    }
    return data;
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
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        const err = new Error(`SendGrid HTTP ${response.status}: ${JSON.stringify(data)}`);
        err.status = response.status;
        err.body = data;
        throw err;
    }
    return data;
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
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        const err = new Error(`Mailgun HTTP ${response.status}: ${JSON.stringify(data)}`);
        err.status = response.status;
        err.body = data;
        throw err;
    }
    return data;
}

// 邮件诊断接口（受 EMAIL_TEST_SECRET 保护）
// GET /api/feedback?action=email_diag&key=<EMAIL_TEST_SECRET>
async function emailDiag(url, env) {
    const key = url.searchParams.get('key');
    const secret = env.EMAIL_TEST_SECRET;
    if (!secret || key !== secret) {
        return jsonResponse({ error: 'Unauthorized: 缺少或错误的 key，需匹配 EMAIL_TEST_SECRET' }, 403);
    }

    // 环境变量在位情况（脱敏）
    const masked = (v) => (v ? (String(v).slice(0, 6) + '…' + (String(v).length > 10 ? ' (' + String(v).length + ' chars)' : '')) : '(未设置)');
    const envStatus = {
        RESEND_API_KEY: env.RESEND_API_KEY ? '已设置: ' + masked(env.RESEND_API_KEY) : '未设置',
        SENDGRID_API_KEY: env.SENDGRID_API_KEY ? '已设置' : '未设置',
        MAILGUN_API_KEY: env.MAILGUN_API_KEY ? '已设置' : '未设置',
        MAILGUN_DOMAIN: env.MAILGUN_DOMAIN ? '已设置' : '未设置',
        ADMIN_EMAIL: env.ADMIN_EMAIL || '(默认) fanhaobin@gmail.com',
        FROM_EMAIL: env.FROM_EMAIL || '(默认) onboarding@resend.dev',
        EMAIL_TEST_SECRET: env.EMAIL_TEST_SECRET ? '已设置' : '未设置',
    };

    // 实际发送一封测试邮件（不抛异常，返回原始结果）
    const result = await sendEmailNotification(env, {
        id: 'DIAG-' + Date.now(),
        feedback_type: 'test',
        typeLabel: '🧪 邮件诊断',
        tool_id: '',
        tool_name: '',
        email: '',
        content: '这是一封来自 yingjideng 邮件诊断接口的测试邮件，用于确认邮件通知是否可达。',
        userIp: '127.0.0.1',
        userAgent: 'diagnostic',
        created_at: new Date().toISOString()
    }).catch(err => ({ success: false, error: err.message || String(err) }));

    return jsonResponse({ env: envStatus, sendResult: result });
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
