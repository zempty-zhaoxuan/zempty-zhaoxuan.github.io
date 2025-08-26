---
layout: post
title: "LeetCode 153：寻找旋转排序数组中的最小值（四种解法详解）"
date: "2025-08-26"
toc: true
excerpt: "二分搜索四种写法全面对比：经典写法、带有有序剪枝优化、左端点锚定变体与显式枢轴查找；解法1与解法2差异、以及为何解法3去掉有序判定会出错。"
tags: [Algorithm, BinarySearch, Java, LeetCode]
comments: true
author: zempty
---

> 题目：在一个无重复元素的递增数组经过若干次旋转后，找到数组中的最小值。要求时间复杂度 O(log n)。

[LeetCode 153: Find Minimum in Rotated Sorted Array](https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/)

- 前置条件：数组严格递增、无重复元素。
- 目标：以二分查找为核心，定位最小值所在区间或直接定位枢轴。

## 解法总览

本文对比四种常见写法：
- 解法1：右端点参照 + 有序区间剪枝（早返回）
- 解法2：右端点参照的标准写法（更常见的模板）
- 解法3：左端点锚定 + 有序区间剪枝（易错点在无旋转时）
- 解法4：显式寻找“断点/枢轴”位置

下面逐一分析正确性、边界与复杂度，最后给出推荐方案与适用场景。

## 解法1：右端点参照 + 有序剪枝

核心思路：维护闭区间 [left, right]，与 `nums[right]` 比较判断最小值所在半边；若当前区间整体有序则直接返回 `nums[left]`。

```java
class Solution {
    public int findMin(int[] nums) {
        int left = 0, right = nums.length - 1;
        while (left < right) {
            if (nums[left] < nums[right]) return nums[left];
            int mid = (left + right) >>> 1;
            if (nums[mid] > nums[right]) {
                left = mid + 1;
            } else {
                right = mid;
            }
        }
        return nums[left];
    }
}
```

- 正确性要点：
  - 若 `[left, right]` 已整体有序，则最小值即在 `left`。
  - 否则以 `nums[right]` 作为参照：
    - 若 `nums[mid] > nums[right]`，最小值一定在右半边 `(mid, right]`。
    - 否则最小值在左半边 `[left, mid]`。
- 复杂度：时间 O(log n)，空间 O(1)。
- 优点：当区间有序时可 O(1) 早返回，常数更小。

## 解法2：右端点参照的标准写法（推荐模板）

与解法1相同的分支逻辑，只是去掉了“区间整体有序”的早返回判断，写法更简洁、广为流传。

```java
class Solution {
    public int findMin(int[] nums) {
        int left = 0, right = nums.length - 1;
        while (left < right) {
            int mid = (left + right) >>> 1;
            if (nums[mid] > nums[right]) {
                left = mid + 1;
            } else {
                right = mid;
            }
        }
        return nums[left];
    }
}
```

- 正确性与复杂度：与解法1一致（时间 O(log n)，空间 O(1)）。
- 对比解法1：
  - 解法1在完全有序或后续缩小后变有序的区间上可早返回；
  - 解法2每轮都继续收缩，最终也会在 O(log n) 内返回；
  - 因此两者在最坏复杂度相同，解法1常数略优但逻辑分支略多。

## 解法3：左端点锚定 + 有序剪枝

该写法以 `nums[left]` 为锚，判断 `mid` 在“左段还是右段”。为避免在“已整体有序”的情况下走错方向，通常需要加上有序区间的早返回判断。

```java
class Solution {
    public int findMin(int[] nums) {
        int left = 0, right = nums.length - 1;
        while (left < right) {
            if (nums[left] < nums[right]) return nums[left];
            int mid = (left + right) >>> 1;
            if (nums[mid] < nums[left]) {
                right = mid;
            } else {
                left = mid + 1;
            }
        }
        return nums[left];
    }
}
```

