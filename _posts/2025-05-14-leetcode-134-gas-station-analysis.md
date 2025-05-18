---
layout: post
title: "LeetCode 134 加油站问题详解 (Gas Station Problem Explained)"
date: "2025-05-14"
toc: true
excerpt: "详细分析 LeetCode 134 题的三种解法，深入探讨解法2和解法3的原理，并比较各算法的优劣及给出建议。"
tags: [Algorithm, LeetCode, Greedy, Array]
comments: true
author: zempty
---

## 题目描述 (Problem Description)

在一条环路上有 `N` 个加油站，其中第 `i` 个加油站有汽油 `gas[i]` 升。

你有一辆油箱容量无限的的汽车，从第 `i` 个加油站开往第 `i+1` 个加油站需要消耗汽油 `cost[i]` 升。你从其中的一个加油站出发，开始时油箱为空。

如果你可以绕环路行驶一周，则返回出发时加油站的编号，否则返回 -1。

**说明:**
*   如果题目有解，该解法是唯一的。
*   输入数组是非空的，且长度相同。
*   输入数组中的元素是非负数。

**示例 1:**
```
Input:
gas  = [1,2,3,4,5]
cost = [3,4,5,1,2]

Output: 3

Explanation:
从 3 号加油站(索引为3)出发，可获得 4 升汽油。此时油箱有 = 0 + 4 = 4 升汽油
开往 4 号加油站，此时油箱有 4 - 1 + 5 = 8 升汽油
开往 0 号加油站，此时油箱有 8 - 2 + 1 = 7 升汽油
开往 1 号加油站，此时油箱有 7 - 3 + 2 = 6 升汽油
开往 2 号加油站，此时油箱有 6 - 4 + 3 = 5 升汽油
开往 3 号加油站，你需要消耗 5 升汽油，正好足够你返回到 3 号加油站。
因此，3 可为起始索引。
```

**示例 2:**
```
Input:
gas  = [2,3,4]
cost = [3,4,3]

Output: -1

Explanation:
你不能从 0 号或 1 号加油站出发，因为没有足够的汽油可以让你行驶到下一个加油站。
我们从 2 号加油站出发，可以获得 4 升汽油。 此时油箱有 = 0 + 4 = 4 升汽油
开往 0 号加油站，此时油箱有 4 - 3 + 2 = 3 升汽油
开往 1 号加油站，此时油箱有 3 - 3 + 3 = 3 升汽油
你无法返回 2 号加油站，因为你需要 4 升汽油，但油箱只有 3 升汽油。
因此，无论怎样，你都无法绕环路行驶一周。
```

## 解法分析 (Solution Analysis)

### 解法1: 暴力枚举 (Brute Force)

```java
class Solution {
    public int canCompleteCircuit(int[] gas, int[] cost) {
        int n = gas.length;
        for(int startStation = 0; startStation < n ; startStation++){
            int currGas = 0;
            int stationsTravelId = 0;
            boolean possible = true;
            for(int i = 0; i < n; i++){ // 模拟行驶一圈
                int currentStopIndex = (startStation + i) % n ;
                currGas += gas[currentStopIndex]; // 加油
                if(currGas < cost[currentStopIndex]){ // 油不够去下一个站
                    possible = false;
                    break;
                }
                currGas -= cost[currentStopIndex]; // 消耗油
                stationsTravelId++;
            }
            if(possible && stationsTravelId == n){ // 成功行驶一圈
                return startStation;
            }
        }
        return -1; // 所有起点都尝试完毕
    }
}
```

**思路**:
这种方法的核心思想是简单直接：尝试从每一个加油站出发，模拟汽车行驶一圈的过程。如果能够成功环绕，那么该加油站就是符合条件的起点。

**步骤**:
1.  **外层循环**: 遍历每一个加油站 `startStation` (从 `0` 到 `n-1`)，将其作为潜在的起点。
2.  **内层循环初始化**: 对于每一个 `startStation`：
    *   初始化当前油箱油量 `currGas = 0`。
    *   初始化已经成功行驶过的站点数 `stationsTravelId = 0`。
    *   设置一个标志位 `possible = true`，表示当前起点目前看来是可行的。
