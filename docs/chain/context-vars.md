# 上下文变量与保留名

上下文变量是 ShortX 动作链的数据通道。它们可以来自触发器、条件、动作输出、对话框、HTTP、Shell、OCR、循环、方法 Hook 或 `customContextDataKey`。

## 引用方式

在动作参数里，常用 `{xxx}` 引用上下文变量：

```json
{
  "@type": "type.googleapis.com/WriteClipboard",
  "text": "{contentText}"
}
```

在 JS/MVEL 表达式里，有些变量会作为运行时名称出现。此时最重要的规则是：不要把上下文变量名拿来当局部变量。

## 必须保留的常见名字

| 来源 | 常见保留名 |
| --- | --- |
| JS/MVEL 输出 | `jsRet`, `mvelRet` |
| 通知 | `title`, `contentText`, `pkgName`, `userId`, `notificationTag` |
| 应用/任务 | `pkgName`, `appLabel`, `taskId`, `componentName`, `activityIntentUri` |
| 对话框 | `selectedListItem`, `choices`, `textFieldInput` |
| Shell/HTTP/OCR | `shellOut`, `httpRequestRet`, `ocrResult` |
| 剪贴板/文本 | `clipboardContent`, `selectedText`, `matchResult`, `replaceResult` |
| 循环 | `foreachIndex`, `foreachData`, `loopAppLabel`, `loopAppPkgName` |

这不是完整清单。原则是：当前或上游动作可能注入的任何字段名，都不要作为局部变量、函数参数、循环变量或解构目标。

## 错误写法

```javascript
var title = String(title);
var contentText = contentText.trim();
function pick(pkgName) {
    return pkgName;
}
var jsRet = "ok";
```

这些名字都可能与动作链上下文冲突。

## 推荐写法

```javascript
var notificationTitleText = String(title);
var contentValue = String(contentText).trim();

function pickPackage(packageNameValue) {
    return packageNameValue;
}

var resultText = "ok";
resultText;
```

## 推荐临时变量名

优先使用：

- `result`
- `output`
- `resultText`
- `finalText`
- `rows`
- `items`
- `dataList`
- `parsed`
- `contentValue`
- `taskIdValue`
- `notificationTitleText`
- `dialogTitleText`

这些名字不是魔法，只是比 `title`、`pkgName`、`jsRet` 更不容易撞到 ShortX 上下文。

