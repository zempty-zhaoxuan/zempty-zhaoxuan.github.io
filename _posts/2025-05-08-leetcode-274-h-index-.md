---
layout: post
title: "LeetCode 274 H-Index 详解与多种解法分析"
date: "2025-05-08"
toc: true
excerpt: "详细解析LeetCode 274 H-Index问题，包括问题理解、三种解法（排序法、计数法和二分查找）及其执行流程分析与优劣比较"
tags: [Algorithm, DataStructure,排序,计数法,二分查找]
comments: true
author: zempty
---

## 问题介绍

LeetCode 274 题 H-Index 是一道关于评价科研人员学术影响力的算法题。

### 题目描述

给你一个整数数组 `citations`，其中 `citations[i]` 表示研究者的第 i 篇论文被引用的次数。计算并返回该研究者的 h 指数。

h 指数的定义：h 代表"高引用次数"（high citations），一名科研人员的 h 指数是指他（她）的 （n 篇论文中）总共有 h 篇论文分别被引用了至少 h 次。且其余的 n - h 篇论文每篇被引用次数 不超过 h 次。

例如：某人的 h 指数是 20，这表示他已发表的论文中，每篇被引用了至少 20 次的论文总共有 20 篇。

### 题目示例

```
输入：citations = [3,0,6,1,5]
输出：3
解释：给定数组表示研究者总共有 5 篇论文，每篇论文相应的被引用了 3, 0, 6, 1, 5 次。
     由于研究者有 3 篇论文每篇 至少 被引用了 3 次，其余两篇论文每篇被引用 不多于 3 次，所以她的 h 指数是 3。
```

## 理解 H 指数

H 指数的关键概念是找到一个数字 h，使得：

- 研究者有**至少** h 篇论文，每篇被引用**至少** h 次
- 其余论文的引用次数**均小于** h

这个定义初看有些晦涩，我们可以通过排序的视角来重新理解：

1. 如果将论文按引用次数**降序**排列
2. H 指数就是满足 `citations[i] ≥ i+1` 的最大下标 i+1
3. （i+1 表示论文数量，citations[i]表示引用次数）

## 解法一：排序法

### 思路

1. 将引用数组**降序**排列
2. 从前向后遍历，找到最后一个满足 `citations[i] > i` 的位置 i
3. 此时 h = i + 1

### 代码实现

```java
class Solution {
    public int hIndex(int[] citations) {
       int n = citations.length;
       Arrays.sort(citations);
       int h = 0;
       // 将数组反转，实现降序排列
       for(int i = 0 ; i < n / 2 ; i++){
        int temp = citations[i];
        citations[i] = citations[n - i - 1];
        citations[n-i-1] = temp;
       }
       for(int i = 0; i < citations.length; i++){
        if(citations[i] > i){
            h = i + 1;
        }else{
            break;
        }
       }
       return h;
    }
}
```

### 执行过程演示

以输入 `[3,0,6,1,5]` 为例：

| 步骤 | 操作                           | 结果        |
| ---- | ------------------------------ | ----------- |
| 1    | 升序排序                       | [0,1,3,5,6] |
| 2    | 反转为降序                     | [6,5,3,1,0] |
| 3    | i=0: citations[0]=6 > 0, h=1   | h=1         |
| 4    | i=1: citations[1]=5 > 1, h=2   | h=2         |
| 5    | i=2: citations[2]=3 > 2, h=3   | h=3         |
| 6    | i=3: citations[3]=1 ≤ 3, break | h=3         |
| 7    | 返回 h                         | 3           |

### 时间复杂度和空间复杂度

- 时间复杂度：O(n log n)，主要是排序操作
- 空间复杂度：O(1)，仅使用常数级别的额外空间

## 解法二：计数法

### 思路

1. 创建大小为 n+1 的计数数组 count，其中 count[i] 表示引用次数为 i 的论文数量
2. 对于引用次数大于 n 的论文，将其计入 count[n]
3. 从后向前遍历计数数组，累计论文数量 paper
4. 当论文数量 paper ≥ 当前引用次数 i 时，返回 i 作为 h 指数

### 代码实现

```java
class Solution {
    public int hIndex(int[] citations) {
       int n = citations.length;
       int[] count = new int[n+1];
       for(int citation : citations){
        count[citation > n ? n : citation]++;
       }
       int paper = 0;
       for(int i = n ; i >= 0; i--){
        paper += count[i];
        if(paper >= i){
            return i;
        }
       }
       return 0;
    }
}
```

### 执行过程演示

以输入 `[3,0,6,1,5]` 为例：

| 步骤 | 操作                      | 结果                       |
| ---- | ------------------------- | -------------------------- |
| 1    | 创建计数数组 count[0...5] | [0,0,0,0,0,0]              |
| 2    | 处理 citation=3           | count[3]++ → [0,0,0,1,0,0] |
| 3    | 处理 citation=0           | count[0]++ → [1,0,0,1,0,0] |
| 4    | 处理 citation=6           | count[5]++ → [1,0,0,1,0,1] |
| 5    | 处理 citation=1           | count[1]++ → [1,1,0,1,0,1] |
| 6    | 处理 citation=5           | count[5]++ → [1,1,0,1,0,2] |
| 7    | i=5: paper=2, paper<5     | paper=2                    |
| 8    | i=4: paper=2, paper<4     | paper=2                    |
| 9    | i=3: paper=3, paper≥3     | 返回 3                     |

