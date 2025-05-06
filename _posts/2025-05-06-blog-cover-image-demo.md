---
layout: post
title: "博客封面图功能演示"
toc: true
excerpt: 博客新功能介绍：封面图-代码高亮-阅读进度条
date: 2025-05-06
tags: [博客, 功能更新]
cover_image: tesla.jpg
toc: true
---

# 博客新功能介绍

本文将介绍最近对博客进行的功能增强，包括：

1. 文章封面图
2. 代码高亮优化
3. 评论区美化
4. 阅读进度条

## 封面图功能

现在每篇文章都可以设置封面图了！只需在文章的 Front Matter 中添加 `cover_image` 属性，指向 `/images/` 目录下的图片即可。

```markdown
---
layout: post
title: "文章标题"
date: 2023-01-01
tags: [标签1, 标签2]
cover_image: your-image.jpg
---
```

## 代码高亮优化

代码块现在有了更好的视觉效果：

```javascript
// 这是一个代码块示例
function sayHello(name) {
  console.log(`Hello, ${name}!`);
  return true;
}

// 调用函数
sayHello('读者');
```

```python
# Python代码示例
def calculate_factorial(n):
    """计算阶乘"""
    if n == 0 or n == 1:
        return 1
    else:
        return n * calculate_factorial(n-1)
        
print(calculate_factorial(5))  # 输出: 120
```

## 评论区美化

评论区的样式也进行了优化，更加美观并且适合阅读。现在支持深色模式下的自适应样式。

## 阅读进度条

页面顶部的阅读进度条可以直观地显示您在文章中的阅读位置。随着滚动，进度条会自动更新。

---