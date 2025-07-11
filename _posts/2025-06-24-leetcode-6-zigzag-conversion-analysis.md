---
layout: post
title: "LeetCode 6 Zigzag Conversion - 三种解法深度分析"
date: "2025-06-24"
category: "算法题解"
toc: true
excerpt: "深入分析LeetCode第6题Zigzag Conversion的三种解法：模拟法、按行遍历法和数学公式法，重点解释数学公式法的推导过程"
tags: [Algorithm, LeetCode, Java, 字符串处理]
comments: true
author: zempty
---

## 题目描述

将一个给定字符串 `s` 根据给定的行数 `numRows`，以从上往下、从左到右进行 Z 字形排列。

比如输入字符串为 `"PAYPALISHIRING"` 行数为 `3` 时，排列如下：

```
P   A   H   R
A P L S I I G
Y   I   N
```

之后，你的输出需要从左往右逐行读取，产生出一个新的字符串，比如：`"PAHNAPLSIIGYIR"`。

## 三种解法概述

### 解法1：模拟法（Direction Simulation）

**核心思想**：模拟Z字形的行走路径，使用方向标志控制当前字符应该放在哪一行。

```java
class Solution {
    public String convert(String s, int numRows) {
        if(numRows == 1 || s.length() <= numRows) return s;
        StringBuilder[] builds = new StringBuilder[numRows];
        for(int i=0; i<numRows;i++){
            builds[i] = new StringBuilder();
        }
        boolean downOrUp = false;
        int currRow = 0;
        for(char curr : s.toCharArray()){
            builds[currRow].append(curr);
            if(currRow == 0 || currRow == numRows -1){
                downOrUp = !downOrUp;
            }
            currRow += downOrUp ? 1 : -1;
        }

        StringBuilder result = new StringBuilder();
        for(var build : builds){
            result.append(build);
        }
        return result.toString();
    }
}
```

**执行流程分析**：

| 字符 | 当前行 | 方向 | 下一行 | 说明 |
|------|--------|------|--------|------|
| P | 0 | down | 1 | 在第0行，改变方向为向下 |
| A | 1 | down | 2 | 继续向下 |
| Y | 2 | up | 1 | 在最后一行，改变方向为向上 |
| P | 1 | up | 0 | 继续向上 |
| A | 0 | down | 1 | 在第0行，改变方向为向下 |

### 解法2：按行遍历法（Row by Row）

**核心思想**：模拟Z字形的填充过程，先向下填满一列，再向上填充到第二行，如此循环。

```java
class Solution {
    public String convert(String s, int numRows) {
       if(numRows == 1 || s.length()<=numRows) return s;
       StringBuilder[] builds = new StringBuilder[numRows];
       for(int i = 0; i < numRows; i++){
        builds[i] = new StringBuilder();
       }
       int n = s.length();
       int index = 0;
       while(index < n){
        // 向下填充：0 -> numRows-1
        for(int i = 0 ; i < numRows && index < n; i++){
            builds[i].append(s.charAt(index++));
        }
        // 向上填充：numRows-2 -> 1
        for(int j = numRows - 2; j >= 1 && index < n; j--){
            builds[j].append(s.charAt(index++));
        }
       }
       StringBuilder result = new StringBuilder();
       for(var build : builds){
        result.append(build);
       }
       return result.toString();
    }
}
```

**执行流程分析**（以 `numRows=3` 为例）：

| 轮次 | 向下填充 | 向上填充 | 索引变化 |
|------|----------|----------|----------|
| 1 | 0→1→2 (P,A,Y) | 1 (P) | 0→3 |
| 2 | 0→1→2 (A,L,I) | 1 (S) | 4→7 |
| 3 | 0→1→2 (H,I,N) | 1 (I) | 8→11 |

### 解法3：数学公式法（Mathematical Pattern）

**核心思想**：通过数学分析找出Z字形排列的规律，直接计算每行字符在原字符串中的位置。

```java
class Solution {
    public String convert(String s, int numRows) {
      if(numRows == 1 || s.length() <= numRows) return s;
      int cycleRange = 2 * numRows - 2;
      StringBuilder result = new StringBuilder();
      int n = s.length();
      for(int i = 0; i < numRows; i++){
        for(int j = 0 ; j + i < n ; j+=cycleRange){
            result.append(s.charAt(j+i));
            if(i>0 && i < numRows - 1 && j + cycleRange -i < n){
                result.append(s.charAt(j+cycleRange-i));
            }
        }
      }
      return result.toString();
    }
}
```

