---
layout: post
title: "LeetCode 68. 文本左右对齐 (Text Justification) 详细题解"
date: "2025-08-06"
toc: true
excerpt: "本文详细分析了 LeetCode 第 68 题 '文本左右对齐' 的解题思路和实现细节。通过贪心算法，我们逐行构建格式化后的文本，并重点处理了空格分配、最后一行以及单单词行的边界情况。"
tags: [Algorithm, LeetCode, String, Greedy]
comments: true
author: zempty
---

## 题目描述

给定一个单词数组 `words` 和一个长度 `maxWidth`，重新排版单词，使其成为每行恰好有 `maxWidth` 个字符，且左右两端对齐的文本。

你需要使用贪心算法来放置给定的单词；也就是说，尽可能多地往每行中放置单词。必要时可用空格 `' '` 填充，使得每行恰好有 `maxWidth` 个字符。

要求尽可能均匀地分配单词间的空格。如果某一行单词间的空格不能均匀分配，则左侧放置的空格数要多于右侧的空格数。

文本的最后一行应为左对齐，且单词之间不插入额外的空格。

**注意:**

*   单词是指由非空格字符组成的字符序列。
*   每个单词的长度大于 0，小于等于 `maxWidth`。
*   输入单词数组 `words` 不包含前导或尾随空格。
*   `words[0].length` <= `maxWidth`
*   至少有一个单词。

## 解题思路

这道题的核心是 **贪心策略**。我们每次都尽可能多地选择单词放入当前行，直到再放一个单词就会超出 `maxWidth` 为止。当确定了一行的单词后，我们再根据这一行是普通行还是特殊行（最后一行或单单词行）来分配空格。

具体步骤如下：

1.  **确定每行的单词**：使用一个指针 `i` 指向当前行的第一个单词，另一个指针 `j` 向后遍历，以确定当前行能容纳多少个单词。
2.  **分配空格**：
    *   **普通行**：如果当前行不是最后一行，并且包含多个单词，我们需要均匀地分配空格。计算出总共需要的空格数，然后计算每个单词间隙平均可以放多少个空格，以及多余的空格数。将多余的空格从左到右依次分配给每个间隙。
    *   **特殊行**：如果当前行是最后一行，或者只包含一个单词，那么它需要左对齐。单词之间只用一个空格隔开，行尾用空格填充至 `maxWidth`。
3.  **循环处理**：重复以上步骤，直到所有单词都被处理完毕。

## 代码实现

```java
class Solution {
    public List<String> fullJustify(String[] words, int maxWidth) {
        List<String> result = new ArrayList<>();
        int n = words.length;
        int i = 0;
        while(i < n){
            int j = i + 1;
            int len = words[i].length();
            while(j < n && len + words[j].length() + (j - i - 1) < maxWidth){
                len += words[j].length();
                j++;
            }
            int numWords = j - i;
            StringBuilder line = new StringBuilder();
            if(j==n || numWords==1){
                for(int k = i; k < j; k++){
                    line.append(words[k]);
                    if(k<j-1){
                        line.append(" ");
                    }
                }
                while(line.length() < maxWidth){
                    line.append(" ");
                }
            }else{
                int totalSpaces = maxWidth - len;
                int wordSpaces = totalSpaces / (numWords - 1);
                int extraSpaces = totalSpaces % (numWords - 1);
                for(int k = i; k < j; k++){
                    line.append(words[k]);
                    if(k < j - 1){
                        int realSpaces = wordSpaces + (k - i < extraSpaces ? 1 : 0);
                        for(int l = 0; l < realSpaces; l++){
                            line.append(" ");
                        }
                    }
                }
            }
            result.add(line.toString());
            i = j;
        }
        return result;
    }
}
```

## 核心逻辑详解

接下来，我们详细分析代码中的核心逻辑。

### 1. `while(j < n && len + words[j].length() + (j - i - 1) < maxWidth)` 详解

这个 `while` 循环的目的是确定当前行能容纳哪些单词。

*   `i` 是当前行第一个单词的索引。
*   `j` 是一个试探性的指针，用来指向下一个要尝试放入该行的单词。
*   `len` 记录了从 `words[i]` 到 `words[j-1]` 这些单词的纯字符总长度。

循环条件 `len + words[j].length() + (j - i - 1) < maxWidth` 是这道题最关键的部分之一。我们来分解它：

*   `len`: 已经放入行的单词的总长度。
*   `words[j].length()`: 准备要放入的新单词的长度。
*   `(j - i - 1)`: **这部分是理解的关键**。如果我们要放入第 `j` 个单词（即 `words[j]`），那么从 `words[i]` 到 `words[j]` 之间将会有 `j - i` 个单词，它们之间有 `j - i - 1` 个间隙。例如，如果行内有 `words[i]` 和 `words[i+1]`，它们之间有1个间隙。为了满足文本对齐的基本要求，每个间隙**至少需要一个空格**。所以，`(j - i - 1)` 代表了将 `words[j]` 放入本行后，所需要的**最少空格数**。

**举例分析：**
假设 `maxWidth = 20`, `i = 0`, `words[0]="This"`, `words[1]="is"`, `words[2]="an"`.

1.  **初始状态**: `i=0`, `j=1`, `len = words[0].length() = 4`.
2.  **尝试放入 `words[1]` ("is")**:
    *   `j=1`
    *   `len` (当前单词总长) = 4
    *   `words[1].length()` = 2
    *   最少空格数 `j - i - 1` = `1 - 0 - 1` = 0 (因为只有1个单词间隙)
    *   总长度 = `4 + 2 + 0 = 6`. `6 < 20`，成立。
    *   可以放入。更新 `len`: `len = 4 + 2 = 6`。`j` 变为 2。
