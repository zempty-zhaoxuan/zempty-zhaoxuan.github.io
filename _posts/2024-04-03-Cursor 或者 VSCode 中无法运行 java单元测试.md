---
layout: post
title: Cursor 或者 VSCode 中无法运行 java单元测试
date: 2024-04-02
toc: true
excerpt: AI, Cursor, VSCode,编辑器
tags: [backend,java,IDE]
comments: true
author: zempty
---

## Cursor 编辑器中无法正常运行 java 的单元测试

1. 正常引入插件 Test Runner for Java;
2. 项目中正常引入 Junit 依赖
3. 在 Intellij idea 中可以正常运行

## 尝试解决

尝试通过 github copilot 和 chatgpt 功能解决，没有找到合适的解决办法，中途有一段时间放弃使用 Cursor 中运行 java 的单元测试，曾以为这是设计上的一个缺陷。

通过浏览器搜索解决了相关问题：

> vscode 中无法运行 java 单元测试

打开搜索链接 

[ vscode配置java test不能正常使用记录 ][1]

该文章解决了相关问题。

## 解决尝试

1. 项目 pom.xml 中引入了如下配置：

```java
<build>
    <!-- 这里是重点，需要添加测试的路径 -->
    <testSourceDirectory>src/main/java</testSourceDirectory>
</build>
```


2. 执行命令 mvn clean install 命令以后问题解决，单元测试可以执行了

## 思考总结

本人过度依赖 AI 功能（ github copilot ，chatgpt ….) ， 忽略了搜索引擎解决问题的能力；

建议解决问题方式：

1. 先使用 AI 去解决相关问题，尝试解决
2. 使用 google 查找相关解决方案


[1]:	https://blog.csdn.net/tianlangstudio/article/details/111872119