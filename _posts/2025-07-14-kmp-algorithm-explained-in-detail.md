---
layout: post
title: "KMP 算法详解：从 LPS 数组到 LeetCode 28 实战"
date: "2025-07-14"
toc: true
excerpt: "深入剖析 KMP 算法，从核心思想、LPS 数组的构建与关键逻辑，到 LeetCode 28 的完整代码实现，带你彻底掌握这个高效的字符串匹配算法。"
tags: [Algorithm, String, KMP, LeetCode]
comments: true
author: zempty
---

KMP (Knuth-Morris-Pratt) 算法是计算机科学中一个著名且高效的字符串匹配算法。它的核心思想是利用已经匹配过的信息，避免在文本串中进行不必要的回溯，从而大幅提升匹配效率。本文将从 KMP 的基本概念、核心的 LPS 数组，到 LeetCode 实战，为你全方位解析 KMP 算法。

### 一、KMP 算法的核心思想

在传统的暴力字符串匹配中，当我们在文本串 `haystack` 中匹配模式串 `needle` 时，一旦遇到不匹配的字符，我们会将 `needle` 的起始位置向后移动一位，然后从头开始新一轮的比较。

例如：`haystack = "abababca"`，`needle = "ababca"`

```
haystack: a b a b a b c a
needle:   a b a b c   (在 c 处不匹配)
```

此时，暴力法会将 `needle` 后移一位，从 `haystack` 的第二个字符开始重新比较：

```
haystack: a b a b a b c a
needle:     a b a b c a
```

这种方法的问题在于，它“忘记”了之前已经匹配成功的部分（"abab"）。KMP 算法的巧妙之处就在于，它能记住这些信息，并利用这些信息进行一次“智能”的跳转。

**KMP 的核心是：** 当发生不匹配时，我们不只是简单地将模式串后移一位，而是根据已经匹配过的内容，计算出一个最有效的位移，跳过那些不可能匹配成功的位置。

这个“智能跳转”的依据，就是我们接下来要讲的 **LPS 数组**。

### 二、LPS 数组（最长公共前后缀）

LPS（Longest Proper Prefix which is also Suffix）数组，有时也被称为 `next` 数组，是 KMP 算法的基石。

#### 1. 什么是 LPS？

为了理解 LPS，我们首先需要明确几个概念：

- **前缀 (Prefix)**: 指一个字符串中从开头开始的任意长度的子串，不包括字符串本身。例如，"apple" 的前缀有 "a", "ap", "app", "appl"。
- **后缀 (Suffix)**: 指一个字符串中到结尾结束的任意长度的子串，不包括字符串本身。例如，"apple" 的后缀有 "e", "le", "ple", "pple"。
- **最长公共前后缀 (LPS)**: 指的是一个字符串的所有前缀和后缀中最长的一个公共元素。

**`lps[i]` 的值代表了模式串 `needle` 的子串 `needle[0...i]` 的最长公共前后缀的长度。**

#### 2. 如何计算 LPS 数组？

我们通过一个具体的例子来理解 LPS 数组的计算过程。假设 `needle = "aabaaf"`。

| 索引 `i` | 字符 `needle[i]` | 子串 `needle[0...i]` | 前缀                       | 后缀                       | 最长公共前后缀 | `lps[i]` |
| :------- | :--------------- | :------------------- | :------------------------- | :------------------------- | :------------- | :------- |
| 0        | 'a'              | "a"                  | (空)                       | (空)                       | (空)           | **0**    |
| 1        | 'a'              | "aa"                 | {"a"}                      | {"a"}                      | "a"            | **1**    |
| 2        | 'b'              | "aab"                | {"a", "aa"}                | {"b", "ab"}                | (空)           | **0**    |
| 3        | 'a'              | "aaba"               | {"a", "aa", "aab"}         | {"a", "ba", "aba"}         | "a"            | **1**    |
| 4        | 'a'              | "aabaa"              | {"a", "aa", "aab", "aaba"} | {"a", "aa", "baa", "abaa"} | "aa"           | **2**    |
| 5        | 'f'              | "aabaaf"             | {...}                      | {...}                      | (空)           | **0**    |

所以，对于 `needle = "aabaaf"`，其 `lps` 数组为 `[0, 1, 0, 1, 2, 0]`。

#### 3. LPS 数组的 Java 实现

下面是计算 LPS 数组的 Java 代码，也就是你在问题中提供的 `buildLPS` 方法。

```java
int[] buildLPS(String needle) {
    int m = needle.length();
    int[] lps = new int[m];
    // len 是当前最长公共前后缀的长度
    // i 是当前遍历到的位置
    int len = 0;
    int i = 1;

    while (i < m) {
        // 情况 1: 字符匹配
        // needle[i] 与 needle[len] 匹配，说明我们找到了一个更长的公共前后缀
        if (needle.charAt(i) == needle.charAt(len)) {
            len++;
            lps[i] = len;
            i++;
        } else { // 情况 2: 字符不匹配
            if (len > 0) {
                // 关键步骤：len 回溯
                len = lps[len - 1];
            } else {
                // len 已经是 0，无法再缩短
                lps[i] = 0;
                i++;
            }
        }
    }
    return lps;
}
```