3.  **尝试放入 `words[2]` ("an")**:
    *   `j=2`
    *   `len` (当前单词总长) = 6
    *   `words[2].length()` = 2
    *   最少空格数 `j - i - 1` = `2 - 0 - 1` = 1 (现在有2个间隙需要最少1个空格)
    *   总长度 = `6 + 2 + 1 = 9`. `9 < 20`，成立。
    *   可以放入。更新 `len`: `len = 6 + 2 = 8`。`j` 变为 3。

假如 `words[3]="example"`，长度为 7。
4.  **尝试放入 `words[3]` ("example")**:
    *   `j=3`
    *   `len` (当前单词总长) = 8
    *   `words[3].length()` = 7
    *   最少空格数 `j - i - 1` = `3 - 0 - 1` = 2
    *   总长度 = `8 + 7 + 2 = 17`. `17 < 20`，成立。
    *   可以放入。更新 `len`: `len = 8 + 7 = 15`。`j` 变为 4。

... 以此类推，直到条件不满足，循环结束。

### 2. `int numWords = j - i;` 如何理解？

这个非常直接。`i` 是当前行第一个单词的索引，当 `while` 循环结束时，`j` 指向的是**下一个**不能被放入当前行的单词的索引。

因此，当前行的单词索引范围是 `[i, i+1, ..., j-1]`。

这是一个左闭右开的区间 `[i, j)`。区间的长度，也就是单词的数量，就是 `j - i`。

**举例分析：**
假设循环结束后，`i = 3`, `j = 7`。

*   这意味着当前行的单词是 `words[3]`, `words[4]`, `words[5]`, `words[6]`。
*   `words[7]` 因为太长而无法放入。
*   单词数量 `numWords` = `7 - 3 = 4`。

### 3. `k - i < extraSpaces` 如何理解？

这行代码用于处理空格的非均匀分配。

当一行确定下来后（并且它不是特殊行），我们需要在单词之间填充空格。

*   `numWords = j - i`: 当前行的单词数。
*   `len`: 当前行所有单词的纯字符总长度。
*   `totalSpaces = maxWidth - len`: 需要填充的总空格数。
*   `numWords - 1`: 单词间的间隙数量。例如，4个单词有3个间隙。
*   `wordSpaces = totalSpaces / (numWords - 1)`: 每个间隙**平均**能分到的空格数。
*   `extraSpaces = totalSpaces % (numWords - 1)`: 平均分配后，**剩余的**、需要额外分配的空格数。

题目要求，如果空格不能均分，多余的空格要从左边的间隙开始依次分配。

`k` 是 `for` 循环中当前单词的索引，范围是 `[i, j-1]`。
`k - i` 表示当前单词相对于行首的位置（从0开始计数）。

*   当 `k=i` 时，`k-i=0`，处理第一个间隙（`words[i]` 和 `words[i+1]` 之间）。
*   当 `k=i+1` 时，`k-i=1`，处理第二个间隙。
*   ...

`k - i < extraSpaces` 这个条件的意思是：**如果当前间隙的序号（从0开始）小于多余的空格数，那么这个间隙就多分一个空格。**

**举例分析:**
假设 `maxWidth = 20`, `words = ["This", "is", "an", "example"]` 都在这一行。

*   `numWords = 4`
*   `len` = `4 + 2 + 2 + 7 = 15`
*   `totalSpaces = 20 - 15 = 5`
*   间隙数 `numWords - 1 = 3`
*   `wordSpaces = 5 / 3 = 1` (每个间隙至少1个空格)
*   `extraSpaces = 5 % 3 = 2` (还有2个多余的空格需要分配)

现在我们用循环来构建这一行：
`for(int k = i; k < j; k++)` (这里 `i=0, j=4`)

1.  **k = 0 (处理 "This")**:
    *   `line.append(words[0])` -> `"This"`
    *   `k < j - 1` (0 < 3) 为 true。
    *   `k - i < extraSpaces` -> `0 - 0 < 2` -> `0 < 2` 为 true。
    *   当前间隙获得 `wordSpaces + 1 = 1 + 1 = 2` 个空格。
    *   `line` -> `"This  "` (2个空格)

2.  **k = 1 (处理 "is")**:
    *   `line.append(words[1])` -> `"This  is"`
    *   `k < j - 1` (1 < 3) 为 true。
    *   `k - i < extraSpaces` -> `1 - 0 < 2` -> `1 < 2` 为 true。
    *   当前间隙获得 `wordSpaces + 1 = 1 + 1 = 2` 个空格。
    *   `line` -> `"This  is  "` (2个空格)

3.  **k = 2 (处理 "an")**:
    *   `line.append(words[2])` -> `"This  is  an"`
    *   `k < j - 1` (2 < 3) 为 true。
    *   `k - i < extraSpaces` -> `2 - 0 < 2` -> `2 < 2` 为 false。
    *   当前间隙获得 `wordSpaces = 1` 个空格。
    *   `line` -> `"This  is  an "` (1个空格)

4.  **k = 3 (处理 "example")**:
    *   `line.append(words[3])` -> `"This  is  an example"`
    *   `k < j - 1` (3 < 3) 为 false。不加空格。

最终结果: `"This  is  an example"`，长度为 20。前两个间隙分配了2个空格，最后一个间隙分配了1个空格，符合要求。

## 总结

LeetCode 68 是一道考验细节处理能力的题目。核心思想是贪心，但成败在于对边界条件的精确处理：

1.  **行单词确定**：准确计算包含最少空格在内的行长度是关键。
2.  **空格分配**：理解整除和取模运算在均匀/非均匀分配中的作用。
3.  **边界判断**：清晰地区分“普通行”与“特殊行”（最后一行、单单词行），并采用不同的对齐策略。

希望这篇详细的分析能帮助你彻底理解这道题目！
