---
layout: post
title: Phaser 类详解（JUC 并发）
date: 2024-04-23
toc: true
excerpt: juc 包中一个不好理解的类，提供了丰富的功能
tags: [java,高并发]
comments: true
author: zempty
---

## Phaser 解决了什么问题

1. 它可以取代 CyclicBarrier 和 CountDownLatch 这两个类，功能丰富；
2. 它可以管理分阶段任务，可以有父子任务（大小任务，一个任务拆解成几个小任务）。

PPhaser是Java的并发辅助类，支持多阶段执行、可变参与者数和灵活的线程同步。相比其他工具如CyclicBarrier和CountDownLatch，Phaser更动态、灵活。其主要功能是管理分阶段任务，即所有线程必须在进入下一阶段前完成当前阶段。Phaser提供了register、arrive、arriveAndAwaitAdvance和arriveAndDeregister等方法，可用于注册线程、通知任务完成、等待其他线程到达和动态变化参与线程数，使其成为处理复杂并发任务的有效工具。

## 替换 CyclicBarrier

所有任务参与者到先等待，都到达后再执行。

```java
     @Test
    public void testCyclicBarrierFunction() {
        //这里分配四个任务参与者，包括主线程
        Phaser phaser = new Phaser(4);
        for (int i = 0; i < 3; i++) {
            new Thread(() -> {
                log.debug("start");
                //先等待其他参与者到达
                phaser.arriveAndAwaitAdvance();
                log.debug("end");
            }).start();
        }
        log.debug("main start");
        //主线程等待其他参与者到达
        phaser.arriveAndAwaitAdvance();
        log.debug("main end");
    }
```

执行结果如下：

```java
17:39:25.635 [Thread-0] DEBUG com.zempty.aqs.PhaserDemo - start
17:39:25.635 [Thread-1] DEBUG com.zempty.aqs.PhaserDemo - start
17:39:25.635 [Thread-2] DEBUG com.zempty.aqs.PhaserDemo - start
17:39:25.635 [main] DEBUG com.zempty.aqs.PhaserDemo - main start
17:39:25.638 [Thread-0] DEBUG com.zempty.aqs.PhaserDemo - end
17:39:25.638 [main] DEBUG com.zempty.aqs.PhaserDemo - main end
17:39:25.638 [Thread-2] DEBUG com.zempty.aqs.PhaserDemo - end
17:39:25.639 [Thread-1] DEBUG com.zempty.aqs.PhaserDemo - end
```

这里输出结果是先输出 start ，然后输出 end;  

arriveAndAwaitAdvance() 这个方法会使线程阻塞，暂停运行都到达后（也就是参与者数量都到达以后）才会运行。

## 替换 CountDownLatch

等其它任务都执行完，我才会继续执行。

```java
    @Test
    public void testCountDownLatchFunction() {
        Phaser phaser = new Phaser(3);
        for(int i = 0; i < 3; i++) {
            new Thread(() -> {
                log.debug("{}执行任务", Thread.currentThread().getName());
                phaser.arrive();
            }).start();
        }
        phaser.awaitAdvance(phaser.getPhase());
        log.debug("主线程执行完毕");
    }
```

输出结果：

```java
17:44:05.652 [Thread-2] DEBUG com.zempty.aqs.PhaserDemo - Thread-2执行任务
17:44:05.652 [Thread-0] DEBUG com.zempty.aqs.PhaserDemo - Thread-0执行任务
17:44:05.652 [Thread-1] DEBUG com.zempty.aqs.PhaserDemo - Thread-1执行任务
17:44:05.663 [main] DEBUG com.zempty.aqs.PhaserDemo - 主线程执行完毕
```

这里主线程执行完毕一定是最后输出。

1. arrive () 方法会标记当前任务到达，类似于 CountDownLatch 中的 countDown() 方法的功能；
2. awaitAdvance() 方法会阻塞当前的线程，等待所有参与线程到达 arrive 以后，才会正常往下执行。

## 父子 Phaser 研究

Phaser 有一个构造方法：

```java
public Phaser(Phaser parent,int parties)
```

这个构造方法不好理解，下面介绍一下具体使用，请看如下代码：

```java
Phaser leader = new Phaser(1) ;
Phaser frontend = new Phaser(leader,3);
Phaser backend = new Phaser(leader,3);
```

比如开发一个项目，分为前后端开发，领导负责任务分配，前端有三个人负责开发，后端有三个人负责开发。

```java
Phaser leader = new Phaser(1) ；
```

这里就是 leader 负责管理项目进度，此时任务参与者是 1 ， 也就是 parties = 1;

```java
Phaser Frontend = new Phaser(leader,3);
```

当初始化完 frontend 以后， 这里前端任务参与者是 3，前端 3 个人完成任务，但是此时 leader 的参与者不是 1 了，变成 2 了（parties = 2) ， leader 需要来监管掌握前端的完成进度。

```java
Phaser backend = new Phaser(leader,3);
```

