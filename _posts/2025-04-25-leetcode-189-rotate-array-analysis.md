---
layout: post
title: "LeetCode 189 旋转数组：三种解法分析"
date: "2025-04-25"
category: "算法题解"
toc: true
excerpt: "详细分析 LeetCode 189 题旋转数组的三种常见解法：使用额外数组、数组反转、循环替换，并比较其优劣和时空复杂度。"
tags: [Algorithm, Java, 问题]
comments: true
author: zempty
---

## 问题描述

LeetCode 189 题要求将一个数组向右旋转 `k` 步，其中 `k` 是非负数。

例如，输入 `nums = [1,2,3,4,5,6,7]` 和 `k = 3`，输出应为 `[5,6,7,1,2,3,4]`。

这是一个常见的数组操作问题，可以通过多种方法解决。本文将分析三种主要的解法。

## 解法一：使用额外数组

### 思路

最直观的方法是创建一个新的数组，然后将原数组中的每个元素 `nums[i]` 放入新数组的正确位置 `(i + k) % n`。最后，将新数组的内容复制回原数组。为了优化空间，我们可以先复制原数组，然后直接在原数组上根据复制数组的值进行放置。

### 代码 (Java)

```java
import java.util.Arrays;

class Solution {
    // create new int[] nums2
    public void rotate(int[] nums, int k) {
        int n = nums.length;
        // k 可能大于 n，取模获取实际有效旋转步数
        k = k % n;
        if (k == 0) return; // 旋转 0 步或 n 的整数倍步，数组不变

        int[] nums2 = Arrays.copyOf(nums, n); // 复制原数组
        for (int i = 0; i < n; i++) {
            int rotatedIndex = (i + k) % n; // 计算旋转后的索引
            nums[rotatedIndex] = nums2[i];   // 将复制数组的元素放到原数组的正确位置
        }
    }
}
```

### 分析

- **优点:** 逻辑简单，易于理解和实现。
- **缺点:** 需要额外的 O(n) 空间来存储数组副本。
- **时间复杂度:** O(n)。`Arrays.copyOf` 需要 O(n)，循环放置元素也需要 O(n)。
- **空间复杂度:** O(n)。需要一个大小为 n 的额外数组 `nums2`。

## 解法二：数组反转

### 思路

这是一种非常巧妙的 O(1) 空间复杂度的解法。通过三次数组反转操作可以实现旋转：

1.  **反转整个数组:** `[1,2,3,4,5,6,7]` -> `[7,6,5,4,3,2,1]`
2.  **反转前 k 个元素:** `[7,6,5]` -> `[5,6,7]`，数组变为 `[5,6,7,4,3,2,1]`
3.  **反转后 n-k 个元素:** `[4,3,2,1]` -> `[1,2,3,4]`，数组变为 `[5,6,7,1,2,3,4]`

这样就得到了最终结果。

### 代码 (Java)

```java
class Solution {
    // rotate nums using reverse
    public void rotate(int[] nums, int k) {
        int n = nums.length;
        k = k % n; // 处理 k >= n 的情况
        if (k == 0) return;

        // 三次反转
        reverse(nums, 0, n - 1); // 1. 反转整个数组
        reverse(nums, 0, k - 1); // 2. 反转前 k 个元素
        reverse(nums, k, n - 1); // 3. 反转后 n-k 个元素
    }

    // 辅助函数：反转数组指定范围内的元素
    private void reverse(int[] nums, int start, int end) {
        while (start < end) {
            int temp = nums[start];
            nums[start] = nums[end];
            nums[end] = temp;
            start++;
            end--;
        }
    }
}
```

### 分析

- **优点:** 空间复杂度为 O(1)，原地修改数组。效率高。
- **缺点:** 相较于方法一，逻辑稍显不直观，需要理解反转操作如何实现旋转。
- **时间复杂度:** O(n)。每个元素最多被移动（交换）两次。`reverse` 函数对其范围内的元素进行线性扫描。总时间为 O(n) + O(k) + O(n-k) = O(2n) = O(n)。
- **空间复杂度:** O(1)。只需要常数空间存储临时变量 `temp` 和索引。

