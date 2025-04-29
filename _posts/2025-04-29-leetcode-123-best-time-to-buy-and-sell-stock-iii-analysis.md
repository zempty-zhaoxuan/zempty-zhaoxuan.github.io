---
layout: post
title: "LeetCode 123 买卖股票的最佳时机 III 详解"
date: "2025-04-29"
toc: true
excerpt: "详细分析 LeetCode 123 买卖股票的最佳时机 III 的两种解法，对比与 121 和 122 的区别，并提供详细的解题思路和步骤。"
tags: [Algorithm, java, 棘手问题]
comments: true
author: zempty
---

## 问题描述

LeetCode 123: [买卖股票的最佳时机 III](https://leetcode.cn/problems/best-time-to-buy-and-sell-stock-iii/)

给定一个数组 `prices`，它的第 `i` 个元素 `prices[i]` 是一支给定的股票在第 `i` 天的价格。

设计一个算法来计算你所能获取的最大利润。你最多可以完成 **两笔** 交易。

**注意:** 你不能同时参与多笔交易（你必须在再次购买前出售掉之前的股票）。

## 与 LeetCode 121 & 122 的区别

这三道题都属于"买卖股票"系列，主要区别在于允许的交易次数：

1.  **LeetCode 121 (买卖股票的最佳时机):** 最多允许完成 **一笔** 交易。目标是找到 `max(prices[j] - prices[i])` 其中 `j > i`。
2.  **LeetCode 122 (买卖股票的最佳时机 II):** 允许完成 **任意多笔** 交易。只要第二天价格比今天高，就可以进行买入卖出操作，累加所有上涨区间的利润。
3.  **LeetCode 123 (买卖股票的最佳时机 III):** 最多允许完成 **两笔** 交易。这是本题的核心，难度在于如何处理这两笔交易，它们可以是连续的，也可以是分开的。

## 解法分析

我们来分析用户提供的两种解法。

### 解法一：动态规划 (状态机思路)

这种解法巧妙地使用了四个变量来跟踪在第 `i` 天结束时的四种可能状态下的最大利润：

*   `buy1`: 到目前为止，**只进行过一次买入**操作的最大利润。
*   `sell1`: 到目前为止，**完成了一次买卖**操作的最大利润。
*   `buy2`: 到目前为止，**进行了第二次买入**操作的最大利润。
*   `sell2`: 到目前为止，**完成了两次买卖**操作的最大利润。

#### 状态转移方程

在第 `i` 天，我们根据第 `i-1` 天的状态来更新这四个变量：

1.  **`buy1` (第一次买入):**
    *   可以是在第 `i` 天买入（此时利润为 `-prices[i]`）。
    *   也可以是保持第 `i-1` 天的 `buy1` 状态（之前某天已经买入）。
    *   `buy1 = Math.max(buy1, -prices[i]);`
    *   初始化时 `buy1 = -prices[0]`。

2.  **`sell1` (第一次卖出):**
    *   可以是在第 `i` 天卖出（利润为 `buy1 + prices[i]`，这里的 `buy1` 是*更新前*的 `buy1` 或当天买入后立刻卖出的情况，但由于 `buy1` 先更新，它代表截至第 `i` 天进行第一次买入的最大利润）。
    *   也可以是保持第 `i-1` 天的 `sell1` 状态（之前某天已经完成第一次交易）。
    *   `sell1 = Math.max(sell1, buy1 + prices[i]);` (注意：这里的 `buy1` 必须是当天更新后的 `buy1`)
    *   初始化时 `sell1 = 0`。

3.  **`buy2` (第二次买入):**
    *   可以是在第 `i` 天进行第二次买入（利润为 `sell1 - prices[i]`，意味着在之前完成第一次交易的基础上，今天买入）。
    *   也可以是保持第 `i-1` 天的 `buy2` 状态。
    *   `buy2 = Math.max(buy2, sell1 - prices[i]);` (这里的 `sell1` 是当天更新后的 `sell1`)
    *   初始化时 `buy2 = -prices[0]` (相当于第一天买入，准备进行第二次交易，虽然这看起来不直观，但保证了状态的连续性。可以理解为在第一天买入后立刻卖出（利润0）然后又买入）。

4.  **`sell2` (第二次卖出):**
    *   可以是在第 `i` 天进行第二次卖出（利润为 `buy2 + prices[i]`）。
    *   也可以是保持第 `i-1` 天的 `sell2` 状态。
    *   `sell2 = Math.max(sell2, buy2 + prices[i]);` (这里的 `buy2` 是当天更新后的 `buy2`)
    *   初始化时 `sell2 = 0`。

**代码实现细节:**
在循环中，更新顺序很重要，确保 `sell1` 使用更新后的 `buy1`，`buy2` 使用更新后的 `sell1`，`sell2` 使用更新后的 `buy2`。给出的代码实现是正确的。

```java
class Solution {
    public int maxProfit(int[] prices) {
        int n = prices.length;
        if(n < 2) return 0;
        int buy1 = -prices[0]; // 第 0 天买入
        int sell1 = 0;         // 第 0 天买入又卖出
        int buy2 = -prices[0]; // 第 0 天买入卖出再买入
        int sell2 = 0;         // 第 0 天买入卖出再买入再卖出
        
        for(int i = 1; i < n; i++){
            // 更新第一次买入的最大利润
            buy1 = Math.max(buy1, -prices[i]); 
            // 更新第一次卖出的最大利润
            sell1 = Math.max(sell1, buy1 + prices[i]);
            // 更新第二次买入的最大利润 (基于第一次卖出的利润)
            buy2 = Math.max(buy2, sell1 - prices[i]);
            // 更新第二次卖出的最大利润 (基于第二次买入的利润)
            sell2 = Math.max(sell2, buy2 + prices[i]);
        }
        // 最终结果是完成两次交易的最大利润
        return sell2;
    }
}
```

#### 思考过程

这个解法的核心思想是将复杂的两次交易问题分解为有限的几种状态。我们不需要关心具体在哪一天买入或卖出，只需要关心在每一天结束时，处于不同交易阶段（未开始、买入1、卖出1、买入2、卖出2）可能获得的最大利润。通过状态转移方程，我们可以在 O(n) 时间内计算出最终完成两次交易的最大利润。

#### 示例分析

以 `prices = [3, 3, 5, 0, 0, 3, 1, 4]` 为例：

| i | price | buy1 = max(buy1, -price) | sell1 = max(sell1, buy1 + price) | buy2 = max(buy2, sell1 - price) | sell2 = max(sell2, buy2 + price) |
|---|-------|-------------------------|-----------------------------------|-----------------------------------|-----------------------------------|
| 0 | 3     | -3                      | 0                                 | -3                                | 0                                 |
| 1 | 3     | max(-3, -3) = -3        | max(0, -3 + 3) = 0                | max(-3, 0 - 3) = -3               | max(0, -3 + 3) = 0                |
| 2 | 5     | max(-3, -5) = -3        | max(0, -3 + 5) = 2                | max(-3, 2 - 5) = -3               | max(0, -3 + 5) = 2                |
| 3 | 0     | max(-3, -0) = 0         | max(2, 0 + 0) = 2                 | max(-3, 2 - 0) = 2                | max(2, 2 + 0) = 2                 |
| 4 | 0     | max(0, -0) = 0          | max(2, 0 + 0) = 2                 | max(2, 2 - 0) = 2                 | max(2, 2 + 0) = 2                 |
| 5 | 3     | max(0, -3) = 0          | max(2, 0 + 3) = 3                 | max(2, 2 - 3) = 2                 | max(2, 2 + 3) = 5                 |
| 6 | 1     | max(0, -1) = 0          | max(3, 0 + 1) = 3                 | max(2, 3 - 1) = 2                 | max(5, 2 + 1) = 5                 |
| 7 | 4     | max(0, -4) = 0          | max(3, 0 + 4) = 4                 | max(2, 3 - 4) = 2                 | max(5, 2 + 4) = 6                 |

最终返回 `sell2 = 6`。
(第一次交易: 0买入, 3卖出, 利润3; 第二次交易: 1买入, 4卖出, 利润3; 总利润 6)

### 解法二：动态规划 (两次遍历)

这种解法将问题分解为：在第 `k` 天之前完成最多一次交易的最大利润，加上在第 `k` 天之后完成最多一次交易的最大利润。

1.  **`firstRound[i]`**: 存储 `prices[0...i]` 区间内进行最多一次交易的最大利润。
2.  **`secondRound[i]`**: 存储 `prices[i...n-1]` 区间内进行最多一次交易的最大利润。

最终结果是 `max(firstRound[k] + secondRound[k])` 对于所有 `k` 从 `0` 到 `n-1`。

#### 计算 `firstRound`

这与 LeetCode 121 完全相同。我们从左到右遍历 `prices` 数组，维护一个 `minFirstRoundPrice` 表示 `prices[0...i]` 中的最低价格。
`firstRound[i] = max(firstRound[i-1], prices[i] - minFirstRoundPrice)`

#### 计算 `secondRound`

这与 LeetCode 121 类似，但我们需要从右到左遍历。我们维护一个 `maxSecondRoundPrice` 表示 `prices[j...n-1]` 中的最高价格。
`secondRound[j] = max(secondRound[j+1], maxSecondRoundPrice - prices[j])`

#### 合并结果

最后，遍历 `k` 从 `0` 到 `n-1`，计算 `firstRound[k] + secondRound[k]` 的最大值。这里需要注意 `secondRound` 数组的含义，`secondRound[k]` 代表的是从 `k` 到 `n-1` 的最大利润。

```java
class Solution {
    public int maxProfit(int[] prices) {
        int n = prices.length;
        if(n < 2) return 0;
        
        // firstRound[i] = max profit in prices[0...i] with at most 1 transaction
        int[] firstRound = new int[n];
        int minFirstRoundPrice = prices[0];
        // firstRound[0] = 0; (already initialized)
        for(int i = 1; i < n; i++){
            minFirstRoundPrice = Math.min(prices[i], minFirstRoundPrice);
            firstRound[i] = Math.max(firstRound[i-1], prices[i] - minFirstRoundPrice);
        }
        
        // secondRound[i] = max profit in prices[i...n-1] with at most 1 transaction
        int[] secondRound = new int[n];
        int maxSecondRoundPrice = prices[n - 1];
        // secondRound[n-1] = 0; (already initialized)
        for(int j = n - 2; j >= 0; j--){
            maxSecondRoundPrice = Math.max(maxSecondRoundPrice, prices[j]);
            // Profit if selling at maxSecondRoundPrice having bought at prices[j]
            // Or the max profit achievable starting from j+1
            secondRound[j] = Math.max(secondRound[j + 1], maxSecondRoundPrice - prices[j]);
        }
        
        // Combine the results
        int maxProfit = 0;
        // The max profit is the sum of max profit from first round ending at k
        // and max profit from second round starting at k.
        // Note: a single transaction is also covered when either firstRound[k] or secondRound[k] is 0.
        // The maximum of firstRound[n-1] already covers the single transaction case.
        // The loop correctly covers splitting the two transactions.
        for(int k = 0; k < n ; k++){
            // Special case: if k=0, profit is secondRound[0] (one transaction in [0, n-1])
            // Special case: if k=n-1, profit is firstRound[n-1] (one transaction in [0, n-1])
            // These cases are handled correctly by the loop and array initialization.
             maxProfit = Math.max(maxProfit, firstRound[k] + secondRound[k]);
        }
        // Does max(firstRound[k] + secondRound[k]) cover the single transaction case correctly?
        // Yes, because if the max profit comes from a single transaction, say in [0, m],
        // then firstRound[m] will hold this max profit. When k=m, we consider firstRound[m] + secondRound[m].
        // Since secondRound[m] >= 0, this sum is at least firstRound[m].
        // If the single optimal transaction is in [p, n-1], then secondRound[p] holds it.
        // When k=p, we consider firstRound[p] + secondRound[p]. Since firstRound[p] >=0, the sum is >= secondRound[p].
        // The absolute maximum single transaction profit is captured in firstRound[n-1] and secondRound[0].
        // maxProfit will eventually compare against firstRound[n-1] + secondRound[n-1] = firstRound[n-1] + 0
        // and firstRound[0] + secondRound[0] = 0 + secondRound[0].
        // So, the single transaction case is implicitly covered.

        return maxProfit;
    }
}
```

#### 思考过程

这个解法的核心思想是**分治**。既然最多两笔交易，那么一定存在一个分割点 `k` (可以是 0 或 n-1)，使得第一笔交易在 `k` 之前（包括 `k`）完成，第二笔交易在 `k` 之后（包括 `k`）开始。我们分别计算出这两个子问题（在 `[0, k]` 区间和 `[k, n-1]` 区间内各完成最多一笔交易）的最大利润，然后将它们相加。遍历所有可能的分割点 `k`，找到最大的和即可。计算子问题 `[0, k]` 和 `[k, n-1]` 内最多一次交易的最大利润，恰好就是 LeetCode 121 的问题，可以通过两次线性扫描解决。

#### 示例分析

以 `prices = [3, 3, 5, 0, 0, 3, 1, 4]` 为例：

**1. 计算 `firstRound` (Max profit in `[0...i]`):**

| i | price | minPrice | profit = price - minPrice | firstRound[i] = max(firstRound[i-1], profit) |
|---|-------|----------|---------------------------|---------------------------------------------|
| 0 | 3     | 3        | 0                         | 0                                           |
| 1 | 3     | 3        | 0                         | max(0, 0) = 0                               |
| 2 | 5     | 3        | 2                         | max(0, 2) = 2                               |
| 3 | 0     | 0        | 0                         | max(2, 0) = 2                               |
| 4 | 0     | 0        | 0                         | max(2, 0) = 2                               |
| 5 | 3     | 0        | 3                         | max(2, 3) = 3                               |
| 6 | 1     | 0        | 1                         | max(3, 1) = 3                               |
| 7 | 4     | 0        | 4                         | max(3, 4) = 4                               |

`firstRound = [0, 0, 2, 2, 2, 3, 3, 4]`

**2. 计算 `secondRound` (Max profit in `[i...n-1]`):**

| j | price | maxPrice | profit = maxPrice - price | secondRound[j] = max(secondRound[j+1], profit) |
|---|-------|----------|---------------------------|----------------------------------------------|
| 7 | 4     | 4        | 0                         | 0 (base case secondRound[n]=0 implicitly)     |
| 6 | 1     | 4        | 3                         | max(0, 3) = 3                                |
| 5 | 3     | 4        | 1                         | max(3, 1) = 3                                |
| 4 | 0     | 4        | 4                         | max(3, 4) = 4                                |
| 3 | 0     | 4        | 4                         | max(4, 4) = 4                                |
| 2 | 5     | 5        | 0                         | max(4, 0) = 4                                |
| 1 | 3     | 5        | 2                         | max(4, 2) = 4                                |
| 0 | 3     | 5        | 2                         | max(4, 2) = 4                                |

`secondRound = [4, 4, 4, 4, 4, 3, 3, 0]`

**3. 合并结果 `max(firstRound[k] + secondRound[k])`:**

| k | firstRound[k] | secondRound[k] | Sum | maxProfit |
|---|---------------|----------------|-----|-----------|
| 0 | 0             | 4              | 4   | 4         |
| 1 | 0             | 4              | 4   | 4         |
| 2 | 2             | 4              | 6   | 6         |
| 3 | 2             | 4              | 6   | 6         |
| 4 | 2             | 4              | 6   | 6         |
| 5 | 3             | 3              | 6   | 6         |
| 6 | 3             | 3              | 6   | 6         |
| 7 | 4             | 0              | 4   | 6         |

最终返回 `maxProfit = 6`。

## 总结与对比

| 特性         | 解法一 (状态机 DP)                 | 解法二 (两次遍历 DP)               |
|--------------|------------------------------------|------------------------------------|
| **思路**     | 跟踪多个交易状态的演变             | 分割问题，分别计算两段的最大利润     |
| **时间复杂度** | O(n)                               | O(n) (两次遍历 + 一次合并)         |
| **空间复杂度** | O(1) (只用了几个变量)              | O(n) (需要两个辅助数组)            |
| **直观性**   | 状态定义和转移略抽象             | 分治思想相对直观，子问题是LC121    |
| **扩展性**   | 容易扩展到 k 笔交易 (状态数量增加) | 扩展到 k 笔交易较复杂 (需要 k*n 空间) |

两种解法都是有效的动态规划思路，时间复杂度相同。解法一在空间上更优，但状态定义需要仔细理解。解法二利用了分治思想，将问题拆解为更简单的子问题（LC121），更容易理解，但需要额外的空间。对于最多两笔交易的限制，两种方法都很好。如果要扩展到最多 k 笔交易，解法一的思路通常更容易推广。

