#!/bin/bash

echo "🚀 开始Vercel构建..."

# 检查Node.js版本
echo "📋 Node.js版本: $(node --version)"
echo "📋 npm版本: $(npm --version)"

# 清理缓存
echo "🧹 清理缓存..."
rm -rf .next
rm -rf node_modules/.cache

# 安装依赖
echo "📦 安装依赖..."
npm ci --production=false

# 构建项目
echo "🔨 构建项目..."
npm run build

# 检查构建结果
if [ $? -eq 0 ]; then
    echo "✅ 构建成功！"
    echo "📁 构建输出目录: .next"
    ls -la .next/
else
    echo "❌ 构建失败！"
    exit 1
fi