### 时间复杂度和空间复杂度

- 时间复杂度：O(n)，只需遍历一次数组
- 空间复杂度：O(n)，需要额外的计数数组

## 解法三：二分查找

### 思路

1. H 指数的范围是[0, n]，可以使用二分查找
2. 对于每个可能的 h 值，检查是否有至少 h 篇论文的引用次数 ≥ h
3. 如果满足条件，说明 h 可能是 H 指数，继续向右找可能更大的值
4. 否则，向左查找更小的值

### 代码实现

```java
class Solution {
    public int hIndex(int[] citations) {
       int n = citations.length;
       int left = 0;
       int right = n;
       int count = 0;
       int hIndexCandidate = 0;
       while(left <= right){
        int mid = (left + right) >> 1;
        count = 0;
        for(int citation : citations){
            if(citation >= mid){
                count++;
            }
        }
        if(count >= mid){
            hIndexCandidate = mid;
            left = mid + 1;
        }else{
            right = mid - 1;
        }
       }
       return hIndexCandidate;
    }
}
```

### 执行过程演示

以输入 `[3,0,6,1,5]` 为例：

| 步骤 | 操作            | 中间值   | 统计               | 判断      | 结果                      |
| ---- | --------------- | -------- | ------------------ | --------- | ------------------------- |
| 1    | left=0, right=5 | mid=2    | count=3（3,6,5≥2） | count≥mid | hIndexCandidate=2, left=3 |
| 2    | left=3, right=5 | mid=4    | count=2（6,5≥4）   | count<mid | right=3                   |
| 3    | left=3, right=3 | mid=3    | count=3（3,6,5≥3） | count≥mid | hIndexCandidate=3, left=4 |
| 4    | left=4, right=3 | 循环结束 | -                  | -         | 返回 3                    |

### 时间复杂度和空间复杂度

- 时间复杂度：O(n log n)，二分查找需要 log n 次迭代，每次迭代需要 O(n) 的时间计数
- 空间复杂度：O(1)，仅使用常数级别的额外空间

### 算法解析

关于二分查找解法中的几个关键点解析：

1. **为什么定义 right = n？**

   - H 指数的取值范围是[0, n]，其中 n 是论文总数
   - H 指数最小可能是 0（没有论文被引用），最大可能是 n（所有 n 篇论文都至少被引用 n 次）
   - 因此，初始的搜索范围应该是[0, n]，所以 right 初始值设为 n

2. **循环条件为什么是 left <= right，left < right 不行吗？**

   - 使用`left <= right`保证我们能检查所有可能的值，包括边界情况
   - 如果改用`left < right`，当 left 和 right 指向同一个值时会退出循环，可能错过正确答案
   - 在二分查找中，当区间缩小到只有一个元素时，仍需检查该元素是否满足条件，所以需要`<=`

3. **关于 hIndexCandidate 的理解**
   - 在这个问题中，mid 值直接代表可能的 H 指数值，而不是数组索引
   - 我们检查的是"有多少论文的引用次数 >= mid"，如果这个数量 >= mid，则 mid 可能是 H 指数
   - 所以，最终返回的 hIndexCandidate 就是 H 指数，不需要加 1
   - 这与排序法中返回 h = i + 1 不同，因为排序法中 i 是数组索引，而二分法中 mid 直接是候选值

举例说明：

- 对于输入[3,0,6,1,5]，n = 5
- 搜索范围是[0, 5]
- 当 mid = 3 时，检查有多少论文引用次数 >= 3，发现有 3 篇（3,6,5）
- 因为有 3 篇论文引用次数 >= 3，符合 H 指数定义，所以 3 是一个候选值
- 继续查找更大的可能值，但最终会发现没有更大的值满足条件
- 所以 hIndexCandidate = 3 就是最终的 H 指数

## 三种解法的比较

| 解法     | 时间复杂度 | 空间复杂度 | 优点                   | 缺点                     |
| -------- | ---------- | ---------- | ---------------------- | ------------------------ |
| 排序法   | O(n log n) | O(1)       | 实现简单直观，易于理解 | 排序耗时，对原数组有修改 |
| 计数法   | O(n)       | O(n)       | 时间复杂度最优         | 需要额外空间，理解稍复杂 |
| 二分查找 | O(n log n) | O(1)       | 不修改原数组，思路巧妙 | 实现相对复杂             |

## 总结

1. **排序法**是最直观的解法，通过降序排列后检查每个位置是否满足条件。
2. **计数法**利用了 H 指数的特性，通过计数避免了排序，达到了线性时间复杂度，是三种方法中理论上最快的。

3. **二分查找**法基于二分思想寻找可能的 H 指数，不需要修改原数组，但需要在每次迭代中重新统计满足条件的论文数量。

对于本题，当数据规模较小时，三种方法的实际效率差异不大。随着数据规模增大，计数法的优势会更加明显。但如果引用次数分布范围很广（远大于论文数量 n），排序法或二分查找法可能更合适。
