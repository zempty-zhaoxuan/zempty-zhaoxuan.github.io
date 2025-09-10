#!/bin/bash

# 安全检查脚本
# Security Check Script

echo "🔍 开始安全检查..."
echo "================================"

# 检查敏感文件
echo "📁 检查敏感文件..."
SENSITIVE_FILES=(".env" ".env.local" "config.json" "secrets.json" "private.key" "*.pem")
FOUND_SENSITIVE=false

for pattern in "${SENSITIVE_FILES[@]}"; do
    if find . -name "$pattern" -type f 2>/dev/null | grep -q .; then
        echo "⚠️  发现敏感文件: $pattern"
        FOUND_SENSITIVE=true
    fi
done

if [ "$FOUND_SENSITIVE" = false ]; then
    echo "✅ 未发现敏感文件"
fi

# 检查硬编码密钥
echo ""
echo "🔑 检查硬编码密钥..."
PATTERNS=("password\s*=" "api_key\s*=" "secret\s*=" "token\s*=" "private_key")
FOUND_SECRETS=false

for pattern in "${PATTERNS[@]}"; do
    if grep -r -i "$pattern" --include="*.js" --include="*.yml" --include="*.json" . 2>/dev/null | grep -v "example\|sample\|test" | grep -q .; then
        echo "⚠️  可能的硬编码密钥: $pattern"
        FOUND_SECRETS=true
    fi
done

if [ "$FOUND_SECRETS" = false ]; then
    echo "✅ 未发现硬编码密钥"
fi

# 检查危险函数
echo ""
echo "⚡ 检查危险函数..."
DANGEROUS_FUNCS=("eval(" "innerHTML\s*=" "document.write(" "setTimeout.*string" "setInterval.*string")
FOUND_DANGEROUS=false

for func in "${DANGEROUS_FUNCS[@]}"; do
    if grep -r "$func" --include="*.js" js/ 2>/dev/null | grep -v "安全:" | grep -v "example\|sample\|test" | grep -q .; then
        echo "⚠️  发现危险函数: $func"
        FOUND_DANGEROUS=true
    fi
done

if [ "$FOUND_DANGEROUS" = false ]; then
    echo "✅ 未发现危险函数调用"
fi

# 检查.gitignore
echo ""
echo "📝 检查.gitignore配置..."
if [ -f ".gitignore" ]; then
    REQUIRED_IGNORES=(".env" "*.log" "node_modules" ".DS_Store")
    MISSING_IGNORES=()
    
    for ignore in "${REQUIRED_IGNORES[@]}"; do
        if ! grep -q "$ignore" .gitignore; then
            MISSING_IGNORES+=("$ignore")
        fi
    done
    
    if [ ${#MISSING_IGNORES[@]} -eq 0 ]; then
        echo "✅ .gitignore配置良好"
    else
        echo "⚠️  .gitignore缺少: ${MISSING_IGNORES[*]}"
    fi
else
    echo "❌ 缺少.gitignore文件"
fi

# 检查文件权限
echo ""
echo "🔒 检查文件权限..."
EXECUTABLE_FILES=$(find . -name "*.sh" -type f)
if [ -n "$EXECUTABLE_FILES" ]; then
    echo "📋 可执行脚本文件:"
    echo "$EXECUTABLE_FILES"
    echo "✅ 确保脚本文件有适当权限"
else
    echo "✅ 未发现可执行脚本"
fi

# 总结
echo ""
echo "================================"
echo "🎯 安全检查完成"
echo ""
echo "📊 检查结果:"
echo "   - 敏感文件: $([ "$FOUND_SENSITIVE" = false ] && echo "✅ 通过" || echo "⚠️  需要注意")"
echo "   - 硬编码密钥: $([ "$FOUND_SECRETS" = false ] && echo "✅ 通过" || echo "⚠️  需要注意")"
echo "   - 危险函数: $([ "$FOUND_DANGEROUS" = false ] && echo "✅ 通过" || echo "⚠️  需要注意")"
echo ""

if [ "$FOUND_SENSITIVE" = false ] && [ "$FOUND_SECRETS" = false ] && [ "$FOUND_DANGEROUS" = false ]; then
    echo "🎉 安全检查全部通过，可以安全公开仓库！"
    exit 0
else
    echo "⚠️  发现一些需要注意的问题，请检查后再公开仓库"
    exit 1
fi