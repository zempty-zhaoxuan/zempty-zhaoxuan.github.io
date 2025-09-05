---
layout: post
title: "LeetCode 1011 Capacity To Ship Packages Within D Days 二分查找全解析"
date: "2025-09-05"
toc: true
excerpt: "用二分答案 + 可行性判定解决最小运载能力问题：构造单调性、边界(left=max, right=sum)、判定函数细节与三种写法比较（暴力枚举超时、二分+线扫最优、前缀和+二分跳跃）。"
tags: [Algorithm, BinarySearch, DataStructure, java, LeetCode]
comments: true
author: zempty
---

## 题目概述

给定包裹重量数组 `weights`（必须按顺序装船，不可打乱），每天船的最大承载量为 `capacity`，求在不改变包裹顺序的前提下，使得在 `days` 天内运完所有包裹的最小 `capacity`。

- **必须按顺序装载**：每一天可以装若干连续的包裹，直到容量不够为止。
- **目标**：最小化运载能力 `capacity`，同时满足不超过 `days` 天。

常见约束（题面原题）：
- `1 ≤ n ≤ 5e4`
- `1 ≤ weights[i] ≤ 500`
- `1 ≤ days ≤ 5e4`

这类“最小化某个阈值/参数，同时满足某个可行性条件”的问题，非常典型地适合用“**二分答案**”来做。

---

## 思路总览：二分答案如何构建？

1) 明确答案的取值范围：
- 下界 `left = max(weights)`：容量至少要能装下最重的单个包裹。
- 上界 `right = sum(weights)`：如果容量等于总和，那么一天就能装完全部包裹。

2) 构造“**可行性判定函数**” `canShip(capacity)`：
- 含义：给定容量 `capacity`，按顺序装载，统计需要的天数 `usedDays`，判断 `usedDays ≤ days` 是否成立。
- 关键性质（单调性）：
  - 若 `capacity` 可行（能在 `days` 天内完成），则任何更大的容量也必然可行；
  - 若 `capacity` 不可行，则任何更小的容量也必不可能可行。
- 因此 `canShip(capacity)` 关于 `capacity` 是**单调的布尔函数**，我们可以在 `[left, right]` 上二分寻找第一个使其为真的最小容量。

3) 二分边界与返回：
- 常用两种写法：
  - 写法A：`while (left < right)`，可行则收缩右边界到 `mid`，不可行则 `left = mid + 1`，最终返回 `left`。
  - 写法B：`while (left <= right)`，可行则 `right = mid - 1`，不可行则 `left = mid + 1`，最终返回 `left`。
- 两种写法等价，注意保持“找到第一个可行解”的不变量即可。

---

## 可行性判定：为什么 `currentDays` 从 1 开始？

线性判定的标准实现：顺序遍历 `weights`，用 `current` 记录当日已装载重量、`currentDays` 记录已使用的天数：

```java
int current = 0;
int currentDays = 1; // 从第1天开始，因为还没装任何包裹，但第一天已经开始计数
for (int weight : weights) {
    if (current + weight > capacity) {
        currentDays++;   // 开启新的一天
        current = 0;     // 当日重量清零
    }
    current += weight;   // 把当前包裹装上船
    if (currentDays > days) return false; // 早停优化
}
return true;
```

- 为何从 1 开始？因为在遍历第一个包裹前，我们已经“使用了第1天”的装载机会（即将开始装第一天）。
- 若把 `currentDays` 从 0 开始，则需要在第一次放入包裹时手动把天数加 1，或在循环前加一次天数，容易引入边界处理和“最后一天是否计入”的混乱。以 1 开始最直观、最不易错。

---

## 三种解法逐一分析

### 解法1：枚举容量 + 线性判定（超时）

核心：从 `capacity = max(weights)` 枚举到 `sum(weights)`，对每个容量调用一次 `canShip` 线性判定，第一次为真即返回。

```java
class Solution {
    public int shipWithinDays(int[] weights, int days) {
        int left = weights[0], right = 0;
        for (int weight : weights) {
            left = Math.max(left, weight);
            right += weight;
        }
        for (int c = left; c <= right; c++) {
            if (canShip(weights, c, days)) return c;
        }
        return 0;
    }

    boolean canShip(int[] weights, int capacity, int days) {
        int currentDays = 1, current = 0;
        for (int weight : weights) {
            if (current + weight > capacity) {
                currentDays++;
                current = 0;
            }
            current += weight;
            if (currentDays > days) return false;
        }
        return true;
    }
}
```

- 复杂度：若 `M = max(weights)`, `S = sum(weights)`, `N = weights.length`，则复杂度约为 `O(N * (S - M + 1))`。
- 在最坏情况下：`N ≤ 5e4`，`S` 最多可达 `≈ 2.5e7`（500 × 5e4），因此外层循环次数巨大，乘上线性判定 `O(N)`，运算量级难以接受，**必然 TLE**。

### 解法2：二分容量 + 线性判定（推荐）

核心：在 `[left=max(weights), right=sum(weights)]` 上二分，使用与解法1相同的线性可行性判定。

