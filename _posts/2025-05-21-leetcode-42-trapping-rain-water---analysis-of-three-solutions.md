---
layout: post
title: "LeetCode 42 题接雨水 - 三种解法详细分析"
date: "2025-05-21"
excerpt: |
  本文详细分析了 LeetCode 第 42 题"接雨水"的三种常用解法：动态规划、双指针和单调栈。每种解法都提供了详细的思路、代码实现和复杂度分析。
tags: [Algorithm, LeETCode, Array, DynamicProgramming, TwoPointers, Stack]
comments: true
author: zempty
---

## 问题描述

LeetCode 42 题，"接雨水"（Trapping Rain Water），是一个经典的算法问题。给定 n 个非负整数表示每个宽度为 1 的柱子的高度图，计算按此排列的柱子，下雨之后能接多少雨水。

例如，给定 `height = [0,1,0,2,1,0,1,3,2,1,2,1]`，返回 `6`。

<img src="https://assets.leetcode.com/uploads/2018/10/22/rainwatertrap.png" alt="Trapping Rain Water Example" style="width:400px;"/>

## 解法分析

我们将详细分析以下三种解决此问题的常用方法：

1.  **动态规划 (Dynamic Programming)**
2.  **双指针 (Two Pointers)**
3.  **单调栈 (Monotonic Stack)**

---

### 解法一：动态规划

#### 思路

对于数组中的每个元素，其上方能接的雨水，取决于其左侧最高柱子和右侧最高柱子中较矮的那一个。具体来说，对于下标 `i`，其能接的雨水高度为 `min(leftMax[i], rightMax[i]) - height[i]`，前提是 `min(leftMax[i], rightMax[i]) > height[i]`。

我们可以分两步预计算出每个位置的左侧最高柱子和右侧最高柱子：
1.  `leftMax[i]`：表示从下标 `0` 到 `i` (包含 `i`) 的柱子中的最高高度。
    -   `leftMax[0] = height[0]`
    -   `leftMax[i] = max(leftMax[i-1], height[i])` for `i > 0`
2.  `rightMax[i]`：表示从下标 `i` 到 `n-1` (包含 `i`) 的柱子中的最高高度。
    -   `rightMax[n-1] = height[n-1]`
    -   `rightMax[i] = max(rightMax[i+1], height[i])` for `i < n-1`

预计算完成后，再遍历一次数组，累加每个位置能接的雨水。注意，最左边和最右边的柱子无法接水，所以遍历范围是 `1` 到 `n-2`。

#### 代码实现

```java
class Solution {
    public int trap(int[] height) {
        int n = height.length;
        if (n < 3) return 0; // 至少需要三根柱子才能接水
        int total = 0;

        // leftMax[i] 表示 height[0...i] 中的最大值
        int[] leftMax = new int[n];
        leftMax[0] = height[0];
        for (int i = 1; i < n; i++) {
            leftMax[i] = Math.max(leftMax[i - 1], height[i]);
        }

        // rightMax[i] 表示 height[i...n-1] 中的最大值
        int[] rightMax = new int[n];
        rightMax[n - 1] = height[n - 1];
        for (int i = n - 2; i >= 0; i--) {
            rightMax[i] = Math.max(rightMax[i + 1], height[i]);
        }

        // 累加每个位置的雨水
        // 最左边和最右边的柱子无法接水，所以从 1 到 n-2
        for (int i = 1; i < n - 1; i++) {
            int currentWater = Math.min(leftMax[i], rightMax[i]) - height[i];
            if (currentWater > 0) { // 只有当两侧的墙高于当前柱子时才能接水
                total += currentWater;
            }
        }
        return total;
    }
}
```

#### 复杂度分析
-   **时间复杂度**: O(n)。需要三次遍历数组，一次计算 `leftMax`，一次计算 `rightMax`，一次累加雨水。
-   **空间复杂度**: O(n)。需要两个额外的数组 `leftMax` 和 `rightMax` 来存储左右最大高度。

---

### 解法二：双指针

#### 思路

动态规划解法中，我们使用了额外的空间来存储每个位置的左右最大高度。双指针法可以优化这一空间复杂度。

