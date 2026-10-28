#!/usr/bin/env python3
"""Cloudflare Workers 部署脚本 - web-links (含 API 路由 + D1 REST API)"""
import base64, json, os, sys, urllib.request, urllib.error
from pathlib import Path

ACCOUNT_ID = "ad72c31a4eaccfca28b91e049a1f8e97"
PROJECT_NAME = "web-links"
PROJECT_DIR = Path("/home/ubuntu/agency-agents-zh/yingjideng-static")
TOKEN_FILE = "/tmp/.cf_token"
D1_DATABASE_ID = "8726fac0-90b1-4399-92ee-c6d787c663d7"

# 从文件读取 Token (deploy.sh 里的 token)
CF_TOKEN = os.environ.get("CLOUDFLARE_API_TOKEN")
if not CF_TOKEN:
    print("❌ 请先设置 CLOUDFLARE_API_TOKEN 环境变量")
    sys.exit(1)

def b64(p):
    with open(p, 'rb') as f:
        return base64.b64encode(f.read()).decode()

def gen():
    files = {}
    for f in ['index.html','admin.html','category.html','favorites.html','import-export.html','tool.html','sitemap.html']:
        if (PROJECT_DIR/f).exists(): files[f'/{f}'] = b64(PROJECT_DIR/f)
    for f in ['manifest.json','robots.txt','sitemap.xml','og-image.svg','sw.js']:
        if (PROJECT_DIR/f).exists(): files[f'/{f}'] = b64(PROJECT_DIR/f)
    for d in ['css','js','data']:
        dp = PROJECT_DIR/d
        if dp.exists():
            for f in dp.glob('*'):
                files[f'/{d}/{f.name}'] = b64(f)
    
    code = "const FILES={\n"
    for p,c in files.items():
        code += f"  '{p}':`{c.replace('`','\\`')}`,\n"
    code += f"""}};

// D1 REST API 配置
const CF_ACCOUNT_ID = '{ACCOUNT_ID}';
const CF_D1_DB_ID = '{D1_DATABASE_ID}';
const CF_API_TOKEN = '{CF_TOKEN}';

async function d1Query(sql, params = []) {{
  const url = `https://api.cloudflare.com/client/v4/accounts/${{CF_ACCOUNT_ID}}/d1/database/${{CF_D1_DB_ID}}/query`;
  const body = JSON.stringify({{ sql, params }});
  const res = await fetch(url, {{
    method: 'POST',
    headers: {{
      'Authorization': `Bearer ${{CF_API_TOKEN}}`,
      'Content-Type': 'application/json'
    }},
    body
  }});
  const data = await res.json();
  if (!data.success) throw new Error(data.errors?.[0]?.message || 'D1 query failed');
  return data.result;
}}

addEventListener('fetch', e => {{
    const u = new URL(e.request.url);
    let p = u.pathname;

    // ===== API: Feedback =====
    if (p === '/api/feedback' && e.request.method === 'POST') {{
        e.respondWith(handleFeedback(e.request));
        return;
    }}
    if (p === '/api/feedback' && e.request.method === 'GET') {{
        e.respondWith(handleFeedbackList(e.request));
        return;
    }}

    // ===== API: Favorites (简化版，返回引导) =====
    if (p.startsWith('/api/favorites')) {{
        e.respondWith(new Response(JSON.stringify({{error: '收藏功能需 Pages Functions 部署'}}), {{headers: {{'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}}}}));
        return;
    }}

    // 静态文件服务
    if (p === '/' || p === '/index.html') p = '/index.html';
    if (p.endsWith('/') && p !== '/') p = p.slice(0, -1);
    let c = FILES[p] || FILES['/index.html'];
    let t = 'text/html';
    if (p.endsWith('.css')) t = 'text/css';
    else if (p.endsWith('.js')) t = 'application/javascript';
    else if (p.endsWith('.json')) t = 'application/json';
    else if (p.endsWith('.svg')) t = 'image/svg+xml';
    else if (p.endsWith('.xml')) t = 'application/xml';
    e.respondWith(new Response(atob(c), {{headers: {{'Content-Type': t}}}}));
}});

async function handleFeedback(request) {{
    try {{
        const data = await request.json();
        const {{ feedback_type, tool_id, tool_name, email, content }} = data;

        if (!content || content.trim().length < 2) {{
            return jsonResponse({{ success: false, error: '内容至少 2 个字符' }}, 400);
        }}

        const userIp = request.headers.get('CF-Connecting-IP') || 'unknown';
        const userAgent = request.headers.get('User-Agent') || '';

        // 插入 feedback 表
        await d1Query(
            `INSERT INTO feedback (feedback_type, tool_id, tool_name, email, content, user_ip, user_agent, status, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', datetime('now'))`,
            [feedback_type || 'other', tool_id || '', tool_name || '', email || '', content.trim(), userIp, userAgent]
        );

        // 邮件通知 (可选，需要 Resend API Key)
        // 这里暂不实现邮件，避免额外依赖

        return jsonResponse({{ success: true, message: '反馈提交成功，感谢您的支持！' }}, 201);
    }} catch (err) {{
        console.error('Feedback error:', err);
        return jsonResponse({{ success: false, error: err.message }}, 500);
    }}
}}

async function handleFeedbackList(request) {{
    try {{
        const u = new URL(request.url);
        const limit = parseInt(u.searchParams.get('limit')) || 50;
        const offset = parseInt(u.searchParams.get('offset')) || 0;
        const status = u.searchParams.get('status');

        let sql = 'SELECT * FROM feedback';
        const params = [];
        if (status) {{
            sql += ' WHERE status = ?';
            params.push(status);
        }}
        sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
        params.push(limit, offset);

        const result = await d1Query(sql, params);
        const rows = result[0]?.results || [];

        // 总数
        let countSql = 'SELECT COUNT(*) as total FROM feedback';
        const countParams = [];
        if (status) {{
            countSql += ' WHERE status = ?';
            countParams.push(status);
        }}
        const countResult = await d1Query(countSql, countParams);
        const total = countResult[0]?.results?.[0]?.total || 0;

        return jsonResponse({{ total, data: rows }});
    }} catch (err) {{
        console.error('Feedback list error:', err);
        return jsonResponse({{ error: err.message }}, 500);
    }}
}}

function jsonResponse(data, status = 200) {{
    return new Response(JSON.stringify(data), {{
        status,
        headers: {{
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        }}
    }});
}}
"""
    return code

print("="*50)
print("  Cloudflare Workers 部署 (含 Feedback API)")
print("="*50)
print(f"项目: {PROJECT_NAME} → yingjideng.dpdns.org")
print()
print("▶ 生成 script...")
js = gen()
print(f"   {len(js)} 字节")
print()
print("▶ 部署中...")

url = f"https://api.cloudflare.com/client/v4/accounts/{ACCOUNT_ID}/workers/scripts/{PROJECT_NAME}"
req = urllib.request.Request(url, data=js.encode(), headers={"Authorization": f"Bearer {CF_TOKEN}", "Content-Type": "application/javascript"}, method='PUT')
try:
    with urllib.request.urlopen(req, timeout=60) as r:
        res = json.loads(r.read())
        if res.get('success'):
            print("✅ 部署成功！访问: https://yingjideng.dpdns.org/")
            print("   反馈 API: POST /api/feedback")
        else:
            print("❌ 失败:")
            for e in res.get('errors',[]): print(f"   - {e.get('message')}")
except urllib.error.HTTPError as e:
    print(f"❌ HTTP {e.code}")
    try:
        b = json.loads(e.read())
        for e in b.get('errors',[]): print(f"   - {e.get('message')}")
    except: print(e.read()[:500])