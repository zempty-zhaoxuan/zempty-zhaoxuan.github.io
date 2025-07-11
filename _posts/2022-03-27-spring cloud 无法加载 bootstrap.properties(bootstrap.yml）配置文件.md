---
layout: post
title: sping cloud 无法加载bootstrap.properties
date: 2022-03-17
category: "其它"
toc: true
excerpt: 问题排查方案解决
tags: [java,棘手问题]
comments: true
author: zempty
---

spring cloud 项目无法加载 [bootstrap.properties](http://bootstrap.properties) (bootstrap.yml) 文件，添加如下的相关依赖即可：

```bash

<dependency>
        <groupId>org.springframework.cloud</groupId>
        <artifactId>spring-cloud-starter-bootstrap</artifactId>
 </dependency>
 
```



相关参考的解决方案：

[bootstrap.yml configuration not processed anymore with Spring Cloud 2020.0](https://stackoverflow.com/questions/64994034/bootstrap-yml-configuration-not-processed-anymore-with-spring-cloud-2020-0)
