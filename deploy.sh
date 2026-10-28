#!/bin/bash
set -e

# ============================================
# Cloudflare Pages 部署脚本
# 项目: yingjideng → web-links
# 账户 ID: ad72c31a4eaccfca28b91e049a1f8e97
# ============================================

# 1. 设置变量
# 请先设置环境变量 CLOUDFLARE_API_TOKEN
: "${CLOUDFLARE_API_TOKEN:?请先设置 CLOUDFLARE_API_TOKEN 环境变量}"
ACCOUNT_ID="ad72c31a4eaccfca28b91e049a1f8e97"
PROJECT_NAME="yingjideng"
echo "  Cloudflare Pages 部署脚本"
echo "============================================"
echo "账户 ID: $ACCOUNT_ID"
echo "项目:    $PROJECT_NAME"
echo "目录:    /home/ubuntu/agency-agents-zh/yingjideng-static"
echo ""

# 2. 进入项目目录
cd /home/ubuntu/agency-agents-zh/yingjideng-static
echo "✅ 进入目录: $(pwd)"

# 3. 创建部署
echo ""
echo "▶ 正在创建部署..."
DEPLOY_RESPONSE=$(curl -s -X POST \
  "https://api.cloudflare.com/client/v4/accounts/$ACCOUNT_ID/pages/projects/$PROJECT_NAME/deployments" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"yingjideng-'$(date +%s)'"}')

echo "   响应: $DEPLOY_RESPONSE"

# 检查是否成功
if echo "$DEPLOY_RESPONSE" | grep -q '"success":false'; then
    echo ""
    echo "❌ 创建部署失败！"
    MSG=$(echo "$DEPLOY_RESPONSE" | grep -o '"message":"[^"]*"' | head -1 | sed 's/"message":"//;s/"$//')
    echo "   错误: $MSG"
    echo ""
    echo "   可能原因:"
    echo "   1. Token 无效或过期"
    echo "   2. 账户没有 Pages 编辑权限"
    echo "   3. 项目不存在"
    exit 1
fi

# 提取部署 ID
DEPLOY_ID=$(echo "$DEPLOY_RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | sed 's/"id":"//;s/"$//')
echo "✅ 部署 ID: $DEPLOY_ID"

# 4. 上传文件列表
FILES="_redirects admin.html category.html favorites.html import-export.html index.html manifest.json robots.txt sitemap.xml sw.js tool.html css/ai-badges.css css/favorites.css css/style.css data/tools.json js/analytics.js js/app.js js/favorites-sync.js js/favorites.js js/feedback.js og-image.svg functions/api/feedback.js functions/api/favorites.js functions/api/reviews.js"

echo ""
echo "▶ 正在上传文件..."
UPLOAD_COUNT=0
for file in $FILES; do
  if [ -f "$file" ]; then
    curl -s -X PUT \
      "https://api.cloudflare.com/client/v4/accounts/$ACCOUNT_ID/pages/projects/$PROJECT_NAME/deployments/$DEPLOY_ID/contents/$file" \
      -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
      -H "Content-Type: application/octet-stream" \
      --data-binary @"$file" > /dev/null
    UPLOAD_COUNT=$((UPLOAD_COUNT + 1))
    echo "  ✅ 已上传: $file"
  else
    echo "  ⚠️  文件不存在: $file"
  fi
done

echo ""
echo "   已上传 $UPLOAD_COUNT 个文件"

# 5. 完成部署
echo ""
echo "▶ 正在完成部署..."
TRIGGER_RESPONSE=$(curl -s -X POST \
  "https://api.cloudflare.com/client/v4/accounts/$ACCOUNT_ID/pages/projects/$PROJECT_NAME/deployments/$DEPLOY_ID/trigger" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"type":"upload"}')

echo "   响应: $TRIGGER_RESPONSE"

# 检查是否成功
if echo "$TRIGGER_RESPONSE" | grep -q '"success":false'; then
    echo ""
    echo "❌ 触发部署失败！"
    MSG=$(echo "$TRIGGER_RESPONSE" | grep -o '"message":"[^"]*"' | head -1 | sed 's/"message":"//;s/"$//')
    echo "   错误: $MSG"
    exit 1
fi

echo ""
echo "============================================"
echo "  ✅ 部署完成！"
echo "============================================"
echo ""
echo "📌 下一步:"
echo "   1. 等待 30-60 秒构建完成"
echo "   2. 访问: https://yingjideng.dpdns.org/"
echo "   3. 验证重定向是否生效:"
echo "      - /index.html → 301 重定向到 /"
echo "      - /tool/cursor → 显示 Cursor 详情页"
echo "      - /category/开发工具 → 显示开发工具分类"
echo ""
echo "⚠️  安全提醒: Token 已用于部署，建议立即轮换"
echo "   https://dash.cloudflare.com/profile/api-tokens"
