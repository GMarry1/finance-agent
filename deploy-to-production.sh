#!/bin/bash

echo "🚀 开始部署到生产环境..."

# 检查是否有未提交的更改
if [ -n "$(git status --porcelain)" ]; then
    echo "📝 发现未提交的更改，正在提交..."
    git add .
    git commit -m "feat: 自动部署更新 - $(date '+%Y-%m-%d %H:%M:%S')"
fi

# 推送到GitHub
echo "📤 推送到GitHub..."
git push origin main

echo "✅ 部署完成！"
echo ""
echo "🌐 您的应用将在几分钟内自动部署到："
echo "   - Vercel: https://your-app.vercel.app"
echo "   - 或您配置的其他平台"
echo ""
echo "📊 查看部署状态："
echo "   - GitHub Actions: https://github.com/GMarry1/finance-agent/actions"
echo "   - Vercel Dashboard: https://vercel.com/dashboard"
