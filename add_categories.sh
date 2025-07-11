#!/bin/bash

# 博客文章分类添加脚本
# 使用方法: ./add_categories.sh

echo "🏷️  博客文章分类工具"
echo "===================="

# 定义分类映射
declare -A CATEGORIES
CATEGORIES["leetcode"]="算法题解"
CATEGORIES["algorithm"]="算法题解"
CATEGORIES["java"]="开发技术"
CATEGORIES["spring"]="开发技术"
CATEGORIES["docker"]="开发技术"
CATEGORIES["jenkins"]="开发技术"
CATEGORIES["ai"]="AI与效率"
CATEGORIES["claude"]="AI与效率"
CATEGORIES["cursor"]="AI与效率"
CATEGORIES["mcp"]="AI与效率"
CATEGORIES["git"]="工具教程"
CATEGORIES["vscode"]="工具教程"
CATEGORIES["tools"]="工具教程"

# 遍历所有markdown文件
for file in _posts/*.md; do
    if [[ -f "$file" ]]; then
        # 检查是否已有category字段
        if grep -q "^category:" "$file"; then
            continue
        fi
        
        echo "处理文件: $file"
        
        # 读取标题和标签
        title=$(grep "^title:" "$file" | sed 's/title: *"*\([^"]*\)"*/\1/')
        tags=$(grep "^tags:" "$file" | sed 's/tags: *\[\([^]]*\)\]/\1/' | tr ',' ' ' | tr -d '[]')
        
        # 根据标签推荐分类
        category=""
        for tag in $tags; do
            tag_lower=$(echo "$tag" | tr '[:upper:]' '[:lower:]' | tr -d ' ')
            if [[ -n "${CATEGORIES[$tag_lower]}" ]]; then
                category="${CATEGORIES[$tag_lower]}"
                break
            fi
        done
        
        # 如果没有匹配的分类，根据文件名推荐
        if [[ -z "$category" ]]; then
            filename=$(basename "$file" .md)
            if [[ "$filename" == *"leetcode"* ]]; then
                category="算法题解"
            elif [[ "$filename" == *"java"* || "$filename" == *"spring"* ]]; then
                category="开发技术"
            elif [[ "$filename" == *"git"* || "$filename" == *"vscode"* ]]; then
                category="工具教程"
            else
                category="其它"
            fi
        fi
        
        echo "  标题: $title"
        echo "  推荐分类: $category"
        
        # 在date行后添加category
        sed -i.bak "/^date:/a\\
category: \"$category\"" "$file"
        
        echo "  ✅ 已添加分类"
        echo ""
    fi
done

echo "🎉 分类添加完成！"
echo ""
echo "📋 可用分类："
echo "  - 算法题解"
echo "  - 开发技术" 
echo "  - AI与效率"
echo "  - 工具教程"
echo "  - 生活感悟"
echo "  - 其它"
echo ""
echo "💡 如需修改分类，请直接编辑文章的 front matter"