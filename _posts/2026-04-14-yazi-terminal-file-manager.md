---
layout: post
title: "🦆 Yazi：用 Rust 打造的极速终端文件管理器"
date: "2026-04-14"
toc: true
excerpt: "厌倦了在终端里反复 cd、ls？Yazi 是一款用 Rust 编写的现代终端文件管理器，速度极快，三栏布局，搭配 Ghostty 使用堪比 IDE。"
tags: [tools, linux, development]
comments: true
author: zempty
---

如果你厌倦了在终端里反复 `cd`、`ls`、`cat`，或者觉得 `ranger` 太慢、`nnn` 太简陋，那 Yazi 可能正是你一直在寻找的那个答案。

<!-- more -->

## 什么是 Yazi？

Yazi（日语"鸭子"之意 🦆）是一款用 **Rust** 编写的现代终端文件管理器，基于异步 I/O 架构，速度极快，支持图片、视频、PDF 预览，还拥有完善的插件生态。

搭配 Ghostty 终端分屏使用，能获得接近 IDE 的文件浏览体验——左边跑代码，右边实时监控文件变化，优雅且高效。

---

## 安装与初始配置

### macOS 一键安装

```bash
brew install yazi ffmpegthumbnailer poppler fd ripgrep fzf zoxide
```

这里安装的不只是 Yazi 本体，还包括一套强力的配套工具：

| 工具 | 用途 |
|------|------|
| `ffmpegthumbnailer` | 视频缩略图预览 |
| `poppler` | PDF 文件预览 |
| `fd` | 快速文件搜索 |
| `ripgrep` | 文件内容搜索 |
| `fzf` | 模糊搜索 |
| `zoxide` | 智能目录跳转（强烈推荐！） |

### 配置 Shell Wrapper（重要！）

在 `~/.zshrc` 中加入以下函数，这样退出 Yazi 后终端会**自动跳转**到你最后浏览的目录：

```bash
function y() {
  local tmp="$(mktemp -t "yazi-cwd.XXXXXX")" cwd
  yazi "$@" --cwd-file="$tmp"
  if cwd="$(command cat -- "$tmp")" && [ -n "$cwd" ] && [ "$cwd" != "$PWD" ]; then
    builtin cd -- "$cwd"
  fi
  rm -f -- "$tmp"
}
```

执行 `source ~/.zshrc` 后，以后用 `y` 命令启动 Yazi 即可，再也不用担心"回到终端发现还在老目录"的尴尬。

### 创建配置文件

```bash
mkdir -p ~/.config/yazi
cd ~/.config/yazi
touch yazi.toml keymap.toml theme.toml
```

三个配置文件各司其职：

| 文件 | 用途 |
|------|------|
| `yazi.toml` | 通用配置（布局、显示、排序等） |
| `keymap.toml` | 自定义快捷键 |
| `theme.toml` | 主题颜色 |

---

## 三栏布局，一目了然

Yazi 的界面采用经典的**三栏布局**：

```
┌──────────┬─────────────────┬──────────────┐
│  父目录   │   当前目录（主）  │   文件预览    │
└──────────┴─────────────────┴──────────────┘
```

可以在 `yazi.toml` 中自定义比例：

```toml
[mgr]
ratio = [1, 4, 3]  # 父目录:当前目录:预览 = 1:4:3
```

如果你只想把 Yazi 当"侧边栏"用，可以直接隐藏父目录栏：

```toml
[mgr]
ratio = [0, 2, 3]  # 只显示当前目录和预览
```

---

## 核心快捷键速查

Yazi 的快捷键对 Vim 用户非常友好，上手成本极低。

### 基础导航

| 快捷键 | 功能 |
|--------|------|
| `j` / `k` | 上下移动光标 |
| `h` / `l` | 返回父目录 / 进入目录 |
| `J` / `K` | 向下/向上移动半页 |
| `gg` | 跳到顶部 |
| `G` | 跳到底部 |
| `~` | 回到 Home 目录 |

### 搜索与跳转

| 快捷键 | 功能 |
|--------|------|
| `/` | 搜索文件（使用 fd） |
| `f` | 过滤当前目录（实时筛选） |
| `z` | 使用 zoxide 智能跳转 |
| `Z` | 使用 fzf 模糊搜索跳转 |
| `s` | 在文件内容中搜索（使用 ripgrep） |

### 文件操作