```java
class Solution {
    public int shipWithinDays(int[] weights, int days) {
        int left = weights[0], right = weights[0];
        for (int weight : weights) {
            left = Math.max(left, weight);
            right += weight;
        }
        while (left < right) {
            int mid = (left + right) >>> 1;
            if (checkCapacityInDays(weights, mid, days)) {
                right = mid;
            } else {
                left = mid + 1;
            }
        }
        return left;
    }

    boolean checkCapacityInDays(int[] weights, int capacity, int days) {
        int current = 0, totalDays = 1;
        for (int w : weights) {
            if (current + w > capacity) {
                totalDays++;
                current = 0;
            }
            current += w;
            if (totalDays > days) return false;
        }
        return true;
    }
}
```

- 复杂度：`O(N * log(S - M + 1))`。对比解法1，`log` 将外层枚举从数千万级降低到约 25～30 次，配合线性判定，能轻松过题。

### 解法3：二分容量 + 前缀和 + 天内二分跳跃（变体）

核心：仍在容量上二分，但可行性判定不再线性逐个加，而是先构造前缀和 `ship[i] = weights[0..i-1]`，在每一天中用二分直接“跳”到当天能装到的最远下标。

```java
class Solution {
    public int shipWithinDays(int[] weights, int days) {
        int left = 0, right = 0;
        for (int w : weights) {
            left = Math.max(left, w);
            right += w;
        }

        int[] ship = new int[weights.length + 1];
        for (int i = 0; i < ship.length - 1; i++) {
            ship[i + 1] = ship[i] + weights[i];
        }

        while (left <= right) {
            int mid = (left + right) >>> 1;
            if (canShip(ship, mid, days)) {
                right = mid - 1;
            } else {
                left = mid + 1;
            }
        }
        return left;
    }

    boolean canShip(int[] ship, int capacity, int days) {
        int usedDays = 0, idx = 0;
        while (idx < ship.length - 1) {
            int target = ship[idx] + capacity;
            idx = upperBound(ship, idx + 1, ship.length - 1, target) - 1; // 取 <= target 的最大位置
            usedDays++;
            if (usedDays > days) return false;
        }
        return true;
    }

    // 返回第一个 > target 的下标（经典 upper_bound），区间为 [l, r]
    int upperBound(int[] a, int l, int r, int target) {
        int start = l, end = r + 1; // 右开
        while (start < end) {
            int m = (start + end) >>> 1;
            if (a[m] <= target) start = m + 1; else end = m;
        }
        return start;
    }
}
```

- 复杂度：单次可行性判定为“每天一次二分”，即 `O(usedDays * log N)`，最坏 `usedDays ≤ days`。整体复杂度近似 `O(days * log N * log(S - M))`，与解法2的 `O(N log)` 相比，不一定更好（当 `days` 接近 `N` 时可能更慢），但在 `days` 远小于 `N` 时可能有优势。该写法提供另一种视角，验证了二分判定的等价性。

---

## `currentDays`/`usedDays` 的定义与起始值差异

- 解法1/2（线性逐包裹装载）：
  - `currentDays` 从 `1` 开始，表示“已处于第1天，准备装第一个包裹”。
  - 当出现溢出（`current + w > capacity`）时，`currentDays++` 并把 `current` 清零，再把当前包裹放到新一天。
  - 若遍历完毕且 `currentDays ≤ days`，则可行。

- 解法3（按天成块装载）：
  - `usedDays` 从 `0` 开始，因为尚未“完成任何一天的装载”。
  - 每次通过前缀和 + 二分确定“这一整天能到达的最远下标”，然后 `usedDays++`。
  - 本质上是以“天”为单位计数，每完成一整天才 +1。

两者本质一致，差异仅在于“何时计入一天”：
- 线性写法按“包裹到来触发换天”计数，因此更自然地以 `1` 起步；
- 成块写法按“完成一天装载”计数，因此以 `0` 起步并在每次成块后加 1。

---

## 为什么解法1会 TLE（具体原因）？

- 外层容量从 `M = max(weights)` 到 `S = sum(weights)` 逐一枚举，枚举次数约为 `S - M + 1`。
- 以题目上界估算：`S` 最高可至 `≈ 2.5e7`。哪怕 `N` 只是 `1e4` 量级，`(S - M) * N` 也会轻松达到 `1e12` 级别操作。
- 判定函数本身是 `O(N)`，整体呈“线性 × 线性”的乘积，远超时限，故提交必然超时。

---

## 细节与易错点

- 二分边界：
  - `left = max(weights)` 必须保证容量至少能装最重包裹；
  - `right = sum(weights)` 是合理上界，意味着“一天装完”。
- 二分中点：`mid = (left + right) >>> 1` 避免溢出；
- 早停优化：判定中一旦 `days` 超限立即返回 `false`；
- 循环结束条件：
  - `while (left < right)` → 返回 `left`；
  - `while (left <= right)` → 返回 `left`；保持不变量即可。
- `currentDays` 初值：建议从 `1` 开始，最易于处理“最后一天是否计入”的边界。

---

## 复杂度对比（概要）

- 解法1：`O(N * (S - M))` → 超时
- 解法2：`O(N * log(S - M))` → 推荐
- 解法3：`O(days * log N * log(S - M))`（单次判定 `O(days * log N)`）→ 视数据分布与 `days` 大小，常不如解法2 稳定

---

## 小结

- 本题的关键是发现“答案关于可行性是单调的”，从而可以**二分答案空间**；
- 判定函数用“顺序装载、超限换天”的线性扫描最直观可靠，`currentDays` 从 1 开始最不易错；
- 解法1 因外层线性枚举容量而超时；解法2 通过二分外层容量高效过题；解法3 提供“按天成块 + 二分跳跃”的等价思路，可用于思维拓展。