## 解法三：循环替换

### 思路

这种方法也是原地旋转，尝试直接将每个元素放到它最终的位置上。从 `start = 0` 开始，将 `nums[start]` 放到 `(start + k) % n` 的位置，然后将被替换掉的元素放到它应该去的位置 `((start + k) + k) % n`，如此循环下去，直到回到 `start` 位置。

一个潜在的问题是，如果 `n` 和 `k` 的最大公约数 `gcd(n, k) > 1`，一次循环可能无法访问所有元素（会提前回到 `start`）。例如 `n=6, k=2`，从 0 开始会访问 0 -> 2 -> 4 -> 0，而 1, 3, 5 未被访问。为了解决这个问题，我们需要进行 `gcd(n, k)` 次这样的循环。代码中使用 `count` 变量记录移动的总元素数量，外层循环 `for(int start = 0; count < n; start++)` 确保当一个循环结束后（`current == start`），如果 `count < n`，则从下一个 `start` 索引开始新的循环，直到所有 `n` 个元素都被移动。

### 代码 (Java)

```java
class Solution {
    // rotate using cyclic replacements
    public void rotate(int[] nums, int k) {
        int n = nums.length;
        k = k % n;
        if (k == 0) return;

        int count = 0; // 记录已放置到最终位置的元素数量
        for (int start = 0; count < n; start++) {
            int current = start; // 当前元素的索引
            int prevValue = nums[start]; // 需要被移动到下一个位置的元素值

            do {
                int nextIndex = (current + k) % n; // 计算目标位置
                int temp = nums[nextIndex]; // 暂存目标位置的原有值
                nums[nextIndex] = prevValue; // 将 prevValue 放到目标位置
                prevValue = temp; // 更新 prevValue 为被替换出来的值
                current = nextIndex; // 移动到下一个位置
                count++; // 移动了一个元素
            } while (current != start); // 当回到起始位置时，一个循环结束
            // 如果 count < n，外层循环 start++ 进入下一个起始点
        }
    }
}
```

### 分析

- **优点:** 空间复杂度为 O(1)，原地修改。
- **缺点:** 逻辑最为复杂，特别是处理 `gcd(n, k) > 1` 的情况，`do-while` 循环和 `count`、`start` 的配合需要仔细理解。
- **时间复杂度:** O(n)。虽然有嵌套循环结构，但 `count` 变量确保每个元素只被访问和移动一次。
- **空间复杂度:** O(1)。只需要常数空间存储 `count`, `start`, `current`, `prevValue`, `temp` 等变量。

## 总结与比较

| 解法     | 时间复杂度 | 空间复杂度 | 实现复杂度 | 优点                    | 缺点               |
| :------- | :--------- | :--------- | :--------- | :---------------------- | :----------------- |
| 额外数组 | O(n)       | O(n)       | 低         | 简单直观                | 空间开销大         |
| 数组反转 | O(n)       | O(1)       | 中         | 空间 O(1)，代码相对简洁 | 思路稍不直观       |
| 循环替换 | O(n)       | O(1)       | 高         | 空间 O(1)，原地完成     | 逻辑复杂，不易实现 |

**选择建议:**

- 如果内存限制宽松，追求快速实现和易理解，**解法一（额外数组）** 是不错的选择。
- 在大多数要求 O(1) 空间复杂度的场景下（如面试、竞赛），**解法二（数组反转）** 是最优选，它在效率和实现难度之间取得了很好的平衡。
- **解法三（循环替换）** 也是 O(1) 空间的有效方法，但其复杂性使得它在实际编码中不如解法二常用，更多用于理解算法思想。

这三种方法覆盖了解决旋转数组问题的主要思路，理解它们有助于掌握不同的数组操作技巧。
