```java
{
  "msg": "Service Unavailable. Please try after sometime.",
  "ret": -408
}
```

情形是这样的：遇到了一个问题，就是本地服务接口测试一直正常，但是放到服务器测试的时候出现问题，老是报如下的错误：

```java
{
  "msg": "Service Unavailable. Please try after sometime.",
  "ret": -408
}
```

经过测试分析，服务是通过 zull 网关访问的，通过 zull 访问相关微服务的时候，会返回如上的一个错误提示，应该是时间超时了，修改 application.yml 的相关配置：

```java
# 这个 xxx 是zull中配置的路由服务
xxxxxxxx:
  ribbon:
    ReadTimeout: 60000
```

配置相关参数，完美解决问题！！！