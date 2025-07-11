---
layout: post
title: "LeetCode 45 跳跃游戏 II 三种解法分析"
date: "2025-05-05" # Set by script
category: "算法题解"
toc: true 
excerpt: "详细分析 LeetCode 45 跳跃游戏 II 的三种不同解法：贪心（正向扫描）、贪心（反向扫描）和动态规划，比较它们的时间和空间复杂度。" # Added excerpt
tags: [Algorithm, java, backend] # Added relevant tags
comments: true
author: zempty
---

本文将详细探讨 LeetCode 第 45 题 "跳跃游戏 II" 的三种常见解法。问题的目标是给定一个非负整数数组 `nums` ，你最初位于数组的第一个位置，数组中的每个元素代表你在该位置可以跳跃的最大长度。目标是用最少的跳跃次数到达数组的最后一个位置。

## 解法 1: 贪心 (Greedy - Forward Scan)

这种方法在每一步都试图达到当前跳跃范围内所能覆盖的最远距离。

```java
import java.util.Arrays; 

class Solution {
    public int jump(int[] nums) {
       int n = nums.length;
       if(n <= 1) return 0; // Base case: Already at the end or empty array
       int jumps = 0;        // Number of jumps taken so far
       int maxReach = 0;     // The farthest index reachable with the current number of jumps
       int currentMaxReach = 0; // The farthest index reachable from any position within the current jump's range
       
       // Iterate through the array, stopping one element before the end
       // because we only need to *reach* the end, not jump from it.
       for(int i = 0; i < n - 1; i++){
           // Update the farthest position we can reach *from* the current position i
           currentMaxReach = Math.max(currentMaxReach, i + nums[i]);
           
           // If we have reached the boundary of the previous jump's reach...
           if(i == maxReach){
               jumps++; // We must take another jump
               maxReach = currentMaxReach; // Update the boundary for the *next* jump
               
               // Optimization: If the new boundary reaches or exceeds the end, we're done.
               if(maxReach >= n - 1) break;
           }
       }
       return jumps;
    }
}
```

**分析 (Analysis):**

1.  **核心思想 (Core Idea):** 贪心策略。在当前跳跃能到达的所有位置中，选择一个可以使 *下一次* 跳跃到达最远的位置。我们维护当前跳跃能到达的边界 `maxReach` 和从当前范围内所有位置出发能到达的最远位置 `currentMaxReach`。
2.  **变量解释 (Variable Explanation):**
    *   `jumps`: 已进行的跳跃次数。
    *   `maxReach`: 使用 `jumps` 次跳跃可以到达的最远索引边界。
    *   `currentMaxReach`: 从索引 0 到 `maxReach` 这个范围内 *任何* 位置出发，下一步能到达的最远索引。
3.  **流程 (Flow):**
    *   遍历数组，在索引 `i` 处更新 `currentMaxReach`。
    *   当 `i` 到达当前跳跃的边界 `maxReach` 时，说明必须进行下一次跳跃。
    *   增加 `jumps`，并将 `maxReach` 更新为 `currentMaxReach`，作为下一次跳跃的新边界。
    *   如果新的 `maxReach` 已经覆盖了终点，则提前结束。
4.  **效率 (Efficiency):**
    *   **时间复杂度:** O(n) - 最多遍历数组一次。
    *   **空间复杂度:** O(1) - 只使用了常数额外空间。

## 解法 2: 贪心 (Greedy - Backward Scan)

这种方法从终点开始反向查找，每次找到能跳到当前位置的最左边的索引。

```java
import java.util.Arrays;

class Solution {
    public int jump(int[] nums) {
        int position = nums.length - 1; // Start from the target (last index)
        int jumps = 0;
        
        // Work backwards until we reach the start (index 0)
        while(position > 0){
            // Find the leftmost position 'i' that can reach the current 'position'
            for(int i = 0; i < position; i++){
                if(i + nums[i] >= position){
                    jumps++;         // Increment jump count
                    position = i;    // Move our target to this new position 'i'
                    break;           // Found the leftmost, move to the next outer loop iteration
                }
            }
        }
        return jumps;
    }
}
```

**分析 (Analysis):**

1.  **核心思想 (Core Idea):** 反向贪心。从终点 `n-1` 开始，找到能一步跳到当前 `position` 的所有位置中，最靠前（索引最小）的那个位置 `i`。将 `i` 作为新的 `position`，重复此过程直到 `position` 变为 0。
2.  **流程 (Flow):**
    *   `position` 初始化为 `n-1`。
    *   当 `position > 0` 时循环：
        *   从 `i = 0` 遍历到 `position - 1`。
        *   找到第一个满足 `i + nums[i] >= position` 的 `i`。
        *   增加 `jumps`，将 `position` 更新为 `i`，然后 `break` 内层循环，开始寻找能跳到这个新 `position` 的位置。
3.  **效率 (Efficiency):**
    *   **时间复杂度:** O(n^2) - 最坏情况下（例如 `[1, 1, ..., 1]`），每次 `while` 循环都需要内层 `for` 循环扫描接近 `position` 的长度。
    *   **空间复杂度:** O(1) - 只使用了常数额外空间。

## 解法 3: 动态规划 (Dynamic Programming)

使用动态规划数组 `dp`，其中 `dp[i]` 表示到达索引 `i` 所需的最少跳跃次数。

