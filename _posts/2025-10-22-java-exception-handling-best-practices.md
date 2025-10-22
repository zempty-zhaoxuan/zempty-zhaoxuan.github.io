---
layout: post
title: "Java 异常处理最佳实践：分类、选型与流程"
date: "2025-10-22"
toc: true
excerpt: "系统梳理 Java 异常体系：分类与层次、Runtime vs Checked 的取舍、分层与边界的处理策略、标准处理流程与代码范式，并附上可落地的最佳实践清单。"
tags: [java, backend, 软件, 思考总结, 异常处理]
comments: true
author: zempty
---

## 引言

异常不是“错误日志”的同义词，而是“非期望路径”的正式建模方式。设计和使用不当，会让代码充满噪音、隐藏真实问题并增加维护成本。本文从分类与层次、日常使用准则、Runtime 与 Checked 的取舍，到标准处理流程与代码范式，给出一套可落地的异常处理实践。

## 1. Java 异常体系与分类

Java 的异常层次结构：

- Throwable
  - Error（不可恢复，JVM 级问题，例如 `OutOfMemoryError`、`StackOverflowError`）
  - Exception
    - 受检异常（Checked）：编译期强制处理，例如 `IOException`、`SQLException`
    - 运行时异常（Runtime/Unchecked）：编译期不强制处理，例如 `NullPointerException`、`IllegalArgumentException`、`IndexOutOfBoundsException`

常见分类方式：

- 按是否受检：Checked vs Unchecked（Runtime）
- 按语义与来源：
  - 业务异常（如“余额不足”“库存不足”）
  - 系统异常（IO/网络/数据库/序列化/并发等）
  - 可恢复 vs 不可恢复（是否可以重试/降级）

典型示例（节选）：

| 类型 | 示例 | 说明 |
| --- | --- | --- |
| Checked | IOException, SQLException, ParseException | 外部资源或格式问题，调用方通常需要明确处理 |
| Runtime | NullPointerException, IllegalArgumentException, IllegalStateException | 多为编程错误或前置条件不满足 |
| Error | OutOfMemoryError, StackOverflowError | 不要捕获，交由进程崩溃或上报 |

## 2. 日常开发中如何正确使用异常

- 使用异常表达“异常路径”，不要把异常当作正常控制流（如跳出循环）。
- 精准抛出与捕获：
  - 抛出时选择最贴切的异常类型；
  - 捕获时尽量精确，不要无脑 `catch (Exception e)`；
  - 需要跨边界时“转换并保留原因”（异常链）。
- 充足上下文：抛出/包装异常时加入关键上下文（谁、做什么、用什么参数）以便排障。
- 保证资源安全：优先使用 try-with-resources 自动关闭资源。
- 不吞异常：禁止空 `catch`；确需忽略时，需注释说明“为何安全”。
- 合理日志：
  - 只在“处理边界”记录日志，避免重复日志；
  - 使用结构化日志字段（如 `orderId`、`userId`）；
  - 选择合适级别（WARN/ERROR），避免日志风暴。
- 参数校验优先：对入参使用显式校验，使用 `IllegalArgumentException` 或校验框架；避免依赖下游 NPE 暴露问题。
- 分层处理：
  - 基础设施层（DAO、网关）抛出技术异常并添加上下文；
  - 领域层可转换为领域异常；
  - 接口适配层（Controller/接口）统一映射为对外错误码/HTTP 状态。

## 3. 运行时异常 vs 受检异常：如何区分与选择

经验法则：

- 可恢复问题且调用方“必须显式处理”的，用受检异常（如文件/网络 IO）；
- 编程错误、前置条件/状态不满足，用运行时异常（如 `IllegalArgumentException`、`IllegalStateException`）；
- 框架与现代业务代码中，倾向使用运行时异常减少签名噪音，并在“调用边界”统一处理。

决策参考表：

| 问题特征 | 是否可恢复 | 谁负责处理 | 建议类型 |
| --- | --- | --- | --- |
| 外部资源（文件/网络/DB）短暂故障 | 是 | 立即重试/降级 | Checked 或包一层 Runtime 并在边界重试 |
| 入参不合法/状态机错误 | 否（修代码） | 开发者 | Runtime（IllegalArgument/State） |
| 第三方库抛 Checked，但我不想污染签名 | 视情况 | 统一异常层 | 包装成 Runtime 并保留 cause |
| 不可恢复（内存耗尽） | 否 | 系统 | 不处理（Error） |

建议：

