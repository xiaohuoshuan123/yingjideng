#!/bin/bash
set -e

# ============================================
# Cloudflare Pages 部署脚本
# 项目: yingjideng → yingjideng.dpdns.org
# 账户 ID: ad72c31a4eaccfca28b91e049a1f8e97
#
# 规矩 2：禁止硬编码文件清单，用 rsync 整目录同步
# 规矩 3：部署后必须做哈希对账
# ============================================

: "${CLOUDFLARE_API_TOKEN:?请先设置 CLOUDFLARE_API_TOKEN 环境变量}"
ACCOUNT_ID="ad72c31a4eaccfca28b91e049a1f8e97"
PROJECT_NAME="yingjideng"
STAGE_DIR="/tmp/yingjideng-stage-$$"

echo "🚀 Cloudflare Pages 部署"
echo "============================================"
echo "账户 ID: $ACCOUNT_ID"
echo "项目:    $PROJECT_NAME"
echo "工作目录: $(pwd)"
echo ""

# 1. 进入项目目录
cd /home/ubuntu/agency-agents-zh/yingjideng-static

# 2. 清理并创建临时 staging 目录
rm -rf "$STAGE_DIR"
mkdir -p "$STAGE_DIR"
echo "📦 准备 staging 目录: $STAGE_DIR"

# 3. rsync 同步（排除 .git/.wrangler/ 等不需要部署的内容）
rsync -a --delete \
  --exclude='.git' \
  --exclude='.wrangler' \
  --exclude='__pycache__' \
  --exclude='*.pyc' \
  --exclude='*.swp' \
  --exclude='node_modules' \
  --exclude='dist/' \
  --exclude='build/' \
  --exclude='*.zip' \
  --exclude='functions/api/debug.js' \
  --exclude='functions/api/test-email.js' \
  ./ "$STAGE_DIR/"

echo "✅ 文件同步完成"

# 4. 列出将要部署的文件数
FILE_COUNT=$(find "$STAGE_DIR" -type f | wc -l)
echo "📄 待部署文件数: $FILE_COUNT"

# 5. 执行部署（wrangler pages deploy 会自动识别 functions/ 作为 serverless functions）
echo ""
echo "▶ 正在部署到 Cloudflare Pages..."
DEPLOY_OUTPUT=$(CLOUDFLARE_API_TOKEN="$CLOUDFLARE_API_TOKEN" \
  wrangler pages deploy "$STAGE_DIR" \
  --project-name="$PROJECT_NAME" \
  --branch=main \
  --commit-dirty=true 2>&1)

echo "$DEPLOY_OUTPUT"

# 6. 检查部署结果
if echo "$DEPLOY_OUTPUT" | grep -q "Deployment complete"; then
  echo ""
  echo "✅ 部署成功！"

  # 7. 规矩 3：哈希对账
  echo ""
  echo "🔍 开始哈希对账（本地 vs 线上）..."
  HASH_OK=true

  for cssfile in css/feedback.css css/style.css css/ai-badges.css css/favorites.css; do
    if [ -f "$cssfile" ]; then
      LOCAL_HASH=$(sha256sum "$cssfile" | awk '{print $1}')
      ONLINE_HASH=$(curl -sL "https://yingjideng.pages.dev/$cssfile" | sha256sum | awk '{print $1}')
      if [ "$LOCAL_HASH" = "$ONLINE_HASH" ]; then
        echo "  ✅ $cssfile  $LOCAL_HASH"
      else
        echo "  ❌ $cssfile  本地=$LOCAL_HASH  线上=$ONLINE_HASH"
        HASH_OK=false
      fi
    fi
  done

  for jsfile in js/app.js js/feedback.js js/favorites.js js/analytics.js; do
    if [ -f "$jsfile" ]; then
      LOCAL_HASH=$(sha256sum "$jsfile" | awk '{print $1}')
      ONLINE_HASH=$(curl -sL "https://yingjideng.pages.dev/$jsfile" | sha256sum | awk '{print $1}')
      if [ "$LOCAL_HASH" = "$ONLINE_HASH" ]; then
        echo "  ✅ $jsfile  $LOCAL_HASH"
      else
        echo "  ❌ $jsfile  本地=$LOCAL_HASH  线上=$ONLINE_HASH"
        HASH_OK=false
      fi
    fi
  done

  if [ "$HASH_OK" = true ]; then
    echo ""
    echo "🎉 哈希对账全部通过，部署已生效！"
  else
    echo ""
    echo "⚠️  部分文件哈希不匹配，请检查部署状态"
    exit 1
  fi

else
  echo ""
  echo "❌ 部署失败！"
  echo "$DEPLOY_OUTPUT"
  exit 1
fi

# 8. 清理 staging
rm -rf "$STAGE_DIR"
echo ""
echo "============================================"
echo "  ✅ 部署完成，staging 已清理"
echo "============================================"
echo ""
echo "📌 验证地址:"
echo "   https://yingjideng.dpdns.org/"
echo "   https://yingjideng.pages.dev/"
