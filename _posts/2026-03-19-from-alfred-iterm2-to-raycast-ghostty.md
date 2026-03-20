---
layout: post
title: "效率工具大换血：从 Alfred + iTerm2 到 Raycast + Ghostty"
date: "2026-03-19"
toc: true
excerpt: "用了多年的 Alfred + iTerm2 组合终于被替换。本文记录我切换到 Raycast + Ghostty 的体验、配置思路，以及为什么「多尝试」才是效率提升的底层逻辑。"
tags: [效率工具, 生产力, macOS, 思考总结]
comments: true
author: zempty
---

## 引言

工具用久了会产生路径依赖——"够用了"成了不去尝试新东西的理由。我用 Alfred + iTerm2 这套组合好几年了，一直觉得没什么可换的。直到最近终于动手试了 Ghostty 和 Raycast，才发现：不试一下，你永远不知道自己错过了什么。

本文不是"A 比 B 好"的评测，而是一次真实的工具切换记录：为什么换、怎么配、用下来感受如何。

<!-- more -->

## Ghostty：终端可以这么简单

之前一直用 iTerm2，功能强大没得说，但配置项多到让人焦虑。Ghostty 给我的第一印象是：**简单**。

### 为什么选 Ghostty

- **设置极简** —— 不需要在层层菜单里翻找，配置文件直观清晰
- **主题漂亮** —— 内置主题质量很高，开箱即用
- **Quick Terminal** —— 这是我最喜欢的功能，随时呼出一个终端浮窗，用完即走

### Quick Terminal + Karabiner-Elements：随叫随到

我用 Karabiner-Elements 设置了 **Double Control**（快速双击 Control 键）触发 Ghostty 的 Quick Terminal。效果是：

> 无论我在什么应用里，双击 Control → 终端浮窗弹出 → 干完活 → 消失。

这个组合把终端从一个"需要切换到的应用"变成了一个"随时可用的工具层"，体验完全不同。

### 搭配 zoxide：目录跳转零摩擦

终端效率的另一个瓶颈是 `cd` 到目标目录。配合 [zoxide](https://github.com/ajeetdsouza/zoxide)，它会学习你常访问的路径，`z` + 关键词就能直达：

```bash
z workspace    # 直接跳到 ~/.openclaw/workspace
z blog         # 直接跳到博客目录
```

不用记完整路径，不用敲 Tab 补全，zoxide 比你自己还清楚你要去哪。

### CLI 工具的主场

Ghostty 轻量快速的特点让它特别适合跑 CLI 工具。我日常高频使用的：

- **Claude Code** —— Anthropic 的 CLI 编程助手
- **Codex** —— OpenAI 的终端编码工具
- **Kiro CLI** —— AWS 的 AI 开发工具
- **Cursor CLI** —— Cursor 编辑器的命令行模式

这些工具都需要频繁地在终端里交互，Ghostty 的响应速度和渲染质量让整个体验很流畅。

## Raycast：早该装的效率神器

说实话，Raycast 我观望了很久。身边很多人推荐，但我一直觉得 Alfred 够用了——能搜文件、能跑 Workflow、能管剪贴板，还要什么？

**直到我真正装上 Raycast，才意识到"够用"和"好用"之间差了多远。**

### 我最常用的 Raycast 功能

**快速启动应用**
和 Alfred 类似但更流畅，搜索响应更快，界面更现代。

**剪贴板历史**
内置剪贴板管理，不需要额外装 Paste 之类的工具。支持搜索、Pin、富文本预览。

**Quick AI & AI Chat**
直接在 Raycast 里调 AI，不用切到浏览器。快速翻译、总结、改写，一个快捷键搞定。

**窗口管理（Window Management）**
内置窗口分屏和布局管理，替代了 Rectangle/Magnet。快捷键操作，不用拖来拖去。

**AI Extension**
Raycast 的扩展生态很丰富，AI 相关的扩展可以直接集成到工作流里。

**自定义应用快捷键**
给常用应用绑定全局快捷键，一键直达。比如我设了 `Hyper + T` 打开终端、`Hyper + B` 打开浏览器。

## 感悟：工具要用了才知道

这次切换给我最大的感受不是"新工具多好"，而是：

> **不要让"够用了"阻止你去尝试更好的东西。**

Alfred 和 iTerm2 都是优秀的工具，它们陪我走过了很长时间。但如果我一直停在"够用"的舒适区，就不会发现 Quick Terminal + Double Control 这种让终端无处不在的体验，也不会知道 Raycast 能把那么多零散工具整合到一个入口。

效率提升的底层逻辑不是找到"最好的工具"，而是**保持尝试的习惯**。工具在迭代，需求在变化，只有持续探索，才能找到当下最适合自己的组合。

## 我的当前工具栈

| 用途 | 之前 | 现在 |
|------|------|------|
| 终端 | iTerm2 | Ghostty |
| 启动器 | Alfred | Raycast |
| 剪贴板 | Alfred | Raycast |
| 窗口管理 | Rectangle | Raycast |
| 终端快速呼出 | 无 | Ghostty Quick Terminal + Karabiner |
| 目录跳转 | cd / autojump | zoxide |
| AI 助手 | 浏览器 | Raycast AI + CLI 工具 |

---

工具是手段，不是目的。但好的工具确实能让你少一些摩擦，多一些心流。

如果你也在用 Alfred + iTerm2 的老组合，不妨花半天时间试试 Raycast + Ghostty，也许会有惊喜。
