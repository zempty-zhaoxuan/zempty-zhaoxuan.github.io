---
layout: post
title: "LeetCode 238: Product of Array Except Self - 三种解法详细分析"
date: "2025-05-13" # Date set by the script
toc: true
excerpt: "详细分析了 LeetCode 238 'Product of Array Except Self' 问题的三种解法，包括暴力法、左右乘积列表法以及空间优化法，并对比了它们的时间和空间复杂度。"
tags: [Algorithm, Java, DataStructure, LeetCode]
comments: true
author: zempty
---

## 引言

大家好，今天我们来详细分析 LeetCode 上的一道经典数组问题：[LeetCode 238. Product of Array Except Self](https://leetcode.com/problems/product-of-array-except-self/)。

**问题描述：**

给定一个整数数组 `nums`，返回一个数组 `ans`，使得 `ans[i]` 等于数组 `nums` 中除 `nums[i]` 之外所有元素的乘积。题目保证 `nums` 中任何前缀或后缀的乘积都可以在 32 位整数内。要求算法时间复杂度为 O(n)，并且不能使用除法操作。

**进阶要求：** 能否在 O(1) 的额外空间复杂度内解决这个问题？（输出数组不被视为额外空间）。

*一个小说明：用户最初的请求中提到了 LeetCode 283 题，但所提供的三种解法代码实际上是针对 LeetCode 238 题 "Product of Array Except Self" 的。因此，本文将聚焦于 LeetCode 238 题以及这三种解法的分析。*

本文将详细介绍并分析解决这个问题的三种方法：暴力解法、使用左右乘积列表的解法，以及空间优化解法。

## 解法一：暴力法 (Brute Force)

最直观的想法是，对于输出数组 `ans` 中的每一个位置 `i`，我们都遍历一次原数组 `nums`，将所有 `j != i` 的元素 `nums[j]` 相乘，得到的结果存入 `ans[i]`。

### 思路

1. 初始化一个长度与 `nums` 相同的答案数组 `ans`。
2. 对于 `ans` 中的每个索引 `i`（从 0 到 `n-1`）：
   a. 初始化一个临时变量 `product = 1`。
   b. 遍历 `nums` 数组中的每个索引 `j`（从 0 到 `n-1`）。
   c. 如果 `i == j`，则跳过当前元素。
   d. 否则，将 `nums[j]` 乘到 `product` 上。
   e. 将最终的 `product` 赋值给 `ans[i]`。
3. 返回 `ans`。

### 代码实现

```java
class Solution {
    public int[] productExceptSelf(int[] nums) {
        int n = nums.length;
        int[] ans = new int[n];
        ans[0] = 1; // User's provided code includes this line
        for(int i = 0; i < n ; i++){
            int before = 1; // 'before' accumulates the product
            for(int j = 0; j < n; j++){
                if(i == j) continue;
                before *= nums[j];
            }
            ans[i] = before; // This assignment will correctly calculate ans[i] for all i,
                             // including overwriting ans[0] when i=0.
        }
        return ans;
    }
}
```
*(注意: The line `ans[0] = 1;` in the provided code for Solution 1 is redundant. The subsequent loop correctly calculates `ans[i]` for all `i`, including `ans[0]` when `i=0`, thereby overwriting this initial assignment. The variable `before` is used to accumulate the product.)*

### 复杂度分析

- **时间复杂度：** O(N^2)。外层循环遍历 `ans` 数组（N 次），内层循环为了计算每个 `ans[i]` 也需要遍历 `nums` 数组（N 次）。
- **空间复杂度：** O(1)（不包括输出数组 `ans`）。如果算上输出数组，则为 O(N)。

这种方法简单易懂，但由于时间复杂度较高，在 `N` 较大时可能会超时，并且不满足题目 O(N) 的时间要求。

## 解法二：左右乘积列表 (Left and Right Product Arrays)

为了在 O(N) 时间内解决问题，并且不使用除法，我们可以预先计算每个元素左边所有元素的乘积和右边所有元素的乘积。

### 思路

1. 创建两个额外的数组：`left` 和 `right` (与用户代码一致)，长度均为 `N`。
2. `left[i]` 存储 `nums[i]` 左侧所有元素的乘积。
   - `left[0]` 初始化为 1（因为索引 0 左边没有元素）。
   - 对于 `i > 0`，`left[i] = left[i-1] * nums[i-1]`。
3. `right[i]` 存储 `nums[i]` 右侧所有元素的乘积。
   - `right[N-1]` 初始化为 1（因为索引 `N-1` 右边没有元素）。
   - 对于 `i < N-1`（从 `N-2` 向下到 0），`right[i] = right[i+1] * nums[i+1]`。
4. 计算最终结果：对于每个索引 `i`，`ans[i] = left[i] * right[i]`。

### 代码实现

```java
class Solution {
    public int[] productExceptSelf(int[] nums) {
        int n = nums.length;
        int[] left = new int[n]; // Stores product of elements to the left
        int[] right = new int[n]; // Stores product of elements to the right
        int[] ans = new int[n];

        // Calculate left products
        left[0] = 1;
        for(int i = 1; i < n; i++){
            left[i] = left[i-1] * nums[i-1];
        }

        // Calculate right products
        right[n-1] = 1;
        for(int j = n - 2; j >=0; j--){
            right[j] = right[j+1] * nums[j+1]; // Correction: user's original code had nums[i+1], corrected to nums[j+1]
        }

        // Calculate the final answer
        for(int k = 0 ; k < n ; k++ ){
            ans[k] = left[k] * right[k];
        }
        return ans;
    }
}
```
*(代码更正说明: 在用户提供的原始解法2中，计算 `right` 数组的循环内 `right[j] = right[j+1] * nums[i+1];` 存在一个笔误，应为 `right[j] = right[j+1] * nums[j+1];`。代码块中已展示修正后的版本，下面的示例和分析将基于此正确逻辑。)*


### 步骤详解与示例

假设 `nums = [1, 2, 3, 4]`，并使用修正后的逻辑：

1.  **初始化：**
    `left = [0, 0, 0, 0]`
    `right = [0, 0, 0, 0]`
    `ans = [0, 0, 0, 0]`

2.  **计算 `left` 数组：**
    - `left[0] = 1`
      `left = [1, 0, 0, 0]`
    - `i = 1`: `left[1] = left[0] * nums[0] = 1 * 1 = 1`
      `left = [1, 1, 0, 0]`
    - `i = 2`: `left[2] = left[1] * nums[1] = 1 * 2 = 2`
      `left = [1, 1, 2, 0]`
    - `i = 3`: `left[3] = left[2] * nums[2] = 2 * 3 = 6`
      `left = [1, 1, 2, 6]`

3.  **计算 `right` 数组 (修正后逻辑 `nums[j+1]`):**
    - `right[3] = 1`
      `right = [0, 0, 0, 1]`
    - `j = 2`: `right[2] = right[3] * nums[3] = 1 * 4 = 4`
      `right = [0, 0, 4, 1]`
    - `j = 1`: `right[1] = right[2] * nums[2] = 4 * 3 = 12`
      `right = [0, 12, 4, 1]`
    - `j = 0`: `right[0] = right[1] * nums[1] = 12 * 2 = 24`
      `right = [24, 12, 4, 1]`

4.  **计算 `ans`：**
    - `k = 0`: `ans[0] = left[0] * right[0] = 1 * 24 = 24`
    - `k = 1`: `ans[1] = left[1] * right[1] = 1 * 12 = 12`
    - `k = 2`: `ans[2] = left[2] * right[2] = 2 * 4 = 8`
    - `k = 3`: `ans[3] = left[3] * right[3] = 6 * 1 = 6`
    最终 `ans = [24, 12, 8, 6]`。

下面用表格展示这个过程：

| `idx` | `nums[idx]` | `left[idx]` (L) | `right[idx]` (R) | `ans[idx] = L * R` |
|-------|-------------|-----------------|------------------|--------------------|
| 0     | 1           | 1               | 24               | 24                 |
| 1     | 2           | 1               | 12               | 12                 |
| 2     | 3           | 2               | 4                | 8                  |
| 3     | 4           | 6               | 1                | 6                  |

### 复杂度分析

- **时间复杂度：** O(N)。计算 `left` 数组需要 O(N)，计算 `right` 数组需要 O(N)，最后计算 `ans` 也需要 O(N)。总共是 O(N) + O(N) + O(N) = O(3N) = O(N)。
- **空间复杂度：** O(N)。需要额外的 `left` 和 `right` 数组，每个大小为 N。

这个方法满足了 O(N) 的时间复杂度要求，但使用了 O(N) 的额外空间。

## 解法三：空间优化 (Optimized Space Complexity)

我们可以对解法二进行空间优化，以满足 O(1) 额外空间复杂度的进阶要求（输出数组不计入额外空间）。

### 思路

这个方法的核心思想是复用输出数组 `ans` 来存储中间计算结果。

1.  **第一遍遍历 (计算左侧乘积)：**
    - 初始化 `ans[0] = 1`。
    - 从左到右遍历数组（从索引 1 开始），`ans[i]` 存储 `nums[i]` 左侧所有元素的乘积。即 `ans[i] = ans[i-1] * nums[i-1]`。
    - 完成后，`ans` 数组实际上存储了之前解法中的 `left` 数组（左侧乘积）。

2.  **第二遍遍历 (计算右侧乘积并合并)：**
    - 初始化一个变量 `right = 1` (与用户代码一致)，用于记录当前元素右侧所有元素的累积乘积。
    - 从右到左遍历数组（从索引 `N-1` 到 0）。
        - 对于当前索引 `k`，`ans[k]` 当前存储的是其左侧元素的乘积。我们需要将其乘以其右侧元素的乘积。所以，`ans[k] = ans[k] * right`。
        - 更新 `right` 以包含当前元素 `nums[k]`，为下一次迭代（即 `nums[k-1]` 的右侧乘积）做准备：`right = right * nums[k]`。

### 代码实现

```java
class Solution {
    public int[] productExceptSelf(int[] nums) {
        int n = nums.length;
        int[] ans = new int[n];

        // Pass 1: ans[i] will store product of elements to the left of nums[i]
        ans[0] = 1;
        for(int i = 1; i < n; i++){
            ans[i] = ans[i-1] * nums[i-1];
        }

        // Pass 2: Calculate product of elements to the right and update ans
        int right = 1; // This variable will store the product of elements to the right
        for(int k = n - 1 ; k >= 0 ; k--){
            ans[k] = ans[k] * right; // Multiply current left product with right product
            right *= nums[k];       // Update right product for the next element (to its left)
        }
        return ans;
    }
}
```

### 步骤详解与示例

同样使用 `nums = [1, 2, 3, 4]`：

1.  **初始化：** `ans = [0, 0, 0, 0]` (conceptually, it will be filled), `n = 4`

2.  **第一遍遍历 (计算左侧乘积到 `ans`)：**
    | `i` | `nums[i-1]` (for i>0) | `ans[i-1]` (for i>0) | `ans[i]` calculation         | `ans` state       |
    |-----|-----------------------|----------------------|-----------------------------|-------------------|
    | 0   | -                     | -                    | `ans[0] = 1`                | `[1, ?, ?, ?]`    |
    | 1   | `nums[0]=1`           | `ans[0]=1`           | `ans[1] = ans[0]*nums[0]=1` | `[1, 1, ?, ?]`    |
    | 2   | `nums[1]=2`           | `ans[1]=1`           | `ans[2] = ans[1]*nums[1]=2` | `[1, 1, 2, ?]`    |
    | 3   | `nums[2]=3`           | `ans[2]=2`           | `ans[3] = ans[2]*nums[2]=6` | `[1, 1, 2, 6]`    |
    (此时 `ans` 数组为 `[1, 1, 2, 6]`)

3.  **第二遍遍历 (从右到左，合并右侧乘积)：**
    - 初始化 `right = 1`

    | `k` | `nums[k]` | `ans[k]` (from Pass 1) | `right` (current value before `ans[k]` update) | `ans[k] = ans[k] * right` (updated `ans[k]`) | `right *= nums[k]` (new `right` for next iter) |
    |-----|-----------|------------------------|----------------------------------------------|----------------------------------------------|---------------------------------------------|
    | 3   | 4         | 6                      | 1                                            | `6 * 1 = 6`                                  | `1 * 4 = 4`                                 |
    | 2   | 3         | 2                      | 4                                            | `2 * 4 = 8`                                  | `4 * 3 = 12`                                |
    | 1   | 2         | 1                      | 12                                           | `1 * 12 = 12`                                | `12 * 2 = 24`                               |
    | 0   | 1         | 1                      | 24                                           | `1 * 24 = 24`                                | `24 * 1 = 24`                               |

    最终 `ans = [24, 12, 8, 6]`。


### 复杂度分析

- **时间复杂度：** O(N)。第一遍遍历计算左侧乘积是 O(N)，第二遍遍历计算右侧乘积并合并也是 O(N)。总共 O(N) + O(N) = O(2N) = O(N)。
- **空间复杂度：** O(1) (不包括输出数组 `ans`)。我们只使用了常数个额外变量（如 `n`, `i`, `k`, `right`）。

这个方法巧妙地复用了输出数组，达到了 O(N) 时间复杂度和 O(1) 额外空间复杂度的要求。

## 总结

我们分析了解决 LeetCode 238 "Product of Array Except Self" 问题的三种方法：

1.  **暴力法：**
    - 时间：O(N^2)
    - 空间：O(1)
    - 简单直观，但不满足题目时间要求。

2.  **左右乘积列表法：**
    - 时间：O(N)
    - 空间：O(N)
    - 满足时间要求，但使用了额外空间。（注意用户提供的代码中有一处小笔误已在分析中指出并修正）。

3.  **空间优化法：**
    - 时间：O(N)
    - 空间：O(1)
    - 满足时间要求，并且通过巧妙地复用输出数组，将额外空间复杂度降至 O(1)，是本题的最佳解法。

所有这三种方法都没有使用题目禁止的除法操作。对于面试或实际应用，理解并能实现空间优化法是非常有价值的。

