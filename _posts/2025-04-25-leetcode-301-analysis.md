---
layout: post
title: "[LeetCode 301] 删除无效括号的两种解法分析"
date: "2025-04-25"
category: "算法题解"
toc: true
excerpt: "本文详细解析 LeetCode 301 题删除无效括号的 BFS 和 DFS 解法，重点讲解 DFS 回溯机制的工作原理。"
tags: [Algorithm, DataStructure]
comments: true
author: zempty
---

## 题目分析

给定包含括号和其他字符的字符串，要求删除最少数量的无效括号，返回所有可能的有效结果。关键点：

1. 需要找到所有最小删除方案
2. 结果需要去重
3. 时间复杂度优化挑战

## BFS 解法解析

```java
import java.util.*;

class Solution_BFS {
    public List<String> removeInvalidParentheses(String s) {
        List<String> result = new ArrayList<>();
        if (s == null) {
            return result;
        }

        Set<String> visited = new HashSet<>();
        Queue<String> queue = new LinkedList<>();

        // Initial state
        queue.offer(s);
        visited.add(s);

        boolean found = false; // Flag to indicate if we found the first valid string(s)

        while (!queue.isEmpty()) {
            int levelSize = queue.size(); // Process level by level

            for (int i = 0; i < levelSize; i++) {
                String current = queue.poll();

                // Check if the current string is valid
                if (isValid(current)) {
                    result.add(current);
                    found = true; // Mark that we've found solutions at this level
                }

                // If we already found solutions at this level,
                // no need to generate shorter strings (more removals)
                if (found) {
                    continue;
                }

                // Generate neighbors (remove one parenthesis)
                for (int j = 0; j < current.length(); j++) {
                    char ch = current.charAt(j);

                    // Only consider removing parentheses
                    if (ch == '(' || ch == ')') {
                        // Create the next string by removing the character at index j
                        String nextStr = current.substring(0, j) + current.substring(j + 1);

                        // If this neighbor hasn't been visited, add it to the queue and visited set
                        if (visited.add(nextStr)) { // Set.add() returns true if the element was not already present
                            queue.offer(nextStr);
                        }
                    }
                }
            }

            // If we found valid strings in this level, stop exploring further (deeper levels)
            if (found) {
                break;
            }
        }

        return result;
    }

    // Helper function to check if a string has valid parentheses
    private boolean isValid(String str) {
        int balance = 0;
        for (char ch : str.toCharArray()) {
            if (ch == '(') {
                balance++;
            } else if (ch == ')') {
                balance--;
            }
            // If balance drops below zero at any point, it's invalid
            if (balance < 0) {
                return false;
            }
        }
        // For a valid string, the final balance must be zero
        return balance == 0;
    }
}
```

**核心思路**：

- 逐层遍历可能的删除方案（类似层级遍历）
- 每层代表删除 N 个括号后的所有可能
- 找到有效解后停止向更深层搜索

**优势**：

- 天然保证找到最小删除次数
- 实现相对直观

**劣势**：

- 空间复杂度较高（需存储中间状态）
- 可能生成大量无效中间字符串

## DFS 解法解析

```java
import java.util.*;

class Solution_DFS {
    private Set<String> resultSet = new HashSet<>();
    private String originalString;
    private int len;
    private int minLeftToRemove;
    private int minRightToRemove;

    public List<String> removeInvalidParentheses(String s) {
        this.originalString = s;
        this.len = s.length();
        this.resultSet.clear(); // Clear for potential multiple calls

        // Step 1: Calculate minimum removals needed
        int left = 0, right = 0;
        for (int i = 0; i < len; i++) {
            char ch = s.charAt(i);
            if (ch == '(') {
                left++;
            } else if (ch == ')') {
                if (left > 0) {
                    left--; // Matched a '('
                } else {
                    right++; // Unmatched ')' found, needs removal
                }
            }
        }
        this.minLeftToRemove = left;  // Remaining unmatched '(' need removal
        this.minRightToRemove = right; // Already counted unmatched ')'

        // Step 2: Start DFS
        dfs(0, 0, 0, minLeftToRemove, minRightToRemove, new StringBuilder());

        return new ArrayList<>(resultSet);
    }

    /**
     * DFS function to explore possibilities.
     *
     * @param index Current index in the original string.
     * @param leftCount Count of '(' included in currentPath so far.
     * @param rightCount Count of ')' included in currentPath so far.
     * @param leftRem Remaining '(' to remove.
     * @param rightRem Remaining ')' to remove.
     * @param currentPath StringBuilder building the potential result.
     */
    private void dfs(int index, int leftCount, int rightCount, int leftRem, int rightRem, StringBuilder currentPath) {
        // Base case: Reached the end of the original string
        if (index == len) {
            // If we removed the exact required number of parentheses and the result is valid
            if (leftRem == 0 && rightRem == 0 && leftCount == rightCount) { // leftCount == rightCount implicitly checks validity here
                resultSet.add(currentPath.toString());
            }
            return;
        }

        // Pruning: If we have already removed too many, stop this path
        if (leftRem < 0 || rightRem < 0) {
            return;
        }
         // Pruning: If rightCount exceeds leftCount, this path cannot lead to a valid solution
        if (rightCount > leftCount) {
             return;
        }


        char currentChar = originalString.charAt(index);
        int pathLength = currentPath.length(); // Store length for backtracking

        if (currentChar == '(') {
            // Option 1: Remove '('
            dfs(index + 1, leftCount, rightCount, leftRem - 1, rightRem, currentPath);

            // Option 2: Keep '('
            currentPath.append('(');
            dfs(index + 1, leftCount + 1, rightCount, leftRem, rightRem, currentPath);
            currentPath.setLength(pathLength); // Backtrack

        } else if (currentChar == ')') {
            // Option 1: Remove ')'
            dfs(index + 1, leftCount, rightCount, leftRem, rightRem - 1, currentPath);

            // Option 2: Keep ')' - only if it maintains validity (rightCount < leftCount)
            // This check is implicitly handled by the pruning `rightCount > leftCount` above,
            // but explicitly checking here can also work: if (leftCount > rightCount) { ... }
            // We rely on the pruning check at the start of the function.
            currentPath.append(')');
            dfs(index + 1, leftCount, rightCount + 1, leftRem, rightRem, currentPath);
            currentPath.setLength(pathLength); // Backtrack

        } else {
            // If it's a letter, just keep it
            currentPath.append(currentChar);
            dfs(index + 1, leftCount, rightCount, leftRem, rightRem, currentPath);
            currentPath.setLength(pathLength); // Backtrack
        }
    }
}
```