3.  **内层循环 (模拟行驶)**: 从 `startStation` 开始，模拟行驶 `n` 个站点。
    *   计算当前实际停留的加油站索引 `currentStopIndex = (startStation + i) % n`，这里 `i` 从 `0` 到 `n-1`，确保环形遍历。
    *   在 `currentStopIndex` 加油: `currGas += gas[currentStopIndex]`。
    *   **检查油量**: 判断当前油量 `currGas` 是否足够支付前往下一个加油站的消耗 `cost[currentStopIndex]`。
        *   如果 `currGas < cost[currentStopIndex]`，说明油不够，当前 `startStation` 不可行。将 `possible` 设为 `false`，并 `break` 内层循环，尝试下一个 `startStation`。
    *   如果油量足够，则消耗汽油: `currGas -= cost[currentStopIndex]`。
    *   成功到达下一个站点，`stationsTravelId` 增加1。
4.  **检查结果**: 内层循环结束后（无论是正常结束还是因油量不足而 `break`）：
    *   如果 `possible` 仍然为 `true` 并且 `stationsTravelId == n` (意味着成功从 `startStation` 出发并完整行驶了 `n` 个站点)，则 `startStation` 就是答案，返回它。
5.  **无解情况**: 如果外层循环遍历完所有可能的起点后，都没有找到一个可行的方案，说明无法完成环绕，返回 `-1`。

**优劣**:
-   **优点**: 思路简单直观，非常容易理解和编码实现。对于问题的基本模拟。
-   **缺点**: 时间复杂度较高。外层循环 `n` 次，内层循环也 `n` 次，因此总时间复杂度为 O(N^2)，其中 N 是加油站的数量。当 N 较大时（例如 LeetCode 题目限制 N 可以到 10^5），O(N^2) 的算法会导致超时 (Time Limit Exceeded)。

### 解法2: 一次遍历 (One Pass Greedy Approach)

```java
class Solution {
    public int canCompleteCircuit(int[] gas, int[] cost) {
        int n = gas.length;
        int total_tank = 0; // 总油量差额，判断全局是否有解
        int current_tank = 0; // 从当前start开始的油量累计
        int start_station = 0; // 候选的起始加油站

        for (int i = 0; i < n; i++) {
            total_tank += gas[i] - cost[i];
            current_tank += gas[i] - cost[i];

            // 如果current_tank < 0，说明从start_station出发无法到达i的下一个站点
            // 那么start_station到i之间的任何站点都不能作为起点
            // 所以，新的候选起点是 i + 1
            if (current_tank < 0) {
                start_station = i + 1;
                current_tank = 0; // 为新的start_station重置油量累计
            }
        }

        // 如果total_tank < 0，说明总油量小于总消耗，不可能完成环绕
        // 否则，start_station就是那个唯一的解 (题目保证有解则唯一)
        return total_tank >= 0 ? start_station : -1;
    }
}
```

**思路**:
这个解法基于一个关键的贪心思想和两个重要的观察：
1.  **观察1 (全局判断)**: 如果所有加油站的总油量 `sum(gas)` 小于总的消耗 `sum(cost)`，那么无论从哪个加油站出发，都不可能完成一圈。因为总的油量补给小于总的消耗。
2.  **观察2 (局部判断与起点更新)**: 如果汽车从加油站 `A` 出发，行驶到加油站 `B` 时（在到达 `B` 的下一个站点之前），油箱的油量首次变为负数，这意味着从 `A` 出发无法到达 `B` 的下一个站点。那么，可以断定：从 `A` 到 `B` 之间的任何一个加油站 `C` (包括 `A`，不包括 `B` 的下一个站点) 出发，都无法到达 `B` 的下一个站点。因此，下一个可能的起点只能是 `B` 的下一个站点。

