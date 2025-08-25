---
layout: post
title: "LeetCode 33 Search in Rotated Sorted Array Analysis"
date: "2025-08-18"
toc: true
excerpt: "四种方法详解：直接二分、先找枢轴后二分、偏移映射一次二分；重点比较两种 pivot 寻找法的差异与边界，附复杂度与优劣分析。"
tags: [Algorithm, BinarySearch, DataStructure, Java]
comments: true
author: zempty
---

## 引言 / 问题描述

给定升序数组经未知次数旋转（无重复），在其中以 \(O(\log n)\) 时间查找目标 `target` 的索引，不存在返回 `-1`。

核心事实：在任何时刻的 `[left, right]` 区间内，至少有一侧是“有序的半边”。利用这一性质判断目标是否落在有序半边，否则转向另一半。

实现要点（通用）：
- 中点计算推荐 `mid = left + (right - left) / 2`，避免 `left + right` 溢出；题解中使用的 `(left + right) >>> 1` 在极端大索引下存在溢出风险（虽在面试常规范围安全）。
- 闭区间语义与循环条件配套：`while (left <= right)`。
- 更新指针必须排除 `mid`，以确保收敛：`left = mid + 1` 或 `right = mid - 1`。

---

## 解法一：单次二分（不显式找枢轴）

思想：每轮二分判断哪一半有序，然后判断 `target` 是否落在该有序半边；若否，去另一半。

你的代码（含注释）：

```java
// 解法1：在当前区间内，至少有一边是有序的；按落区推进
class Solution {
    public int search(int[] nums, int target) {
        int left = 0, right = nums.length - 1;
        while(left <= right){
            int mid = (left + right) >>> 1; // 中点（注意极大索引时可改用 left + (right-left)/2）
            if(nums[mid] == target){
                return mid; // 命中
            }
            if(nums[left] <= nums[mid]){ // 左半有序
                if(nums[left] <= target && nums[mid] > target){
                    right = mid - 1; // 目标在左半
                }else {
                    left = mid + 1; // 目标在右半
                }
            }else{ // 右半有序
                if(nums[mid] < target && nums[right] >= target){
                    left = mid + 1; // 目标在右半
                }else{
                    right = mid - 1; // 目标在左半
                }
            }
        }
        return -1;   
    }
}
```

重点解释：
- `nums[left] <= nums[mid]` 判定左半有序；否则右半有序。由于无重复，等号安全。
- 落区判断用“闭开/闭闭”的不等式组合，避免漏掉边界；每次更新须排除 `mid` 自身以收敛。

关键步骤：
1. 计算中点 `mid`，命中则返回。
2. 判断左半是否有序：`nums[left] <= nums[mid]`。
   - 若左半有序，且 `nums[left] <= target < nums[mid]`，则目标在左半：`right = mid - 1`；否则 `left = mid + 1`。
3. 否则右半有序：
   - 若 `nums[mid] < target <= nums[right]`，则 `left = mid + 1`；否则 `right = mid - 1`。

复杂度：时间 \(O(\log n)\)，空间 \(O(1)\)。

优点：一次循环、代码短、常作为 LC33 的“标准写法”。

注意：条件边界需小心使用“闭/开”关系，上式采用左闭右闭的严格不等与不等号组合，避免漏解。

---

## 解法二：先找枢轴 pivot（断点判定：`nums[mid] > nums[mid+1]`），再常规二分

流程：
1. 通过 `findRotateIndex` 找最小元素索引（旋转点）。若数组本身有序（`nums[left] < nums[right]`），返回 `0`。
2. 根据 `target` 与 `nums[0]` 的大小关系，决定在 `[0, pivot-1]` 或 `[pivot, n-1]` 上用标准二分查找。

你的代码（含注释）：

