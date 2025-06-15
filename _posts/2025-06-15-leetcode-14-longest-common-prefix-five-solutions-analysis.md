---
layout: post
title: "LeetCode 14 最长公共前缀：五种解法深度解析"
date: "2025-06-15"
toc: true
excerpt: "深入分析 LeetCode 14 题最长公共前缀问题的五种经典解法：垂直扫描法、水平扫描法、indexOf优化法、二分查找法和分治法，详细解释每种方法的实现原理、时间复杂度和适用场景。"
tags: [Algorithm, Java, LeetCode, 字符串]
comments: true
author: zempty
---

## 问题描述

LeetCode 14 题要求找到字符串数组中所有字符串的最长公共前缀。如果不存在公共前缀，返回空字符串 `""`。

**示例：**
- 输入：`strs = ["flower","flow","flight"]`
- 输出：`"fl"`

本文将详细分析五种不同的解法，每种方法都有其独特的思路和适用场景。

## 解法一：垂直扫描法（逐字符比较）

### 算法思路

垂直扫描法是最直观的解法，其核心思想是：
1. 以第一个字符串作为基准
2. 逐个字符位置进行比较
3. 对每个字符位置，检查所有字符串在该位置的字符是否相同
4. 一旦发现不匹配或某个字符串长度不够，立即返回当前位置之前的子串

### 代码实现

```java
class Solution {
    public String longestCommonPrefix(String[] strs) {
        String str = strs[0];
        for(int i = 0; i < str.length(); i++){
            char curr = str.charAt(i);
            for(int j = 1; j < strs.length; j++){
                if(i == strs[j].length() || strs[j].charAt(i) != curr){
                    return str.substring(0, i);
                }
            }
        }
        return str; 
    }
}
```

### 执行流程示例

以 `["flower", "flow", "flight"]` 为例：

| 位置 | 基准字符 | flower | flow | flight | 结果 |
|------|----------|--------|------|--------|------|
| 0    | f        | f      | f    | f      | 匹配 |
| 1    | l        | l      | l    | l      | 匹配 |
| 2    | o        | o      | o    | i      | 不匹配 |

在位置 2 发现不匹配，返回 `str.substring(0, 2) = "fl"`

### 复杂度分析

- **时间复杂度**：O(S)，其中 S 是所有字符串中字符的总数
- **空间复杂度**：O(1)，只使用了常数额外空间

## 解法二：水平扫描法（两两比较）

### 算法思路

水平扫描法采用两两比较的策略：
1. 将第一个字符串作为初始前缀
2. 依次与后续每个字符串比较，更新公共前缀
3. 使用辅助函数 `getCommonPrefix` 计算两个字符串的公共前缀
4. 如果某次比较后前缀为空，提前返回

### 代码实现

```java
class Solution {
    public String longestCommonPrefix(String[] strs) {
        String prefix = strs[0];
        for(int j = 1; j < strs.length; j++){
            prefix = getCommonPrefix(prefix, strs[j]);
            if(prefix.isEmpty()){
                return "";
            }
        }
        return prefix;
    }

    String getCommonPrefix(String str1, String str2){
        int minLength = Math.min(str1.length(), str2.length());
        for(int i = 0; i < minLength; i++){
            if(str1.charAt(i) != str2.charAt(i)){
                return str1.substring(0, i);
            }
        }
        return str1.substring(0, minLength);
    }
}
```

### 执行流程示例

以 `["flower", "flow", "flight"]` 为例：

| 步骤 | 当前前缀 | 比较字符串 | 新前缀 | 说明 |
|------|----------|------------|--------|------|
| 1    | "flower" | "flow"     | "flow" | flower和flow的公共前缀 |
| 2    | "flow"   | "flight"   | "fl"   | flow和flight的公共前缀 |

### 复杂度分析

- **时间复杂度**：O(S)，最坏情况下需要比较所有字符
- **空间复杂度**：O(1)，不计算返回值的空间

## 解法三：indexOf优化法

### 算法思路

这种方法巧妙地利用了 `indexOf` 方法的特性：
1. 以第一个字符串作为初始前缀
2. 对每个后续字符串，检查当前前缀是否为其前缀（使用 `indexOf(prefix) == 0`）
3. 如果不是，则逐渐缩短前缀长度，直到找到公共前缀或前缀为空

### 代码实现

```java
class Solution {
    public String longestCommonPrefix(String[] strs) {
        String prefix = strs[0];
        for(int i = 1; i < strs.length; i++){
            while(strs[i].indexOf(prefix) != 0){
                prefix = prefix.substring(0, prefix.length() - 1);
                if(prefix.isEmpty()) return "";
            }
        }
        return prefix;
    }
}
```

### 执行流程示例

以 `["flower", "flow", "flight"]` 为例：

| 步骤 | 当前前缀 | 检查字符串 | indexOf结果 | 操作 |
|------|----------|------------|-------------|------|
| 1    | "flower" | "flow"     | -1          | 缩短为"flowe" |
| 1    | "flowe"  | "flow"     | -1          | 缩短为"flow" |
| 1    | "flow"   | "flow"     | 0           | 匹配，继续 |
| 2    | "flow"   | "flight"   | -1          | 缩短为"flo" |
| 2    | "flo"    | "flight"   | -1          | 缩短为"fl" |
| 2    | "fl"     | "flight"   | 0           | 匹配，结束 |

### 复杂度分析

