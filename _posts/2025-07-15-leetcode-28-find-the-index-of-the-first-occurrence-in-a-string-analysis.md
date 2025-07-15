---
layout: post
title: "LeetCode 28 题解：四种方法实现 strStr() (Find the Index of the First Occurrence in a String)"
date: "2025-07-15"
toc: true
excerpt: "本文详细分析了 LeetCode 第 28 题的四种解法：暴力匹配、KMP 算法、Java 内置 indexOf 方法以及 substring + startsWith 方法。深入探讨了每种算法的原理、时间空间复杂度，并提供了详细的执行流程分析，特别对 KMP 算法的 LPS 数组构建和匹配过程做了重点讲解。"
tags: ["Algorithm", "LeetCode", "String", "KMP", "Java"]
comments: true
author: zempty
---

## 问题描述

LeetCode 第 28 题要求我们实现 `strStr()` 函数。给定两个字符串 `haystack` 和 `needle`，我们需要在 `haystack` 字符串中找出 `needle` 字符串第一次出现的位置（索引值）。如果 `needle` 不是 `haystack` 的一部分，则返回 `-1`。

**示例:**
- **输入:** haystack = "sadbutsad", needle = "sad"
- **输出:** 0
- **解释:** "sad" 在索引 0 和 6 处出现。第一次出现是在索引 0 ，所以我们返回 0 。

- **输入:** haystack = "leetcode", needle = "leeto"
- **输出:** -1
- **解释:** "leeto" 没有在 "leetcode" 中出现，所以返回 -1 。

这是一个经典的字符串匹配问题。本文将详细分析四种不同的解法，从最直观的暴力匹配到最高效的 KMP 算法，再到利用 Java 内置函数，帮助你全面理解这个问题。

---

## 解法一：暴力匹配 (Brute Force)

这是最容易想到的方法。我们遍历 `haystack` 中的每个字符，并将其视为潜在的匹配起点。然后，从这个起点开始，逐一比较 `haystack` 的后续字符与 `needle` 的字符是否相同。

### 代码实现

```java
class Solution {
    public int strStr(String haystack, String needle) {
        int m = needle.length();
        int n = haystack.length();
        if (m > n) return -1;

        // i 只需遍历到 n-m 即可，因为再往后 haystack 剩余的长度已不足以容纳 needle
        for (int i = 0; i <= n - m; i++) {
            int j = 0;
            while (j < m && haystack.charAt(i + j) == needle.charAt(j)) {
                j++;
            }
            // 如果 j 成功遍历完 needle 的所有字符，说明匹配成功
            if (j == m) {
                return i;
            }
        }
        return -1;
    }
}
```

### 算法分析

这里的条件 `i <= n - m` 是因为我们要在 `haystack` 中寻找 `needle` 的完整匹配。假设 `haystack` 长度为 `n`，`needle` 长度为 `m`，那么从 `haystack` 的第 `i` 个位置开始，只有当 `i + m - 1 < n`（即 `i <= n - m`）时，`haystack` 剩余的子串长度才足够与 `needle` 进行完整比较。如果 `i > n - m`，那么从这个位置开始，`haystack` 剩下的字符已经不足以容纳一个完整的 `needle`，所以无需再尝试匹配。

举例说明：  
- `haystack = "abcde"`，长度 `n = 5`  
- `needle = "cd"`，长度 `m = 2`  
- 最后一次合法的起点是 `i = 3`，因为 `haystack[3..4] = "de"`，再往后就不够 2 个字符了。

因此，循环条件写作 `i <= n - m`，确保每一次匹配尝试都不会越界，并且不会做无意义的比较。


- **执行流程**:
    1. 外层循环 `i` 控制 `haystack` 的起始匹配点。
    2. 内层循环 `j` 负责逐个字符地比较 `haystack.substring(i, i+m)` 与 `needle`。
    3. 如果内层循环因为字符不匹配而中断，则外层循环 `i` 增加 1，从下一个位置重新开始匹配。
    4. 如果内层循环顺利完成（`j` 的值等于 `m`），说明找到了一个完整的匹配，立即返回当前的起始索引 `i`。

- **时间复杂度**: **O(n * m)**
  - `n` 是 `haystack` 的长度，`m` 是 `needle` 的长度。
  - 在最坏的情况下（例如 `haystack` = "aaaaaaaaab", `needle` = "aaab"），对于 `haystack` 的每一个起始位置，我们都需要比较 `m` 次。总共大约需要 `(n-m) * m` 次比较，因此时间复杂度为 O(n * m)。