双指针法的核心思想是：我们可以使用两个指针 `left` 和 `right` 分别从数组的两端向中间移动，同时维护两个变量记录已遍历部分的最大高度。这种方法有两种实现变体，它们的核心原理相同但实现细节略有不同。

#### 第一种实现：先比较高度，再更新最大值

在这种实现中：
1. `leftMaxHeight` 表示 `height[0...left]` 中的最大值
2. `rightMaxHeight` 表示 `height[right...n-1]` 中的最大值

关键洞察：在任意时刻，如果 `height[left] < height[right]`，那么对于当前的 `left` 位置，我们可以确定它能接的雨水量就是 `leftMaxHeight - height[left]`（如果为正）。这是因为：

1. 右边一定存在一个高度至少为 `height[right]` 的柱子
2. 如果 `height[left] < height[right]`，那么左侧的 `leftMaxHeight` 就是瓶颈
3. 因此，`left` 位置能接的雨水量取决于 `leftMaxHeight`

同理，如果 `height[left] >= height[right]`，那么对于当前的 `right` 位置，它能接的雨水量就是 `rightMaxHeight - height[right]`（如果为正）。

#### 第二种实现：先更新最大值，再比较最大值

在这种实现中：
1. `leftMax` 记录的是 `[0, left]` 的最大值
2. `rightMax` 记录的是 `[right, n-1]` 的最大值

这种方法的关键洞察是：如果 `leftMax < rightMax`，那么对于当前的 `left` 位置，我们可以确定它能接的雨水量就是 `leftMax - height[left]`。这是因为：

1. 右边一定存在一个高度至少为 `rightMax` 的柱子
2. 既然 `leftMax < rightMax`，那么左侧的 `leftMax` 就是瓶颈
3. 因此，`left` 位置能接的雨水量取决于 `leftMax`

#### 两种实现的比较

两种实现的本质是相同的，都是基于"木桶原理"——水位由较短的那块木板决定。区别在于：
- 第一种实现先比较当前柱子高度，再更新最大值
- 第二种实现先更新最大值，再比较最大值

两种方法都能正确计算雨水量，只是处理顺序不同。第二种实现的代码可能更简洁，因为不需要额外的条件判断来更新最大值。

无论哪种实现，双指针法的巧妙之处在于，我们总是处理较矮的那一侧，这样可以确保水位由较矮的一侧决定，从而正确计算雨水量，同时将空间复杂度从 O(n) 优化到 O(1)。

#### 代码实现

```java
class Solution {
    public int trap(int[] height) {
        int n = height.length;
        if (n < 3) return 0;

        int left = 0, right = n - 1;
        int leftMaxHeight = 0; // height[0...left] 的最大值
        int rightMaxHeight = 0; // height[right...n-1] 的最大值
        int total = 0;

        while (left < right) {
            // 更新 leftMaxHeight 和 rightMaxHeight
            // 注意：这里是先比较 height[left] 和 height[right]，然后再更新对应的 maxHeight
            // 这样保证了 leftMaxHeight 和 rightMaxHeight 是基于旧的 left 和 right 计算的
            // 另一种写法是先更新 maxHeight，再比较 maxHeight

            if (height[left] < height[right]) {
                // 如果 height[left] 是目前较低的墙
                if (height[left] >= leftMaxHeight) {
                    // 如果当前柱子是左边最高的，它不能存水，更新 leftMaxHeight
                    leftMaxHeight = height[left];
                } else {
                    // 当前柱子比 leftMaxHeight 矮，可以存水
                    total += leftMaxHeight - height[left];
                }
                left++;
            } else {
                // 如果 height[right] 是目前较低的或与 height[left] 相等
                if (height[right] >= rightMaxHeight) {
                    // 如果当前柱子是右边最高的，它不能存水，更新 rightMaxHeight
                    rightMaxHeight = height[right];
                } else {
                    // 当前柱子比 rightMaxHeight 矮，可以存水
                    total += rightMaxHeight - height[right];
                }
                right--;
            }
        }
        return total;
    }
}
```
下面是用户提供的第二种解法的逻辑，它稍微不同，先更新 `max`再计算雨水：
```java
class Solution {
    public int trap(int[] height) {
        int n = height.length;
        if(n < 3) return 0;
        int left = 0, right= n-1;
        int leftMax = 0; // 代表 height[0...left-1] 的最大值 (在比较之后，指针移动之前)
        int rightMax = 0; // 代表 height[right+1...n-1] 的最大值
        int total = 0;
        while(left < right){
            leftMax = Math.max(leftMax, height[left]);
            rightMax = Math.max(rightMax, height[right]);
            // 如果 leftMax < rightMax，此时瓶颈在于 leftMax。
            // 意味着 height[left] 左边的最高墙是 leftMax，
            // 而 height[right] 右边的最高墙是 rightMax，且 rightMax 更高。
            // 所以，left 位置能接的雨水由 leftMax 决定。
            // total 累加的是 leftMax - height[left]。
            // 注意：此时的 leftMax 是 height[0...left] 的最大值。
            // 当 height[left] 本身就是 leftMax 时，leftMax - height[left] = 0，正确。
            // 当 height[left] < leftMax 时，leftMax - height[left] > 0，可以积水。
            if (leftMax < rightMax) {
                total += leftMax - height[left]; // height[left] 上方的水由 leftMax 决定
                left++;
            } else {
                // 如果 leftMax >= rightMax，此时瓶颈在于 rightMax。
                // height[right] 上方的水由 rightMax 决定
                total += rightMax - height[right];
                right--;
            }
        }
        return total;
    }
}
```