- 库/SDK 面向多样调用者：对“必须处理”的情况保留 Checked；
- 业务服务内部：倾向 Runtime + 统一异常处理（如 Spring `@ControllerAdvice`），在外层做重试/降级。

## 4. 正确处理异常的标准流程

1) 发现与抛出：在最靠近问题源处抛出或立刻包装，并补充上下文。

2) 资源处理：使用 try-with-resources 或 finally 保证资源关闭。

3) 边界转换：跨层时转换为更贴近语义的异常，保留 cause：`new BusinessException("支付失败", cause)`。

4) 决策与补救：根据异常类型进行重试、降级、兜底返回或熔断。

5) 记录与上报：仅在处理边界打一次日志，携带关键字段，并上报监控/告警。

6) 对外反馈：在接口层映射为稳定的错误码/HTTP 状态与易懂信息（不泄漏内部细节）。

## 5. 代码范式与示例

### 5.1 try-with-resources 保证资源安全

```java
public String readFirstLine(Path path) {
    try (BufferedReader reader = Files.newBufferedReader(path, StandardCharsets.UTF_8)) {
        return reader.readLine();
    } catch (IOException ioe) {
        throw new UncheckedIOException("Read first line failed: path=" + path, ioe);
    }
}
```

### 5.2 丰富上下文并保留异常链

```java
public Order loadOrder(String orderId) {
    try {
        return repository.findById(orderId)
            .orElseThrow(() -> new NoSuchElementException("Order not found: " + orderId));
    } catch (RuntimeException e) {
        throw new OrderLoadException("Load order failed: orderId=" + orderId, e);
    }
}

public class OrderLoadException extends RuntimeException {
    public OrderLoadException(String message, Throwable cause) {
        super(message, cause);
    }
}
```

### 5.3 参数校验用运行时异常（或校验框架）

```java
public void transfer(String from, String to, BigDecimal amount) {
    if (from == null || to == null) {
        throw new IllegalArgumentException("Account must not be null");
    }
    if (amount == null || amount.signum() <= 0) {
        throw new IllegalArgumentException("Amount must be positive");
    }
    // ... do transfer
}
```

### 5.4 Web 接口层的统一异常处理（Spring 示例）

```java
@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(IllegalArgumentException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ErrorResponse handleBadRequest(IllegalArgumentException ex) {
        return ErrorResponse.of("INVALID_ARGUMENT", ex.getMessage());
    }

    @ExceptionHandler(OrderLoadException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public ErrorResponse handleOrderNotFound(OrderLoadException ex) {
        return ErrorResponse.of("ORDER_NOT_FOUND", ex.getMessage());
    }

    @ExceptionHandler(Exception.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public ErrorResponse handleGeneric(Exception ex) {
        return ErrorResponse.of("INTERNAL_ERROR", "系统繁忙，请稍后重试");
    }
}
```

### 5.5 重试/降级的边界处理（伪代码）

```java
public Data fetchWithRetry() {
    for (int attempt = 1; attempt <= 3; attempt++) {
        try {
            return remoteClient.fetch();
        } catch (TransientException e) {
            if (attempt == 3) throw e; // 边界抛出，由上层统一处理
            backoff(attempt);
        }
    }
    throw new IllegalStateException("Unreachable");
}
```

## 6. 最佳实践清单（可直接落地）

- 精准类型：抛/捕获尽量具体类型；跨层转换时保留 cause。
- 充足上下文：message 要包含关键业务字段而非“失败了”。
- 单点记录：只在真正处理的边界记录日志，避免重复打印。
- 资源安全：使用 try-with-resources；不要在 finally 里吞异常。
- 参数为先：显式入参校验优于依赖下游异常暴露。
- 选型一致：团队达成“何时 Runtime/Checked”的共识并文档化。
- 用户友好：对外返回稳定错误码与可理解提示，隐藏实现细节。
- 监控闭环：异常 → 日志/链路追踪 → 告警 → 根因分析 → 回归测试。

## 7. 常见误区

- 捕获后不处理（空 catch）或只打印不抛出，导致问题被吞没。
- 过度包装异常层层加壳，message 冗余又丢失关键信息。
- 在低层打印日志，在高层再打印，产生重复噪声。
- 滥用 Checked 使方法签名膨胀，调用链处处 try-catch。
- 用异常做分支控制或预期流程（性能与可读性都更差）。

## 结语

异常处理的关键在于“分层、精准、含上下文、边界兜底”。当团队就 Runtime/Checked 的取舍达成一致，再配合统一异常处理与监控告警，才能让异常真正服务于稳定性与可维护性。