- **空间复杂度**: **O(1)**
  - 我们只使用了几个额外的变量 (`i`, `j`, `n`, `m`)，所以空间消耗是常数级别的。

---

## 解法二：KMP 算法

KMP (Knuth-Morris-Pratt) 算法是一种高效的字符串匹配算法，它通过预处理 `needle` 字符串来避免在匹配过程中进行不必要的回溯。其核心思想是，当发生字符不匹配时，能够利用已经匹配过的信息，将 `needle` 字符串向右“滑动”尽可能远的距离，而不是仅仅移动一位。

> **推荐阅读：** [KMP 算法详解：从 LPS 数组到 LeetCode 28 实战 (2025-07-14)]({% post_url 2025-07-14-kmp-algorithm-explained-in-detail %})


### KMP 核心：LPS 数组

KMP 算法的关键在于一个预先计算好的 **LPS (Longest Proper Prefix which is also Suffix)** 数组，有时也叫 `next` 数组。对于 `needle` 中的任意位置 `i`，`lps[i]` 表示 `needle` 的子串 `needle[0...i]` 中，最长的相等的前缀和后缀的长度。

- **前缀 (Prefix)**: 指不包含最后一个字符的所有子串。
- **后缀 (Suffix)**: 指不包含第一个字符的所有子串。

**示例**: 对于 `needle = "aabaaf"`
- `i=0`, "a": 前后缀为空，`lps[0]=0`
- `i=1`, "aa": 最长相等前后缀为 "a"，长度 1，`lps[1]=1`
- `i=2`, "aab": 无相等前后缀，`lps[2]=0`
- `i=3`, "aaba": 最长相等前后缀为 "a"，长度 1，`lps[3]=1`
- `i=4`, "aabaa": 最长相等前后缀为 "aa"，长度 2，`lps[4]=2`
- `i=5`, "aabaaf": 无相等前后缀，`lps[5]=0`
所以，`lps` 数组为 `[0, 1, 0, 1, 2, 0]`。

### 代码实现

```java
class Solution {
    public int strStr(String haystack, String needle) {
        int m = needle.length();
        int n = haystack.length();
        if (m > n) return -1;
        if (m == 0) return 0;

        int[] lps = buildLPS(needle);
        int i = 0; // haystack 的指针
        int j = 0; // needle 的指针

        while (i < n) {
            if (haystack.charAt(i) == needle.charAt(j)) {
                i++;
                j++;
                if (j == m) {
                    return i - j; // 匹配成功，返回起始位置
                }
            } else {
                if (j > 0) {
                    // 发生不匹配，根据 lps 数组移动 needle 指针 j
                    // i 不需要回溯
                    j = lps[j - 1];
                } else {
                    // j 已经是 0，说明 needle 的第一个字符就不匹配
                    // 直接移动 haystack 指针 i
                    i++;
                }
            }
        }
        return -1;
    }

    // 构建 LPS 数组
    private int[] buildLPS(String needle) {
        int m = needle.length();
        int[] lps = new int[m];
        int length = 0; // 当前最长相等前后缀的长度
        int i = 1;

        while (i < m) {
            if (needle.charAt(i) == needle.charAt(length)) {
                length++;
                lps[i] = length;
                i++;
            } else {
                if (length > 0) {
                    // 回溯到上一个可能匹配的位置
                    length = lps[length - 1];
                } else {
                    lps[i] = 0;
                    i++;
                }
            }
        }
        return lps;
    }
}
```

### 算法分析

- **执行流程**:
    1. **预处理**: 调用 `buildLPS` 函数为 `needle` 生成 `lps` 数组。这个过程本身也是一个动态规划。
    2. **匹配**:
        - 使用指针 `i` 遍历 `haystack`，指针 `j` 遍历 `needle`。`i` 永远不会回退。
        - 如果 `haystack[i] == needle[j]`，两个指针都向前移动。
        - 如果不匹配，`j` 会根据 `lps[j-1]` 的值进行回退，相当于 `needle` 向右滑动了一段距离，而 `i` 保持不变。这个回退操作利用了 `needle` 自身的对称性，跳过了暴力解法中冗余的比较。

- **时间复杂度**: **O(n + m)**
  - `buildLPS` 函数的时间复杂度为 O(m)。
  - `strStr` 主函数的匹配过程，虽然看起来有回溯，但可以证明指针 `i` 和 `j` 的移动总次数是线性的，所以时间复杂度为 O(n)。
  - 总时间复杂度为 O(n + m)。