#### 复杂度分析
-   **时间复杂度**: O(n)。 `left` 和 `right` 指针各遍历数组一次。
-   **空间复杂度**: O(1)。只需要常数级别的额外空间。

---

### 解法三：单调栈

#### 思路

单调栈通常用于解决"找到下一个更大/更小元素"或类似模式的问题。在这里，我们可以用单调递减栈来计算雨水。

栈中存储的是柱子的下标，并且这些下标对应的柱子高度是单调递减的（栈顶元素对应的柱子最矮）。

遍历数组 `height` 中的每个柱子 `height[current]` (下标为 `current`)：

1.  **当栈不为空且 `height[current] > height[stack.peek()]` 时**:
    这意味着当前柱子 `height[current]` 比栈顶柱子 `height[stack.peek()]` 要高。
    此时，栈顶柱子 `height[stack.peek()]` (我们称之为 `height[top]`) 可能是一个凹陷的底部，可以储水。
    -   我们将栈顶元素 `top = stack.pop()` 弹出。
    -   如果弹出后栈为空，说明 `height[top]` 左边没有柱子能形成"墙"，无法储水，跳出循环 (`break`)。
    -   如果栈不为空，此时新的栈顶元素 `stack.peek()` (我们称之为 `leftBoundIndex`) 就是 `height[top]` 左边的墙。当前柱子 `height[current]` 是 `height[top]` 右边的墙。
    -   储水的高度 `h` 由这两侧墙中较矮的一个决定，即 `h = min(height[current], height[stack.peek()]) - height[top]`。
    -   储水的宽度 `w` 是 `current - stack.peek() - 1`。
    -   累加雨水量：`total += w * h`。
    -   继续 `while` 循环，因为 `height[current]` 可能比新的栈顶柱子还要高，形成更多储水区域。

2.  **处理完 `while` 循环后 (即栈为空，或者 `height[current] <= height[stack.peek()]`)**:
    将当前柱子的下标 `current`压入栈中。这样可以维持栈的单调递减性（或允许相等高度的柱子）。

遍历完成后，`total` 即为所求的雨水量。

#### 举例说明
`height = [3,2,1,5,2,2,6]`

---
下面是单调栈解法的执行过程：