```java
// 解法2：先找 pivot，再在正确区间做标准二分
class Solution {
    public int search(int[] nums, int target) {
        int left = 0, right = nums.length - 1;
        int rotateIndex = findRotateIndex(nums); // 旋转点（最小值索引）
        if (rotateIndex == 0) {
            return binarySearch(nums, left, right, target); // 未旋转，直接二分
        }
        if(nums[0] <= target){
            return binarySearch(nums,0,rotateIndex - 1,target); // 在左段
        }else{
            return binarySearch(nums,rotateIndex,right,target); // 在右段
        }
    }

    int findRotateIndex(int[] nums){
        int left = 0, right = nums.length - 1;
        if(nums[left] < nums[right]) return 0; // 已有序
        while(left <= right){
            int mid = (left + right) >>> 1; 
            if(mid < nums.length - 1 && nums[mid] > nums[mid + 1]){ // 断点：下降处的右侧即最小值
                return mid + 1;
            }else if(nums[mid] >= nums[left]){ // mid 在左有序段
                left = mid + 1;
            }else{ // mid 在右无序段
                right = mid - 1;
            }
        }
        return 0;
    }

    int binarySearch(int[] nums, int left, int right, int target){
        while(left <= right){
            int mid = (left + right) >>> 1;
            if(nums[mid] == target) return mid;
            else if(nums[mid] > target) right = mid -1;
            else left = mid + 1;
        }
        return -1;
    }
}
```

pivot 边界控制要点：
- `mid < n - 1` 防止访问 `nums[mid+1]` 越界；
- 若数组全升序，提前返回 `0`；
- 用 `>=` 将 `mid` 归为“左段”，避免停滞；更新指针必须排除 `mid`。

`findRotateIndex` 关键逻辑：
- 若 `mid < n-1 && nums[mid] > nums[mid+1]`，则 `mid+1` 即为最小元素（枢轴），直接返回。
- 否则根据 `nums[mid] >= nums[left]` 判断 `mid` 落在“左有序段”，则 `left = mid + 1`；否则在“右无序段”，`right = mid - 1`。

复杂度：找枢轴 \(O(\log n)\) + 一次二分 \(O(\log n)\)；总 \(O(\log n)\)。

优点：分而治之，概念清晰；枢轴可复用（如还需最小值、偏移等）。

风险点：需要小心 `mid + 1` 的越界与条件选择（仅适用于“无重复”数组）。

---

## 解法三：先找枢轴 pivot（右端对比收敛法），再常规二分

与解法二相同的总体思路，但 `findRotateIndex` 采用“与 `right` 对比”的经典收敛法（同 LC153）：

你的代码（含注释）：

```java
// 解法3：与右端比较收敛找最小值索引 pivot
class Solution {
    public int search(int[] nums, int target) {
        int left = 0, right = nums.length - 1;
        int rotateIndex = findRotateIndex(nums); // 最小值索引
        if (rotateIndex == 0) {
            return binarySearch(nums, left, right, target);
        }
        if(nums[0] <= target){
            return binarySearch(nums,0,rotateIndex - 1,target);
        }else{
            return binarySearch(nums,rotateIndex,right,target);
        }
    }

    int findRotateIndex(int[] nums){
        int left = 0, right = nums.length - 1;
        if(nums[left] < nums[right]) return 0; // 未旋转
        while(left < right){ // 收敛到单点
            int mid = (left + right) >>> 1; 
            if(nums[mid] > nums[right]){ // 最小值在右侧（不含 mid）
                left = mid  + 1;
            }else { // 最小值在左侧（含 mid）
                right = mid;
            }
        }
        return left; // 即最小值索引
    }

    int binarySearch(int[] nums, int left, int right, int target){
        while(left <= right){
            int mid = (left + right) >>> 1;
            if(nums[mid] == target) return mid;
            else if(nums[mid] > target) right = mid -1;
            else left = mid + 1;
        }
        return -1;
    }
}
```

`findRotateIndex` 核心：
- 若数组已整体有序（`nums[left] < nums[right]`），返回 `0`。
- 迭代条件 `while (left < right)`：
  - 取 `mid`，若 `nums[mid] > nums[right]`，说明最小值在右侧（不含 `mid`），`left = mid + 1`；
  - 否则最小值在左侧（含 `mid`），`right = mid`。