#### 4. 重点解析：`len = lps[len - 1]` 为什么是这样？

这是理解 LPS 数组构建过程最核心、也最难的一步。

当 `needle.charAt(i) != needle.charAt(len)` 时，意味着：

- 以 `needle[i]` 结尾的子串 `needle[0...i]`
- 它的最长公共前后缀长度 _不可能_ 是 `len + 1`。

我们需要找到一个**更短**的前缀，这个前缀要满足它是 `needle[0...i-1]` 的一个后缀。我们希望这个前缀的下一个字符 `needle[len]`（新的 `len`）能与 `needle[i]` 匹配。

**这个过程本质上是在寻找 `needle[0...i-1]` 的次长公共前后缀。**

让我们来分析一下：

- `len` 是 `needle[0...i-1]` 的最长公共前后缀的长度。
- 这意味着 `needle[0...len-1]` (前缀) 等于 `needle[i-len...i-1]` (后缀)。

当 `needle[i]` 和 `needle[len]` 不匹配时，我们不能简单地放弃。我们希望找到下一个可能匹配的位置。这个位置在哪里？

我们需要在已经匹配的前缀 `needle[0...len-1]` 中，寻找它的**最长公共前后缀**。这个长度由 `lps[len - 1]` 给出。

**为什么？**
因为 `lps[len-1]` 代表了 `needle[0...len-1]` 的最长公共前后缀的长度。假设这个长度是 `k`。

- 这意味着 `needle[0...k-1]`（`needle[0...len-1]` 的前缀）等于 `needle[len-k...len-1]`（`needle[0...len-1]` 的后缀）。
- 又因为 `needle[0...len-1]` 本身是 `needle[0...i-1]` 的后缀，所以 `needle[len-k...len-1]` 也是 `needle[0...i-1]` 的后缀的一部分。

这样，我们就把问题规模缩小了：从试图匹配长度为 `len` 的前缀，变为了试图匹配长度为 `lps[len - 1]` 的前缀。我们将新的 `len` 更新为 `lps[len - 1]`，然后再次比较 `needle[i]` 和 `needle[len]`（新的 `len`）。这个过程一直持续，直到 `len` 变为 0 或者找到匹配。

这其实是一个动态规划的思想：我们利用已经计算好的 `lps` 值（`lps[len - 1]`）来递推当前的状态。

### 三、KMP 算法流程分析 (LeetCode 28)

现在我们有了 `lps` 数组，就可以来看 KMP 的主匹配过程了。我们用 LeetCode 28 题的代码进行分析。

**题目**: 给你两个字符串 `haystack` 和 `needle` ，请你在 `haystack` 字符串中找出 `needle` 字符串的第一个匹配项的下标（下标从 0 开始）。如果 `needle` 不是 `haystack` 的一部分，则返回 `-1` 。

