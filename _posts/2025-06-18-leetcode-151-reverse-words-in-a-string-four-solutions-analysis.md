---
layout: post
title: "LeetCode 151 反转字符串中的单词 - 四种解法详细分析"
date: "2025-06-18"
toc: true
excerpt: "深入分析LeetCode 151题的四种不同解法：内置函数法、双指针法、双端队列法和原地算法，详细对比各种方法的时间复杂度、空间复杂度和执行效率"
tags: [Algorithm, leetcode, 字符串, 双指针, 队列, 原地算法]
comments: true
author: zempty
---

## 题目描述

**LeetCode 151. 反转字符串中的单词 (Reverse Words in a String)**

给定一个字符串，逐个翻转字符串中的每个单词。

**示例：**
- 输入: `"the sky is blue"`
- 输出: `"blue is sky the"`

**说明：**
- 无空格字符构成一个单词
- 输入字符串可以在前面或者后面包含多余的空格，但是反转后的字符不能包括
- 如果两个单词间有多余的空格，将反转后单词间的空格减少到只含一个

## 解法一：内置函数法（Split + StringBuilder）

### 算法思路

这是最直观的解法，利用Java内置的字符串处理方法：
1. 使用 `strip()` 去除首尾空格
2. 使用 `split("\\s+")` 按空格分割字符串，正则表达式 `\\s+` 可以匹配一个或多个空白字符
3. 从后往前遍历单词数组，用 `StringBuilder` 构建结果

### 代码实现

```java
class Solution {
    public String reverseWords(String s) {
        String[] words = s.strip().split("\\s+");
        StringBuilder builder = new StringBuilder();
        for(int i = words.length - 1; i >= 0; i--){
            builder.append(words[i]);
            if(i > 0){
                builder.append(" ");
            }
        }
        return builder.toString();   
    }
}
```

### 执行流程分析

以输入 `"  the sky is blue  "` 为例：

| 步骤 | 操作 | 结果 |
|------|------|------|
| 1 | `s.strip()` | `"the sky is blue"` |
| 2 | `split("\\s+")` | `["the", "sky", "is", "blue"]` |
| 3 | `i=3, append("blue")` | `"blue"` |
| 4 | `i=2, append(" is")` | `"blue is"` |
| 5 | `i=1, append(" sky")` | `"blue is sky"` |
| 6 | `i=0, append(" the")` | `"blue is sky the"` |

### 复杂度分析

- **时间复杂度：** O(n)，其中 n 是字符串长度
- **空间复杂度：** O(n)，需要存储分割后的单词数组

### 优缺点

**优点：**
- 代码简洁，易于理解
- 利用内置函数，减少出错概率

**缺点：**
- 需要额外的空间存储单词数组
- 对字符串进行了多次操作

## 解法二：双指针法（从右到左遍历）

### 算法思路

使用双指针技术从字符串末尾开始处理：
1. 从字符串末尾开始遍历
2. 跳过空格找到单词的结尾
3. 继续向前找到单词的开头
4. 提取单词并添加到结果中

### 代码实现

```java
class Solution {
    public String reverseWords(String s) {
        StringBuilder build = new StringBuilder();
        int i = s.length() - 1;
        while(i >= 0){
            // 跳过空格
            while(i >= 0 && s.charAt(i) == ' '){
                i--;
            }
            if(i < 0){
                break;
            }
            // 找到单词结尾
            int j = i;
            // 找到单词开头
            while(i >= 0 && s.charAt(i) != ' '){
                i--;
            }
            // 添加单词
            if(build.length() > 0){
                build.append(" ");
            }
            build.append(s.substring(i + 1, j + 1));
        }
        return build.toString();
    }
}
```

### 执行流程分析

以输入 `"  the sky is blue  "` 为例：

| 步骤 | i | j | 操作 | 当前单词 | 结果 |
|------|---|---|------|----------|------|
| 1 | 16→13 | - | 跳过末尾空格 | - | `""` |
| 2 | 13→9 | 13 | 找单词"blue" | "blue" | `"blue"` |
| 3 | 9→7 | - | 跳过空格 | - | `"blue"` |
| 4 | 7→5 | 7 | 找单词"is" | "is" | `"blue is"` |
| 5 | 5→3 | - | 跳过空格 | - | `"blue is"` |
| 6 | 3→0 | 3 | 找单词"sky" | "sky" | `"blue is sky"` |
| 7 | 0→-2 | - | 跳过空格 | - | `"blue is sky"` |
| 8 | -2→-5 | -2 | 找单词"the" | "the" | `"blue is sky the"` |

### 复杂度分析

- **时间复杂度：** O(n)，每个字符最多被访问两次
- **空间复杂度：** O(1)，除了结果字符串外，只使用常数额外空间

### 优缺点

**优点：**
- 空间效率高，不需要存储中间数组
- 一次遍历完成

**缺点：**
- 逻辑相对复杂，需要仔细处理边界条件

## 解法三：双端队列法（Deque）

### 算法思路

使用双端队列（Deque）来存储单词：
1. 从左到右遍历字符串
2. 构建每个单词
3. 将单词添加到双端队列的头部
4. 最后用空格连接所有单词

### 代码实现