- 循环结束返回 `left`（即最小元素索引）。

复杂度：同解法二，总 \(O(\log n)\)。

优点：无需访问相邻元素，不涉及 `mid + 1`；区间收敛性质好，代码更短更稳健。若扩展到“有重复”的版本（LC154），只需在相等时 `right--` 处理退化。

---

## 解法四：偏移映射一次二分（先求 pivot，再在“虚拟有序数组”上二分）

你的代码（含注释）：

```java
// 解法4：求 pivot 后，映射到“复位”的有序视图上做一次二分
class Solution {
    public int search(int[] nums, int target) {
        int left = 0, right = nums.length - 1;
        int rotateIndex = findRotateIndex(nums);
        while(left <= right){
            int mid = (left + right) >>> 1;
            int real = (mid + rotateIndex) % nums.length; // 偏移映射到真实索引
            if(nums[real] == target) return real;
            else if(nums[real] > target) {
                right = mid - 1;
            }else{
                left = mid + 1;
            }
        }
        return -1;
    }

    int findRotateIndex(int[] nums){
        int left = 0, right = nums.length - 1;
        if(nums[left] < nums[right]) return 0;
        while(left < right){
            int mid = (left + right) >>> 1; 
            if(nums[mid] > nums[right]){
                left = mid  + 1;
            }else {
                right = mid;
            }
        }
        return left;
    }
}
```

思想：先用解法三的 `findRotateIndex` 得到 `pivot`，随后对索引区间 `[0, n-1]` 做一次标准二分，但比较时映射到原数组的“真实索引”：

```java
int real = (mid + rotateIndex) % nums.length;
```

如此等效于在“已旋转数组复位后的有序视图”上直接二分。

复杂度：找枢轴 \(O(\log n)\) + 一次二分 \(O(\log n)\)。

优点：思路整洁统一；在需要对“旋转视图”做多种有序操作时（如 lower/upper_bound）很方便。

---

## 解法二 vs 解法三：两种 pivot 寻找法的差异（重点）

- 思想差异：
  - 解法二：寻找“断点”本身，使用相邻比较 `nums[mid] > nums[mid+1]` 判断是否越过下降边界；
  - 解法三：不找断点，找“最小值”的索引。通过 `nums[mid]` 与 `nums[right]` 的相对大小，判定最小值落在哪侧区间，区间收敛到单点。

- 边界与健壮性：
  - 解法二需要 `mid + 1` 判越界，且逻辑依赖“无重复”（有重复时 `>=`/`>` 的选择影响路径）；
  - 解法三不访问相邻元素，模板化程度更高；若有重复，可用 `if (nums[mid] == nums[right]) right--;` 处理退化到 \(O(n)\) 最坏，但普适性更强。

- 实现复杂度：
  - 解法二条件分支较多，易出边界 bug；
  - 解法三语义清晰、代码更短，面试中更不易出错。

- 性能：两者均为 \(O(\log n)\)；常数因子相近，实践差异极小。

---

## 解法三的 pivot 查找：逐步演示

以 `nums = [4,5,6,7,0,1,2]` 为例：

| 轮次 | left | right | mid | nums[mid] | 与 nums[right] 比较 | 结论 | 新区间 |
|---:|---:|---:|---:|:---:|:---:|:---|:---|
| 1 | 0 | 6 | 3 | 7 | 7 > 2 | 最小值在右侧（不含 mid） | left = 4 |
| 2 | 4 | 6 | 5 | 1 | 1 <= 2 | 最小值在左侧（含 mid） | right = 5 |
| 3 | 4 | 5 | 4 | 0 | 0 <= 1 | 最小值在左侧（含 mid） | right = 4 |
| 终止 | 4 | 4 | - | - | - | 收敛 | pivot = 4 |

边界注意：
- 使用 `while (left < right)` 避免与相邻访问相关的越界；
- 将“最小值在左侧”写成 `right = mid`（包含 mid），确保不会跳过最小值；
- 将“最小值在右侧”写成 `left = mid + 1`，排除 mid 以保证收敛。

