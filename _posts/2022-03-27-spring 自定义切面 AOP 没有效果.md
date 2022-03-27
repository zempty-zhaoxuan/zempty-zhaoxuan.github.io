### merquri 工作中遇到这样一个问题，自定义 AOP 没有效果，解决方案如下：

- 自定义切面
    
    ![Screen Shot 2021-09-29 at 10.29.52 AM.png](spring%20%E8%87%AA%E5%AE%9A%E4%B9%89%20a6b59/Screen_Shot_2021-09-29_at_10.29.52_AM.png)
    
- 解决方案：
    
    ![Screen Shot 2021-09-29 at 10.30.41 AM.png](spring%20%E8%87%AA%E5%AE%9A%E4%B9%89%20a6b59/Screen_Shot_2021-09-29_at_10.30.41_AM.png)
    
    总结： 不可以使用 this 调用本方法，需要使用引用才可以有效果。