| 当前位置 | 当前高度 | 栈内容 | 操作 | 弹出元素 | 弹出高度 | 左边界 | 左边界高度 | 水高 | 宽度 | 总水量 |
|---------|---------|--------|------|---------|---------|-------|-----------|------|------|-------|
| 0 | 3 | [] | 栈为空，压入0 | - | - | - | - | - | - | 0 |
|  |  | [0] |  |  |  |  |  |  |  |  |
| 1 | 2 | [0] | 2<3，压入1 | - | - | - | - | - | - | 0 |
|  |  | [0,1] |  |  |  |  |  |  |  |  |
| 2 | 1 | [0,1] | 1<2，压入2 | - | - | - | - | - | - | 0 |
|  |  | [0,1,2] |  |  |  |  |  |  |  |  |
| 3 | 5 | [0,1,2] | 5>1，弹出2 | 2 | 1 | 1 | 2 | 1 | 1 | 1 |
|  |  | [0,1] | 5>2，弹出1 | 1 | 2 | 0 | 3 | 1 | 2 | 3 |
|  |  | [0] | 5>3，弹出0 | 0 | 3 | - | - | - | - | 3 |
|  |  | [3] | 压入3 |  |  |  |  |  |  |  |
| 4 | 2 | [3] | 2<5，压入4 | - | - | - | - | - | - | 3 |
|  |  | [3,4] |  |  |  |  |  |  |  |  |
| 5 | 2 | [3,4] | 2=2，压入5 | - | - | - | - | - | - | 3 |
|  |  | [3,4,5] |  |  |  |  |  |  |  |  |
| 6 | 6 | [3,4,5] | 6>2，弹出5 | 5 | 2 | 4 | 2 | 0 | 1 | 3 |
|  |  | [3,4] | 6>2，弹出4 | 4 | 2 | 3 | 5 | 3 | 2 | 9 |
|  |  | [3] | 6>5，弹出3 | 3 | 5 | - | - | - | - | 9 |
|  |  | [6] | 压入6 |  |  |  |  |  |  |  |

最终接水量为9。通过这个例子，我们可以清晰地看到单调栈如何处理每个位置并计算积水。

#### 代码实现
(Requires `java.util.Deque` and `java.util.ArrayDeque`)
```java
import java.util.Deque;
import java.util.ArrayDeque;

class Solution {
    public int trap(int[] height) {
       int n = height.length;
       if (n < 3) return 0;
       int total = 0;
       Deque<Integer> stack = new ArrayDeque<>(); // Stores indices of bars

       for (int current = 0; current < n; current++) {
           // While stack is not empty and current bar is taller than stack top bar
           while (!stack.isEmpty() && height[current] > height[stack.peek()]) {
               int topIndex = stack.pop(); // Index of the bar at the bottom of the dip
               
               if (stack.isEmpty()) { // No left wall to form a container
                   break; 
               }
               
               int leftBoundIndex = stack.peek(); // Index of the left wall
               
               // Distance between the left and right walls
               int distance = current - leftBoundIndex - 1; 
               
               // Bounded height of water
               int boundedHeight = Math.min(height[current], height[leftBoundIndex]) - height[topIndex];
               
               total += distance * boundedHeight;
           }
           // Push current bar's index onto the stack
           // If current bar is shorter or equal to stack top, it could be a potential left wall
           // or part of a descending sequence.
           stack.push(current); 
       }
       return total;
    }
}
```

#### 复杂度分析
-   **时间复杂度**: O(n)。每个柱子最多被压入栈和弹出栈一次。
-   **空间复杂度**: O(n)。在最坏的情况下（例如，一个单调递减的柱子序列），栈中可能会存储所有柱子的下标。

---

## 总结

| 解法         | 时间复杂度 | 空间复杂度 | 思路简介                                                                 |
|--------------|------------|------------|--------------------------------------------------------------------------|
| 动态规划     | O(n)       | O(n)       | 预计算每个位置的左侧最高和右侧最高，然后逐个计算雨水。                     |
| 双指针       | O(n)       | O(1)       | 从两端向中间收缩，维护左右两侧遇到的最大高度，根据较小的一方计算雨水。     |
| 单调栈       | O(n)       | O(n)       | 维护一个单调递减的栈，当遇到更高的柱子时，形成凹槽，计算并累加雨水。         |

对于这道题：
-   **双指针法** 在空间效率上最优。
-   **动态规划** 思路相对直观，易于理解。
-   **单调栈** 是一种巧妙的解法，适用于一些需要找到左右边界的场景。

选择哪种解法取决于具体的约束和偏好。在面试中，能够想到并实现双指针或单调栈解法会是加分项。