| 快捷键 | 功能 |
|--------|------|
| `y` | 复制（yank） |
| `x` | 剪切 |
| `p` | 粘贴 |
| `d` | 删除到回收站 |
| `D` | 永久删除 |
| `a` | 新建文件/目录（`/` 结尾则创建目录） |
| `r` | 重命名 |
| `.` | 切换显示隐藏文件 |

### Tab 管理

| 快捷键 | 功能 |
|--------|------|
| `t` | 新建 Tab |
| `1-9` | 切换到第 N 个 Tab |
| `[` / `]` | 切换上一个/下一个 Tab |
| `Ctrl + c` | 关闭当前 Tab |

### 文件排序

| 快捷键 | 功能 |
|--------|------|
| `,m` | 按修改时间排序 |
| `,M` | 按修改时间排序（倒序） |
| `,s` | 按文件大小排序 |
| `,n` | 按文件名排序 |

---

## 实用配置推荐

### 默认显示隐藏文件

```toml
# ~/.config/yazi/yazi.toml
[mgr]
show_hidden = true
```

### Esc 直接关闭输入框

默认 Esc 会进入 Vi 模式，下面的配置让 Esc 直接关闭输入框，更符合直觉：

```toml
# ~/.config/yazi/keymap.toml
[[input.prepend_keymap]]
on = "<Esc>"
run = "close"
desc = "Cancel input"
```

### 排序默认按修改时间（最新在前）

```toml
# ~/.config/yazi/yazi.toml
[mgr]
sort_by = "modified"
sort_dir_first = true
sort_reverse = true
```

---

## 搭配 Ghostty + Claude Code 的工作流

这是我目前最喜欢的使用方式：

```
┌────────────────────────┬──────────────────┐
│                        │                  │
│     Claude Code        │      Yazi        │
│     (主工作区)          │   (文件监控)      │
│                        │                  │
└────────────────────────┴──────────────────┘
```

**操作步骤：**

1. 打开 Ghostty，`cd` 到项目目录
2. 启动 Claude Code
3. **⌘ + D** 垂直分屏，右侧打开新面板
4. 右侧运行 `y`（或 `yazi`）
5. 用 **⌘⌥ + 方向键** 在左右面板之间切换

**高效使用技巧：**

- **⌘⇧Enter** 临时放大当前面板（再按恢复），方便专注某一侧
- 按 `.` 切换隐藏文件显示，随时查看 `.git`、`.env` 等配置文件
- 按 `f` 快速过滤，输入 `.ts` 只显示 TypeScript 文件
- 按 `z` 用 zoxide 快速跳到常去的目录
- **按 `,m` 按修改时间排序**，最新修改的文件排在最前——这是追踪 Claude Code 改了哪些文件的最佳方式

---

## 推荐插件

Yazi 有完善的插件系统，用 `ya pkg` 安装（v25.2.7+ 版本已将 `ya pack` 更名为 `ya pkg`）：

```bash
# 文件自动打开，目录自动进入
ya pkg add yazi-rs/plugins:smart-enter

# 不用进入目录即可粘贴
ya pkg add yazi-rs/plugins:smart-paste

# 显示文件的 Git 状态
ya pkg add yazi-rs/plugins:git
```

### 启用 Git 状态显示

安装 git 插件后，在 `yazi.toml` 中添加：

```toml
[plugin]
prepend_fetchers = [
  { id = "git", name = "*", run = "git" },
  { id = "git", name = "*/", run = "git" },
]
```

这样 Yazi 中就会直观地显示文件的 Git 状态（新增、修改、未追踪等），体验和 IDE 一样。

---

## 总结

Yazi 是目前我用过的最好的终端文件管理器。Rust 带来的性能优势让响应速度几乎感知不到延迟，三栏布局让文件导航变得直觉化，搭配 zoxide、fzf 等工具后，目录跳转和文件搜索都变得极为流畅。

对于日常在终端工作的开发者来说，Yazi 值得花一两个小时认真配置，之后你会发现自己再也离不开它。

---

## 参考资源

- [官方文档](https://yazi-rs.github.io/docs/quick-start/)
- [配置参考](https://yazi-rs.github.io/docs/configuration/overview/)
- [快捷键完整列表](https://yazi-rs.github.io/docs/configuration/keymap/)
- [进阶技巧](https://yazi-rs.github.io/docs/tips/)
- [社区插件合集 awesome-yazi](https://github.com/AnirudhG07/awesome-yazi)