**解题原理**:
1.  **`total_tank`**: 这个变量累积计算 `gas[i] - cost[i]` 的总和。它用于最终判断全局上是否有解。如果 `total_tank < 0`，则说明总油量不足以覆盖总消耗，直接返回 -1。
2.  **`current_tank`**: 这个变量追踪从当前假设的起点 `start_station` 出发，到当前遍历到的站点 `i` 时，油箱中油量的净变化（相对于在 `start_station` 加油后的状态）。
3.  **`start_station`**: 这个变量记录了当前认为可行的起始加油站的索引。初始时，我们假设从站点 0 开始 (`start_station = 0`)。
4.  **遍历与更新逻辑**:
    *   我们从左到右遍历每一个加油站 `i` (从 `0` 到 `n-1`)。
    *   在每个站点 `i`，我们都计算 `diff = gas[i] - cost[i]`。这个 `diff` 同时累加到 `total_tank` 和 `current_tank`。
    *   **核心判断**: 如果在某个站点 `i`，`current_tank` 的值变为负数：
        *   这表示：如果我们以当前的 `start_station` 作为起点，那么我们无法从 `start_station` 成功行驶到站点 `i` 的下一个站点（即站点 `i+1`）。
        *   根据上面的"观察2"，不仅当前的 `start_station` 不行，从 `start_station` 到 `i` 之间的任何一个站点作为起点也都不行。
        *   因此，我们必须放弃当前的 `start_station` 以及它到 `i` 之间的所有站点作为起点的可能性。下一个有潜力的起点只能是站点 `i+1`。
        *   所以，我们将 `start_station` 更新为 `i + 1`。
        *   同时，我们为这个新的 `start_station` 重置 `current_tank = 0`，因为我们现在要开始一段新的行驶模拟，看看从这个新的 `start_station` 出发情况如何。
5.  **最终判断**:
    *   遍历结束后，如果 `total_tank >= 0` (这意味着全局油量够用)，那么在遍历过程中最后确定的 `start_station` 就是答案。
    *   为什么？因为如果这个 `start_station` 是在遍历后期确定的，它保证了从这个 `start_station` 到数组末尾 `n-1` 的路段，`current_tank` 始终是非负的。而题目保证如果解存在，它是唯一的。该贪心策略能找到这个解。如果 `total_tank < 0`，则返回 -1。

**优劣**:
-   **优点**: 只需要一次遍历，时间复杂度为 O(N)。空间复杂度为 O(1)，因为只用了几个额外的变量。非常高效。
-   **缺点**: 思路相对不那么直观，需要理解其贪心选择的正确性证明（即"观察2"）。

### 解法3: 基于最低油量点的思考 (Lowest Point Logic)

```java
class Solution {
    public int canCompleteCircuit(int[] gas, int[] cost) {
        int n = gas.length;
        int total_net_gas = 0; // 计算总的净油量
        for (int i = 0; i < n; i++) {
            total_net_gas += gas[i] - cost[i];
        }

        // 如果总净油量小于0，则不可能完成旅程
        if (total_net_gas < 0) {
            return -1;
        }

        // 如果解存在，我们需要找到这个起点。
        // 起点应该是使得累积油量"赤字"最大的那个点的下一个点。
        int start_node = 0;
        int current_gas_sum = 0; // 从站点0开始的累积油量变化
        int min_gas_sum = 0;     // 记录累积油量变化过程中的最小值
                                 // 初始化为0，因为可能从0开始一直不为负，或者最低点在最后。

        for (int j = 0; j < n; j++) {
            current_gas_sum += gas[j] - cost[j];
            if (current_gas_sum < min_gas_sum) {
                min_gas_sum = current_gas_sum;
                // 如果在j点之后，累积油量达到了新的最低点，
                // 那么真正的起点应该是j+1。
                // 因为我们要跨过这个"最深的坑"。
                start_node = (j + 1) % n;
            }
        }
        return start_node;
    }
}
```

**解题原理**:
这个解法的核心思想是：将问题转化为寻找油量变化序列中的一个特殊点。
1.  **计算总净油量**: 首先，和解法2一样，计算所有站点 `gas[i] - cost[i]` 的总和 `total_net_gas`。如果 `total_net_gas < 0`，那么肯定无法完成旅程，直接返回 -1。这保证了如果存在解，那么总油量是足够的。
2.  **寻找油箱油量的"最低点"**:
    *   我们定义 `diff[i] = gas[i] - cost[i]` 为在站点 `i` 的净油量变化。
    *   计算从站点 0 开始的累积油量变化 `current_gas_sum[j] = diff[0] + diff[1] + ... + diff[j]`。可以想象这是一条油量随站点变化的折线图。
    *   我们需要找到这个 `current_gas_sum` 序列中的最小值 `min_gas_sum`。假设这个最小值是在累积到站点 `k` 之后出现的 (即 `current_gas_sum[k]` 是最小值)。
