---
layout: post
title: "LeetCode 875｜Koko 吃香蕉：二分查找最小可行速度全解析"
date: "2025-09-03"
toc: true
excerpt: "全面解析 LeetCode 875 Koko 吃香蕉：单调性与二分搜索的建模、两种实现（递归与迭代）、整除上取整公式、边界不变量与正确性证明、复杂度与易错点。"
tags: [Algorithm, BinarySearch, Java, 算法, 题解]
comments: true
author: zempty
---

## 引言

这题的核心在于：把“以某个吃香蕉速度 speed 是否能在 h 小时内吃完”的可行性判断，抽象为一个**单调谓词**，然后用二分搜索在区间 `[1, max(piles)]` 内找到满足条件的最小 `speed`。

本文将：
- 给出两种写法（递归版与迭代版）
- 详细解释「整除上取整」计算方式
- 回答两个高频问题：
  - `Math.ceil((double)pile/speed)` 能否写成 `Math.ceil(pile/speed)`？
  - `totalHours` 用 `int` 还是 `long`？
- 说明循环条件 `left < right` 的意义与不变量
- 最后对两种方案做对比与总结

---

## 题目与建模

给定香蕉堆数组 `piles`，以及总时长 `h`，小猴每小时从一堆中吃 `speed` 根（若不够则吃完这堆）。问：最小的 `speed` 是多少，才能在 `h` 小时内吃完所有香蕉？

关键观察：
- 若 `speed` 可行（能在 `h` 小时内吃完），则更大的速度也一定可行（单调性）。
- 因此可在 `[1, max(piles)]` 上做二分查找最小可行值。

判定函数（谓词）：
- `eatAll(piles, speed, h)` 计算以 `speed` 吃完所有堆所需的总小时数 `totalHours`，若 `totalHours <= h` 则可行。

---

## 解法一：递归二分

### 代码

```java
class Solution {
    public int minEatingSpeed(int[] piles, int h) {
        int left = 1, right = 0;
        for (int pile : piles) {
            right = Math.max(pile, right);
        }
        return binarySearch(piles, h, left, right);
    }

    int binarySearch(int[] piles, int h, int left, int right) {
        if (left == right) {
            return left;
        }
        int mid = left + (right - left) / 2;
        if (eatAll(piles, mid, h)) {
            return binarySearch(piles, h, left, mid);
        } else {
            return binarySearch(piles, h, mid + 1, right);
        }
    }

    boolean eatAll(int[] piles, int speed, int h) {
        long totalHours = 0; // 用 long，解释见下文
        for (int pile : piles) {
            totalHours += Math.ceil((double) pile / speed);
            if (totalHours > h) return false; // 提前剪枝
        }
        return true;
    }
}
```

### 关键解释

- 为什么是 `Math.ceil((double)pile/speed)`？
  - 因为 `pile` 和 `speed` 是 `int`，写成 `pile / speed` 会先做**整数除法**，小数部分被截断。例如 `5/2 == 2`，再 `ceil(2)` 仍是 2，与真实需要的 3 小时不符。
  - 正确做法是先转成 `double` 再 `ceil`，或者用纯整数写法 `hours = (pile + speed - 1) / speed`（见解法二）。

- `Math.ceil(pile/speed)` 可以吗？
  - 不可以。原因同上：`pile/speed` 已经是整数结果，再 `ceil` 毫无意义，等价于向下取整，导致低估所需小时数，判定为“可行”的速度可能过小，最终答案错误。

- `totalHours` 必须是 `long` 吗？
  - 从上界分析：当 `speed = 1` 时，`totalHours = sum(piles)`。由于 `piles.length ≤ 1e4` 且 `piles[i] ≤ 1e9`，极端情况下总和可达 `1e13`，超出 `int`（约 `2.1e9`）。
  - 若用 `int` 直接累加，可能溢出成负数，破坏比较逻辑。因此本实现用 `long` 更稳妥。
  - 另一种安全做法（见解法二）是：用 `int` 但在每次累加后立即与 `h` 比较并提前返回。因为 `h ≤ 1e9`，一旦超过 `h` 就返回，不会让和增长到超过 `int` 上限；且在“可行”的情况下，总和也不可能超过 `h`，因此 `int` 也安全。

---

## 解法二：迭代二分

### 代码

```java
class Solution {
    public int minEatingSpeed(int[] piles, int h) {
        int left = 1, right = 0;
        for (int pile : piles) {
            right = Math.max(pile, right);
        }
        while (left < right) { // 不变量见下文
            int mid = (left + right) >>> 1; // 等价于 (left+right)/2 对于非负数
            if (eatAll(piles, mid, h)) {
                right = mid; // mid 可行，收缩右边界，继续找更小可行值
            } else {
                left = mid + 1; // mid 不可行，最小可行值必在右侧
            }
        }
        return left; // 此时 left == right，为最小可行速度
    }

    boolean eatAll(int[] piles, int speed, int h) {
        int totalHours = 0; // 用 int 但配合提前退出，见解释
        for (int pile : piles) {
            // 纯整数实现的上取整：ceil(pile / speed)
            totalHours += (pile + speed - 1) / speed;
            if (totalHours > h) return false; // 及时剪枝，避免溢出
        }
        return true;
    }
}
```

