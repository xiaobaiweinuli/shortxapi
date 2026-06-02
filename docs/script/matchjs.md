# MatchJS 条件

`MatchJS` 用来给动作链做布尔判断。它适合回答“要不要继续执行”“当前分支是否命中”，不适合承担大型数据转换、文件读写或系统调用。

## 适合场景

| 场景 | 写法 |
| --- | --- |
| 判断上游 JS 是否有输出 | 读取 `jsRet`，返回 `true` / `false` |
| 判断 MVEL 结果 | 读取 `mvelRet`，做布尔表达式 |
| 判断对话框选择 | 读取 `selectedListItem` 或 `choices` |
| 判断通知内容 | 读取 `contentText`、`title`，做关键词或正则 |
| 判断 Shell/OCR 结果 | 读取 `shellOut`、`ocrResult`，判断是否为空或包含目标文本 |

如果逻辑已经超过“判断条件”，先用 `ExecuteJS` 清洗数据，再让 `MatchJS` 只判断清洗后的结果。

## 基本形态

判断上游 JS 结果：

```javascript
var resultText = jsRet == null ? "" : String(jsRet);
resultText.length > 0;
```

判断对话框选择：

```javascript
var selectedItemText = selectedListItem == null ? "" : String(selectedListItem);
selectedItemText.indexOf("settings") >= 0;
```

判断通知文本：

```javascript
var notificationTextValue = contentText == null ? "" : String(contentText);
notificationTextValue.indexOf("验证码") >= 0 || notificationTextValue.indexOf("code") >= 0;
```

## 输出要求

`MatchJS` 的最终表达式应当是布尔值：

```javascript
var resultText = jsRet == null ? "" : String(jsRet);
resultText.indexOf("ok") >= 0;
```

不要输出字符串、JSON 或数组给下游。需要输出复杂数据时，改用 `ExecuteJS`，并通过 `customContextDataKey` 给结果命名。

## 命名规则仍然适用

即使只是条件，也不要声明上下文变量同名局部变量：

```javascript
// 错误
var selectedListItem = String(selectedListItem);

// 正确
var selectedItemText = String(selectedListItem);
selectedItemText.length > 0;
```

常见保留名包括 `jsRet`、`mvelRet`、`selectedListItem`、`choices`、`contentText`、`pkgName`、`userId`、`shellOut`、`ocrResult`。这些值可以读取，但不要声明成局部变量。

## 与 IfThenElse 的配合

常见链路：

```text
通知触发器
  -> ExecuteJS 提取验证码
  -> MatchJS 判断是否提取成功
  -> IfThenElse 命中后写剪贴板
```

其中 `ExecuteJS` 负责提取和格式化，`MatchJS` 只负责：

```javascript
var codeTextValue = jsRet == null ? "" : String(jsRet);
/^[0-9]{4,8}$/.test(codeTextValue);
```

## 不推荐

- 在 MatchJS 中写大型数据转换。
- 在 MatchJS 中修改全局变量。
- 在 MatchJS 中构造 UI。
- 在 MatchJS 中加载 dex/jar。
- 在 MatchJS 中输出复杂 JSON 给下游。
- 在 MatchJS 中使用 `console.log(...)` 当作结果。

## 排查清单

| 现象 | 检查 |
| --- | --- |
| 条件永远不命中 | 上游结果 key 是否读错 |
| 条件偶尔命中 | 是否没有处理 `null` 或空字符串 |
| 语法报错 | 是否把 MVEL typed declaration 写进 JS |
| 下游拿不到值 | MatchJS 只返回布尔值，不负责传递业务数据 |
| 变量冲突 | 是否声明了上下文保留名 |
