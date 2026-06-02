# 动作输出契约

动作链里的“返回值”不是一个统一类型。不同动作会把结果放进不同上下文名，后续步骤必须按约定读取。

## 常见输出位置

| 动作或脚本 | 默认输出 | 说明 |
| --- | --- | --- |
| `ExecuteJS` | `jsRet` | JS 最终表达式结果 |
| `ExecuteMVEL` | `mvelRet` | MVEL 表达式结果 |
| `ShowListDialog` | `selectedListItem` | 用户选中的项，可能是普通文本或 JSON 项 |
| `ShowChoiceDialog` | `choices` | 选择结果 |
| `ShowTextFieldDialog` | `textFieldInput` | 输入框文本 |
| `HttpRequest` | `httpRequestRet` | HTTP 请求结果 |
| Shell 动作 | `shellOut` | Shell 输出 |
| `OcrDetect` | `ocrResult` | OCR 识别文本 |
| 下载/媒体动作 | `downloadFilePath`、`mediaUri` 等 | 文件路径或 URI |

这些名字既是动作链数据名，也是脚本保留名。读取可以，声明不可以。

## 先定义消费者

写脚本前先确认下一步要什么：

| 下游消费者 | 推荐输出 |
| --- | --- |
| 写剪贴板、弹窗、通知 | 普通字符串 |
| `MatchJS` 分支 | 布尔值或短字符串 |
| `ShowListDialog` | JSON 数组字符串或分隔文本 |
| 后续多字段处理 | JSON 对象字符串 |
| 多步链路共享 | `customContextDataKey` 改名 |

如果下游是对话框，输出要面向 UI；如果下游是脚本，输出要面向解析。

## 文本契约

适合通知、剪贴板、弹窗：

```javascript
var resultText = String(contentText).replace(/\s+/g, " ").trim();
resultText;
```

文本契约最简单，但不适合长期传递多字段数据。

## JSON 列表契约

适合 `ShowListDialog`：

```javascript
var items = [
    {
        name: "打开设置",
        summary: "跳转到系统设置",
        __value: "android.settings.SETTINGS"
    }
];

JSON.stringify(items, null, 2);
```

后续解析选择项：

```javascript
var parsed = JSON.parse(selectedListItem);
String(parsed.__value);
```

不要写 `var selectedListItem = ...`。

## JSON 对象契约

适合多字段结果，例如 HTTP、OCR、文件处理后的结构化输出：

```javascript
var output = {
    ok: true,
    text: String(jsRet),
    source: "previous-step"
};

JSON.stringify(output);
```

后续步骤只依赖字段名，不依赖展示文本。

## `executeAction` 的结果契约

`shortx.executeAction(...)` 的返回值常见形态是执行结果对象，真正结果在 `contextData` 中：

```javascript
var result = shortx.executeAction(action);
var output = result.contextData.get("ocrResult");
output == null ? "" : String(output);
```

读取 `contextData` key 时，应以动作页面、同类动作链或 proto action 类型说明为准。不要猜字段名。

## 改名契约

链路超过两步时，建议把关键结果改名：

```json
"customContextDataKey": {
  "keys": [{
    "first": "jsRet",
    "second": "ExtractedCode"
  }]
}
```

改名的目的不是美化，而是降低下游误读风险。后续动作看到 `{ExtractedCode}`，比看到 `{jsRet}` 更容易知道这个值代表什么。

## 检查清单

- 下游需要文本、布尔值、JSON 列表还是 JSON 对象？
- 默认输出名是否需要 `customContextDataKey`？
- 是否误把 `jsRet`、`selectedListItem`、`shellOut`、`ocrResult` 当作局部变量声明？
- 是否在循环里多次输出，而不是最终输出一个稳定值？
- `console.log(...)` 是否只用于调试，而不是被当成链路结果？