### 回溯机制详解

**为什么需要回溯**：

1. **路径共享问题**：`StringBuilder` 在递归过程中被多个分支共享
2. **状态恢复需求**：每次递归尝试后需要恢复原始状态才能进行其他尝试

**具体实现**：

```java
// 以处理 '(' 为例：
currentPath.append('(');      // 选择保留该括号
dfs(...);                     // 继续探索
currentPath.setLength(pathLength); // 回溯：撤销选择
```

**三步回溯过程**：

1. 记录当前路径长度 `pathLength = currentPath.length()`
2. 进行添加字符后的递归探索
3. 通过 `setLength()` 回退到之前的状态

### 剪枝优化

1. **剩余删除数校验**：`if (leftRem < 0 || rightRem < 0) return;`
2. **有效性提前判断**：`if (rightCount > leftCount) return;`
3. **最小删除数限制**：通过预计算确定必须删除的最小括号数

## 两种解法对比

| 维度       | BFS          | DFS          |
| ---------- | ------------ | ------------ |
| 时间复杂度 | O(n × 2ⁿ)    | O(2ⁿ)        |
| 空间复杂度 | O(2ⁿ)        | O(n)         |
| 结果顺序   | 层级有序     | 随机顺序     |
| 适用场景   | 需要最短路径 | 内存敏感场景 |

## 复杂度分析

### BFS 复杂度

- **时间复杂度**：O(n × 2ⁿ)
  - 最坏情况需要遍历所有可能的删除组合
  - 每层处理需要 O(n) 时间验证有效性
- **空间复杂度**：O(2ⁿ)
  - 队列最多存储 C(n,k) 个元素（k 为最小删除数）

### DFS 复杂度

- **时间复杂度**：O(2ⁿ)
  - 但通过剪枝优化实际远小于理论值
  - 预计算最小删除数显著减少搜索空间
- **空间复杂度**：O(n)
  - 递归栈深度最大为 n
  - 临时 StringBuilder 的空间消耗

## 测试用例解析

```java
// 示例 1：
输入: "()())()"
输出: ["()()()", "(())()"]

// DFS处理流程：
1. 预计算需删除 1 ')'
2. 递归树中优先尝试删除第3个')'和第5个')'
3. 通过回溯保留有效组合
```

## 常见问题解答

**Q：为什么 DFS 需要预计算最小删除数？**
A：这是关键剪枝策略：

1. 通过遍历字符串统计必须删除的括号数
2. 在 DFS 过程中严格跟踪剩余可删除数
3. 避免无效路径的探索（如删除超过必要数量的括号）

**Q：如何处理重复结果？**

```java
// BFS 方案：
使用 HashSet 存储已访问字符串

// DFS 方案：
自然避免重复，因为：
1. 总是按顺序处理字符
2. 删除选择具有确定性
3. 结果存储在Set中自动去重
```

## 算法选择建议

1. **优先 BFS**：当需要保证找到所有最短路径解时
2. **选择 DFS**：
   - 输入字符串较长时（内存敏感）
   - 需要更优的最坏情况时间复杂度
   - 结合记忆化搜索可进一步优化

## 扩展思考

1. 如何修改算法处理其他括号类型（如 {} []）？
2. 如果要求返回字典序最小的解，如何优化？
3. 如何实现并行化处理加速计算？

## 深度优化技巧

### 记忆化搜索改进

```java
// 在DFS中加入记忆缓存
private Map<String, Boolean> memo = new HashMap<>();

// 修改递归入口：
if (memo.containsKey(currentPath.toString())) {
    return;
}
memo.put(currentPath.toString(), true);
```

**效果**：避免重复处理相同路径，适用于含大量重复字符的场景

### 早期终止策略

```java
// 在DFS开始时加入长度判断
int maxPossibleLength = len - (minLeftToRemove + minRightToRemove);
if (currentPath.length() + (len - index) < maxPossibleLength) {
    return;
}
```
