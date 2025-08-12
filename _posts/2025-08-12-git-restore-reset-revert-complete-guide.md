---
layout: post
title: "Git 后悔药完全指南：restore / reset / revert 命令详解"
date: "2025-08-12"
toc: true
excerpt: "一文彻底搞懂 git restore、git reset、git revert 三大“后悔药”：分别作用于工作区/暂存区、本地历史与远程已推送历史，涵盖核心概念、常见用法、风险等级与实战建议。"
tags: [git, 技术相关, 工作流]
cover_image: git_image.png
comments: true
author: zempty
---

最近在研究 `git restore` / `git reset` / `git revert` 命令：

- **git restore**：针对未提交（工作区/暂存区）的后悔操作；
- **git reset**：针对本地 `HEAD` 的历史回退，主要用于撤销已提交但未推送的提交；
- **git revert**：针对已推送到远程的后悔药，通过新增一个相反变更的提交来“撤销”历史。

在掌握命令前，务必理解几个阶段：`工作区 (worktree)` / `Index (Staging Area)` / `Repository (Local)` / `Remote`。理解这些层次有助于把握三者的作用范围与风险。

![Git 概念图]({{ site.baseurl }}/images/git_image.png)

## git restore 命令

### 撤销本地（工作区）修改

```bash
git restore xxx/yyy/file
# 或者撤销整个目录
git restore .
```

撤销工作区已被 Git 追踪的文件的未暂存修改（新建的未追踪文件无效）。这会丢失未暂存的修改，慎用！

### 撤销 index（撤销 git add）

```bash
git restore --staged xxx/yyy/file
# 撤销所有暂存的文件
git restore --staged .
```

撤销暂存，改动回到工作区，相当于撤销 `git add`，文件修改仍然保留在工作区。

### 撤销到指定提交版本

```bash
# 只恢复工作区文件到指定版本
git restore --source=commit_id xxx/yyy/file

# 同时恢复工作区和暂存区到指定版本
git restore --source=commit_id --staged --worktree xxx/yyy/file

# 示例：恢复到上一次提交
git restore --source=HEAD~1 README.md
```

### 实用技巧

```bash
# 交互式选择要恢复的内容
git restore -p file

# 恢复被删除的文件（从当前 HEAD 恢复）
git restore deleted_file.txt
```

### 小结

`git restore`（自 Git 2.23 起）聚焦工作区与暂存区，语义化替代部分 `git checkout` 用法，表达更清晰。

## git reset 命令

### --soft 模式

```bash
git reset --soft commit_id
# 示例：撤销最近一次提交，但保留更改在暂存区
git reset --soft HEAD~1
```

本地仓库回到 `commit_id`，`HEAD` 指向 `commit_id`，但暂存区与工作区不变。

**使用场景**：
- 合并多次提交为一次，并重写提交信息
- 撤销提交但保留暂存内容，继续修订

### --mixed 模式（默认）

```bash
git reset --mixed commit_id
# 或简写为
git reset commit_id

# 示例：撤销最近两次提交，更改保留在工作区
git reset HEAD~2
```

本地仓库与暂存区回到 `commit_id`，工作区保持不变。可用 `git status` 查看被“撤回”到工作区的改动。

**使用场景**：
- 重新组织提交：撤销后重新选择要提交的文件
- 拆分大提交为多个小提交

### --hard 模式（危险）

```bash
git reset --hard commit_id

# 示例：完全回退到上一次提交，丢弃所有更改
git reset --hard HEAD~1

# 回退到远程分支状态
git reset --hard origin/main
```

工作区 -> 暂存区 -> 本地仓库全部回退到 `commit_id`，未提交的更改会被彻底丢弃！

**后悔药的后悔药**：

```bash
# 如果后悔了 reset --hard 操作
git reflog              # 查看操作历史，找到之前的 commit_id
git reset --hard <commit_id>  # 回到之前状态
```

### 高级用法

```bash
# 将特定文件的“暂存区内容”重置为某个提交版本（工作区不变）
git reset commit_id -- file_path

# 仅重置暂存区到 HEAD（工作区不变，等价于“取消暂存”）
git reset HEAD -- file_path
```

### 小结

`git reset` 主要用于本地历史（未推送）的回退：
- **--soft**：仅移动 `HEAD`，暂存区/工作区不变
- **--mixed**：移动 `HEAD` 和暂存区，工作区不变
- **--hard**：三者全重置，危险！

## git revert 命令

通过创建一个新的“反向变更”的提交来撤销某次历史提交，历史线性且完整，适合协作场景。

### 基本用法

```bash
git revert commit_id

# 示例：撤销最近一次提交
git revert HEAD

# 撤销指定范围的提交（不包括 commit1）
git revert commit1..commit2
```

撤销 `commit_id` 的更改：之前添加的内容会被删除；之前删除的内容会被恢复。

### 批量撤销

```bash
# 撤销多次提交，不自动创建 commit
git revert -n commit_id1 commit_id2 ...
# 最后统一提交
git commit -m "Revert multiple commits"

# 撤销一个范围内的提交
git revert --no-commit HEAD~3..HEAD
git commit -m "Revert last 3 commits"
```

### 处理冲突

```bash
# revert 可能产生冲突，需要手动解决
git revert commit_id
# 解决冲突后
git add .
git revert --continue

# 或者放弃 revert
git revert --abort
```

### 实用场景

```bash
# 撤销 merge commit
git revert -m 1 <merge_commit_id>  # -m 1 表示保留第一个父分支

# 撤销 revert（撤销的撤销）
git revert <revert_commit_id>
```

### 小结

`git revert` 适用于“已推送”的历史修正，不改写历史，通过新增提交进行撤销，是多人协作时的安全选择。

## 三者对比与选择

| 命令 | 作用范围 | 是否改写历史 | 适用场景 | 危险程度 |
|------|---------|--------------|---------|---------|
| **git restore** | 工作区/暂存区 | 否 | 未提交的修改 | 低（仅影响未提交内容） |
| **git reset** | 本地仓库 | 是 | 本地已提交但未推送 | 中-高（`--hard` 很危险） |
| **git revert** | 远程历史（已推送） | 否（新增提交） | 已推送的提交需要撤销 | 低（协作安全） |

## 实战建议

1. **未提交的修改**：优先使用 `git restore`
2. **本地提交未推送**：使用 `git reset`
3. **已推送到远程**：使用 `git revert`
4. **不确定时**：先 `git stash` 保存，或创建临时/备份分支
5. **查看历史**：善用 `git reflog` 与 `git log` 理清操作轨迹

记住：Git 让你很难真正丢失“已记录”的内容，`git reflog` 是你的终极后悔药！

