#!/bin/bash

echo "🔧 修复分类格式..."

for file in _posts/*.md; do
    if [[ -f "$file" ]]; then
        # 修复category字段后缺少换行的问题
        sed -i.tmp 's/category: "\([^"]*\)"\([a-zA-Z]\)/category: "\1"\n\2/g' "$file"
        rm -f "$file.tmp"
        echo "修复: $(basename "$file")"
    fi
done

echo "✅ 格式修复完成！"