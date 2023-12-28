---
layout: post
title: git submodule 用法总结
date: 2022-03-27
toc: true
excerpt: git submodule 的使用总结
tags: [java,git,软件]
comments: true
author: zempty
---
> 开发的过程中有时候会遇到这样的情形： 现在有 A, B , C 三个项目，三个项目各自运行，现在 A 项目用到了 B 和 C 项目，需要把 B 和 C 项目变成 A 项目的的子项目，如何使用 git 来操作和管理呢？
> 

### 父工程引入子工程

1. 创建或者拉取远程的父工程项目 A (日常操作）
2. 引入 B 工程项目或者 C 
	```bash
	git submodule add B项目的仓库路径 ./B
	    
	上面这条命令是在 A 项目目录下面运行，拉取远程的仓库 B ,并且在 A 项目目录下面新建一个 B 目录
	```
3. 正常更新提交 A 项目（日常操作 )

### 子工程的提交和更新

切换到 A 中的 B 或者 C 的目录下面，我们会发现子项目 B 或者 C 下面 .git 目录，这说明 B 和 C 可以单独的使用 git 命令操作，可以拉取远程代码/提交远程代码/分支的切换等操作,如下等等：

```bash
git status

git add .

git commit -am"XXXXX"

git pull origin B

git push origin B
```

当然更新了 B 或者 C 项目后，对于 A 项目而言整个项目是有变动的，这个时候需要切换到 A 项目的目录下面更新提交一下 A 项目，这个时候 A , B , C 项目的 git 操作就完成了

在 A 目录下，如何直接更新 B 或者 C 呢？

```bash
git submodule update --remote
该命令可以把远程的 B 或者 C 的更新直接拉取下来到本地
```

### 拉取远程使用 git submodule 的项目

**当远程拉取一个使用 submodule  的父工程的时候，我们会发现父工程中的子工程是空的？这个问题如何解决呢？**

1. 就是使用 git submodule 命令：
	```bash
	git submoudle init  
	    
	该命令注册子工程的远程路径到父工程当中
	    
	git submodule update
	    
	该命令用来拉取子工程项目和更新子工程的项目
	    
	```
	也可以使用如下个一个命令解决问题：
	```bash
	git submodule update --init --recursive
	```
2. 克隆的时候把子工程的项目一并克隆下来
	```bash
	git clone --recursive A项目的仓库路径
	克隆父工程的时候添加一个 --recursive ,顺便把子工程的项目也拉取下来
	```