3.  **为什么是最低点的下一个站点是起点?**
    *   如果我们将整个油量变化过程看作是在一个数轴上行走，`diff[i]` 是每一步的位移。`current_gas_sum[j]` 是从原点出发，走到第 `j` 步后的位置。
    *   `min_gas_sum` 就是这个行走过程中到达的最"左"的点（或最低的"谷底"）。设这个点在处理完站点 `k` 后达到。
    *   如果我们选择从站点 `(k+1) % n` 作为新的起点开始我们的旅程：
        *   这意味着我们把之前所有的"负债"（即导致油量下降到 `min_gas_sum` 的那部分路程）都放在了我们"身后"。
        *   从新的起点 `(k+1)%n` 出发，油箱的油量变化（相对于在 `(k+1)%n` 加油后的状态）可以看作是 `current_gas_sum[j] - min_gas_sum`（这里需要对环路和下标做一些调整才能严格对应，但核心思想是这样）。
        *   因为 `min_gas_sum` 是 `current_gas_sum` 序列中的最小值，所以 `current_gas_sum[j] - min_gas_sum` 必然总是 `>= 0`。
        *   这说明，如果我们从 `(k+1)%n` 这个站点开始，并且初始油量为0（在 `(k+1)%n` 加油后），那么在我们行驶到环路上的任何其他站点时，油箱的油量（相对于在 `(k+1)%n` 的初始状态）都不会降到0以下。
    *   由于我们已经检查过 `total_net_gas >= 0`，这保证了整个环路的总油量是足够的。结合从"最低点之后"出发的策略，就能保证顺利跑完一圈。
    *   因此，如果存在解，那么这个起点就是使得累积油量 `current_gas_sum` 达到最低值的那个站点 `k` 的下一个站点 `(k+1)%n`。

**优劣**:
-   **优点**: 理论上只需要一次遍历来计算总净油量，再进行一次遍历来找到最低点和对应的起始点。因此时间复杂度为 O(N)。空间复杂度为 O(1)。同样高效。
-   **缺点**: 原理比解法2更抽象一些，涉及到前缀和以及寻找序列最低点的概念，可能不如解法2的贪心思路直观。

## 算法比较与建议

| 特性         | 解法1 (暴力枚举) | 解法2 (一次遍历贪心) | 解法3 (最低油量点) |
|--------------|--------------------|----------------------|--------------------|
| 时间复杂度   | O(N^2)             | O(N)                 | O(N)               |
| 空间复杂度   | O(1)               | O(1)                 | O(1)               |
| 实现难度   | 简单               | 中等                 | 中等               |
| 理解难度   | 容易               | 中等，需理解贪心证明 | 较难，需理解前缀和与最低点逻辑 |
| 核心思想   | 尝试所有起点       | 若A无法到B，则A到B之间任一点都不能作起点，跳到B的下一个点 | 从累积油量最低点之后出发，相当于将"历史欠账"甩在身后 |

**详细分析解法2和解法3的原理**:

**解法2 (一次遍历贪心) 原理回顾**:
-   **关键条件**:
    1.  `sum(gas) >= sum(cost)` 是有解的必要条件。算法通过 `total_tank` 检查。
    2.  **贪心选择**: 如果从 `start_station` 出发，在到达站点 `i` 的下一个站点（即 `i+1`）前油量 `current_tank` 变负，则说明从 `start_station` 到 `i` 的任何一个站点都不能作为最终起点。因此，下一个可能的起点是 `i+1`。
-   **正确性**:
    *   当循环结束时，如果 `total_tank >= 0`，则 `start_station` 是解。
    *   考虑 `start_station`。从 `start_station` 到 `n-1`，`current_tank` 始终 `>=0`。
    *   现在需要考虑从 `0` 到 `start_station-1` 这段路程。设 `sum(i, j)` 为 `gas[k]-cost[k]` 从 `k=i` 到 `k=j` 的和。
    *   我们有 `sum(start_station, n-1) >= 0`。
    *   我们也有 `sum(0, n-1) = total_tank >= 0`。
    *   `sum(0, n-1) = sum(0, start_station-1) + sum(start_station, n-1)`。
    *   所以 `sum(0, start_station-1) = total_tank - sum(start_station, n-1)`。
    *   当汽车从 `start_station` 跑完一圈回到 `start_station` 时，它在 `start_station` 到 `n-1` 段积累的油量是 `sum(start_station, n-1)`。然后它需要跑 `0` 到 `start_station-1` 这段。
    *   如果 `total_tank >= 0`，则保证存在一个解。而该算法的贪心策略就是不断排除不满足条件的区间，最终剩下的 `start_station` （如果 `total_tank >=0`）即为解。
    *   一个更强的论证是：如果 `total_tank >=0`，问题保证有解。如果在遍历中 `start_station` 被更新为 `k+1`，是因为从旧的 `start_station` 无法到达 `k+1`。这意味着 `sum(旧_start_station, k) < 0`。这个算法实际上是在找一个 `start_station`，使得 `sum(start_station, ..., n-1, 0, ..., start_station-1)` 始终非负。