## 解法3的数学推导过程

### 第一步：发现周期性规律

观察Z字形排列，以 `numRows=4` 为例：

```
P     I     N
A   L S   I G
Y A   H R
P     I
```

原字符串索引分布：
```
0     6     12
1   5 7   11 13
2 4   8 10
3     9
```

**关键发现**：每个完整的Z字形周期包含 `2*numRows-2` 个字符。

### 第二步：分析周期长度

一个完整的Z字形包括：
- 向下的一列：`numRows` 个字符
- 向上的对角线：`numRows-2` 个字符（不包括第一行和最后一行）

因此周期长度：`cycleRange = numRows + (numRows-2) = 2*numRows-2`

### 第三步：分析每行的字符分布

#### 第一行和最后一行（边界行）
- **特点**：每个周期内只有一个字符
- **位置规律**：第`k`个周期的字符位置为 `k * cycleRange + i`（其中`i`为行号）

#### 中间行
- **特点**：每个周期内有两个字符
- **第一个字符**：向下时经过的字符，位置为 `k * cycleRange + i`
- **第二个字符**：向上时经过的字符，位置为 `k * cycleRange + (cycleRange - i)`

### 第四步：推导具体公式

对于第`i`行（`0 ≤ i < numRows`），第`k`个周期（`k ≥ 0`）：

1. **所有行都有的字符**：位置 = `k * cycleRange + i`

2. **中间行额外的字符**（当 `0 < i < numRows-1` 时）：
   位置 = `k * cycleRange + (cycleRange - i)`
   = `k * cycleRange + (2*numRows-2-i)`

### 第五步：代码实现解析

```java
for(int i = 0; i < numRows; i++){                    // 遍历每一行
    for(int j = 0 ; j + i < n ; j+=cycleRange){      // j表示每个周期的起始位置
        result.append(s.charAt(j+i));                // 添加该行在当前周期的第一个字符
        
        // 中间行需要添加第二个字符
        if(i>0 && i < numRows - 1 && j + cycleRange -i < n){
            result.append(s.charAt(j+cycleRange-i));
        }
    }
}
```

### 第六步：执行过程示例

以 `s="PAYPALISHIRING"`, `numRows=3` 为例：

- `cycleRange = 2*3-2 = 4`

**第0行**：
- 周期0: `j=0`, 字符索引 `0+0=0` → 'P'
- 周期1: `j=4`, 字符索引 `4+0=4` → 'A'
- 周期2: `j=8`, 字符索引 `8+0=8` → 'H'
- 周期3: `j=12`, 字符索引 `12+0=12` → 'R'

**第1行**：
- 周期0: `j=0`, 字符索引 `0+1=1` → 'A', 额外字符索引 `0+4-1=3` → 'P'
- 周期1: `j=4`, 字符索引 `4+1=5` → 'L', 额外字符索引 `4+4-1=7` → 'S'
- 周期2: `j=8`, 字符索引 `8+1=9` → 'I', 额外字符索引 `8+4-1=11` → 'I'
- 周期3: `j=12`, 字符索引 `12+1=13` → 'G'

**第2行**：
- 周期0: `j=0`, 字符索引 `0+2=2` → 'Y'
- 周期1: `j=4`, 字符索引 `4+2=6` → 'I'
- 周期2: `j=8`, 字符索引 `8+2=10` → 'N'

最终结果：`"PAHNAPLSIIGYIR"`

## 三种解法对比

| 解法 | 时间复杂度 | 空间复杂度 | 优点 | 缺点 |
|------|------------|------------|------|------|
| 模拟法 | O(n) | O(n) | 直观易懂，模拟真实过程 | 需要额外的方向控制逻辑 |
| 按行遍历法 | O(n) | O(n) | 逻辑清晰，易于实现 | 仍然是模拟过程 |
| 数学公式法 | O(n) | O(1) | 效率最高，直接计算 | 公式推导复杂，理解困难 |

## 总结

1. **模拟法**适合初学者理解问题，通过模拟实际的Z字形填充过程来解决问题
2. **按行遍历法**将问题简化为向下和向上两个过程的循环，思路更清晰
3. **数学公式法**通过发现规律直接计算结果，是最优雅的解法，但需要较强的数学分析能力

在实际面试中，建议先用模拟法快速解决问题，然后尝试优化为数学公式法，展现更深层的思考能力。

