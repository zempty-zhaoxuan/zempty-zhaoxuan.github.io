---
layout: post
title: "LeetCode 34：在排序数组中查找元素的第一个和最后一个位置——三种解法详解与对比"
date: "2025-08-26"
toc: true
excerpt: "三种二分思路（先命中后扩散、双 lower_bound、分别求左/右边界）全面解析与复杂度对比，含边界证明与常见坑。"
tags: [Algorithm, BinarySearch, Java, LeetCode]
comments: true
author: zempty
---

## 题目概述

给定一个非递减排序数组 `nums` 和目标值 `target`，返回 `target` 在数组中出现的第一个位置和最后一个位置。如果不存在，返回 `[-1, -1]`。

- 要求：时间复杂度尽量为 `O(log n)`。

本文对三种实现思路进行详细分析，并给出复杂度、正确性、边界处理与对比建议。

## 解法一：先二分命中一个位置，再向两端线性扩散

### 思路
1. 用一次标准二分在区间 `[0, n-1]` 中找到任意一个等于 `target` 的下标 `index`。
2. 若找不到（返回 `-1`），直接返回 `[-1, -1]`。
3. 从 `index` 向左线性移动直到不是 `target`，得到左边界；从 `index` 向右线性移动直到不是 `target`，得到右边界。

### 代码

```java
public int[] searchRange(int[] nums, int target) {
      int[] result = { -1, -1 };
      int left = 0, right = nums.length - 1;
      int index = binarySearch(nums,left ,right, target);
      if(index == -1) return result;
      int leftBound = index, rightBound = index;
      while(leftBound >= 1 && nums[leftBound - 1] == target){
          leftBound--;
      }
      result[0] = leftBound;
      while(rightBound < nums.length - 1 && nums[rightBound + 1] == target){
          rightBound ++;
      }
      result[1] = rightBound;
      return result;
  } 

  int binarySearch(int[] nums, int left, int right, int target){
      while(left <= right){
          int mid = (left + right) >>> 1;
          if(nums[mid] == target) return mid;
          else if(nums[mid] > target) right = mid - 1;
          else left = mid + 1;
      }
      return -1 ;
  }
```

### 复杂度
- 平均：`O(log n + k)`，其中 `k` 为 `target` 连续段的长度。
- 最坏：`O(n)`（当数组全为 `target` 时，线性扩散遍历整个数组）。
- 空间：`O(1)`。

### 正确性与边界
- 当找到一个 `index` 后，线性往左/右收缩一定能触达极限边界；若不存在命中，直接 `[-1, -1]`。
- 边界条件：空数组、`target` 小于最小值或大于最大值、`target` 不存在时返回默认值。
- 注意：虽简单直观，但不能保证 `O(log n)` 上界。

## 解法二：两次 lower_bound（右边界 = lower_bound(target+1) - 1）

### 思路
使用“第一个不小于目标”的下界函数 `lower_bound`：
- `leftBound = lower_bound(nums, target)`，得到第一个 `>= target` 的下标。
- `rightBound = lower_bound(nums, target + 1) - 1`，即第一个 `>= target+1` 的下标减一。
- 若 `leftBound <= rightBound` 且 `leftBound < n` 且 `nums[leftBound] == target`，则返回 `[leftBound, rightBound]`，否则 `[-1, -1]`。

### 代码

```java
class Solution {
    public int[] searchRange(int[] nums, int target) {
        int[] result = { -1, -1 };
        int leftBound = findBound(nums,target);
        int rightBound = findBound(nums,target + 1) - 1;
        if(leftBound <= rightBound && leftBound < nums.length && nums[leftBound] == target){
            result = new int[]{leftBound,rightBound};
        }
        return result;
    } 

    int findBound(int[] nums,int target){
        int left = 0, right = nums.length;
        while(left < right){
            int mid = (left + right) >>> 1;
            if(nums[mid] < target){
                left = mid + 1;
            }else{
                right = mid;
            }
        }
        return left;
    }
}
```

### 复杂度
- 时间：两次二分，`O(log n)`。
- 空间：`O(1)`。