```java
import java.util.Arrays;

class Solution {
    public int jump(int[] nums) {
        int n = nums.length;
        int[] dp = new int[n]; // dp[i] stores the minimum jumps to reach index i
        Arrays.fill(dp, Integer.MAX_VALUE); // Initialize with infinity 
        
        dp[0] = 0; // 0 jumps to reach the starting index
        
        for(int i = 0; i < n ; i++){
            if(dp[i] == Integer.MAX_VALUE) continue; // Optimization: skip unreachable indices
            
            // Calculate the farthest index reachable from i
            int maxReach = Math.min(i + nums[i], n - 1); 
            
            // Update the dp values for all reachable indices j from i
            for(int j = i + 1; j <= maxReach; j++){ 
                 dp[j] = Math.min(dp[j], dp[i] + 1); 
            }
        }
        
        // The result is the minimum jumps to reach the last index
        return dp[n-1];  
    }
}
```

**分析 (Analysis):**

1.  **核心思想 (Core Idea):** `dp[i]` 定义为到达索引 `i` 的最小跳跃数。通过迭代计算 `dp` 数组。
2.  **状态转移 (State Transition):** 对于每个位置 `i`，如果它是可达的 (`dp[i]` 不是初始的最大值)，它可以更新从它能跳到的所有位置 `j` (`i < j <= i + nums[i]`) 的 `dp` 值。状态转移方程为：`dp[j] = min(dp[j], dp[i] + 1)`。
3.  **流程 (Flow):**
    *   初始化 `dp` 数组，`dp[0] = 0`，其余为极大值。
    *   遍历 `i` 从 0 到 `n-1`。
    *   对于每个 `i`，确定其能到达的范围 `[i+1, min(i + nums[i], n-1)]`。
    *   对于该范围内的每个 `j`，用 `dp[i] + 1` 更新 `dp[j]` 的最小值。
    *   最终答案为 `dp[n-1]`。
4.  **效率 (Efficiency):**
    *   **时间复杂度:** O(n^2) - 外层循环 `n` 次，内层循环的执行次数总和在最坏情况下可能达到 O(n^2)（例如 `nums[i]` 很大或 `[1, 1, ..., 1]`）。
    *   **空间复杂度:** O(n) - 需要 `dp` 数组存储中间结果。

## 总结与比较 (Summary & Comparison)

| 解法        | 方法                  | 时间复杂度 | 空间复杂度 | 优点                     | 缺点                 |
| :---------- | :-------------------- | :--------- | :--------- | :----------------------- | :------------------- |
| **解法 1**  | Greedy (Forward Scan) | **O(n)**   | **O(1)**   | 最优效率，代码简洁       | 逻辑可能稍难直接想到   |
| **解法 2**  | Greedy (Backward Scan)| O(n^2)     | O(1)       | 思路相对直观             | 效率较低             |
| **解法 3**  | Dynamic Programming   | O(n^2)     | O(n)       | DP 标准思路，易于理解    | 效率较低，空间占用多 |

**结论 (Conclusion):**

对于 LeetCode 45 跳跃游戏 II 问题，**解法 1 (贪心 - 正向扫描)** 是最优解，具有线性的时间复杂度和常数的空间复杂度。虽然解法 2 和 3 也能解决问题，但它们的效率相对较低。在面试或实际应用中，应首选解法 1。

## LeetCode 45 与 LeetCode 55 的比较

LeetCode 45 (Jump Game II) 和 LeetCode 55 (Jump Game) 是两道经典的数组跳跃问题，它们有许多相似之处，但也存在关键差异。

### 相同点

1. **问题背景**：两题都基于相同的跳跃游戏设定 - 数组中的每个元素表示从该位置可以跳跃的最大长度。

2. **目标位置**：两题都关注能否到达或如何到达数组的最后一个位置。

3. **解题思路**：两题都可以使用贪心算法解决，且贪心策略是最优解法。

4. **数组特性**：两题的输入都是非负整数数组。

5. **可行性问题**：两题的核心都是关于路径可行性的分析。

### 不同点

1. **问题目标**：
   - **LeetCode 45**：求到达最后位置的**最少跳跃次数**（优化问题）
   - **LeetCode 55**：判断是否**能够**到达最后位置（判定问题）

2. **问题假设**：
   - **LeetCode 45**：题目保证总是可以到达最后位置
   - **LeetCode 55**：需要判断是否可以到达最后位置

3. **解题难度**：
   - **LeetCode 45**：相对更复杂，需要计算最优路径
   - **LeetCode 55**：相对简单，只需判断可行性

4. **算法实现**：
   - **LeetCode 45**：需要记录跳跃次数，通常使用贪心算法的"最远可达"策略
   - **LeetCode 55**：只需维护一个"最远可达"变量，判断是否能覆盖最后位置

5. **时间复杂度**：
   - **LeetCode 45**：最优解为 O(n)，但需要更精细的实现
   - **LeetCode 55**：同样是 O(n)，但实现通常更简单直接

### 解题策略对比

**LeetCode 55 的贪心策略**：
- 维护一个变量 `maxReach`，表示当前能到达的最远位置
- 遍历数组，不断更新 `maxReach = max(maxReach, i + nums[i])`
- 如果 `maxReach` 能覆盖最后位置，返回 `true`；否则返回 `false`

**LeetCode 45 的贪心策略**：
- 维护当前跳跃的边界 `end` 和下一次跳跃可达的最远位置 `maxReach`
- 当到达当前跳跃边界时，必须进行下一次跳跃，跳跃次数加一
- 最终返回跳跃次数

### 总结

虽然这两个问题看似相似，但它们的目标不同：LeetCode 55 关注"能否到达"，而 LeetCode 45 关注"最少需要多少步到达"。这种差异导致了解题思路和实现细节的不同。理解这两个问题的联系和区别，有助于掌握贪心算法在路径规划问题中的应用。