**解法3 (最低油量点) 原理回顾**:
-   **关键条件**:
    1.  `total_net_gas = sum(gas[i] - cost[i]) >= 0` 是有解的必要条件。
    2.  **选择起点**: 找到 `S[k] = sum_{i=0 to k} (gas[i]-cost[i])` 的全局最小值。那么起点就是 `(k+1)%n`。
-   **正确性**:
    *   令 `diff[i] = gas[i] - cost[i]`。令 `S[j] = diff[0] + ... + diff[j]` 为前缀和。
    *   假设 `S[k]` 是所有前缀和 `S[-1]=0, S[0], ..., S[n-1]` 中的最小值。
    *   如果我们从 `start = (k+1)%n` 出发。
    *   当汽车行驶到任意站点 `p` 时（`p` 在 `start` 之后，环形考虑），油箱中的油量（相对于在 `start` 加油后的状态）是 `sum_{i=start to p} diff[i]`。
    *   这个和可以表示为 `S[p] - S[k]` (如果 `p` 在 `k` 之后，且路径不跨越 `n-1` 到 `0`) 或者 `(S[n-1] - S[k]) + S[p]` (如果路径跨越了 `n-1` 到 `0`，即 `p < k`)。
    *   **情况1**: `p >= k+1` (且在第一次环绕内)。此时油量变化是 `diff[k+1] + ... + diff[p] = S[p] - S[k]`。由于 `S[k]` 是最小值，所以 `S[p] - S[k] >= 0`。
    *   **情况2**: 汽车从 `k+1` 开到 `n-1`，然后从 `0` 开到 `p` (其中 `p <= k`)。
        *   油量变化是 `(diff[k+1] + ... + diff[n-1]) + (diff[0] + ... + diff[p])`
        *   这等于 `(S[n-1] - S[k]) + S[p]`。
        *   我们知道 `S[n-1] = total_net_gas`。所以油量是 `total_net_gas - S[k] + S[p]`。
        *   由于 `S[k]` 是全局最小值，所以 `S[p] >= S[k]`。因此 `S[p] - S[k] >= 0`。
        *   表达式变为 `total_net_gas + (S[p] - S[k])`。
        *   因为 `total_net_gas >= 0` (有解的前提) 且 `S[p] - S[k] >= 0`，所以这个总和也 `>= 0`。
    *   因此，从 `(k+1)%n` 出发，在任何点油量都不会降到初始油量（在 `(k+1)%n` 加油后）以下。

**总结与建议**:

-   **解法1 (暴力枚举)**: O(N^2) 时间复杂度，通常不可取，除非 N 非常小。主要用于理解问题。
-   **解法2 (一次遍历贪心)**:
    -   **优点**: O(N) 时间，O(1) 空间。代码相对简洁，贪心逻辑一旦掌握比较清晰。
    -   **推荐度**: 非常高。这是面试和竞赛中最常见的标准解法之一。
-   **解法3 (最低油量点)**:
    -   **优点**: O(N) 时间，O(1) 空间。
    -   **理解**: 思维方式不同，基于累积和与寻找最低点。对于某些人可能更直观，对于另一些人可能更抽象。
    -   **推荐度**: 高。也是一个优秀的解法，展示了从不同角度分析问题的能力。

**最终建议**:
**解法2 (一次遍历贪心)** 通常是首选推荐。它在效率上与解法3相当，但其逐步排除不可行区间的贪心策略可能更容易被大多数人接受和解释。代码也往往非常凝练。

在面试中，能够清晰地解释解法2的贪心逻辑和为什么它是正确的，通常就已经达到了优秀的标准。如果能进一步想到或讨论解法3的思路（例如，从图论角度，或将油量变化看作一个函数并寻找其全局最低点以确定分割点），这会是一个很好的加分项，表明了更深层次的理解和问题分析能力。

对于学习者而言，从解法1出发，理解其局限性，然后学习并掌握解法2和解法3的优化思路，是一个非常好的提升算法思维的过程。但在实际编码时，应选择O(N)的解法。

