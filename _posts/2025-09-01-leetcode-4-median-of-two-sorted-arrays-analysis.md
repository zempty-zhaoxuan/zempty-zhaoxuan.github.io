---
layout: post
title: "LeetCode 4 Median of Two Sorted Arrays Analysis"
date: "2025-09-01"
toc: true
excerpt: "什么是中位数，如何在两个有序数组中高效求中位数？对三种解法逐一讲清：合并排序、线性归并、二分切割（最优解），并深入解释解法三的切割点。"
tags: [Algorithm, BinarySearch, DataStructure, Java]
comments: true
author: zempty
---

## 中位数是什么？怎么求中位数？

中位数（Median）是把一个有序序列分成左右两半的“中间值”。

- 若长度为奇数 \(L=2k+1\)，中位数为第 \(k+1\) 个元素。
- 若长度为偶数 \(L=2k\)，中位数为第 \(k\) 个与第 \(k+1\) 个元素的平均值。

对于两个已排序数组 `nums1` 和 `nums2`，题目要求在合并意义下的整体有序序列中找到中位数。

---

## 题目简述

给定两个有序数组 `nums1`、`nums2`，求它们合并后的中位数。经典要求是时间复杂度达到 \(O(\log(m+n))\)。

---

## 解法一：合并后整体排序再取中位数（直观但不最优）

思路：直接把两个数组拼接起来，整体排序，再根据长度奇偶取中位数。

- 时间复杂度：\(O((m+n)\log(m+n))\)
- 空间复杂度：\(O(m+n)\)
- 优点：代码最直观、易写。
- 缺点：没有利用“原本已排序”的性质；不满足最优时间复杂度要求。

代码：

```java
class Solution {
    public double findMedianSortedArrays(int[] nums1, int[] nums2) {
        int[] total = java.util.stream.IntStream
            .concat(java.util.Arrays.stream(nums1), java.util.Arrays.stream(nums2))
            .toArray();
        java.util.Arrays.sort(total);
        int len = total.length;
        if (len % 2 == 0) {
            return (total[len / 2 - 1] + total[len / 2]) / 2.0;
        }
        return total[len / 2];
    }
}
```

---

## 解法二：双指针线性归并，走到中位数为止（更高效且易实现）

思路：像归并排序的合并过程一样，用两个指针 `i`、`j` 同步前进，按从小到大“弹出”元素。仅需推进到中位数所在的位置即可。

- 时间复杂度：\(O(m+n)\)（虽然只走到一半，但大 O 仍为线性）
- 空间复杂度：\(O(1)\)
- 优点：不需要额外数组，代码简单高效。
- 缺点：仍未达到题目经典的对数时间最优解。

代码：

```java
class Solution {
    public double findMedianSortedArrays(int[] nums1, int[] nums2) {
        int m = nums1.length, n = nums2.length;
        int len = m + n;
        int left, right;
        if (len % 2 == 0) {
            left = len / 2 - 1;
            right = len / 2;
        } else {
            left = right = len / 2;
        }
        int i = 0, j = 0, k = 0;
        int leftValue = 0, rightValue = 0;
        while (k <= right) {
            int current;
            if (i >= m) {
                current = nums2[j++];
            } else if (j >= n) {
                current = nums1[i++];
            } else if (nums1[i] < nums2[j]) {
                current = nums1[i++];
            } else {
                current = nums2[j++];
            }
            if (k == left) leftValue = current;
            if (k == right) rightValue = current;
            k++;
        }
        return (leftValue + rightValue) / 2.0;
    }
}
```

小例子跟踪（`nums1=[1,3]`, `nums2=[2,4,5]`, `len=5`，`left=right=2`）：

| k | i | j | 取出的 current | leftValue | rightValue |
|---|---|---|----------------|-----------|------------|
| 0 | 1 | 0 | 1              | -         | -          |
| 1 | 1 | 1 | 2              | -         | -          |
| 2 | 2 | 1 | 3              | 3         | 3          |

此时停下，中位数为 3。

---

## 解法三：二分切割（最优解 \(O(\log\min(m,n))\)）

核心思想：在较短的数组上做二分，找到一个切割点 \(i\)，在另一个数组上对应切割 \(j\)，使得左半部分包含整体一半（或一半+1）元素，且左半所有元素都不大于右半所有元素。

设：

- `i` 为 `nums1` 左半取用的元素个数，`i ∈ [0, m]`
- `j = halfLen - i` 为 `nums2` 左半取用的元素个数
- `halfLen = (m + n + 1) / 2`（奇偶统一写法）

平衡与有序性条件：

- 平衡：`i + j = halfLen`
- 有序性：`nums1[i-1] ≤ nums2[j]` 且 `nums2[j-1] ≤ nums1[i]`

