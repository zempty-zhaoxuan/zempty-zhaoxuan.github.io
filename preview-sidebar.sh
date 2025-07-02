#!/bin/bash

# 博客侧边栏现代化预览脚本
# Blog Sidebar Modernization Preview Script

echo "🚀 正在启动博客预览..."
echo "📝 侧边栏现代化改造已完成！"
echo ""
echo "✨ 新功能预览："
echo "   🎨 现代化品牌区域（已移除头像）"
echo "   🏠 图标化导航系统"
echo "   🔍 实时搜索功能" 
echo "   📊 博客统计面板"
echo "   🏷️ 智能标签云"
echo "   📄 最新文章快览"
echo "   📅 时间线归档"
echo "   📱 完整响应式设计"
echo ""

# 检查Jekyll是否安装
if ! command -v jekyll &> /dev/null; then
    echo "❌ Jekyll 未安装！"
    echo "💡 请先安装 Jekyll："
    echo "   gem install jekyll bundler"
    exit 1
fi

# 检查Gemfile是否存在
if [ ! -f "Gemfile" ]; then
    echo "⚠️  未找到 Gemfile，正在创建..."
    echo "source 'https://rubygems.org'" > Gemfile
    echo "gem 'jekyll', '~> 4.0'" >> Gemfile
    echo "gem 'jekyll-paginate'" >> Gemfile
    echo "gem 'jekyll-sitemap'" >> Gemfile
    echo "gem 'jekyll-feed'" >> Gemfile
fi

# 安装依赖
echo "📦 正在安装依赖..."
bundle install --quiet

# 启动Jekyll服务
echo "🌐 正在启动 Jekyll 服务器..."
echo "📱 请在浏览器中访问: http://localhost:4000"
echo "🛑 按 Ctrl+C 停止服务器"
echo ""

bundle exec jekyll serve --host=0.0.0.0 --port=4000 --livereload