### 正确性与边界
- `findBound` 不变式：返回区间内第一个使得 `nums[i] >= target` 的最小下标（若不存在则返回 `n`）。
- 因此 `lower_bound(target+1) - 1` 恰为最后一个 `< target+1` 的位置，即 `<= target` 的最后位置。
- 边界：当 `target` 不存在时，`leftBound == n` 或 `nums[leftBound] != target`，条件判定会使结果回退为 `[-1, -1]`。

## 解法三：分别二分左端点与右端点

### 思路
- 左端点：找最左的 `target`，即满足 `nums[mid] >= target` 时收缩右侧；最终检查 `left` 合法性。
- 右端点：找最右的 `target`，即满足 `nums[mid] <= target` 时收缩左侧；最终检查 `left-1` 合法性。

### 代码

```java
class Solution {
    public int[] searchRange(int[] nums, int target) {
        int[] result = { -1, -1 };
        int left = 0, n = nums.length, right = n - 1;
        if(n == 0 ) return result;
        result[0] = findLeftMost(nums, left, right, target);
        result[1] = findRightMost(nums, left, right, target);
        return result;
    }

    int findLeftMost(int[] nums, int left, int right, int target) {
        while (left <= right) {
            int mid = (left + right) >>> 1;
            if (nums[mid] >= target) {
                right = mid - 1;
            } else {
                left = mid + 1;
            }
        }
        return left < nums.length && nums[left] == target ? left : -1;
    }
    int findRightMost(int[] nums, int left, int right, int target) {
        while (left <= right) {
            int mid = (left + right) >>> 1;
            if (nums[mid] <= target) {
                left = mid + 1;
            } else{
                right = mid - 1;
            }
        }
        return left > 0 && nums[left - 1] == target ? left - 1 : -1;
    }
}
```

### 复杂度
- 时间：两次二分，`O(log n)`。
- 空间：`O(1)`。

### 正确性与边界
- 左端点循环结束时，`left` 为“第一个 `>= target`”的位置；若 `nums[left]==target` 则返回，否则 `-1`。
- 右端点循环结束时，`left` 为“第一个 `> target`”的位置；因此候选右端点为 `left-1`，需判空与比较。

## 三种方法对比

| 方法 | 核心思路 | 时间复杂度 | 最坏情况 | 空间复杂度 | 易错点 | 适用场景 |
| --- | --- | --- | --- | --- | --- | --- |
| 解法一 | 先命中再左右线性扩散 | 平均 `O(log n + k)` | `O(n)`（大量重复值） | `O(1)` | 边界越界、最坏超时 | 代码直观、`k` 很小的场景 |
| 解法二 | `lower_bound(target)` 与 `lower_bound(target+1)-1` | `O(log n)` | `O(log n)` | `O(1)` | 判定条件与 `n` 边界 | 模板化强、复用下界函数 |
| 解法三 | 分别求最左和最右的二分 | `O(log n)` | `O(log n)` | `O(1)` | 循环条件、返回值校验 | 常规面试高频、易独立实现 |

### 选择建议
- 追求稳定 `O(log n)`：优先解法二或解法三。
- 复用性与模板化：解法二（`lower_bound/upper_bound` 思维）更通用。
- 教学/直观：解法一便于理解，但在极端数据上不满足对数上界。

## 常见坑与校验清单
- 空数组与单元素数组要先判定。
- 二分边界：解法二使用的是半开区间 `[0, n)` 模式，解法三为闭区间 `while (left <= right)`，不要混淆。
- `mid` 计算可用 `>>> 1` 防止溢出（Java int 足够但保持习惯更好）。
- 返回前务必二次校验下标有效且值相等（避免返回无效位置）。

## 小例子（左端点寻找）
数组：`[5,7,7,8,8,10]`，`target=8`

- 左端点：最终停在第一个 `>=8` 的位置 `3`，检验 `nums[3]==8`，成立。
- 右端点（解法三）：最终 `left` 停在第一个 `>8` 的位置 `5`，因此右端点为 `left-1=4`。

## 总结
- 三种实现均正确；若你需要保证对数复杂度，建议使用“下界两次”的解法二或“分别求左右端点”的解法三。
- 写二分要统一区间定义与循环不变式，结束后的下标解释要与不变式一致；最后做一次安全校验，避免越界与误报。


