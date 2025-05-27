---
layout: post
title: "LeetCode 13. Roman to Integer - 三种解法详细分析"
date: "2025-05-27"
toc: true
excerpt: "深入分析LeetCode第13题罗马数字转整数问题，详细对比三种不同的解法思路，包括从左到右遍历、从右到左遍历和优化的字符数组方法，分析各自的时间复杂度和空间复杂度。"
tags: [Algorithm, LeetCode, Java, 字符串处理]
comments: true
author: zempty
---

## 题目描述

LeetCode 第13题：Roman to Integer（罗马数字转整数）

罗马数字包含以下七种字符: `I`, `V`, `X`, `L`, `C`, `D` 和 `M`。

| 字符 | 数值 |
|------|------|
| I    | 1    |
| V    | 5    |
| X    | 10   |
| L    | 50   |
| C    | 100  |
| D    | 500  |
| M    | 1000 |

例如， 罗马数字 2 写做 `II` ，即为两个并列的 1。12 写做 `XII` ，即为 `X` + `I` + `I` 。 27 写做  `XXVII`, 即为 `XX` + `V` + `II` 。

通常情况下，罗马数字中小的数字在大的数字的右边。但也存在特例，例如 4 不写做 `IIII`，而是 `IV`。数字 1 在数字 5 的左边，所表示的数等于大数 5 减小数 1 得到的数值 4 。同样地，数字 9 表示为 `IX`。这个特殊的规则只适用于以下六种情况：

- `I` 可以放在 `V` (5) 和 `X` (10) 的左边，来表示 4 和 9。
- `X` 可以放在 `L` (50) 和 `C` (100) 的左边，来表示 40 和 90。 
- `C` 可以放在 `D` (500) 和 `M` (1000) 的左边，来表示 400 和 900。

给定一个罗马数字，将其转换成整数。输入确保在 1 到 3999 的范围内。

## 题目分析

### 核心规律

罗马数字的核心规律是：
1. **正常情况**：小数字在大数字右边时，进行加法运算
2. **特殊情况**：小数字在大数字左边时，进行减法运算

### 关键思路

解决这个问题的关键在于如何处理减法情况。有两种主要思路：
1. **从左到右遍历**：当发现当前字符对应的值小于下一个字符时，进行减法
2. **从右到左遍历**：当发现当前字符对应的值小于前一个字符时，进行减法

## 解法一：从左到右遍历（预判法）

```java
class Solution {
    public int romanToInt(String s) {
        Map<String,Integer> romes = new HashMap<>();
        romes.put("I", 1);
        romes.put("V",5);
        romes.put("X",10);
        romes.put("L",50);
        romes.put("C",100);
        romes.put("D",500);
        romes.put("M",1000);
        int total = 0;
        for(int i = 0; i < s.length(); i++){
            String current = s.substring(i,i+1);
            if(i+1 < s.length()){
                String next = s.substring(i+1,i+2);
                if(romes.get(next) > romes.get(current)){
                    total -= romes.get(current);
                    continue;
                }
            }
            total += romes.get(current);
        }
        return total;
    }
}
```

### 算法思路

1. 创建HashMap存储罗马字符与数值的映射关系
2. 从左到右遍历字符串
3. 对于每个字符，检查下一个字符是否存在且值更大
4. 如果下一个字符值更大，当前字符进行减法操作
5. 否则进行加法操作

### 执行流程示例

以 "MCMXC" (1990) 为例：

| 步骤 | i | current | next | 比较结果 | 操作 | total |
|------|---|---------|------|----------|------|-------|
| 1    | 0 | M(1000) | C(100) | 1000 > 100 | +1000 | 1000 |
| 2    | 1 | C(100)  | M(1000) | 100 < 1000 | -100 | 900 |
| 3    | 2 | M(1000) | X(10) | 1000 > 10 | +1000 | 1900 |
| 4    | 3 | X(10)   | C(100) | 10 < 100 | -10 | 1890 |
| 5    | 4 | C(100)  | null | 无下一个 | +100 | 1990 |

### 复杂度分析

- **时间复杂度**：O(n)，其中 n 是字符串长度
- **空间复杂度**：O(1)，HashMap 大小固定为7

## 解法二：从右到左遍历（回溯法）

```java
class Solution {
    public int romanToInt(String s) {
        Map<String,Integer> romes = new HashMap<>();
        romes.put("I", 1);
        romes.put("V",5);
        romes.put("X",10);
        romes.put("L",50);
        romes.put("C",100);
        romes.put("D",500);
        romes.put("M",1000);
        int total = 0;
        for(int i = s.length() - 1; i >= 0; i--){
            String current = s.substring(i,i+1);
            total += romes.get(current);
            if(i - 1 >= 0 && romes.get(s.substring(i-1,i)) < romes.get(current)){
                total -= romes.get(s.substring(i-1,i));
                i--;
            }
        }
        return total;
    }
}
```