当初始化完 backend 以后，这里的后端任务参与者是 3， 后端 3 个人完成任务，但是此时 leader 的参与者不是 2了，变成 3 了（parties = 3) ， leader 需要来监管掌握后端的完成进度。

总结： 只要有通过 Phaser 初始化一个子 Phaser， 父 Phaser 的任务参与者会增加 1 个。

下面举例分析：

```java

    //父 Phaser 和子 Phaser
    @Test
    public void testPhaserParentAndSons() {
    
        Phaser leader = new Phaser(1);

        Phaser frontend = new Phaser(leader,3);

        Phaser backend = new Phaser(leader,3);

        for(int i = 0; i < 3; i++) {
            new Thread(() -> {
                log.debug("前端线程 {} 任务完成", Thread.currentThread().getName());

                //这里会等待前端三个家伙都完成，人后才可以继续执行提交代码任务
                frontend.arriveAndAwaitAdvance();
                log.debug("前端线程 {} 代码提交完毕", Thread.currentThread().getName());
                //这里会注销前端线程，parties 会减少一个
                frontend.arriveAndDeregister();
            }).start();
        }

        for(int i = 0; i < 3; i++) {
            new Thread(() -> {
                log.debug("后端线程 {} 任务完成", Thread.currentThread().getName());
                //这里会等待后端三个家伙都完成，人后才可以继续执行提交代码任务
                backend.arriveAndAwaitAdvance();
                log.debug("后端线程 {} 代码提交完毕", Thread.currentThread().getName());
                //这里会注销后端线程, parties 会减少一个
                backend.arriveAndDeregister();
            }).start();
        }

        //这里会完成两个功能：
        //1. 等待所有任务到达
        //2. 如果有子 Phaser,它会等待所有子 Phaser 完成任务
        //leader会到达，去监督等待所有人任务完成，然后再去提交代码（完成第一阶段-任务完成）
        leader.arriveAndAwaitAdvance();

        //这里会等待所有人提交代码完毕(完成第二阶段-代码提交)
        //当 parties 为 1 的时候，主线程会在这里放行，继续执行后续代码
        leader.arriveAndAwaitAdvance();
        log.debug("{},审核前后端代码完毕，任务完成！", Thread.currentThread().getName());

    }
```

执行结果如下：

```java
18:58:28.748 [Thread-2] DEBUG com.zempty.aqs.PhaserDemo - 前端线程 Thread-2 任务完成
18:58:28.748 [Thread-0] DEBUG com.zempty.aqs.PhaserDemo - 前端线程 Thread-0 任务完成
18:58:28.748 [Thread-3] DEBUG com.zempty.aqs.PhaserDemo - 后端线程 Thread-3 任务完成
18:58:28.748 [Thread-1] DEBUG com.zempty.aqs.PhaserDemo - 前端线程 Thread-1 任务完成
18:58:28.748 [Thread-4] DEBUG com.zempty.aqs.PhaserDemo - 后端线程 Thread-4 任务完成
18:58:28.748 [Thread-5] DEBUG com.zempty.aqs.PhaserDemo - 后端线程 Thread-5 任务完成
18:58:28.758 [Thread-1] DEBUG com.zempty.aqs.PhaserDemo - 前端线程 Thread-1 代码提交完毕
18:58:28.758 [Thread-3] DEBUG com.zempty.aqs.PhaserDemo - 后端线程 Thread-3 代码提交完毕
18:58:28.758 [Thread-2] DEBUG com.zempty.aqs.PhaserDemo - 前端线程 Thread-2 代码提交完毕
18:58:28.758 [Thread-5] DEBUG com.zempty.aqs.PhaserDemo - 后端线程 Thread-5 代码提交完毕
18:58:28.758 [Thread-4] DEBUG com.zempty.aqs.PhaserDemo - 后端线程 Thread-4 代码提交完毕
18:58:28.759 [Thread-0] DEBUG com.zempty.aqs.PhaserDemo - 前端线程 Thread-0 代码提交完毕
18:58:28.763 [main] DEBUG com.zempty.aqs.PhaserDemo - main,leader 审核前后端代码完毕，任务完成！
```

执行顺序是：任务完成→代码提交完毕→审核前后端代码完毕，任务完成！

结果分析：

frontend.arriveAndAwaitAdvance() 开始会阻塞等待所有前端任务完成后，才会继续往下面执行；

backend.arriveAndAwaitAdvance() 开始会阻塞等待所有后端任务完成后，才会继续往下面执行；

leader.arriveAndAwaitAdvance() 第一次调用会等待所有子任务的任务完成后才会继续往下面执行；

frontend.arriveAndDeregister() 会进行第二轮的到达，这里 frontend 一位同志代码提交完成，下线，这里 frontend 的任务由初始化的 3 ，变成 2 ，然后 1，最后 0；

backend 同理；

 leader.arriveAndAwaitAdvance() 第二次调用的时候，当 frontend 和 backend 代码已经提交，纷纷下线，leader 任务参与者变成 1 （ parties = 1) , 此时主线程到达，可以继续执行，最后会运行：

```java
main,leader 审核前后端代码完毕，任务完成！
```
