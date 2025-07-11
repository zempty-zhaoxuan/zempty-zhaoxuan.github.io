# 📚 博客文章分类指南

## 🎯 快速分类方法

在写文章时，只需在文章开头的 front matter 中添加 `category` 字段即可：

```yaml
---
layout: post
title: "你的文章标题"
date: 2025-01-01
category: "算法题解"  # 添加这一行
tags: [LeetCode, Java]
---
```

## 📋 可用分类列表

| 分类名称 | 适用内容 | 示例 |
|---------|---------|------|
| **算法题解** | LeetCode题解、算法分析、数据结构 | LeetCode 189 旋转数组 |
| **开发技术** | Java、Spring、Docker、后端技术 | Spring Boot 配置详解 |
| **AI与效率** | AI工具、Claude、Cursor、MCP | Claude Code 使用体验 |
| **工具教程** | Git、VSCode、开发工具配置 | Git Submodule 用法 |
| **生活感悟** | 个人思考、生活体验、读书笔记 | 投资理财心得 |
| **其它** | 不属于以上分类的内容 | 博客搭建记录 |

## ✍️ 写作时的分类步骤

### 1. 确定文章主题
写文章前先想想：这篇文章主要讲什么？

### 2. 选择对应分类
根据主题选择最合适的分类：
- 解LeetCode题 → `算法题解`
- 技术教程/经验 → `开发技术`
- AI工具使用 → `AI与效率`
- 工具配置 → `工具教程`
- 个人感悟 → `生活感悟`
- 其他内容 → `其它`

### 3. 在文章中添加分类
```yaml
---
layout: post
title: "你的标题"
date: 2025-01-01
category: "选择的分类名称"
tags: [相关标签]
---
```

## 📝 实际示例

### 算法题解文章
```yaml
---
layout: post
title: "LeetCode 189 旋转数组：三种解法分析"
date: 2025-04-25
category: "算法题解"
tags: [LeetCode, Algorithm, Java]
---
```

### AI工具文章
```yaml
---
layout: post
title: "Claude Code 使用体验"
date: 2025-06-20
category: "AI与效率"
tags: [AI, Claude, MCP, Productivity]
---
```

### 开发技术文章
```yaml
---
layout: post
title: "Spring Boot 配置详解"
date: 2025-01-01
category: "开发技术"
tags: [Java, Spring, Configuration]
---
```

## 🔄 修改现有文章

如果要给现有文章添加分类，只需：

1. 打开文章文件
2. 在 front matter 中添加 `category: "分类名称"`
3. 保存文件

## 💡 分类建议

- **一篇文章只选一个主分类**，这样更清晰
- **标签可以多个**，用来描述具体技术点
- **分类是大方向，标签是细节**

例如：
```yaml
category: "开发技术"     # 大分类
tags: [Java, Spring, Docker]  # 具体技术标签
```

## 🚀 自动化工具

您可以使用项目中的 `create_blog_post.sh` 脚本来创建新文章，它会提示您选择分类。

这样的分类系统让您：
- ✅ 写作时快速决定分类
- ✅ 读者能快速找到相关内容
- ✅ 博客结构更加清晰有序