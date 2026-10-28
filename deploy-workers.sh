#!/bin/bash
set -e

# ============================================
# Cloudflare Workers 部署脚本 (简化版)
# 项目: web-links (Workers)
# 账户 ID: ad72c31a4eaccfca28b91e049a1f8e97
# ============================================

ACCOUNT_ID="ad72c31a4eaccfca28b91e049a1f8e97"
PROJECT_NAME="web-links"
TOKEN="cfut...echo "============================================"
echo "  Cloudflare Workers 部署脚本"
echo "============================================"

cd /home/ubuntu/agency-agents-zh/yingjideng-static
echo "✅ 进入目录: $(pwd)"

# 创建 Workers script
cat > /tmp/worker.js << 'EOF'
const FILES = {
EOF

# 添加 HTML 文件 (用 base64 编码)
for file in index.html admin.html category.html favorites.html import-export.html tool.html; do
  if [ -f "$file" ]; then
    echo "  '/$file': '$(base64 -w 0 < "$file")'," >> /tmp/worker.js
  fi
done

# 添加其他静态文件
for file in manifest.json robots.txt sitemap.xml og-image.svg; do
  if [ -f "$file" ]; then
    echo "  '/$file': '$(base64 -w 0 < "$file")'," >> /tmp/worker.js
  fi
done

# CSS 文件
for file in css/*.css; do
  if [ -f "$file" ]; then
    name=$(basename "$file")
    echo "  '/css/$name': '$(base64 -w 0 < "$file")'," >> /tmp/worker.js
  fi
done

# JS 文件
for file in js/*.js; do
  if [ -f "$file" ]; then
    name=$(basename "$file")
    echo "  '/js/$name': '$(base64 -w 0 < "$file")'," >> /tmp/worker.js
  fi
done

# Data 文件
for file in data/*.json; do
  if [ -f "$file" ]; then
    name=$(basename "$file")
    echo "  '/data/$name': '$(base64 -w 0 < "$file")'," >> /tmp/worker.js
  fi
done

cat >> /tmp/worker.js << 'EOF'
};

addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  let path = url.pathname;
  
  // 默认返回 index.html
  if (path === '/' || path === '/index.html') path = '/index.html';
  
  // 移除尾部斜杠
  if (path.endsWith('/') && path !== '/') path = path.slice(0, -1);
  
  // 查找文件
  let content = FILES[path];
  if (!content) content = FILES['/index.html'];
  
  // 根据扩展名设置 Content-Type
  let contentType = 'text/html';
  if (path.endsWith('.css')) contentType = 'text/css';
  else if (path.endsWith('.js')) contentType = 'application/javascript';
  else if (path.endsWith('.json')) contentType = 'application/json';
  else if (path.endsWith('.svg')) contentType = 'image/svg+xml';
  else if (path.endsWith('.xml')) contentType = 'application/xml';
  
  event.respondWith(new Response(atob(content), {
    headers: { 'Content-Type': contentType }
  }));
});
EOF

echo "✅ 已生成 Workers script"

# 部署
echo ""
echo "▶ 正在部署到 Workers..."
RESPONSE=$(curl -s -X POST \
  "https://api.cloudflare.com/client/v4/accounts/$ACCOUNT_ID/workers/scripts/$PROJECT_NAME" \
  -H "Authorization: Bearer $CLOUD...EN" \
  -H "Content-Type: application/javascript" \
  --data-binary @/tmp/worker.js)

echo "   响应: $RESPONSE"

if echo "$RESPONSE" | grep -q '"success":false'; then
    echo ""
    echo "❌ 部署失败！"
    echo "$RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE"
    exit 1
fi

echo ""
echo "============================================"
echo "  ✅ 部署完成！"
echo "============================================"
echo ""
echo "📌 访问: https://yingjideng.dpdns.org/"