- **空间复杂度**: **O(m)**
  - 需要一个 `lps` 数组来存储预处理结果，其大小与 `needle` 的长度成正比。

---

## 解法三：使用 Java 内置 `indexOf` 方法

在实际开发中，最直接、最推荐的方法就是使用语言标准库提供的内置函数。Java 的 `String` 类提供了 `indexOf` 方法，其功能与 `strStr` 完全相同。

### 代码实现

```java
class Solution {
    public int strStr(String haystack, String needle) {
        // 无需手动处理 m > n 的情况，indexOf 内部会处理
        return haystack.indexOf(needle);
    }
}
```

### 算法分析

- **执行流程**:
    - `indexOf` 方法的底层实现经过了高度优化。在不同的 JDK 版本中，其实现可能有所不同。通常，它会结合多种算法的优点。对于较短的 `needle`，它可能使用类似于暴力匹配的算法；对于较长的 `needle`，它可能采用更高级的算法（如 Boyer-Moore 或其变体），这些算法通常比 KMP 在平均情况下的表现更好。

- **时间复杂度**: **平均 O(n * m)，但实践中非常快**
  - 理论上，其最坏时间复杂度仍然是 O(n * m)，但在绝大多数实际应用场景中，由于底层的优化和 native 实现，它的性能远超我们自己实现的暴力匹配，通常被认为是解决此问题的最佳实践。

- **空间复杂度**: **O(1)**
  - 从用户的角度看，没有额外的空间开销。

---

## 解法四：使用 `substring` 和 `startsWith`

这种方法也是一种变相的暴力匹配，通过循环截取 `haystack` 的子字符串，然后检查该子字符串是否以 `needle` 开头。

### 代码实现

```java
class Solution {
    public int strStr(String haystack, String needle) {
        int m = needle.length();
        int n = haystack.length();
        if (m > n) return -1;

        for (int i = 0; i <= n - m; i++) {
            // 截取子串并检查
            if (haystack.substring(i).startsWith(needle)) {
                return i;
            }
        }
        return -1;
    }
}
```

### 算法分析

- **执行流程**:
    - 循环遍历 `haystack` 的所有可能起始点 `i`。
    - 在每次循环中，`haystack.substring(i)` 会创建一个新的字符串对象。这是一个非常耗时的操作。
    - `startsWith(needle)` 再对这个新生成的子串进行字符比较。

- **时间复杂度**: **O(n * m)，但常数因子很大**
  - `substring()` 操作在现代 Java 中（Java 7u6 之后）需要复制字符数组，其时间复杂度为 O(k)，其中 k 是子串的长度。在这里，子串长度最大为 `n`。`startsWith()` 的复杂度为 O(m)。
  - 循环执行 `n-m` 次，每次都创建一个新对象并进行比较，导致其性能通常比第一种暴力解法还要差。频繁的内存分配和垃圾回收会带来巨大的额外开销。

- **空间复杂度**: **O(n)**
  - 在循环的每一步中，`substring(i)` 都会创建一个新的字符串。最长的子串长度为 `n`，因此空间复杂度为 O(n)。

---

## 总结与对比

| 解法 | 时间复杂度 | 空间复杂度 | 实现难度 | 推荐指数 |
| :--- | :--- | :--- | :--- | :--- |
| **暴力匹配** | O(n * m) | O(1) | ★☆☆☆☆ (简单) | ★★☆☆☆ (作为基础理解) |
| **KMP 算法** | O(n + m) | O(m) | ★★★★★ (复杂) | ★★★★☆ (面试、算法竞赛) |
| **内置 `indexOf`** | O(n * m) (理论) | O(1) | ☆☆☆☆☆ (极简) | ★★★★★ (实际开发首选) |
| **`substring` + `startsWith`** | O(n * m) (高开销) | O(n) | ★☆☆☆☆ (简单) | ☆☆☆☆☆ (不推荐) |

### 结论

1.  **日常开发**: 毫不犹豫地使用 **解法三 (`indexOf`)**。它最简洁、可读性最好，并且性能经过了高度优化。
2.  **求职面试/算法学习**: **解法二 (KMP)** 是必须掌握的。它展示了你对高级字符串算法的理解，是优化字符串匹配问题的标准答案。**解法一 (暴力匹配)** 也需要会写，并能分析其复杂度，作为优化前的基准。
3.  **应避免的方案**: **解法四 (`substring` + `startsWith`)** 是一个典型的反例。虽然代码看起来很直观，但由于在循环中创建了大量临时对象，其性能和资源消耗都非常差，应该避免使用。

