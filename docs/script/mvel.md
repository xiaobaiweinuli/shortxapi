# MVEL 写法

MVEL 是 ShortX 的另一种表达式语言，不是 JS 的简写。它更接近 Java 风格，适合条件、字符串处理、简单计算和部分系统表达式。能用一行判断解决的问题，可以用 MVEL；一旦需要复杂 JSON、文件、Android UI 或外部库，优先改用 JS。

## 适合 MVEL 的场景

- 简单正则匹配。
- 字符串、数字、布尔计算。
- Java 风格 typed declaration。
- `foreach`。
- 同类逻辑已经稳定使用 MVEL。

## 不适合 MVEL 的场景

- 大量 JSON 数据塑形。
- Android UI 构建。
- 外部 dex/jar 加载。
- `Packages.*` 风格的复杂内部服务调用。
- 需要复用 JS 代码库片段。

## 最小判断

判断通知正文里是否含验证码：

```java
import java.util.regex.Pattern;

String contentValue = contentText == null ? "" : contentText;
Pattern.compile("\\d{4,8}").matcher(contentValue).find();
```

`contentText` 是上下文变量，只读取；临时变量使用 `contentValue`。

## 输出文本

MVEL 也可以输出字符串，下游通过 `mvelRet` 读取：

```java
String contentValue = contentText == null ? "" : contentText;
contentValue.trim();
```

不要声明：

```java
String mvelRet = "";
```

`mvelRet` 是动作链输出名，不是临时变量名。

## 和 JS 的边界

MVEL 可以出现 Java typed declaration：

```java
import java.util.regex.Pattern;

String contentValue = contentText == null ? "" : contentText;
Pattern.compile("\\d{6}").matcher(contentValue).find();
```

JS 对应写法是：

```javascript
importClass(java.util.regex.Pattern);

var contentValue = contentText == null ? "" : String(contentText);
var matcherObj = Pattern.compile("\\d{6}").matcher(contentValue);
matcherObj.find();
```

不要把两者混写。MVEL 里不要写 `console.log(...)`，JS 里也不要把 `String contentValue = ...` 当作普通风格。

## 读取上游输出

如果上一段 JS 输出默认 `jsRet`，MVEL 可以读取它：

```java
String resultValue = jsRet == null ? "" : jsRet;
resultValue.length() > 0;
```

如果上一段已经用 `customContextDataKey` 改名为 `ExtractedCode`，就读取业务名：

```java
String codeValue = ExtractedCode == null ? "" : ExtractedCode;
codeValue.length() >= 4;
```

业务名也应避免使用 `title`、`text`、`pkgName` 这类常见上下文名。

## 什么时候改用 JS

出现以下情况时，不要硬写 MVEL：

- 需要 `JSON.parse(...)` / `JSON.stringify(...)` 风格的数据塑形。
- 需要 `importClass(Packages...)` 调内部 proto action。
- 需要 try/catch 包住多段 Android API。
- 需要循环生成复杂数组给 `ShowListDialog`。
- 需要加载外部 dex/jar。

MVEL 适合短判断，不适合承载完整业务流程。

## 排查清单

- 是否把 JS 的 `var`、`function`、`console.log` 写进 MVEL？
- 是否声明了 `mvelRet`、`jsRet`、`selectedListItem` 等保留名？
- 表达式最终是否真的返回了布尔值或字符串？
- 正则是否转义了反斜杠，例如 `"\\d{6}"`？
- 下游读取的是 `mvelRet`，还是改名后的业务上下文？