```java
class Solution {
    public String reverseWords(String s) {
        int right = s.length() - 1;
        int left = 0;
        // 去除首尾空格
        while(right >= 0 && s.charAt(right) == ' ') right--;
        while(left <= right && s.charAt(left) == ' ') left++;
        
        StringBuilder word = new StringBuilder();
        Deque<String> words = new LinkedList<>();
        
        while(left <= right){
            char curr = s.charAt(left);
            if(curr != ' '){
                word.append(curr);
            }else if(word.length() != 0){
                words.addFirst(word.toString());
                word.setLength(0);
            }
            left++;
        }
        words.addFirst(word.toString());
        
        return String.join(" ", words);
    }
}
```

### 执行流程分析

以输入 `"  the sky is blue  "` 为例：

| 步骤 | left | curr | word | words | 操作 |
|------|------|------|------|-------|------|
| 预处理 | 2→14 | - | - | `[]` | 去除首尾空格 |
| 1 | 2 | 't' | "t" | `[]` | 构建单词 |
| 2 | 3 | 'h' | "th" | `[]` | 构建单词 |
| 3 | 4 | 'e' | "the" | `[]` | 构建单词 |
| 4 | 5 | ' ' | "" | `["the"]` | 添加单词到队列头 |
| 5 | 6 | 's' | "s" | `["the"]` | 构建单词 |
| ... | ... | ... | ... | ... | ... |
| 最终 | - | - | - | `["blue", "is", "sky", "the"]` | 所有单词 |

### 复杂度分析

- **时间复杂度：** O(n)，遍历字符串一次
- **空间复杂度：** O(n)，需要存储所有单词

### 优缺点

**优点：**
- 思路清晰，易于理解
- 使用了合适的数据结构

**缺点：**
- 需要额外的队列空间
- 代码稍显冗长

## 解法四：原地算法（In-place）

### 算法思路

这是最优雅的解法，分为三个步骤：
1. 反转整个字符串
2. 反转每个单词
3. 去除多余空格

### 代码实现

```java
class Solution {
    public String reverseWords(String s) {
        char[] chars = s.toCharArray();
        int n = chars.length;
        
        // 步骤1：反转整个字符串
        reverse(chars, 0, n - 1);
        
        // 步骤2：反转每个单词
        int start = 0;
        for (int end = 0; end <= n; end++) {
            if (end == n || chars[end] == ' ') {
                reverse(chars, start, end - 1);
                start = end + 1;
            }
        }
        
        // 步骤3：去除多余空格
        return removeSpace(chars);
    }

    void reverse(char[] chars, int left, int right) {
        while (left < right) {
            char temp = chars[left];
            chars[left] = chars[right];
            chars[right] = temp;
            left++;
            right--;
        }
    }

    String removeSpace(char[] chars) {
        int i = 0, j = 0;
        int n = chars.length;
        
        while (j < n) {
            // 跳过空格
            while (j < n && chars[j] == ' ') {
                j++;
            }
            // 复制单词
            while (j < n && chars[j] != ' ') {
                chars[i++] = chars[j++];
            }
            // 跳过空格
            while(j < n && chars[j] == ' '){
                j++;
            }
            // 添加单个空格
            if(j < n){
                chars[i++] = ' ';
            }
        }
        return new String(chars).substring(0, i);
    }
}
```

### 执行流程分析

以输入 `"  the sky is blue  "` 为例：

| 步骤 | 操作 | 结果 |
|------|------|------|
| 原始 | - | `"  the sky is blue  "` |
| 1 | 反转整个字符串 | `"  eulb si yks eht  "` |
| 2 | 反转每个单词 | `"  blue is sky the  "` |
| 3 | 去除多余空格 | `"blue is sky the"` |

### 复杂度分析

- **时间复杂度：** O(n)，每个字符被访问常数次
- **空间复杂度：** O(1)，原地操作（不考虑返回值）

### 优缺点

**优点：**
- 空间复杂度最优
- 算法设计巧妙
- 真正的原地操作

**缺点：**
- 实现较复杂
- 需要修改输入数据

## 四种解法对比总结

| 解法 | 时间复杂度 | 空间复杂度 | 代码复杂度 | 适用场景 |
|------|------------|------------|------------|----------|
| 内置函数法 | O(n) | O(n) | ⭐⭐⭐⭐⭐ | 面试快速实现 |
| 双指针法 | O(n) | O(1) | ⭐⭐⭐ | 节省空间需求 |
| 双端队列法 | O(n) | O(n) | ⭐⭐⭐⭐ | 清晰的逻辑表达 |
| 原地算法 | O(n) | O(1) | ⭐⭐ | 空间要求严格 |

## 推荐策略

1. **面试场景**：推荐解法一（内置函数法），代码简洁，不容易出错
2. **追求空间效率**：推荐解法二（双指针法）或解法四（原地算法）
3. **学习算法设计**：推荐解法四（原地算法），体现了优雅的算法思维
4. **工程实践**：根据具体需求选择，通常解法一已足够

## 总结

LeetCode 151题看似简单，但提供了多种思路来解决问题。从简单的内置函数到复杂的原地算法，每种方法都有其适用场景。在实际开发中，我们应该根据具体需求（时间复杂度、空间复杂度、代码可读性）来选择最合适的解法。

通过分析这四种解法，我们可以学到：
- 如何权衡时间复杂度和空间复杂度
- 双指针技术的灵活运用
- 数据结构选择的重要性
- 原地算法的设计思路

这些思想在解决其他字符串和数组问题时都非常有用。