- **时间复杂度**：O(S)，但实际性能可能较差，因为 `indexOf` 方法本身有开销
- **空间复杂度**：O(1)

## 解法四：二分查找法

### 算法思路

二分查找法是一种优化思路：
1. 首先找到所有字符串中的最短长度，这是公共前缀的上界
2. 在 [0, minLength] 范围内进行二分查找
3. 对于每个中点长度，检查是否所有字符串都包含这个长度的公共前缀
4. 根据检查结果调整搜索范围

### 代码实现

```java
class Solution {
    public String longestCommonPrefix(String[] strs) {
        int minLength = Integer.MAX_VALUE;
        for(String str : strs){
            minLength = Math.min(str.length(), minLength);
        }
        
        int left = 0;
        int right = minLength;
        int lastPosition = 0;

        while(left <= right){
            int mid = left + (right - left) / 2;
            if(isCommonPrefix(strs, mid)){
                lastPosition = mid;
                left = mid + 1;
            } else {
                right = mid - 1;
            }
        }
        return strs[0].substring(0, lastPosition);
    }

    boolean isCommonPrefix(String[] strs, int len){
        if(len == 0) return true;
        String prefix = strs[0].substring(0, len);
        for(int i = 1; i < strs.length; i++){
            if(!strs[i].startsWith(prefix)){
                return false;
            }
        }
        return true;
    }
}
```

### 执行流程示例

以 `["flower", "flow", "flight"]` 为例，minLength = 4：

| 轮次 | left | right | mid | 检查长度 | 前缀 | 是否公共前缀 | 更新 |
|------|------|-------|-----|----------|------|--------------|------|
| 1    | 0    | 4     | 2   | 2        | "fl" | 是           | left=3, lastPosition=2 |
| 2    | 3    | 4     | 3   | 3        | "flo"| 否           | right=2 |
| 3    | 3    | 2     | -   | -        | -    | -            | 结束 |

### 复杂度分析

- **时间复杂度**：O(S×log(minLen))，其中 S 是所有字符串字符总数
- **空间复杂度**：O(1)

## 解法五：分治法

### 算法思路

分治法采用"分而治之"的策略：
1. 将字符串数组分成两半
2. 递归求解左半部分和右半部分的最长公共前缀
3. 合并两个结果，求出最终的公共前缀
4. 基准情况：当只有一个字符串时，返回该字符串本身

### 代码实现

```java
class Solution {
    public String longestCommonPrefix(String[] strs) {
        int right = strs.length - 1;
        return getPrefix(strs, 0, right);
    }

    String getPrefix(String[] strs, int left, int right){
        if(left == right) return strs[left];
        
        int mid = left + (right - left) / 2;
        String leftPrefix = getPrefix(strs, left, mid);
        String rightPrefix = getPrefix(strs, mid + 1, right);
        
        return getCommonPrefix(leftPrefix, rightPrefix);
    }

    String getCommonPrefix(String str1, String str2){
        int minLength = Math.min(str1.length(), str2.length());
        for(int i = 0; i < minLength; i++){
            if(str1.charAt(i) != str2.charAt(i)){
                return str1.substring(0, i);
            }
        }
        return str1.substring(0, minLength);
    }
}
```

### 执行流程示例

以 `["flower", "flow", "flight"]` 为例：

```
getPrefix(["flower", "flow", "flight"], 0, 2)
├── getPrefix(["flower", "flow"], 0, 1)
│   ├── getPrefix(["flower"], 0, 0) → "flower"
│   ├── getPrefix(["flow"], 1, 1) → "flow"
│   └── getCommonPrefix("flower", "flow") → "flow"
├── getPrefix(["flight"], 2, 2) → "flight"
└── getCommonPrefix("flow", "flight") → "fl"
```

### 复杂度分析

- **时间复杂度**：O(S)，其中 S 是所有字符串中字符的总数
- **空间复杂度**：O(m×log(n))，其中 m 是字符串的平均长度，n 是字符串的数量（递归调用栈）

## 五种解法对比总结

| 解法 | 时间复杂度 | 空间复杂度 | 优点 | 缺点 | 适用场景 |
|------|------------|------------|------|------|----------|
| 垂直扫描 | O(S) | O(1) | 实现简单，提前终止 | 无 | 通用场景 |
| 水平扫描 | O(S) | O(1) | 逻辑清晰，易理解 | 无 | 通用场景 |
| indexOf优化 | O(S) | O(1) | 代码简洁 | indexOf性能开销 | 字符串较短时 |
| 二分查找 | O(S×log(minLen)) | O(1) | 理论上可优化 | 实际可能更慢 | 特殊优化场景 |
| 分治法 | O(S) | O(m×log(n)) | 算法思想经典 | 空间开销大 | 学习分治思想 |

## 推荐方案

对于 LeetCode 14 题，**推荐使用解法一（垂直扫描法）或解法二（水平扫描法）**：

1. **解法一**：当字符串数组中存在很短的字符串时，能够快速终止
2. **解法二**：逻辑更加清晰，代码可读性更好

两种方法的时间复杂度都是最优的 O(S)，空间复杂度都是 O(1)，在实际面试中都是很好的选择。

## 总结

通过分析这五种解法，我们可以看到：
- 同一个问题可以有多种不同的解决思路
- 简单直接的方法往往是最有效的
- 复杂的算法（如二分查找、分治）并不总是更优
- 在实际开发中，应该根据具体场景选择最合适的算法

这种多角度的思考方式对于提升算法能力和解决实际问题都非常有帮助。