### 算法思路

1. 从右到左遍历字符串
2. 先将当前字符的值加到总和中
3. 检查前一个字符是否存在且值更小
4. 如果前一个字符值更小，说明是减法情况，减去前一个字符的值
5. 同时跳过前一个字符（i--）

### 执行流程示例

以 "MCMXC" (1990) 为例：

| 步骤 | i | current | prev | 操作 | total |
|------|---|---------|------|------|-------|
| 1    | 4 | C(100)  | X(10) | +100, 发现X<C, -10, i-- | 90 |
| 2    | 2 | M(1000) | C(100) | +1000, 发现C<M, -100, i-- | 990 |
| 3    | 0 | M(1000) | null | +1000 | 1990 |

### 复杂度分析

- **时间复杂度**：O(n)，其中 n 是字符串长度
- **空间复杂度**：O(1)，HashMap 大小固定为7

## 解法三：优化的字符数组方法

```java
class Solution {
    public int romanToInt(String s) {
        char[] romes = s.toCharArray();
        int total = 0;
        int prev = getNums(romes[romes.length - 1]);
        total += prev;
        for(int i = romes.length - 2; i>=0; i--){
            int current = getNums(romes[i]);
            if(current < prev){
                total -= current;
            }else{
                total += current;
            }
            prev = current;
        }
        return total;
    }

    int getNums(char c){
        int result = switch(c){
            case 'I' -> 1;
            case 'V' -> 5;
            case 'X' -> 10;
            case 'L' -> 50;
            case 'C' -> 100;
            case 'D' -> 500;
            case 'M' -> 1000;
            default -> 0;
        };
        return result;
    }
}
```

### 算法思路

1. 将字符串转换为字符数组，避免重复的substring操作
2. 从右到左遍历，维护前一个字符的值
3. 比较当前字符值与前一个字符值的大小关系
4. 如果当前值小于前一个值，进行减法；否则进行加法
5. 使用switch表达式替代HashMap，提高查找效率

### 执行流程示例

以 "MCMXC" (1990) 为例：

| 步骤 | i | current | prev | 比较 | 操作 | total |
|------|---|---------|------|------|------|-------|
| 初始 | 4 | C(100)  | - | - | +100 | 100 |
| 1    | 3 | X(10)   | 100 | 10 < 100 | -10 | 90 |
| 2    | 2 | M(1000) | 10 | 1000 > 10 | +1000 | 1090 |
| 3    | 1 | C(100)  | 1000 | 100 < 1000 | -100 | 990 |
| 4    | 0 | M(1000) | 100 | 1000 > 100 | +1000 | 1990 |

### 复杂度分析

- **时间复杂度**：O(n)，其中 n 是字符串长度
- **空间复杂度**：O(n)，字符数组的空间

## 三种解法对比分析

### 性能对比

| 解法 | 时间复杂度 | 空间复杂度 | 优点 | 缺点 |
|------|------------|------------|------|------|
| 解法一 | O(n) | O(1) | 逻辑直观，易理解 | 多次substring操作，性能较差 |
| 解法二 | O(n) | O(1) | 空间效率高 | 逻辑复杂，需要跳过字符 |
| 解法三 | O(n) | O(n) | 性能最优，代码简洁 | 额外的字符数组空间 |

### 代码质量分析

1. **可读性**：解法一 > 解法三 > 解法二
2. **性能**：解法三 > 解法二 > 解法一
3. **内存使用**：解法一 = 解法二 > 解法三

### 实际应用建议

- **面试场景**：推荐解法三，展示对性能优化的理解
- **生产环境**：推荐解法三，性能最优且代码简洁
- **学习理解**：推荐解法一，逻辑最直观

## 总结

LeetCode 第13题考查的是字符串处理和逻辑思维能力。三种解法都能正确解决问题，但在性能和代码质量上有所差异：

1. **解法一**采用预判的方式，逻辑最直观但性能较差
2. **解法二**采用回溯的方式，空间效率高但逻辑复杂
3. **解法三**采用优化的数组方式，在性能和代码简洁性上达到最佳平衡

在实际应用中，建议选择解法三，它不仅性能最优，而且代码简洁易维护。同时，这道题也提醒我们在处理字符串时要注意避免不必要的substring操作，合理使用字符数组和switch语句可以显著提升性能。

