# mysql 不支持 emoji 表情

日期: May 20, 2021 9:33 PM
状态: 已解决
类型: mysql, 编程

**解决方案**

```java
ALTER TABLE feed_look CHANGE content content text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

**参考文章**

[网页收集](https://www.notion.so/8f9462b07cad4be1879a081480715805)