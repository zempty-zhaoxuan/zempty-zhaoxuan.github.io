---

layout: post
title: "正则表达式（java 版）的理解"
date: 2022-10-14
toc: true
tags: [backend,java]
comments: true
author: zempty

---

## 一个特殊字符 ‘\’


在 java 中有一个特殊的字符，那就是使用 \ (反斜线）后面再添加一个字符，我们叫转义字符（escape character），比如 \n 表示的是换号符号，并不是单纯的一个 n 字符了。

![https://raw.githubusercontent.com/zempty-zhaoxuan/pics/master/escape\_character.png][image-1]

那 \  (反斜线）用来做转义字符了，那么程序就是要输出一个 \ (反斜线）怎么处理呢？

那就是再使用一个 \ (下划线) ，用来说明告诉程序，接下来的 \ 并不是用来转义字符的。

下面我们看看 String 类中关于 \  (反斜线）的一些使用；

## String 中的 ‘\’

我们先来看看下面的代码：

```java
    @Test
    public void testBackSlash() {

        System.out.println("============demo1============");
        //输出一个单引号字符 demo1
        char singleQuotes = '\'';
        System.out.println(singleQuotes);

        System.out.println("============demo2============");
        //输出一个双引号 demo2
        String doubleQuotes = "\"";
        System.out.println(doubleQuotes);

        System.out.println("============demo3============");
        //添加转义字符在字符串当中 demo3
        String hi = "你好\n\t棒";
        System.out.println(hi);

        System.out.println("============demo4============");
        //输出一个 \ demo4
        String backSlash = "\\";
        System.out.println(backSlash);

        System.out.println("============demo5============");
        //windows系统常用文件路径，需要多添加一个 \  demo5
        String path = "C:\\Windows\\System32\\cmd.exe";
        System.out.println(path);

        System.out.println("============demo6============");
        //输出一个 json demo6
        String json = "{\"name\":\"zempty\"}";
        System.out.println(json);

        System.out.println("============demo7============");
        //数据带有反斜线的 json demo7
        String json2 = "{\\\"name\\\":\\\"zempty\\\"}";
        System.out.println(json2);

        System.out.println("============demo8============");
        //四个反斜线代表一个反斜线 demo8
        String normalJson = json2.replaceAll("\\\\","");
        System.out.println(normalJson);
    }
```

你能回到以上 8 个示例的输出结果吗？如果可以，那么你对 java 当中转义字符 \ 和反转义 \\ 应该很清楚了，结果如下：

![https://raw.githubusercontent.com/zempty-zhaoxuan/pics/master/result.png][image-2]

在 java 语言当中 ‘ (单引号）用来表示字符，“ (双引号）用来表示字符串，所以如何输出一个单引号字符和一个双引号呢？所以在 java 当中就有了转义字符 \ 来帮忙了。

如何反转义呢？那就使用两个 \\ ，上面示例 4 中两个 \\ 可以输出一个 \ 。

在示例 5 中大家熟知的 windows 系统中的文件路径通常就需要一个 \ ,那么使用两个 \\ 就可以防止发生转义，正常的输出一个 \ 。

在示例 7 中使用了三个 \\\ 怎么理解呢？ 前两个会输出一个 \ , 最后一个 \是转义字符，\“ 是输出一个 “ 。

**在示例 8 中的四个 \\\\ 表示一个 \ 怎么理解呢？尝试解释一下，查询了解一下……**

## java 中的正则表达式 Pattern

在 java 中有这样一个包，java.util.regex 这个包提供给我们方便使用正则表达式， Pattern 类是干嘛用的呢？

正则表达式就是一类字符串，这类字符串符合特定的规则而已，比如：**[0-9]\d{5}**  就是匹配六位数字。

java 中 Pattern 就是正则表达式，通过 Pattern.compile(String regex) 来创建一个正则表达式实例，正则表达式是一个有规则的字符串，在 java 中定义一个有规则的字符串（正则表达式）用 Pattern 来表示。

Pattern 类文档中列举了许多正则表达式的规则，正则表达式忘记了也可以查询该类的 API 文档：

 [https://docs.oracle.com/javase/8/docs/api/java/util/regex/Pattern.html][1]

上文的一个问题 :**在上文的示例 8 中的四个 \\\\ 表示一个 \ 怎么理解呢？**

我们看一下 String 类的 replaceAll 方法，第一个参数是 regex 正则表达式，我们就大致可以明白：

1. 在  java  中两个反斜线 \\ 输出一个反斜线 \ ,四个反斜线就会处理成两个反斜线 \\ 。
2. 再由正则表达式处理上述结果的两个反斜线 \\ ，这里最终结果两个反斜线又解释成了一个反斜线 \ 。

所以在 java 当中如果需要通过正则表达式匹配一个反斜线，那么就需要四个反斜线 \\\\ 。

下面来研究一下 Pattern 这个类：

```java
    @Test
    public void patternMethods() {

        System.out.println("===demo1:compile(String regex)===");
        //demo1 compile(String regex)
        Pattern p1 = Pattern.compile("\\d+");
        System.out.println(p1.toString());

        System.out.println("===demo2:compile(String regex,int flags)===");
        //demo2 compile(String regex,int flags)
        Pattern p2 = Pattern.compile("[AbC]", Pattern.CASE_INSENSITIVE);
        System.out.println(p2.toString());
        Matcher m = p2.matcher("hat");
        while (m.find()) {
            System.out.println(m.group());
        }

        System.out.println("===demo3:compile(String regex,int flags)===");
        //demo3 flags()
        System.out.println(p2.flags());

        //demo4 pattern() and toString()
        System.out.println("===demo4:pattern() and toString()===");
        System.out.println(p2.pattern());
        System.out.println(p2.toString());

        System.out.println("===demo5:matcher(CharSequence)===");
        //matcher(CharSequence)
        Matcher m2 = p2.matcher("hat");
        System.out.println(m);

        System.out.println("===demo6:matches(String regex,CharSequence)===");
        //matches(regex,CharSequence)
        boolean result = Pattern.matches("\\w{1,10}", "helloworld");
        System.out.println(result);

        System.out.println("===demo7:quote(String)===");
        //quote(String)
        String s = Pattern.quote("\\d{3}");
        System.out.println(s);
        boolean test1 = Pattern.matches(s, "456");
        boolean test2 = Pattern.matches(s, "\\d{3}");
        System.out.println(test1);
        System.out.println(test2);

        System.out.println("===demo8:asPredicate()===");
        //asPredicate
        Pattern p3 = Pattern.compile("hello");
        boolean test3 = p3.asPredicate().test("glksahgaghello");
        System.out.println(test3);
    }
```

结果如下：

![https://raw.githubusercontent.com/zempty-zhaoxuan/pics/master/patternresult.png][image-3]

以上方法中 compile 方法用来编译正则表达式（创建 Pattern 示例），compile 方法提供了两个方法，带有两个参数的 int flag 可以实现不同需求，比如上面示例中的Pattern.CASE\_INSENSITIVE 就是表示正则表达式匹配字符串的时候不用区分大小写；flags()用来输出 Pattern 的 flag 。

pattern() 和 toString() 方法效果相同，就是输出一个正则表达式。

macher 方法是用来生成一个匹配对象 Matcher ，该类提供了一些获取匹配到的字符串的一些方法，matches 方法是一个静态方法，提供正则表达式和需要匹配的字符串直接获取匹配结果:true 匹配，false 不匹配。

quote 方法直接输出一个文本字符串，这个方法的用处是什么呢？

有时候我们需要正则表达式失效，就是想匹配原字符串，我们可以使用该方法，具体可以参考上面的示例。

asPredicate() 方法获取一个断言，可以判断正则表达式和断言提供的字符串是否有匹配结果。

在 Pattern 类中有这样一个方法 split(CharSequence,int) 这个方法，这个方法很难理解，现在通过示例代码说明：

```java
   @Test
    public void PatternSplit() {
        // split(CharSequence,int)
        String s = "boo:and:foo";
        Pattern p1 = Pattern.compile(":");
        String[] test0 = p1.split(s, 1);//["boo:and:foo"]
        String[] test1 = p1.split(s, 2);//{ "boo", "and:foo" }
        String[] test2 = p1.split(s, 5);//{ "boo", "and", "foo" }
        String[] test3 = p1.split(s, -2);//{ "boo", "and", "foo" }

        Pattern p2 = Pattern.compile("o");
        String[] test4 = p2.split(s,2);//["b", "o:and:foo"]
        String[] test5 = p2.split(s, 3);//["b", "", ":and:foo"]
        String[] test6 = p2.split(s, 4);//["b", "", ":and:f", "o"]
        String[] test7 = p2.split(s, 5);//["b", "", ":and:f", "", ""]
        String[] test8 = p2.split(s, -1);//["b", "", ":and:f", "", ""]
        String[] test9 = p2.split(s, 0);//["b", "", ":and:f"]
        // spilt(CharSequence) 和 Split(CharSequence,0) 内部调用的是两个参数的方法，limit = 0
        String[] test10 = p2.split(s);//["b", "", ":and:f"]

        //直接分割成数据流，便于使用集合类进行数据的操作
        Stream stream = p1.splitAsStream("hello:world:demo");
        Iterator<String> ss = stream.iterator();
        while (ss.hasNext()) {
            String result = ss.next();
            System.out.println(result);
        }
    }
```

参考以上示例，分析 split 方法 limit 的参数一下几种情况：

```java
public String[] split(CharSequence input,int limit)
```

1. limit \> 0
split 方法返回的是数组，数组的长度不可以超过 limit 的值，limit ≥ 数组的长度才可以，为了满足这个条件因此切割字符串的次数最多是 limit - 1 次。
2. limit \< 0
当 limit \< 0 ，如果匹配正则表达式就会进行切割切分，匹配多少次切割多少次，数组长度没有限制。
3. limit = 0
如果匹配结果就会进行切割，切割拆分后的结果会舍弃尾部的空字符串，尾部空字符串会被丢弃，数组长度没有限制

特殊案例分析：

```java
 String[] test0 = p1.split(s, 1);//["boo:and:foo"]
```

提供的 limit = 1, 也就是数组长度最大是 1， 因此不会进行切割拆分。

```java
 String[] test5 = p2.split(s, 3);//["b", "", ":and:foo"]
```

从上面的结果可以看出，少了两个 0 ，因此进行切割了两次，因为不间断连续切割，因此中间会有一个空字符串，这样数组的总长度已经等于提供的 limit = 3 ,无法在继续进行切割。

```java
String[] test7 = p2.split(s, 5);//["b", "", ":and:f", "", ""]
```

limit = 5 , 最多只能进行切割拆分 4 次 ，中间不间断连续切割两次补了一个空字符串，尾部也是不间断连续切割补了一个字符串，最后因为在字符串尾部切割了一次，没有剩余子串，尾部会追加一个空字符串。

```java
String[] test9 = p2.split(s, 0);//["b", "", ":and:f"]
```

当 limit = 0 的时候,同一个参数的 split 方法效果相同:

```java
public String[] split(CharSequence input)
```

如果切割拆分的尾部有空字符串将会被舍弃。

```java
 Stream stream = p1.splitAsStream("hello:world:demo");
```

splitAsStream 方法提供了生成 Stream 流的方法，这样方便我们把拆分后的结果就行流式处理（切割拆分结果同 limit = 0 ，使用一个参数的 split 方法相同），方便集合操作等等。

## Matcher 中几个常见方法分析

Matcher 类用来获取匹配结果，Matcher 类中有几个高频常用方法，下面加以说明：

在解释说明 Matcher 类常用方法之前，我们需要理解一个概念，那就是正则表达式中组的概念，正则表达式如何分组，组号怎么理解的，组名又是什么呢？

正则表达式中使用括号来分组，我们可以统计有几个左括号就是有几组，从左边开始算起，组号分别是 1,2,3…..n 。

```java
(A(B(C)))
```

ABC 是第一组，组号是 1 。

BC 是第二组，组号是 2 。

C 是第三组，组号是 3 。

组号 0 表示正则表达式的一个整体，上面也是就是 ABC 。

```java
    @Test
    public void groupTest() {
        Pattern p = Pattern.compile("((\\d{3}).)(\\w{2})");
        Matcher m = p.matcher("hello987xworld456yhltest");
        int groupCount = m.groupCount();
        System.out.println("==="+ "groupCount:"+groupCount+"===");
        int findCount = 0 ;
        while (m.find()) {
            findCount++;
            System.out.println("==="+"找到第 "+ findCount + " 个匹配");
            System.out.println("==="+"匹配开始索引："+m.start()+"===");
            System.out.println("==="+"匹配结束索引：" + m.end()+"===");
            System.out.println("==="+"完全匹配结果"+"===");
            System.out.println(m.group());
            System.out.println(m.group(0));
            for (int i = 1; i <= groupCount; i++) {
                System.out.println("==="+"第 "+i +" 组"+"===");
                System.out.println(m.group(i));
            }
        }
        System.out.println("==="+"匹配到 "+ findCount + " 个结果"+"===");
    }
```

上面一段代码正则表达式有几组，每组匹配的是什么？

上面的正则表达式中分 3 组，第一组 \d{3}.  在匹配的结果中第一组是 3个数组和任意一个字符；第二组是 \d{3} 是 3 个数字；第三组 \w{2} 匹配两个字母。

```java
public int groupCount()
```

这个方法用来统计改正则表达式有几组，上面的示例中 groupCount 输出是 3 。

```java
public boolean find()
```

find 方法是找到给定字符串匹配到的正则表达式的结果，上面示例中 m.find() 结果是 true，它的运行机制是从给定的字符串 hello987xworld456yhltest 从头开始匹配正则表达式，找到 9 开始进行匹配，然后 987xwo 中到一个匹配，程序会记录下字符串匹配到的开始索引和结束索引 ；

继续匹配，一直匹配到字符串的结束为止，当匹配到 456yhl 匹配到第二个结果，程序依然会记录第二次匹配到的开始索引和结束索引。

综上所述，上面的示例 m.find () 在 while 循环到中会找到两次匹配结果，第一次匹配结果是：987xwo 返回 true ; 第二次匹配结果是：456yhl 返回 true，findCount 的输出结果是 2 。

```java
public int start()
public int end()
```

start 方法返回值是匹配到结果在字符串中的开始索引，end 方法返回的是匹配到结果在字符串中的结束索引，上面示例中匹配到的第一个结果 987xwo 在给定的字符串中 hello987xworld456yhltest 开始索引是 5，结束索引是 11； 第二个结果 456yhl 开始索引是 14，结束索引是 20 。

```java
public String group()
public String group(int group)

```

group() 方法返回的是正则表达式匹配到的结果，示例中 group()的输出结果分别是 987xwo 和 456yhl , group (0) 和 group() 结果相同都是输出完全匹配结果。

group(int) 方法中的参数是组号，上面示例中正则表达式有三组，第一组匹配的是3个数组和任意一个字符 ，因此在第一次匹配的结果 987xwo 中第一组是 987x，第二组是是 3 个数字 987，第三组是两个字母 wo；同理可分析第二次匹配结果 456yhl 中各组的匹配结果。

依据综上分析，可知上述示例的输出结果：

![https://raw.githubusercontent.com/zempty-zhaoxuan/pics/master/matcher\_result.png][image-4]

Matcher 类中 reset() 相关方法

```java
public Matcher reset()
public Matcher reset(CharSequence input)
public boolean lookingAt()
```

```java
    @Test
    public void reset() {
        Pattern p = Pattern.compile("\\d{3}");
        Matcher m1 = p.matcher("hello076world123test");
        m1.find();
        System.out.println("===m1===");
        System.out.println(m1.group());
        m1.find();
        System.out.println(m1.group());

        Matcher m2 = p.matcher("hello076world123test");
        m2.find();
        System.out.println("===m2 reset()===");
        System.out.println(m2.group());
        m2.reset();
        m2.find();
        System.out.println(m2.group());

        m2.reset("123testdemo345");
        m2.find();
        System.out.println("===m2 reset(CharSequence)===");
        System.out.println(m2.group());
        m2.find();
        System.out.println(m2.group());

        System.out.println("===m2 lookingAt()===");
        m2.lookingAt();
        System.out.println(m2.group());
        m2.lookingAt();
        System.out.println(m2.group());
    }
```

上述示例说明了 reset 方法的使用规则：

reset 中文意思是重置，在这里是重置匹配的位置，从头开始。

1. 示例中的 m1.find() 会往下寻找匹配，找到匹配后就录匹配的结束位置，当下一次 m1.find() 的时候，会从上次的匹配的结束位置，继续往下匹配。
2. m2.reset() 后会从头开始匹配，在 m2 的第一个例子中，两次的匹配结果相同。
3. 在示例 m2.reset("123testdemo345")  当中，m2 重置了要匹配的字符串对象，结果也会从头开始进行结果的匹配。
4. lookingAt() 方法的效果就是从头开始匹配，因此最后一个 lookingAt() 的示例，两次输出的结果是相同的。

![https://raw.githubusercontent.com/zempty-zhaoxuan/pics/master/reset\_result.png][image-5]

Matcher 类的 matches() 方法分析：

```java
public boolean matches()
```

```java
    @Test
    public void matches() {
        Pattern p = Pattern.compile("\\d{3}");
        Matcher m1 = p.matcher("1345");
        System.out.println(m1.matches());//false

        Matcher m2 = p.matcher("134");
        System.out.println(m2.matches());//true
        System.out.println(m2.group());//134

        Matcher m3 = p.matcher("134345");
        System.out.println(m3.matches());//false
    }
```

matches() 匹配的是整个字符串是否匹配正则表达式，比如上面示例当中的正则表达式是要匹配的是 3 个数字，m1 给定的字符串是 1345 四个数字不匹配，m2 符合要求返回true，m3 给定的 134345 给定六个数字依然不匹配，返回 false ， matches() 方法需要同 find() 方法区分开来：

1. matches 比配的是整体字符串，整体匹配正则表达式才会返回 true 。
2. find() 是在给定的字符串中从头开始找子串，子串有符合就会返回 true ；如果继续调用 find() 会从匹配的前一个子串的结尾处，继续寻找下去。

更新给定字符串的方法：

```java
public String replaceAll(String replacement)

public Matcher appendReplacement(StringBuffer sb,
                                 String replacement)

public StringBuffer appendTail(StringBuffer sb)
```

```java
    @Test
    public void updateString() {
        Pattern p1 = Pattern.compile("a*b");
        Matcher m1 = p1.matcher("aabfooaabfooabfoob");
        String s = m1.replaceAll("-");
        System.out.println(s);//-foo-foo-foo-

        Pattern p2 = Pattern.compile("cat");
        Matcher m2 = p2.matcher("one cat two cats in the yard");
        StringBuffer sb = new StringBuffer();
        while (m2.find()) {
            m2.appendReplacement(sb, "dog");
        }
        System.out.println(sb.toString());
        m2.appendTail(sb);
        System.out.println(sb.toString());
    }
```

replaceAll 方法是从给定的字符串中找匹配正则表达式的子串，找到后使用replaceAll 方法提供的字符串替换匹配到的子串，上述示示例中正则表达式的意思是匹配 b 在尾部，b 前面有 0 个或者多个 a 的子串，匹配到子串后使用 replaceAll 方法提供的参数字符串替换掉匹配到的子串，示例中 s 的输出结果是 foo-foo-foo- 。

appendReplacement 方法把给定的字符串 one cat two cats in the yard 从头开始匹配正则表达式，如果匹配成功的话，就把匹配到的子串之前的子串追加到 StringBuffer 当中，并把匹配到的子串替换成 appendReplacement 给定的第二个参数字符串继续追加到 StringBuffer 当中 ，该方法的逻辑大致总结如下：**匹配成功，StringBuffer = 目标子串前面的子串 + 替换参数**

因此上面示例 while 循环结束以后，输出结果是 one dog two dog 。

appendTail(StringBuffer) 追加尾部没匹配到的子串到 StringBuffer 当中，最终的输出是 one dog two dogs in the yard 。

综上所述关于 Matcher 类的主要功能大致列举完毕…

## 正则表达式的奇怪写法

能写出一个好的正则表达式是正则表达式最难的地方，有时候看着别人写的正则表达式就是看不懂，这时候我们就要寻求万能的谷歌帮忙了，其实正则表达式的各种表现形式，在 Java 的 Pattern API 也有列举说明：

[https://docs.oracle.com/javase/8/docs/api/java/util/regex/Pattern.html][2]

下面列举几个不常用的一些写法：

```java
(?<name>X)
(?=X)
(?!X)
(?<=X)
(?<!X)
```

为了理解上面这个表达式，我们来看看下面的例子：

```java
    @Test
    public void testPattern() {
        //给组命名 (?<name>X)
        Pattern p = Pattern.compile("(?<hello>\\d3)\\w{2}");
        Matcher m = p.matcher("test123hi");
        while (m.find()) {
            System.out.println(m.group());//23hi
            System.out.println(m.group(1));//23
            System.out.println(m.group("hello"));//23
        }

       //(?=X)
        Pattern p2 = Pattern.compile("zempty(?=handsome|cool)");
        Matcher m2 = p2.matcher("zemptycool123");
        while (m2.find()) {
            System.out.println(m2.group()); //zempty
        }
        Matcher m3 = p2.matcher("zemptyniubi");
        while (m3.find()) {//false
            System.out.println(m3.group());
        }

        //(?!X)
        Pattern p3 = Pattern.compile("zempty(?!handsome|cool)");
        Matcher m4 = p3.matcher("zemptycool");
        while (m4.find()) {//false
            System.out.println(m4.group());
        }
        Matcher m5 = p3.matcher("zemptyniubi");
        while (m5.find()) {
            System.out.println(m5.group());//zempty
        }

        //(?<=X)
        Pattern p4 = Pattern.compile("(?<=zempty|boys)handsome");
        Matcher m6 = p4.matcher("boyshandsome");
        while (m6.find()) {
            System.out.println(m6.group());//handsome
        }
        Matcher m7 = p4.matcher("everyonehandsome");
        while (m7.find()) {//false
            System.out.println(m7.group());
        }

        //(?<!X)
        Pattern p5 = Pattern.compile("(?<!zempty|boys)handsome");
        Matcher m8 = p5.matcher("boyshandsome");
        while (m8.find()) {//false
            System.out.println(m8.group());
        }
        Matcher m9 = p5.matcher("everyonehandsome");
        while (m9.find()) {
            System.out.println(m9.group());//handsome
        }
    }
```

前文提到了正则表达式的分组，但是正则表达式的命名没有提到？参考示例 “(?<hello>\\d3)\\w{2}” 表示的是匹配三个数字和两个字母的字符串，其中 “(?<hello>\\3) ” 表示的一个分组，组号是 1， 组名是 hello ，所以参考以上示例可知 m.group(”hello”) 是得到组名为 hello 的字符串。

(?=X) 可以这样理解：

1. 寻找匹配到的正则表达式字符串，其中包含匹配到的 X 子串，X 子串在尾部 ；
2. 去掉尾部匹配到的字符串中是 X 的子串，然后得到结果。

上面示例中的正则表达式是 “zempty(?=handsome|cool)” 表示的的是在含有 zemptyhandsome 或者 zemptycool 的字符串中获取 zempty 这个结果。

(?!X) 可以这样理解：

1. 寻找匹配到的正则表达式字符串其中不包含的 X 子串，不包含的 X 子串在尾部；
2. 去掉尾部匹配字符串中不是 X 的子串，然后得到结果。

上面的示例中 "zempty(?!handsome|cool)" 表示的在含有 zempty 且后面不能包含 handsome 或者 cool 的子字符串中获取 zempty 整个结果。

通常 (?=X) 和 (?!X) 的正则表达式写法就形如 xxxx(?=X) 获取尾部是 X 的 xxxx, 比如示例中 zempty(?=handsome|cool) 就是获取 zempty 这个子字符串，但是条件是只能获取zempty 后面是 handsome 或者 cool 中的 zempty 。

(?\<=X) 可以这样理解：

1. 寻找匹配到的正则表达式字符串其中包含匹配到的 X ，X 子串在头部；
2. 去掉头部匹配到的字符串中是 X 的子串，然后得到结果。

上面的示例中的正则表达式 "(?\<=zempty|boys)handsome" 表示的是在含有zemptyhandsome 或者 boyshandsome字符串中获取 handsome 这个结果。

 (?\<!X) 可以这样理解：

1. 寻找匹配到的正则表达式字符串其中不包含的 X 子串 ，不包含的 X 子串在尾部；
2. 去掉头部匹配到的字符串中不是X 的子串，然后得到结果。

上面的示例中的正则表达式 "(?\<!zempty|boys)handsome" 表示的是在获取 handsome 这个结果，但是 handsome 前面不能有 zempty 或者 boys 。

通常 (?\<=X) 和 (?\<!X) 的正则表达式写法是 (?\<=X)xxxx 获取头部是 X 的 xxxx，比如示例中的  "(?\<=zempty|boys)handsome" 就是获取 handsome 这个子字符串，但是条件是只能获取 handsome 前面是 zempty 或者 boys 的 handsome 。

[1]:	https://docs.oracle.com/javase/8/docs/api/java/util/regex/Pattern.html
[image-1]:	https://raw.githubusercontent.com/zempty-zhaoxuan/pics/master/escape_character.png
[image-2]:	https://raw.githubusercontent.com/zempty-zhaoxuan/pics/master/result.png
[image-3]:	https://raw.githubusercontent.com/zempty-zhaoxuan/pics/master/patternresult.png
[image-4]:	https://raw.githubusercontent.com/zempty-zhaoxuan/pics/master/matcher_result.png
[image-5]:	https://raw.githubusercontent.com/zempty-zhaoxuan/pics/master/reset_result.png
                                          
                                          
                                         