边界用哨兵处理：

- `i == 0` 时 `nums1[i-1] = -∞`，用 `Integer.MIN_VALUE`
- `i == m` 时 `nums1[i]   = +∞`，用 `Integer.MAX_VALUE`
- `j == 0` 或 `j == n` 同理

若有序性不满足：

- 若 `nums1[i-1] > nums2[j]`，说明 `i` 取多了，应左移 `right = i - 1`
- 否则 `nums2[j-1] > nums1[i]`，应右移 `left = i + 1`

当两个条件同时满足时：

- 若总长度为奇数，中位数为 `max(nums1[i-1], nums2[j-1])`
- 若为偶数，中位数为 `max(nums1[i-1], nums2[j-1])` 与 `min(nums1[i], nums2[j])` 的平均

代码：

```java
class Solution {
    public double findMedianSortedArrays(int[] nums1, int[] nums2) {
        int m = nums1.length, n = nums2.length;
        if (n < m) return findMedian(nums2, nums1); // 保证 m <= n
        return findMedian(nums1, nums2);
    }

    private double findMedian(int[] nums1, int[] nums2) {
        int m = nums1.length, n = nums2.length;
        int len = m + n;
        int left = 0, right = m;
        int halfLen = (len + 1) / 2;
        while (left <= right) {
            int i = (left + right) / 2;
            int j = halfLen - i;
            int nums1LeftMax = (i == 0) ? Integer.MIN_VALUE : nums1[i - 1];
            int nums2LeftMax = (j == 0) ? Integer.MIN_VALUE : nums2[j - 1];
            int nums1RightMin = (i == m) ? Integer.MAX_VALUE : nums1[i];
            int nums2RightMin = (j == n) ? Integer.MAX_VALUE : nums2[j];
            if (nums1LeftMax <= nums2RightMin && nums2LeftMax <= nums1RightMin) {
                if (len % 2 == 0) {
                    return (Math.max(nums1LeftMax, nums2LeftMax) + Math.min(nums1RightMin, nums2RightMin)) / 2.0;
                } else {
                    return Math.max(nums1LeftMax, nums2LeftMax);
                }
            } else if (nums1LeftMax > nums2RightMin) {
                right = i - 1;
            } else {
                left = i + 1;
            }
        }
        return 0; // 按逻辑不会到达
    }
}
```

### 切割点如何理解？

可以把两个数组想象成拼接后的整体，但我们不真正合并，而是在各自内部选择“切口”：

```
nums1: [  … 左半(取 i 个) … | … 右半 … ]
nums2: [  … 左半(取 j 个) … | … 右半 … ]
            ↑                ↑
           i-1              i
```

目标是让左半一共 `halfLen` 个元素，且左半最大 ≤ 右半最小。

举例：`nums1=[1,3,8,9,15] (m=5)`, `nums2=[7,11,18,19,21,25] (n=6)`。

- `len=11`，`halfLen=(11+1)/2=6`
- 取 `i=3` ⇒ `j=3`
- 左半最大：`max(nums1[2]=8, nums2[2]=18)=18`
- 右半最小：`min(nums1[3]=9, nums2[3]=19)=9`
- 因为 `8 ≤ 19` 但 `18 ≤ 9` 不成立，说明 `i` 取小了（`nums2` 的左半过大），应增加 `i`

通过二分不断调整 `i`，直到两侧“最大左 ≤ 最小右”。一旦满足，答案按奇偶直接读出。

为什么正确？因为：

- 平衡保证了我们取的左半刚好覆盖整体的一半（或一半+1）
- 有序性保证了左半的任一元素都不大于右半的任一元素，此时中位数定义与读取公式严格对应

---

## 三种方法对比

| 方法 | 时间复杂度 | 空间复杂度 | 代码复杂度 | 何时选择 |
|------|------------|------------|------------|----------|
| 合并排序（解法一） | \(O((m+n)\log(m+n))\) | \(O(m+n)\) | 简单 | 仅需快速写、数据量不大 |
| 线性归并（解法二） | \(O(m+n)\) | \(O(1)\) | 简单 | 追求常数小、代码直观 |
| 二分切割（解法三） | \(O(\log\min(m,n))\) | \(O(1)\) | 中等 | 追求最优复杂度、面试首选 |

---

## 小结

- 中位数把序列一分为二，奇取中点，偶取中间两数平均。
- 解法一最直接但最慢；解法二线性时间、实现简单；解法三利用二分切割，在较短数组上搜索，达到最优 \(O(\log\min(m,n))\)。
- 理解解法三的关键在于“平衡 + 有序性”两个条件，以及边界的哨兵处理。

