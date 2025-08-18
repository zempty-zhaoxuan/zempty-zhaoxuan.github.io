---
layout: post
title: "二分查找：从起源到成熟的全面指南（含要点与经典面试题目表）"
date: "2025-08-18"
toc: true
excerpt: "系统梳理二分查找的历史起源、演进与成熟，实现细节、工程化要点、常见陷阱与变体，并附典型面试题目总结表，帮助你从理论到实践全面掌握二分查找。"
tags: [Algorithm, BinarySearch, DataStructure, Java]
comments: true
author: zempty
---

## 引言

二分查找（Binary Search）以“分而治之”为核心思想，是算法面试与工程实践中最常用、最高效的查找技术之一。尽管其思路直观，但实现细节“出奇地棘手”。本文综合多方资料，系统讲解二分查找从“起源→过程→成熟”的发展脉络，给出工程化实现要点与常见陷阱，配合经典题目总结，帮助你在面试与实际开发中稳健落地。

## 起源：从数学到计算机

- 16 世纪：西蒙·斯蒂文（Simon Stevin）在研究多项式时使用“二分法”思想。
- 1817 年：波尔查诺（Bernard Bolzano）形式化“二分法”（介值定理背景）。
- 1946 年：计算机先驱约翰·莫奇利（John Mauchly）在著名的摩尔学院讲座首次以计算机角度讨论二分查找，用于函数表查找。
- 1950s–1960s 的完善：
  - 早期公开实现常假设数组长度为 \(2^n-1\)，以便“正中对半”，现实适用性差。
  - 1960 年，D. H. Lehmer 给出适用于任意长度数组的通用算法，打破限制。
  - 1962 年，Thomas N. Hibbard 等人奠定了与检索/排序相关的理论基础；Hermann Bottenbruch 在 ALGOL 60 中提出将“相等判断”后置的实现思路以减少每轮比较。
- 实践教训：实现细节长期易错。包括《Programming Pearls》中的实现与 Java 早期 `Arrays.binarySearch` 曾经存在整数溢出问题，直至 2006 年被 Joshua Bloch 揭示。

## 过程：算法机理与标准实现

### 适用前提

1. 有序数据：数组需预先按升序（或降序）排列；
2. 随机访问：能以 \(O(1)\) 时间按索引访问元素（如数组、ArrayList），不适用于链表等顺序访问结构。

### 闭区间迭代模板（推荐用于生产）

```java
public static int binarySearch(int[] array, int target) {
    if (array == null || array.length == 0) return -1;
    int low = 0, high = array.length - 1;
    while (low <= high) {
        int mid = low + (high - low) / 2; // 防止溢出
        if (array[mid] == target) return mid;
        if (array[mid] < target) low = mid + 1; else high = mid - 1;
    }
    return -1;
}
```

要点：
- 中点计算使用 `low + (high - low) / 2`，避免 `(low + high)` 溢出；
- 闭区间 `[low, high]` 搭配循环条件 `low <= high`；
- 指针更新必须严格缩小区间：`low = mid + 1` 或 `high = mid - 1`。

### 递归实现（教学友好，工程上少用）

```java
public static int binarySearchRecursive(int[] a, int t, int l, int r) {
    if (l > r) return -1;
    int m = l + (r - l) / 2;
    if (a[m] == t) return m;
    return a[m] < t ? binarySearchRecursive(a, t, m + 1, r)
                    : binarySearchRecursive(a, t, l, m - 1);
}
```

复杂度：时间 \(O(\log n)\)；迭代法空间 \(O(1)\)，递归法空间 \(O(\log n)\)。

### 示例执行流程（目标 7）

数组：`[1, 3, 5, 7, 9]`

| 轮次 | low | high | mid | a[mid] | 关系 | 新区间 |
|---:|---:|---:|---:|:----:|:----:|:-----|
| 1 | 0 | 4 | 2 | 5 | 5 < 7 | [3, 4] |
| 2 | 3 | 4 | 3 | 7 | 命中 | 结束 |

## 成熟：工程化与实践要点

1. 循环不变量：闭区间语义下，“如果目标存在，其索引始终落在 `[low, high]` 内”。每次更新要维护不变量并严格缩小区间；
2. 选择合适模板：
   - 查找某个值：多用闭区间 `while (low <= high)` 模板；
   - 查找边界（lower_bound/upper_bound）：常用“半开区间 + 不回退”的写法；
3. 防溢出：一律使用 `low + (high - low) / 2`；
4. 去死循环：禁止 `low = mid` 或 `high = mid`（需 `±1`）；
5. 空数组/单元素边界：入口处判空，单元素时应再执行一次循环；
6. 小数组的现实考量：在 \(< 20\) 的规模上，线性扫描可能因更好的缓存/分支预测而更快；
7. 适用场景：静态或少变数据、需要多次查询；频繁增删的场景考虑平衡树/跳表/索引结构。

## 常见变体与代码模板

### 1) 下界（第一个 ≥ target 的位置）