---

## 复杂度与边界用例

- 四种方法时间复杂度均为 \(O(\log n)\)，空间 \(O(1)\)。
- 边界：
  - `n = 1`、`target` 为首尾、未旋转（单调有序）、旋转点在两端（近似未旋转）。
  - 本题假设“无重复”。若允许重复（LC81/154），需在有序性/收敛策略中做额外处理，最坏可能退化到 \(O(n)\)。

---

## 优劣对比与选择建议

- 解法一（一次二分）：
  - **优点**：代码短、无需显式求 pivot、执行一次循环即可完成；
  - **缺点**：每轮分支判断略多，条件边界需仔细校验。

- 解法二（断点式 pivot + 二分）：
  - **优点**：思路直观，先定位 pivot 再常规二分，便于讲解与复用 pivot；
  - **缺点**：相邻元素比较易出边界问题；对重复元素不稳健；代码冗长些。

- 解法三（右端对比式 pivot + 二分）：
  - **优点**：模板稳定，代码更简洁，不依赖相邻元素；易扩展到“有重复”的场景；
  - **缺点**：仍需两段流程（找 pivot + 二分）。

- 解法四（偏移映射一次二分）：
  - **优点**：统一视角，便于在“复位后的有序视图”上做更多操作；
  - **缺点**：仍需先求 pivot；对初学者可读性稍弱。

选择建议：
- 面试快速稳妥：优先解法一（无需额外函数）。
- 需要复用 pivot 或希望模板化：选解法三（pivot 模板更稳健）。
- 想统一“旋转→有序视图”的抽象：解法四。

### 四种方法对比表

| 项目 | 解法一：一次二分 | 解法二：断点式 pivot + 二分 | 解法三：右端对比式 pivot + 二分 | 解法四：偏移映射一次二分 |
|:--|:--|:--|:--|:--|
| 思路 | 每轮判断哪侧有序并落区推进 | 先找断点（最小值右邻），再标准二分 | 与右端比较收敛到最小值，再标准二分 | 先找 pivot，再对“复位视图”做一次二分 |
| 代码长度 | 短 | 中 | 中 | 中 |
| 易错点 | 区间与不等式边界 | `mid+1` 越界、条件选择 | 边界较稳，无相邻访问 | 需掌握索引偏移映射 |
| 适配重复元素 | 需额外处理，可能退化 | 不稳健 | 可在相等时 `right--` 退化处理 | 与 pivot 寻找法一致 |
| 复杂度 | 时间/空间：\(O(\log n)/O(1)\) | \(O(\log n)/O(1)\) | \(O(\log n)/O(1)\) | \(O(\log n)/O(1)\) |
| 可复用性 | 一次性查值 | 可复用 pivot（最小值等） | 可复用 pivot，模板化强 | 统一抽象，便于扩展 lower/upper_bound |
| 面试推荐 | 强烈推荐 | 备选 | 强烈推荐（找最小值模板） | 进阶/抽象化选择 |

---

## 小示例（解法一执行流程）

数组 `nums = [4,5,6,7,0,1,2]`，`target = 0`

| 轮次 | left | right | mid | nums[mid] | 左半有序? | 走向 |
|---:|---:|---:|---:|:---:|:---:|:---|
| 1 | 0 | 6 | 3 | 7 | 是 | 目标不在 `[4,7)` → `left = 4` |
| 2 | 4 | 6 | 5 | 1 | 否 | 右半有序，目标不在 `(1,2]` → `right = 4` |
| 3 | 4 | 4 | 4 | 0 | - | 命中 |

---

## 总结

四种写法本质一致：利用“至少一侧有序”或“找到最小值索引”这一结构性特征，将问题还原为标准二分。实际工程/面试中，建议熟练掌握：
1) 一次二分（解法一）作为主模板；
2) 右端对比式 pivot（解法三）作为找最小值/旋转点的通用模板；
3) 需要进一步抽象时，使用偏移映射（解法四）。