```java
class Solution {
    public int strStr(String haystack, String needle) {
        int m = needle.length();
        if (m == 0) return 0;
        int n = haystack.length();
        if (m > n) return -1;

        // 1. 构建 LPS 数组
        int[] lps = buildLPS(needle);

        int i = 0; // haystack 的指针
        int j = 0; // needle 的指针

        // 2. 主循环匹配
        while (i < n) {
            // 情况 A: 字符匹配
            if (haystack.charAt(i) == needle.charAt(j)) {
                i++;
                j++;
                // 如果 j 到达 needle 的末尾，说明完全匹配
                if (j == m) {
                    return i - j; // 返回匹配的起始索引
                }
            } else { // 情况 B: 字符不匹配
                if (j > 0) {
                    // 利用 LPS 数组进行“智能跳转”
                    // j 不需要回退到 0，而是回退到 lps[j-1]
                    j = lps[j - 1];
                } else {
                    // j 已经是 0，说明 needle 的第一个字符就不匹配
                    // 直接移动 haystack 的指针
                    i++;
                }
            }
        }
        return -1; // 未找到匹配
    }

    int[] buildLPS(String needle) {
        int m = needle.length();
        int[] lps = new int[m];
        int len = 0;
        int i = 1;

        while (i < m) {
            if (needle.charAt(i) == needle.charAt(len)) {
                len++;
                lps[i] = len;
                i++;
            } else {
                if (len > 0) {
                    len = lps[len - 1];
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
---

#### 具体解释：为什么预处理模式串（构建 LPS/next 数组）后，KMP 算法就能高效地在文本串中进行匹配？

KMP 算法为什么这么快？简单来说，它提前分析了要查找的字符串（模式串），找出了"重复的规律"，这样在匹配失败时就能聪明地跳过不必要的比较。

**用生活化的比喻来解释：**

想象你在读一本书，要找到其中的一句话 "今天天气很好"。普通的查找方法是：
- 从第一页开始，一个字一个字地比较
- 如果中途发现不匹配，就回到下一页重新开始
- 这样会反复检查很多已经看过的字

而 KMP 算法就像是一个"聪明的读者"：
- 它先分析这句话的特点，发现"天"字出现了两次
- 当匹配到"今天天气"时发现第五个字不是"很"，普通方法会回去重新找
- 但 KMP 发现已经匹配的部分"今天天"中，开头的"天"和中间的"天"是一样的
- 所以它直接跳到中间的"天"继续比较，不用重新开始

**具体的工作原理：**

1. **记忆已匹配的信息**  
   当我们匹配失败时，之前已经匹配成功的部分包含了有用信息。KMP 通过 LPS 数组记录了这些信息，避免重复比较。

2. **聪明的跳跃**  
   普通算法失败后会"傻傻地"回到起点重新开始，但 KMP 会根据已匹配的内容，计算出最佳的跳跃位置，直接跳过不可能成功的部分。

3. **效率大幅提升**  
   这种方法让每个字符最多只被检查两次，所以整体效率从 O(m×n) 提升到 O(m+n)。就像从"一页页翻书"变成了"直接跳到可能的页面"。

**实际例子：**  
假设要在 "abcabcabcabc" 中找 "abcabc"：
- 普通方法：失败后每次只移动一位，需要大量重复比较
- KMP 方法：发现 "abc" 在模式串中重复出现，失败时直接跳到下一个可能的"abc"位置

**核心思想：**  
KMP 的精髓就是"不走回头路"——通过预先分析模式串的规律，在匹配失败时能够跳过那些肯定不会成功的位置，直接跳到最有希望的地方继续比较。


#### 匹配流程图解

假设 `haystack = "ababcabcabababd"`，`needle = "abcabd"`。
`lps` 数组为: `[0, 0, 0, 1, 2, 0]` (`abcab` 的最长公共前后缀是 `ab`，长度为 2, 所以 `lps[4]=2`)

1. `i=0, j=0`: `a` == `a`. `i` 变为 1, `j` 变为 1.
2. `i=1, j=1`: `b` == `b`. `i` 变为 2, `j` 变为 2.
3. `i=2, j=2`: `a` != `c`. **不匹配**。

   - `j` 现在是 2，`j > 0`。
   - `j` 更新为 `lps[j-1] = lps[1] = 0`。`needle` 相当于移动到了下图位置，`i` 不变。

   ```
   haystack: a b a b c a b c a b a b a b d
   needle:   a b c         (在'a'和'c'处不匹配)
   needle:     a b c a b d (j回退到0，i不变，继续比较 haystack[2] 和 needle[0])
   ```

4. `i=2, j=0`: `a` == `a`. `i` 变为 3, `j` 变为 1.
5. `i=3, j=1`: `b` == `b`. `i` 变为 4, `j` 变为 2.
6. `i=4, j=2`: `c` == `c`. `i` 变为 5, `j` 变为 3.
7. `i=5, j=3`: `a` == `a`. `i` 变为 6, `j` 变为 4.
8. `i=6, j=4`: `b` == `b`. `i` 变为 7, `j` 变为 5.
9. `i=7, j=5`: `c` != `d`. **不匹配**。

   - `j` 现在是 5，`j > 0`。
   - `j` 更新为 `lps[j-1] = lps[4] = 2`。`needle` 相当于移动到了下图位置。

   ```
   haystack: a b a b c a b c a b a b a b d
   needle:         a b c a b d (在'c'和'd'处不匹配)
   needle:             a b c a b d (j回退到2，即"ab"部分，继续比较 haystack[7] 和 needle[2])
   ```

   这里的跳转非常关键。因为我们知道 `needle` 中不匹配之前的子串是 "abcab"，它的 LPS 是 "ab"（长度为 2）。所以我们不需要从头开始，而是可以直接让 `needle` 的前缀 "ab" 对齐 `haystack` 结尾的 "ab"，然后从 `needle[2]` (`c`) 和 `haystack[7]` (`c`) 开始继续比较。

10. `i=7, j=2`: `c` == `c`. `i` 变为 8, `j` 变为 3.
11. ...以此类推，直到找到匹配或 `i` 遍历完 `haystack`。

### 总结

KMP 算法的精髓在于 `lps` 数组，它预处理了模式串 `needle` 自身的结构信息。通过这个数组，算法可以在匹配失败时，以最高效的方式移动 `needle`，跳过大量不可能成功的比较，从而将时间复杂度从暴力法的 O(m\*n) 优化到了 O(m+n)（其中 m 是 `needle` 长度，n 是 `haystack` 长度）。理解 `lps` 数组的构建，特别是 `len = lps[len-1]` 的回溯逻辑，是掌握 KMP 算法的关键。
