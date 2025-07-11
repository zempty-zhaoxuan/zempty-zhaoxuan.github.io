#!/bin/bash

echo "🏷️ 添加文章分类..."

# 处理每个文章文件
for file in _posts/*.md; do
    if [[ -f "$file" ]]; then
        # 检查是否已有category字段
        if grep -q "^category:" "$file"; then
            continue
        fi
        
        echo "处理: $(basename "$file")"
        
        # 读取标签行
        tags_line=$(grep "^tags:" "$file" || echo "")
        
        # 根据标签和文件名推荐分类
        category="其它"
        
        if [[ "$tags_line" == *"LeetCode"* ]] || [[ "$tags_line" == *"Algorithm"* ]] || [[ "$file" == *"leetcode"* ]]; then
            category="算法题解"
        elif [[ "$tags_line" == *"Java"* ]] || [[ "$tags_line" == *"Spring"* ]] || [[ "$tags_line" == *"Docker"* ]] || [[ "$tags_line" == *"Jenkins"* ]]; then
            category="开发技术"
        elif [[ "$tags_line" == *"AI"* ]] || [[ "$tags_line" == *"Claude"* ]] || [[ "$tags_line" == *"Cursor"* ]] || [[ "$tags_line" == *"MCP"* ]]; then
            category="AI与效率"
        elif [[ "$tags_line" == *"Git"* ]] || [[ "$tags_line" == *"VSCode"* ]] || [[ "$tags_line" == *"Tools"* ]]; then
            category="工具教程"
        fi
        
        echo "  分类: $category"
        
        # 在date行后添加category
        sed -i.bak "/^date:/a\\
category: \"$category\"" "$file"
        
        echo "  ✅ 完成"
    fi
done

echo "🎉 所有文章已添加分类！"