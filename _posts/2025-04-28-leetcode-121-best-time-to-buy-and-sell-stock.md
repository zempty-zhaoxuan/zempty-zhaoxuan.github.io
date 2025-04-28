---
layout: post
title: "LeetCode 121 买卖股票的最佳时机详解"
date: "2025-04-28"
toc: true
excerpt: "详细分析LeetCode 121买卖股票的最佳时机问题的四种解法，包括暴力法、一次遍历法和动态规划方法"
tags: [Algorithm, DataStructure, 股票]
comments: true
author: zempty
---

# LeetCode 121: 买卖股票的最佳时机

## 题目描述

给定一个数组 `prices`，它的第 `i` 个元素 `prices[i]` 表示一支给定股票第 `i` 天的价格。

你只能选择某一天买入这只股票，并选择在未来的某一个不同的日子卖出该股票。设计一个算法来计算你所能获取的最大利润。

返回你可以从这笔交易中获取的最大利润。如果你不能获取任何利润，返回 0。

## 解法分析

### 解法1: 暴力法

```java
class Solution {
    public int maxProfit(int[] prices) {
        if(prices.length < 2) return 0;
        int maxProfit = 0;
        for(int i = 0; i <= prices.length - 2; i++){
            int buyPrice = prices[i];
            for(int j = i+1;j <= prices.length - 1; j++){
                int sellPrice = prices[j];
                maxProfit = Math.max(sellPrice - buyPrice,maxProfit);
            }
        }
        return maxProfit;
    }
}
```

**分析**:
- 这种方法使用两层循环遍历所有可能的买入卖出组合
- 外层循环选择买入的日子，内层循环选择卖出的日子
- 对于每种组合，计算利润并更新最大利润
- 时间复杂度: O(n²)，其中n是价格数组的长度
- 空间复杂度: O(1)，只使用常量额外空间

虽然这种方法简单直观，但在数据量大时会超时，不是最优解。

### 解法2: 一次遍历法

```java
class Solution {
    public int maxProfit(int[] prices) {
        int min = Integer.MAX_VALUE;
        int maxprofit = 0;
        for(int i = 0; i < prices.length; i++){
            maxprofit = Math.max(maxprofit, prices[i] - min);
            min = Math.min(min, prices[i]);
        }
        return maxprofit;
    }
}
```

**分析**:
- 这种方法只需要一次遍历，通过维护历史最低价格
- 对于每个价格，计算如果在历史最低点买入、当天卖出的利润
- 更新最大利润和历史最低价格
- 时间复杂度: O(n)
- 空间复杂度: O(1)

这种方法的思路是：记录之前看到的最低价格，然后计算当前价格与最低价格的差值，更新最大利润。

### 解法3: 动态规划

```java
class Solution {
    public int maxProfit(int[] prices) {
        int n = prices.length;
        if(n < 2) return 0;
        int[][] dp = new int[n][2];
        //not have stock
        dp[0][0] = 0;
        // have stock
        dp[0][1] = -prices[0];
        for(int i = 1; i < n; i++){
            dp[i][0] = Math.max(dp[i-1][0],dp[i-1][1] + prices[i]);
            dp[i][1] = Math.max(dp[i-1][1],-prices[i]);
        }
        return dp[n-1][0];
    }
}
```

**分析**:
- 使用二维dp数组，`dp[i][j]`表示第i天结束时的最大利润
  - `dp[i][0]`: 第i天结束时，不持有股票的最大利润
  - `dp[i][1]`: 第i天结束时，持有股票的最大利润
- 状态转移方程:
  - `dp[i][0] = max(dp[i-1][0], dp[i-1][1] + prices[i])`
    - 不持有股票：前一天也不持有，或前一天持有但今天卖出
  - `dp[i][1] = max(dp[i-1][1], -prices[i])`
    - 持有股票：前一天就持有，或今天买入
    - 注意这里是-prices[i]而不是dp[i-1][0]-prices[i]，因为题目限制只能买卖一次
- 时间复杂度: O(n)
- 空间复杂度: O(n)

#### 动态规划解法可视化

假设我们有价格数组 `[7,1,5,3,6,4]`，DP表格如下:

| 天数 i | 价格 prices[i] | dp[i][0] (不持有) | dp[i][1] (持有) | 解释 |
|-------|--------------|-----------------|----------------|------|
| 0     | 7            | 0               | -7             | 初始状态 |
| 1     | 1            | 0               | -1             | 不持有：max(0,-7+1)=0，持有：max(-7,-1)=-1 |
| 2     | 5            | 4               | -1             | 不持有：max(0,-1+5)=4，持有：max(-1,-5)=-1 |
| 3     | 3            | 4               | -1             | 不持有：max(4,-1+3)=4，持有：max(-1,-3)=-1 |
| 4     | 6            | 5               | -1             | 不持有：max(4,-1+6)=5，持有：max(-1,-6)=-1 |
| 5     | 4            | 5               | -1             | 不持有：max(5,-1+4)=5，持有：max(-1,-4)=-1 |

最终结果是 dp[5][0] = 5，表示最大利润为5。

### 解法4: 优化的动态规划

```java
class Solution {
    public int maxProfit(int[] prices) {
        int n = prices.length;
        if(n < 2) return 0;
        int noStockProfit = 0;
        int haveStockProfit = -prices[0];
        for(int i = 1; i < n; i++){
            int currentNoStockProfit = Math.max(noStockProfit,haveStockProfit + prices[i]);
            int currentHaveStockProfit = Math.max(haveStockProfit,-prices[i]);
            noStockProfit = currentNoStockProfit;
            haveStockProfit = currentHaveStockProfit;
        }
        return noStockProfit;
    }
}
```

**分析**:
- 这是解法3的空间优化版本
- 注意到dp[i]只依赖于dp[i-1]，所以我们不需要保存整个数组
- 使用两个变量代替二维数组:
  - `noStockProfit`: 对应dp[i][0]，不持有股票的最大利润
  - `haveStockProfit`: 对应dp[i][1]，持有股票的最大利润
- 时间复杂度: O(n)
- 空间复杂度: O(1)

## 为什么DP可以简化为解法4?

解法3中使用了二维dp数组来存储每一天的两种状态。然而，我们可以发现，计算第i天的状态只需要第i-1天的状态，不需要知道更早的状态。这种情况下，我们可以使用"滚动数组"技术来优化空间复杂度。

在解法4中:
1. 我们使用两个变量代替了整个dp数组，因为我们只关心前一天的状态
2. 每次迭代，我们根据前一天的状态计算当前天的状态
3. 更新变量，为下一次迭代做准备

通过这种方式，我们把空间复杂度从O(n)优化到了O(1)，同时保持算法逻辑和结果不变。这种优化在动态规划问题中很常见，当前状态只依赖于有限的之前状态时，我们通常可以使用有限的变量代替整个DP数组。

## 总结

1. **暴力法**：简单直观但效率低，时间复杂度O(n²)
2. **一次遍历法**：通过维护最低价格，一次遍历解决，时间复杂度O(n)
3. **动态规划**：使用二维dp数组，定义清晰的状态和转移方程，时间复杂度O(n)，空间复杂度O(n)
4. **优化的动态规划**：使用滚动变量代替数组，时间复杂度O(n)，空间复杂度O(1)

在实际应用中，解法2和解法4都是高效的选择，它们都具有O(n)的时间复杂度和O(1)的空间复杂度。解法2更为直观，解法4则展示了如何从DP角度思考问题。 