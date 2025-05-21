---
layout: postx
title: "LeetCode 135. Candy 分析"
date: "2025-05-18"
toc: true
excerpt: 本文详细分析了 LeetCode 第 135 题"分糖果"的三种常用解法：两次遍历、两个数组和优先队列。每种解法都提供了详细的思路、代码实现和复杂度分析。
tags: [Algorithm, LeetCode, Array, Greedy, PriorityQueue]
comments: true
author: zempty
---

## LeetCode 135 题目介绍

[LeetCode 135. Candy](https://leetcode.com/problems/candy/) 是一道困难级别的数组问题：

> 有 n 个孩子站成一排。给你一个整数数组 ratings 表示每个孩子的评分。
> 你需要按照以下要求，给这些孩子分发糖果：
> - 每个孩子至少分配到 1 个糖果。
> - 相邻两个孩子评分更高的孩子会获得更多的糖果。
> 请你计算并返回需要准备的 最少糖果数目 。

这个问题看似简单，但需要同时满足两个相邻位置的约束，因此有一定难度。下面将详细分析四种不同的解法。

## 解法一：两次遍历

第一种解法使用两次遍历方式，先从左向右遍历确保右侧评分更高的孩子获得更多糖果，再从右向左遍历确保左侧评分更高的孩子获得更多糖果。

```java
class Solution {
    public int candy(int[] ratings) {
        int n = ratings.length;
        int[] candies = new int[n];
        Arrays.fill(candies,1);
        for(int i = 1; i < n ; i++){
            if(ratings[i] > ratings[i-1]){
                candies[i] = Math.max(candies[i],candies[i-1] + 1);
            }
        }
        for(int j = n - 2; j>=0; j--){
            if(ratings[j] > ratings[j+1]){
                candies[j] = Math.max(candies[j], candies[j+1] + 1);
            }
        }
        int total = 0;
        for(int count : candies){
            total += count;
        }
        return total;
    }
}
```

### 解法一详解

1. 初始化一个长度为 n 的数组 `candies`，每个位置都为 1，表示每个孩子至少分配一个糖果。
2. **第一次遍历**（从左到右）：
   - 对于每个位置 i (i > 0)，如果 `ratings[i] > ratings[i-1]`，即当前孩子评分高于左边的孩子，则当前孩子应该比左边孩子多分配至少一个糖果。
   - 此时，`candies[i] = Math.max(candies[i], candies[i-1] + 1)`，确保满足左边的约束。
3. **第二次遍历**（从右到左）：
   - 对于每个位置 j (j < n-1)，如果 `ratings[j] > ratings[j+1]`，即当前孩子评分高于右边的孩子，则当前孩子应该比右边孩子多分配至少一个糖果。
   - 此时，`candies[j] = Math.max(candies[j], candies[j+1] + 1)`，确保满足右边的约束。
   - 使用 Math.max 是因为第一次遍历可能已经给当前位置分配了更多糖果。
4. 最后统计总糖果数。

时间复杂度: O(n)，两次遍历数组。  
空间复杂度: O(n)，需要一个额外数组存储每个孩子的糖果数。

## 解法二：左右两个数组法

第二种解法使用两个数组分别记录从左到右和从右到左的约束，最后取两者的最大值。

```java
class Solution {
    public int candy(int[] ratings) {
        int n = ratings.length;
        int[] leftToRight = new int[n];
        int[] rightToLeft = new int[n];
        Arrays.fill(leftToRight,1);
        Arrays.fill(rightToLeft,1);
        for(int i = 1; i < n; i++){
            if(ratings[i] > ratings[i-1]){
                leftToRight[i] = leftToRight[i-1] + 1;
            }
        }

        for(int i = n - 2; i >=0; i--){
            if(ratings[i] > ratings[i+1]){
                rightToLeft[i] = rightToLeft[i+1] + 1;
            }
        }

        int total = 0;
        for(int i = 0; i < n; i++){
            total += Math.max(leftToRight[i],rightToLeft[i]);
        }
        return total;
    }
}
```

### 解法二详解

1. 创建两个长度为 n 的数组：
   - `leftToRight`：表示只考虑左侧约束时每个孩子应该获得的糖果数
   - `rightToLeft`：表示只考虑右侧约束时每个孩子应该获得的糖果数
2. 初始化两个数组的每个位置为 1。
3. 从左到右遍历，更新 `leftToRight` 数组：
   - 如果 `ratings[i] > ratings[i-1]`，则 `leftToRight[i] = leftToRight[i-1] + 1`
4. 从右到左遍历，更新 `rightToLeft` 数组：
   - 如果 `ratings[i] > ratings[i+1]`，则 `rightToLeft[i] = rightToLeft[i+1] + 1`
5. 对于每个位置 i，最终分配的糖果数应该是 `max(leftToRight[i], rightToLeft[i])`，以同时满足左右两边的约束。
6. 计算总和并返回。

相比解法一，这种方法逻辑更清晰，但使用了两个数组，空间复杂度为 O(2n)。时间复杂度仍为 O(n)。

## 解法三：优先队列法

第三种解法使用优先队列，按照评分从低到高的顺序处理每个孩子，确保低评分的孩子先被处理。

```java
class Solution {
    public int candy(int[] ratings) {
        int n = ratings.length;
        int[] candies = new int[n];
        Arrays.fill(candies,1);
        PriorityQueue<Integer> queue = new PriorityQueue<>((a,b)-> ratings[a] - ratings[b]);
        for(int i = 0 ; i < n ; i++){
            queue.offer(i);
        }

        for(int i = 0; i < n; i++){
            int j = queue.poll();
            if(j > 0  && ratings[j] > ratings[j-1]){
                candies[j] = Math.max(candies[j], candies[j-1] + 1);
            }
            if(j < n-1 && ratings[j] > ratings[j+1]){
                candies[j] = Math.max(candies[j],candies[j+1] + 1);
            }
        }
        int total = 0;
        for(int count : candies){
            total += count;
        }
        return total;
    }
}
```

### 解法三详解

1. 初始化一个长度为 n 的数组 `candies`，每个位置都为 1。
2. 创建一个优先队列，按照评分从低到高的顺序存储孩子的索引。
3. 将所有孩子的索引加入优先队列。
4. 按照评分从低到高的顺序依次处理每个孩子：
   - 检查当前孩子与左右相邻孩子的评分关系
   - 如果当前孩子评分高于左侧孩子，则 `candies[j] = Math.max(candies[j], candies[j-1] + 1)`
   - 如果当前孩子评分高于右侧孩子，则 `candies[j] = Math.max(candies[j], candies[j+1] + 1)`
5. 计算总糖果数并返回。

这种方法的核心思想是：优先处理评分较低的孩子，因为他们对相邻高评分孩子的糖果数有影响。由于使用了优先队列，时间复杂度为 O(n log n)，空间复杂度为 O(n)。

## 解法四：常数空间一次遍历法

第四种解法最为巧妙，只需要一次遍历且不需要额外数组，采用贪心的思想解决问题。

```java
class Solution {
    public int candy(int[] ratings) {
        int n = ratings.length;
        int total = 1;
        int up = 1;
        int peak = 1;
        int down = 0;
        for(int i = 1; i < n; i++){
            if(ratings[i] > ratings[i-1]){
                up++;
                peak = up;
                down = 0;
                total += up;
            }else if(ratings[i] < ratings[i-1]){
                down++;
                up = 1;
                total += down + (down >= peak ? 1 : 0);
            }else{
                up = 1;
                down = 0;
                peak = 1;
                total +=1;
            }
        }
        return total;
    }
}
```
### 解法四详解

这种方法通过一次遍历和几个辅助变量来计算总糖果数，避免了额外数组的开销。其核心思想是追踪递增和递减序列的长度，并据此更新糖果总数。

变量说明：
- `total`: 已分配的糖果总数。初始化为 1，因为第一个孩子至少有 1 个糖果。
- `up`: 当前连续递增序列的长度。如果 `ratings[i] > ratings[i-1]`，则 `up` 递增。`up` 的值也代表当前孩子在递增序列末端应得的糖果数。
- `down`: 当前连续递减序列的长度。如果 `ratings[i] < ratings[i-1]`，则 `down` 递增。
- `peak`: 最近一个递增序列的峰值（即峰顶孩子获得的糖果数）。当进入递减序列时，`peak` 的值用于确保峰顶孩子的糖果数满足其两边的约束。

#### 算法步骤与示例

我们以 `ratings = [1, 2, 8, 7, 6, 5]` 为例，逐步解释算法流程。
初始状态: `total = 1` (为 `ratings[0]=1` 分配1颗糖果), `up = 1`, `peak = 1`, `down = 0`。
循环从 `i = 1` 开始。

| `i` | `ratings[i-1]` | `ratings[i]` | 条件判断                     | `up` | `peak` | `down` | `total` 更新逻辑                                                                 | `total` | 注释 (隐含的糖果分配思路)                                                                                                                               |
|-----|----------------|--------------|------------------------------|------|--------|--------|----------------------------------------------------------------------------------|---------|-------------------------------------------------------------------------------------------------------------------------------------------------------|
| 0   | -              | 1            | 初始                         | 1    | 1      | 0      | `total = 1` (为 `ratings[0]`)                                                    | 1       | `c[0]=1`                                                                                                                                              |
| 1   | 1              | 2            | `ratings[i] > ratings[i-1]`  | 2    | 2      | 0      | `up=2`, `peak=up=2`, `down=0`. `total += up` (1+2)                               | 3       | `ratings[1]` 在递增序列中，获得 `up=2` 颗糖果。`c[1]=2`. 当前糖果 `[1,2]`                                                                                 |
| 2   | 2              | 8            | `ratings[i] > ratings[i-1]`  | 3    | 3      | 0      | `up=3`, `peak=up=3`, `down=0`. `total += up` (3+3)                               | 6       | `ratings[2]` 在递增序列中，获得 `up=3` 颗糖果。`c[2]=3`. 当前糖果 `[1,2,3]`                                                                                 |
| 3   | 8              | 7            | `ratings[i] < ratings[i-1]`  | 1    | 3      | 1      | `down=1`, `up=1`. `total += down` (6+1). `down < peak` (1<3), 不额外加。           | 7       | `ratings[3]` 在递减序列中，获得1颗。`total`增加1。`c[3]=1`. 当前糖果 `[1,2,3,1]`                                                                        |
| 4   | 7              | 6            | `ratings[i] < ratings[i-1]`  | 1    | 3      | 2      | `down=2`, `up=1`. `total += down` (7+2). `down < peak` (2<3), 不额外加。           | 9       | `ratings[4]` 获得1颗。`ratings[3]`因处于长度为2的下坡，糖果数需调整为2。`total`增加2 (1为`c[4]`, 1为调整`c[3]`)。当前糖果 `[1,2,3,2,1]`                      |
| 5   | 6              | 5            | `ratings[i] < ratings[i-1]`  | 1    | 3      | 3      | `down=3`, `up=1`. `total += down` (9+3). `down >= peak` (3>=3), `total += 1` (12+1). | 13      | `ratings[5]` 获得1颗。`ratings[4]`调整为2, `ratings[3]`调整为3。`total`增加3。因`down>=peak`，峰顶`ratings[2]`糖果+1。当前糖果 `[1,2,4,3,2,1]` |

最终 `total = 13`。
对应的糖果分配为 `[1, 2, 4, 3, 2, 1]`，满足所有条件。

#### 代码逻辑详解

1.  **`if (ratings[i] > ratings[i-1])` (递增情况):**
    *   `up++`: 延长当前递增序列。`up` 代表当前孩子应得的糖果数。
    *   `peak = up`: 更新峰值为当前 `up` 值。
    *   `down = 0`: 重置递减序列计数器。
    *   `total += up`: 将当前孩子应得的 `up` 颗糖果计入总数。

2.  **`else if (ratings[i] < ratings[i-1])` (递减情况):**
    *   `down++`: 延长当前递减序列。
    *   `up = 1`: 递增序列中断，如果后续再次递增，新的 `up` 将从1开始。
    *   `total += down`: 这是关键之一。当遇到第 `down` 个递减元素时：
        *   当前孩子 `ratings[i]` 获得 1 颗糖果。
        *   递减序列中的前 `down-1` 个孩子，它们各自的糖果数需要比其后的孩子多1。`total += down` 实际上是为当前孩子加1颗糖，并为前面 `down-1` 个递减序列中的孩子各补1颗糖，以维持递减关系（例如，使它们的糖果数从 `down-1, down-2, ..., 1` 变为 `down, down-1, ..., 2`，再加上当前孩子的1颗）。
    *   `total += (down >= peak ? 1 : 0)`: 这是关键之二。
        *   `peak` 记录的是上一个递增序列末尾（即山峰）的糖果数。
        *   如果当前的递减序列长度 `down` 大于或等于 `peak`，意味着仅仅按递减序列分配糖果（例如 `peak, down, down-1, ..., 1`）可能会导致山峰处的糖果数不大于其后第一个递减孩子的糖果数（即 `peak` 不大于 `down`）。
        *   为了满足 `ratings[peak_idx] > ratings[peak_idx+1]` => `candies[peak_idx] > candies[peak_idx+1]`，山峰 `peak` 处的糖果数可能需要增加。
        *   每当 `down >= peak` 时，给 `total` 额外加 1。这相当于给山峰位置的孩子增加一颗糖果，以确保它比后续递减序列的第一个孩子糖果多。这个调整会随着 `down` 的增长持续进行，只要 `down >= peak`。

3.  **`else` (即 `ratings[i] == ratings[i-1]`, 相等情况):**
    *   `up = 1`, `down = 0`, `peak = 1`: 重置所有计数器。当前孩子获得1颗糖果，并形成一个新的潜在峰值1。
    *   `total += 1`: 将当前孩子的1颗糖果计入总数。

这种方法通过巧妙地维护 `up`, `down`, `peak` 状态，并在一次遍历中正确累计总糖果数，尤其是处理递减序列对前面山峰的影响，从而达到 O(1) 空间复杂度的优化。

时间复杂度: O(n)，只需一次遍历。
空间复杂度: O(1)，只使用几个变量，不需要额外数组。

## 总结

1. **解法一（两次遍历）**：思路清晰，实现简单，时间 O(n)，空间 O(n)。
2. **解法二（两个数组）**：与解法一类似，但逻辑更清晰，时间 O(n)，空间 O(2n)。
3. **解法三（优先队列）**：利用优先队列按评分从低到高处理，时间 O(n log n)，空间 O(n)。
4. **解法四（常数空间一次遍历）**：最优解，时间 O(n)，空间 O(1)，但理解难度较高。

在大多数情况下，解法一和解法二足够高效且易于理解。解法四虽然在空间复杂度上最优，但代码不够直观，更难维护。在实际应用中，应根据具体需求选择合适的解法。