```java
public static int lowerBound(int[] a, int target) {
    int l = 0, r = a.length; // 半开区间 [l, r)
    while (l < r) {
        int m = l + (r - l) / 2;
        if (a[m] < target) l = m + 1; else r = m;
    }
    return l; // 若越界或 a[l] != target，则为插入位置
}
```

### 2) 上界（第一个 > target 的位置）

```java
public static int upperBound(int[] a, int target) {
    int l = 0, r = a.length;
    while (l < r) {
        int m = l + (r - l) / 2;
        if (a[m] <= target) l = m + 1; else r = m;
    }
    return l;
}
```

### 3) 旋转有序数组查找（LC 33）

```java
public static int searchRotated(int[] nums, int target) {
    int l = 0, r = nums.length - 1;
    while (l <= r) {
        int m = l + (r - l) / 2;
        if (nums[m] == target) return m;
        if (nums[l] <= nums[m]) { // 左半有序
            if (nums[l] <= target && target < nums[m]) r = m - 1; else l = m + 1;
        } else { // 右半有序
            if (nums[m] < target && target <= nums[r]) l = m + 1; else r = m - 1;
        }
    }
    return -1;
}
```

### 4) 在答案空间上二分（单调判定函数）

以 LC 875「爱吃香蕉的珂珂」为例：给定吃速 `k` 是否能在 `h` 小时内吃完是单调可判定的。

```java
public static int minEatingSpeed(int[] piles, int h) {
    int l = 1, r = java.util.Arrays.stream(piles).max().orElse(1);
    while (l < r) {
        int m = l + (r - l) / 2;
        if (canFinish(piles, m, h)) r = m; else l = m + 1;
    }
    return l;
}

private static boolean canFinish(int[] piles, int k, int h) {
    long time = 0;
    for (int p : piles) {
        time += (p + k - 1) / k; // 向上取整
        if (time > h) return false;
    }
    return true;
}
```

### 5) 数值函数的二分：整数平方根（LC 69）

```java
public static int mySqrt(int x) {
    if (x < 2) return x;
    int l = 1, r = x / 2 + 1;
    while (l < r) {
        int m = l + (r - l + 1) / 2; // 取上中位，避免死循环
        if ((long) m * m <= x) l = m; else r = m - 1;
    }
    return l;
}
```

## 二分查找要点总结（速记）

- 模板优先：闭区间查值；半开区间找边界；
- 中点防溢：`mid = low + (high - low) / 2`；
- 不变量明确：目标若存在，必在当前区间内；
- 严格收敛：更新必须排除 `mid` 本身；
- 边界清晰：空数组、单元素、首尾目标、越界返回；
- 变体通关：lower_bound/upper_bound、旋转数组、答案二分；
- 工程权衡：小规模/一次性查询不一定优于线性；
- 测试完备：存在/不存在、边界、重复元素、极值规模。

## 经典面试题目介绍总结

下表精选高频与代表性二分题目，覆盖基础实现、边界查找、结构变形与答案空间二分等模式。

| 序号 | 题目 | 难度 | 关键思路/考点 | 模式 |
|---:|:--|:--:|:--|:--|
| 704 | Binary Search | Easy | 标准闭区间模板与防溢中点 | 查值 |
| 35 | Search Insert Position | Easy | `lower_bound` 等价；循环结束 `low` 即插入点 | 边界 |
| 278 | First Bad Version | Easy | 单调布尔序列的左边界定位 | 答案/边界 |
| 69 | Sqrt(x) | Easy | 数值空间单调判定，注意乘法溢出 | 答案 |
| 34 | Find First and Last Position | Medium | 两次边界二分：首/尾出现位置 | 边界 |
| 33 | Search in Rotated Sorted Array | Medium | 至少一侧有序，落区判断 | 结构变形 |
| 153 | Find Minimum in Rotated Sorted Array | Medium | 枢轴/最小值定位 | 结构变形 |
| 162 | Find Peak Element | Medium | 依据上升/下降趋势选侧 | 方向二分 |
| 74 | Search a 2D Matrix | Medium | 视作一维或先定行再定列 | 映射/两段二分 |
| 240 | Search a 2D Matrix II | Medium | 行列有序，亦可二分或线性从角落推进 | 结构利用 |
| 875 | Koko Eating Bananas | Medium | 最小可行速度的单调判定 | 答案 |
| 1011 | Ship Packages in D Days | Medium | 最小可行载重的单调判定 | 答案 |
| 4 | Median of Two Sorted Arrays | Hard | 对短数组做二分分割，平衡左右两侧 | 高级分割/答案 |

## 思考与总结

二分查找的“难”，不在思想，而在工程细节与变体套路：

- 牢记不变量与区间语义，模板化编码能显著降低出错率；
- 学会识别问题中的“单调性”，才能将二分从“数组查值”推广到“答案空间”与“结构变形”；
- 结合硬件现实（缓存/分支预测）与业务场景（数据规模、变更频率），权衡是否使用二分；
- 在面试中，先给出稳健模板，再小步改造以应对变体与边界，是拿分关键；
- 以系统化练习（上表题单）覆盖各类模式，建立一套可迁移的心智模型。

掌握了上述原则与模板，你就能在算法题与实际工程中，稳定、高效地运用二分查找。


