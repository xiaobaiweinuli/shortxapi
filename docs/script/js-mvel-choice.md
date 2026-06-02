# JS 与 MVEL 选择指南

JS 和 MVEL 都能调用 Android/ShortX 能力，但它们不是同一种语言。不要为了省事写成混合语法。

## 优先选择 JS

这些场景优先用 `ExecuteJS`：

- JSON 解析和生成。
- 数组、对象、列表转换。
- `ShowListDialog` 数据整理。
- `selectedListItem` 解析。
- `shortx.executeAction(...)`。
- `Packages.*`、`importClass(...)`、`importPackage(...)`。
- `PathClassLoader` 加载外部 dex/jar。
- 长 UI、悬浮窗、线程、反射。

典型 JS：

```javascript
var contentValue = contentText == null ? "" : String(contentText);
var resultText = contentValue.replace(/\s+/g, " ").trim();
resultText;
```

## 优先选择 MVEL

这些场景可以优先用 MVEL：

- 简短 Java 风格表达式。
- typed declaration 更自然的逻辑。
- `foreach` 处理简单集合。
- 同类逻辑已经稳定使用 MVEL。
- 简单 Settings Provider 表达式。

典型 MVEL：

```java
String textValue = contentText == null ? "" : contentText;
textValue.length() > 0;
```

## 优先选择 MatchJS

`MatchJS` 只用于分支判断：

```javascript
var resultText = jsRet == null ? "" : String(jsRet);
resultText.indexOf("ok") >= 0;
```

如果需要解析 JSON、构造列表、写全局变量，应先用 `ExecuteJS` 处理。

## 不要混写

不要这样写：

```javascript
String textValue = contentText == null ? "" : contentText;
console.log(textValue);
```

第一行是 MVEL/Java 风格，第二行是 JS 调试风格。应明确选择一种语言表面。

## 决策表

| 任务 | 推荐 |
| --- | --- |
| 提取通知验证码 | JS 或 MVEL；复杂正则和多输出用 JS |
| 判断上游结果是否为空 | MatchJS |
| 生成列表对话框 JSON | JS |
| 解析 `selectedListItem` | JS |
| 读取 Settings 一个值 | MVEL 或 JS，按邻近导出风格 |
| 调用 ShortX proto action | JS |
| 调用内部 ShortX 服务 | JS |
| 加载外部 jar/dex | JS |
| 简单数字、布尔计算 | MVEL 或 MatchJS |

## 输出差异

JS 默认输出进入 `jsRet`，MVEL 默认输出进入 `mvelRet`。

不要在脚本里声明：

```javascript
var jsRet = "";
```

也不要在 MVEL 里声明：

```java
String mvelRet = "";
```

它们是动作链输出名，不是临时变量名。

