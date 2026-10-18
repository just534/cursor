#!/bin/bash
set -e

echo "🚀 启动 Xread..."
echo ""

if ! command -v node &> /dev/null; then
    echo "❌ 错误: 未找到 Node.js"
    exit 1
fi

if [ ! -f "package.json" ]; then
    echo "❌ 错误: 请在项目根目录运行此脚本"
    exit 1
fi

if [ ! -d "node_modules" ]; then
    echo "📦 正在安装依赖..."
    npm install
    echo ""
fi

if [ ! -f "xread.db" ]; then
    echo "💾 正在初始化数据库..."
    npm run init-db
    echo ""
fi

echo "✅ 启动服务器..."
echo ""
npm start
