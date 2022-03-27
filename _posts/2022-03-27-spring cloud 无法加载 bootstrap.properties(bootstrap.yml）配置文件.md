# spring cloud 无法加载 bootstrap.properties(bootstrap.yml）配置文件

日期: October 25, 2021 11:12 AM
状态: 已解决
类型: 编程

spring cloud 项目无法加载 [bootstrap.properties](http://bootstrap.properties) (bootstrap.yml) 文件，添加如下的相关依赖即可：

```bash
<dependency>
        <groupId>org.springframework.cloud</groupId>
        <artifactId>spring-cloud-starter-bootstrap</artifactId>
 </dependency>
```

相关参考的解决方案：

[bootstrap.yml configuration not processed anymore with Spring Cloud 2020.0](https://stackoverflow.com/questions/64994034/bootstrap-yml-configuration-not-processed-anymore-with-spring-cloud-2020-0)