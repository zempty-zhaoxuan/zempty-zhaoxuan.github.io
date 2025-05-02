---
layout: post
title: "LeetCode 55 Jump Game 三种解法详细分析与对比"
date: "2025-05-02"
toc: true
excerpt: "详细分析 LeetCode 55 Jump Game 的贪心、动态规划、反向贪心三种主流解法，含代码、复杂度、流程举例与方法对比。"
tags: [Algorithm, DataStructure]
comments: true
author: zempty
---

# LeetCode 55 Jump Game 三种解法详细分析与对比

## 问题描述

给定一个非负整数数组 `nums`，你最初位于数组的第一个位置。数组中的每个元素代表你在该位置可以跳跃的最大长度。判断你是否能够到达最后一个位置。

**示例 1：**

| 输入        | 输出  | 解释                 |
| ----------- | ----- | -------------------- |
| [2,3,1,1,4] | true  | 可以依次跳到最后一个 |
| [3,2,1,0,4] | false | 第 3 位后无法继续    |

## 解法一：贪心算法（正向遍历）

**思路：**

- 维护一个变量 `maxReach`，表示当前能到达的最远下标。
- 遍历数组，每到一个位置，更新 `maxReach = max(maxReach, i + nums[i])`。
- 如果当前位置 `i` 超过了 `maxReach`，说明无法到达，直接返回 false。
- 如果 `maxReach` 达到或超过最后一个下标，返回 true。

**Java 代码：**

```java
class Solution {
    public boolean canJump(int[] nums) {
        int maxReach = 0;
        for (int i = 0; i < nums.length; i++) {
            if (i > maxReach) return false; // 当前位置不可达
            maxReach = Math.max(maxReach, i + nums[i]); // 更新最远可达
            if (maxReach >= nums.length - 1) return true; // 已可达终点
        }
        return true;
    }
}
```

**复杂度分析：**

- 时间复杂度：O(n)
- 空间复杂度：O(1)

---

## 解法二：动态规划

**思路：**

- 用布尔数组 `dp[i]` 表示能否到达位置 `i`。
- 初始 `dp[0]=true`。
- 对每个位置 `i`，遍历前面所有位置 `j`，如果 `dp[j]=true` 且 `j+nums[j]>=i`，则 `dp[i]=true`。

**Java 代码：**

```java
class Solution {
    public boolean canJump(int[] nums) {
        boolean[] dp = new boolean[nums.length];
        dp[0] = true;
        for (int i = 1; i < nums.length; i++) {
            for (int j = 0; j < i; j++) {
                if (dp[j] && j + nums[j] >= i) {
                    dp[i] = true;
                    break;
                }
            }
        }
        return dp[nums.length - 1];
    }
}
```

**复杂度分析：**

- 时间复杂度：O(n²)
- 空间复杂度：O(n)

---

## 解法三：贪心算法（反向遍历）

**思路：**

- 从后往前维护一个变量 `lastPos`，表示最后一个能到达终点的位置。
- 如果当前位置 `i + nums[i] >= lastPos`，则更新 `lastPos = i`。
- 最终判断 `lastPos == 0` 是否成立。

**Java 代码：**

```java
class Solution {
    public boolean canJump(int[] nums) {
        int lastPos = nums.length - 1;
        for (int i = nums.length - 2; i >= 0; i--) {
            if (i + nums[i] >= lastPos) {
                lastPos = i;
            }
        }
        return lastPos == 0;
    }
}
```

**复杂度分析：**

- 时间复杂度：O(n)
- 空间复杂度：O(1)

---

## 三种方法对比表

| 方法     | 时间复杂度 | 空间复杂度 | 优点         | 缺点           |
| -------- | ---------- | ---------- | ------------ | -------------- |
| 贪心正向 | O(n)       | O(1)       | 直观高效     | 需理解贪心原理 |
| 动态规划 | O(n²)      | O(n)       | 思路清晰     | 效率较低       |
| 贪心反向 | O(n)       | O(1)       | 代码简洁高效 | 思路不直观     |

---

## 三种方法执行流程举例

以 `nums = [2,3,1,1,4]` 为例，详细说明三种方法的执行过程：

### 贪心正向

| i   | nums[i] | maxReach | 说明            |
| --- | ------- | -------- | --------------- |
| 0   | 2       | 2        | 0+2=2           |
| 1   | 3       | 4        | 1+3=4           |
| 2   | 1       | 4        | 2+1=3 < 4       |
| 3   | 1       | 4        | 3+1=4           |
| 4   | 4       | 8        | 4+4=8 >= 4 终点 |

- 只要 `maxReach` >= 终点下标，返回 true。

### 动态规划

| i   | dp[i] | 说明               |
| --- | ----- | ------------------ |
| 0   | true  | 起点可达           |
| 1   | true  | 0+2>=1, dp[0]=true |
| 2   | true  | 0+2>=2, dp[0]=true |
| 3   | true  | 1+3>=3, dp[1]=true |
| 4   | true  | 1+3>=4, dp[1]=true |

- dp[4]=true，返回 true。

### 贪心反向

| i   | nums[i] | lastPos | 说明                  |
| --- | ------- | ------- | --------------------- |
| 3   | 1       | 4       | 3+1=4 >= 4, lastPos=3 |
| 2   | 1       | 3       | 2+1=3 >= 3, lastPos=2 |
| 1   | 3       | 2       | 1+3=4 >= 2, lastPos=1 |
| 0   | 2       | 1       | 0+2=2 >= 1, lastPos=0 |

- lastPos=0，返回 true。

---

## 总结与推荐

- **实际开发/面试推荐：** 贪心算法（正向或反向）都能高效解决本题，推荐优先掌握。
- **动态规划**适合理解递推思想，但效率较低。
- 建议优先写贪心正向，理解后可尝试反向贪心，动态规划适合拓展思路。
