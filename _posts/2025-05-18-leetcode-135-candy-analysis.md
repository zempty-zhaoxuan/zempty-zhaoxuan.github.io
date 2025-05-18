---
layout: post
title: "LeetCode 135 分发糖果问题的四种解法分析"
date: "2025-05-18"
toc: true
excerpt: "详细分析 LeetCode 135 分发糖果问题的四种不同实现方法，包括两次遍历法、两个数组法、优先队列法和常数空间一次遍历法，并解释每种解法的算法思想和时间复杂度"
tags: [Algorithm, Java, leetcode]
comments: true
author: zempty
---

## LeetCode 135 题目介绍

[LeetCode 135. Candy](https://leetcode.com/problems/candy/) 是一道困难级别的数组问题：

> 有 n 个孩子站成一排。给你一个整数数组 ratings 表示每个孩子的评分。
>
> 你需要按照以下要求，给这些孩子分发糖果：
>
> - 每个孩子至少分配到 1 个糖果。
> - 相邻两个孩子评分更高的孩子会获得更多的糖果。
>
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

这种方法比较复杂，需要跟踪几个变量：

- `up`：当前递增序列的长度
- `peak`：当前山峰（递增序列之后的最高点）的值
- `down`：当前递减序列的长度
- `total`：总糖果数

我们通过具体例子来说明这种方法如何工作：

#### 场景一：ratings[i] > ratings[i-1]（递增情况）

例如：ratings = [1, 2, 3, 4]

- i=0：初始状态，total=1, up=1, peak=1, down=0
- i=1：2>1，递增，up=2, peak=2, down=0, total+=2，此时 total=3
- i=2：3>2，递增，up=3, peak=3, down=0, total+=3，此时 total=6
- i=3：4>3，递增，up=4, peak=4, down=0, total+=4，此时 total=10

在递增情况下，每个孩子都比前一个多获得一个糖果。

#### 场景二：ratings[i] = ratings[i-1]（相等情况）

例如：ratings = [2, 2]

- i=0：初始状态，total=1, up=1, peak=1, down=0
- i=1：2=2，相等，up=1, peak=1, down=0, total+=1，此时 total=2

在相等情况下，当前孩子重置为 1 个糖果。

#### 场景三：ratings[i] < ratings[i-1]（递减情况）

例如：ratings = [5, 4, 3, 2, 1]

- i=0：初始状态，total=1, up=1, peak=1, down=0
- i=1：4<5，递减，down=1, up=1, total+=1+(1>=1?1:0)=2，此时 total=3
- i=2：3<4，递减，down=2, up=1, total+=2+(2>=1?1:0)=3，此时 total=6
- i=3：2<3，递减，down=3, up=1, total+=3+(3>=1?1:0)=4，此时 total=10
- i=4：1<2，递减，down=4, up=1, total+=4+(4>=1?1:0)=5，此时 total=15

对于递减情况，这里关键要理解 `total += down + (down >= peak ? 1 : 0)` 这部分逻辑：

**为什么需要 down >= peak 时加 1？**

当递减序列长度大于等于之前山峰位置的值时，需要给山峰位置额外加一个糖果。这是因为：

假设有一个序列 [3, 5, 4, 3, 2, 1]，按照要求：

- 初始每人一颗糖果
- 3 → 1 颗
- 5 > 3，所以 5 → 2 颗
- 4 < 5 但 > 3，满足左右约束，4 → 1 颗
- 3 < 4 但和首位 3 相等，3 → 1 颗
- 2 < 3，2 → 1 颗
- 1 < 2，1 → 1 颗

但此时出现问题：3 < 4 但 3 只有 1 颗糖果，不满足约束。所以实际分配应为：

- 3 → 1 颗
- 5 > 3，5 → 2 颗
- 4 < 5，4 → 1 颗
- 3 < 4，3 → 2 颗
- 2 < 3，2 → 3 颗
- 1 < 2，1 → 4 颗

在解法四中，当我们到达递减序列 [5, 4, 3, 2, 1] 时：

- 当 down=1 时（处理 4）：peak=2（即 5 处的糖果数），此时 down < peak，不需要额外+1
- 当 down=2 时（处理 3）：down >= peak，需要给山峰位置（5）额外加 1 颗糖果
- 后续每增加一个递减元素，都需要这样额外+1

这种巧妙的处理确保了在长下坡时，山峰位置的糖果数足够大，能够满足两边的约束。

时间复杂度: O(n)，只需一次遍历。  
空间复杂度: O(1)，只使用几个变量，不需要额外数组。

## 总结

1. **解法一（两次遍历）**：思路清晰，实现简单，时间 O(n)，空间 O(n)。
2. **解法二（两个数组）**：与解法一类似，但逻辑更清晰，时间 O(n)，空间 O(2n)。
3. **解法三（优先队列）**：利用优先队列按评分从低到高处理，时间 O(n log n)，空间 O(n)。
4. **解法四（常数空间一次遍历）**：最优解，时间 O(n)，空间 O(1)，但理解难度较高。

在大多数情况下，解法一和解法二足够高效且易于理解。解法四虽然在空间复杂度上最优，但代码不够直观，更难维护。在实际应用中，应根据具体需求选择合适的解法。
