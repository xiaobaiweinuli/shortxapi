# 输出模板

动作链里的脚本不是独立程序。它的输出必须符合下游动作的期待。

## 普通文本

用于 Toast、弹窗、通知、剪贴板。

```javascript
var contentValue = contentText == null ? "" : String(contentText);
var resultText = contentValue.trim();
resultText;
```

## 布尔判断

用于 `MatchJS`。

```javascript
var resultText = jsRet == null ? "" : String(jsRet);
resultText.length > 0;
```

复杂处理先放到 `ExecuteJS`，`MatchJS` 只做最后判断。

## JSON 列表

用于 `ShowListDialog`。

```javascript
var items = [
    {
        name: "打开设置",
        summary: "跳转到系统设置",
        __value: "android.settings.SETTINGS"
    },
    {
        name: "复制文本",
        summary: "写入剪贴板",
        __value: "copy-text"
    }
];

JSON.stringify(items, null, 2);
```

后续解析：

```javascript
var parsed = JSON.parse(String(selectedListItem));
var resultText = String(parsed.__value);
resultText;
```

不要声明 `var selectedListItem = ...`。

## JSON 对象

用于多字段传递。

```javascript
var output = {
    ok: true,
    source: "notification",
    value: String(contentText)
};

JSON.stringify(output);
```

下游读取：

```javascript
var parsed = JSON.parse(String(jsRet));
var resultText = parsed.ok ? String(parsed.value) : "";
resultText;
```

## 多行列表

用于快速展示，不需要结构化选择时使用。

```javascript
var rows = [];
for (var i = 0; i < dataList.length; i++) {
    rows.push(String(dataList[i]));
}

rows.join("\n");
```

如果后续还要知道每一项的真实值，改用 JSON 列表。

## `executeAction` 结果

用于在 JS 中执行 ShortX proto action。

```javascript
var result = shortx.executeAction(action);
var output = result.contextData.get("ocrResult");
output == null ? "" : String(output);
```

`ocrResult`、`shellOut`、`selectedListItem` 这类 key 需要从动作页面、同类动作链或 proto action 类型说明查证。

## 改名输出

链路变长时，用 `customContextDataKey` 改名：

```json
"customContextDataKey": {
  "keys": [{
    "first": "jsRet",
    "second": "ExtractedText"
  }]
}
```

改名后的 `ExtractedText` 也是下游保留名，后续脚本可以读取，不能声明同名局部变量。

## 失败输出

失败时不要含糊地返回 `null`。按下游需求选择：

| 下游 | 推荐失败输出 |
| --- | --- |
| 文本展示 | `"ERROR: " + e` |
| MatchJS | `false` |
| JSON 对象 | `{"ok":false,"error":"..."}` |
| 列表对话框 | `[]` |