- 分支逻辑：
  - 若区间整体有序，直接返回 `nums[left]`。
  - 否则：
    - 若 `nums[mid] < nums[left]`，说明最小值在左半 `[left, mid]`；
    - 否则在右半 `(mid + 1, right]`。
- 复杂度：时间 O(log n)，空间 O(1)。

### 去掉有序判定还能工作吗？（不能）
若删掉 `if (nums[left] < nums[right]) return nums[left];`，在以下两种情况会失败：

1. **无旋转的完全有序数组**：最小值在最左端，但算法会一路向右移动；
2. **旋转后中点为最大值**：当 `mid` 恰好是原数组最大值时，`nums[mid] >= nums[left]` 为真，会错误地向右收缩，错过左侧的最小值。

以 `[1,2,3,4]` 为例：

| 轮次 | left | right | mid | nums[left] | nums[mid] | nums[right] | 决策 |
|---|---:|---:|---:|---:|---:|---:|---|
| 1 | 0 | 3 | 1 | 1 | 2 | 4 | 2 < 1 为假 → left = mid + 1 = 2 |
| 2 | 2 | 3 | 2 | 3 | 3 | 4 | 3 < 3 为假 → left = 3 |
| 结束 | 3 | 3 | - | - | - | - | 返回 nums[3] = 4（错误，应为 1） |

原因：用 `nums[left]` 作为锚时，若区间本身已整体有序，`nums[mid] < nums[left]` 永远为假，指针会一路向右导致返回末尾元素。因此，这个写法必须保留“区间有序”的早返回判定。

## 解法4：显式寻找枢轴（断点）

思路：在旋转数组中，唯一的“降序断点”满足 `nums[pivot-1] > nums[pivot]`。先特判“整体有序”，否则二分去定位该断点。

```java
class Solution {
    public int findMin(int[] nums) {
        int pivot = findPivot(nums);
        return nums[pivot];
    }

    int findPivot(int[] nums) {
        int left = 0, right = nums.length - 1;
        if (nums[0] < nums[right]) return 0; // 整体有序
        while (left <= right) {
            int mid = (left + right) >>> 1;
            if (mid < nums.length - 1 && nums[mid] > nums[mid + 1]) {
                return mid + 1;
            } else if (nums[mid] >= nums[left]) {
                left = mid + 1;
            } else {
                right = mid - 1;
            }
        }
        return 0; // 兜底（理论上不会到达）
    }
}
```

- 正确性要点：
  - 若整体有序，则最小值下标为 0；
  - 否则，断点唯一且在“降序处”命中；
  - 分支 `nums[mid] >= nums[left]` 表示左段有序、断点在右侧；否则在左侧。
- 复杂度：时间 O(log n)，空间 O(1)。
- 适用：当你需要显式的“最小值下标/断点位置”时，这个写法更直观。

## 解法1 与 解法2 的区别

- 共同点：都以 `nums[right]` 为参照收缩边界，保持不变式“最小值始终位于闭区间 [left, right] 内”。
- 不同点：
  - 解法1增加了“区间有序”的早返回判断，在很多用例上常数更优；
  - 解法2更简洁、易记，最坏复杂度相同，是更通用的模板代码。

## 综合对比与建议

- 正确性：四种写法在“无重复元素”的前提下均正确。注意解法3必须保留有序早返回，否则在无旋转数组会失败。
- 可读性与通用性：
  - 推荐优先使用解法2（标准模板），代码最简洁；
  - 若更看重常数并愿意多一个分支，可用解法1；
  - 需要明确“枢轴下标”时，用解法4；
  - 解法3仅在保留有序判定时才安全，且语义不如右端点参照直观。
- 复杂度：四种方法最坏时间均为 O(log n)，空间 O(1)。

## 小结

- 右端点参照是解决本题最稳妥的思路；
- 解法1与解法2核心一致，仅差一个早返回分支；
- 解法3若去掉有序判定会在“无旋转”的输入上出错；
- 若题目扩展到“允许重复元素”（LeetCode 154），需要特别处理相等分支，模板也要相应调整。
