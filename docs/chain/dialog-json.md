# 对话框 JSON 数据流

ShortX 的列表对话框不只是“显示几行文字”。列表对话框经常用 JSON 结构把显示标题、摘要、图标和真实值一起传到后续动作。

## 推荐使用 JSON 的场景

- 列表项显示名和真实值不同。
- 下游需要包名、设置项 key、动作 id 等隐藏字段。
- 需要多选。
- 需要根据用户选择生成 JS、MVEL 或 Shell 片段。

如果只是展示一组纯文本标签，分隔符文本足够；如果后续要继续处理，JSON 更稳。

## 真实风格

常见形态：

```javascript
importPackage(Packages.tornaco.apps.shortx.core.proto.action);
importClass(Packages.tornaco.apps.shortx.core.proto.common.DialogUiStyleSettings);

var dataJson = `[
    {
        "name": "Android",
        "version": 16,
        "__value": "android",
        "__icon": "android-fill"
    }
]`;

var action = ShowListDialog.newBuilder()
    .setTitle("列表对话框")
    .setData(dataJson)
    .setDataType(ShowListDialogDataType.ShowListDialogDataType_Json)
    .setStyle(DialogUiStyleSettings.newBuilder().setFontScale(1.0).build())
    .setIsMultipleChoice(true)
    .setNeedConfirmAction(true)
    .setCancelable(true)
    .build();

var result = shortx.executeAction(action);
result.contextData.get("selectedListItem");
```

## 下游解析

单选时，`selectedListItem` 可能是一个 JSON 字符串；多选时，多选结果常按数组处理：

```javascript
var rows = [];
for (var i = 0; i < selectedListItem.length; i++) {
    var item = JSON.parse(selectedListItem[i]);
    rows.push(item.name + " = " + item.__value);
}
rows.join("\n");
```

不要写 `var selectedListItem = ...`。它是对话框输出上下文名。

## 字段约定

| 字段 | 用途 |
| --- | --- |
| `name` | 列表中主要显示文本 |
| `summary` | 副标题、说明、差异摘要 |
| `__value` | 下游真正要使用的值 |
| `__icon` | 图标名，视动作支持情况使用 |

## 常见链路

```text
ExecuteJS 生成 JSON
  -> ShowListDialog 渲染
  -> selectedListItem
  -> ExecuteJS 解析
  -> WriteClipboard / executeAction / MatchJS
```

## 失败排查

- 对话框空白：先把 JSON 输出到剪贴板验证。
- 下游解析失败：确认 `selectedListItem` 是单个字符串还是数组。
- 多选没有确认按钮：检查 `needConfirmAction`。
- 后续动作拿不到值：确认是否应使用 `customContextDataKey` 改名。

