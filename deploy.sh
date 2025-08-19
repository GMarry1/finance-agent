#!/bin/bash

echo "🚀 开始部署财务AI助手..."

# 检查Node.js版本
echo "📋 检查Node.js版本..."
node --version
npm --version

# 安装依赖
echo "📦 安装依赖..."
npm install

# 构建项目
echo "🔨 构建项目..."
npm run build

# 检查构建结果
if [ $? -eq 0 ]; then
    echo "✅ 构建成功！"
    echo "🌐 项目已准备就绪，可以部署到以下平台："
    echo ""
    echo "1. Vercel (推荐):"
    echo "   npm install -g vercel"
    echo "   vercel login"
    echo "   vercel"
    echo ""
    echo "2. Netlify:"
    echo "   访问 https://netlify.com 并连接GitHub仓库"
    echo ""
    echo "3. Railway:"
    echo "   访问 https://railway.app 并连接GitHub仓库"
    echo ""
    echo "4. 自建服务器:"
    echo "   pm2 start ecosystem.config.js"
else
    echo "❌ 构建失败，请检查错误信息"
    exit 1
fi