### 为什么循环条件是 `left < right`？

我们要找的是“最小可行值”。维护不变量：
- 区间始终是闭区间 `[left, right]`
- `eatAll(right)` 一定可行（初始 `right = max(piles)`，显然可行）
- 每次取 `mid = floor((left + right)/2)`
  - 若 `mid` 可行，则最小可行值在 `[left, mid]`，令 `right = mid`
  - 若 `mid` 不可行，则最小可行值在 `[mid + 1, right]`，令 `left = mid + 1`

用 `left < right` 可以保证每次循环都严格缩小区间长度（至少减 1），最终停在 `left == right`，即答案。若使用 `left <= right`，需要额外处理收敛与返回逻辑，否则容易出现死循环或越界。

### 关于 `mid` 的计算

- 代码使用 `(left + right) >>> 1`，对非负数与 `(left + right) / 2` 等价。
- 更常见的写法是 `left + (right - left) / 2`，从数学上避免 `left + right` 的潜在溢出；本题里 `right ≤ 1e9`，`left + right < 2^31`，两者都安全。

### 整数上取整公式 `(pile + speed - 1) / speed`

目标是计算 `ceil(pile / speed)`，用纯整数实现：

推导：设 `a = pile`，`b = speed (≥1)`。

\[ \lceil \frac{a}{b} \rceil = \left\lfloor \frac{a + b - 1}{b} \right\rfloor \]

直观理解：把 `a` 先“抬高”到下一个能被 `b` 整除的数，再做整除。若 `a` 正好是 `b` 的倍数，不会多加；否则会多加到最近的倍数，恰好相当于上取整。

示例：`a = 5, b = 2`
- `ceil(5/2) = 3`
- `(5 + 2 - 1) / 2 = 6 / 2 = 3`

溢出性：本题 `a ≤ 1e9, b ≤ max(piles) ≤ 1e9`，有 `a + b - 1 ≤ 2e9 - 1 < 2^31 - 1`，因此用 `int` 不会溢出。

---

## 小例子走一遍（`piles = [3,6,7,11], h = 8`）

观察速度与总小时数（使用 `(pile + speed - 1) / speed` 计算）：

| speed | 每堆所需小时 | 总小时 |
|---:|:---|---:|
| 4 | 1, 2, 2, 3 | 8 |
| 3 | 1, 2, 3, 4 | 10 |

`speed=4` 可行，`speed=3` 不可行，于是答案是 4。二分会在 `[1, 11]` 上收缩并落在 4。

---

## 两种实现对比

- 可行性判定：两者一致，核心是“整除上取整”。
- 表达方式：
  - 递归版语义直观，但需要注意递归深度（本题最多 ~30 层，安全）。
  - 迭代版更常见，无栈开销，循环式不变量清晰。
- 数值类型：
  - 递归版用 `long totalHours`，即使不提前返回也不会溢出，稳健。
  - 迭代版用 `int totalHours` 搭配“每次累加后立即与 `h` 比较并提前退出”，在 `h ≤ 1e9` 的约束下同样安全且更高效。
- 小技巧：
  - 推荐统一用整数上取整 `(pile + speed - 1) / speed`，避免浮点误差与类型转换。

复杂度（两者相同）：
- 时间：`O(n log max(piles))`
- 空间：递归版 `O(log max(piles))`，迭代版 `O(1)`

---

## 常见易错点

- 写成 `Math.ceil(pile/speed)`（错）：`/` 已经做了整数除法。
- 使用 `left <= right` 配合错误的边界更新，导致死循环或错过答案。
- `mid` 写成 `(left + right)/2` 在极限条件下可能溢出（本题不至于，但习惯上推荐 `left + (right-left)/2`）。
- `totalHours` 用 `int` 且不提前判断 `> h`，可能溢出。

---

## 结论与推荐

- 建议实现：迭代二分 + 纯整数上取整 `(pile + speed - 1) / speed` + 每次累加后立刻与 `h` 比较提前返回。
- 若使用浮点：务必写成 `Math.ceil((double)pile/speed)`，不要忽略强制类型转换。
- `totalHours`：
  - 若无提前返回，建议 `long`；
  - 若每次累加后立即与 `h` 比较并提前退出，`int` 也安全（因 `h ≤ 1e9`）。

这样写不仅正确而且在工程上更稳健、可读性也更好。


