---
layout: post
title: "从 0 开始学习搭建自己的网站（速成版）"
date:   2022-03-26
toc: true 
author: zempty
---
## 从 0 开始学习搭建自己的网站（速成版）

前面写了一篇文章 [ 从 0 开始学习搭建自己的网站（详细版） ]，基本上把搭建一个网站的细节要素介绍到位了，下面针对前文在此做一个总结：

- 前文已经说明拥有自己的网站需要服务器+域名+ ssl 证书，这些都可以免费获取就不再次啰嗦了 。
- 前文需要在服务器上安装 docker + mysql + wordpress + nginx + ssl , 虽然文章中操作服务器的命令已经罗列的相当详尽，但是相信没有计算机基础的人还是很难坚持做下去的
- 如果认真操作下来，你不仅仅收货了怎么样搭建一个网站，你应改有一下收获：
	1. 学会使用docker 安装 mysql 软件，并配置 mysql 远程连接 
	2. 学会使用 docker 安装 wordpress  
	3. 学会使用 docker 安装 nginx ,通过反向代理访问 wordpress
	4. 学会免费获取 ssl 证书，并在 nginx 上配置使用 https

下面开始本文快速搭建网站的讲解，上一篇文章  [ 从 0 开始学习搭建自己的网站（详细版） ] 步骤稍多。给大家介绍一个很好的网站，可能需要科学上网才能访问 [https://bitnami.com/] ：它把很多软件打包成一个安装包，我们只需要在 server 上执行一个命令，该安装的软件就都安装了。

下面开始快速安装我们的安装包来搭建我们的网站，请参考如下图片提示在 server 上安装我们需要的安装包：

##下载安装包

点解红色箭头提示，进入搜索安装：
(img)

输入 wordpress ,选中图示图标进入安装界面：
(img)

安装 linux 版本如下：
(img)

复制如下安装包的链接：
(img)


连接server 复制链接，下载安装包：
mkdir ～/software
wget [https://bitnami.com/redirect/to/797480/bitnami-wordpresspro-5.3-0-linux-x64-installer.run]

贴心提示：如果 wget 无法使用请安装 wget
yum install wget

现在 ～/software 路径下面应该有 bitnami-wordpresspro-5.3-0-linux-x64-installer.run 这个安装包。

##执行安装包

给安装包赋予执行权限：
chmod +x bitnami-wordpresspro-5.3-0-linux-x64-installer.run

运行安装包：
./bitnami-wordpresspro-5.3-0-linux-x64-installer.run

下面截取部分图片如下：

点击回车键继续：
(img)

接下来按照提示填写信息，等待安装完毕：
(img)

安装完毕以后，会在 /opt/wordpresspro-5.3-0 下面看到下图所示：
(img)

到这里我们的软件 wordpress + nginx + mysql + ssl 就都安装完毕了！！！

##给自己的域名配置 ssl 证书

执行如下命令切换到该目录下：
cd /opt/wordpresspro-5.3-0/letsencrypt/scripts/

执行如下命令,按照终端提示一直输入 Y，等待执行完毕：
./generate-certificate.sh -m kickcodeman@qq.com -d zempty.cf

查看 /opt/wordpresspro-5.3-0/nginx/conf 目录下面有没有生成根据你的域名命名的 ssl 证书文件：
(img)

##  重新启动所有服务

切换到 /opt/wordpresspro-5.3-0 目录下面：
cd /opt/wordpresspro-5.3-0

执行下面命令，重启所有服务：
./ctlscript.sh restart 

打开浏览器输入域名测试 zempty.cf  测试，测试成功！！！

##总结

以上详述了搭建网站的步骤流程，如有疑问，欢迎留言，下面提供该软件包的官方参考文档链接如下：[https://docs.bitnami.com/installer/apps/wordpress-pro/get-started/] ，有不解之处也可以参考官方文档进行解决，网站已经解决但是接下来是时候来布局美化自己的网站了，这个过程也是蛮耗精力的，推荐两个教程：

[ 如何使用wordpress做一个精美的网站？ ]
[ 人人都能学会的 WordPress 实战课 ]

最后，恭喜你！！！
