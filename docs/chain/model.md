# 动作链数据模型

动作链正确与否，常常不取决于单段 JS，而取决于结果有没有交给下一个动作。

## 基本流向

```text
触发器 / 上游动作
  -> 上下文变量
  -> ExecuteJS / ExecuteMVEL / 内置动作
  -> jsRet / mvelRet / 动作自定义输出
  -> customContextDataKey 改名
  -> MatchJS / 对话框 / 剪贴板 / 全局变量 / 后续 JS
```

## `jsRet`

`ExecuteJS` 的默认结果进入 `jsRet`。它可能立刻被后续动作读取：

```json
{
  "@type": "type.googleapis.com/WriteClipboard",
  "text": "{jsRet}"
}
```

不要在 JS 里写 `var jsRet = ...`。`jsRet` 是动作链输出名，应当视为保留名。

## `mvelRet`

`ExecuteMVEL` 的默认结果进入 `mvelRet`。它和 `jsRet` 一样是动作链输出，不应该作为 MVEL 或 JS 的局部变量名。

## `customContextDataKey`

当链路变长时，不要一直依赖 `jsRet` 传递关键业务值。复杂链路常用 `customContextDataKey` 把结果改名：

```json
"customContextDataKey": {
  "keys": [{
    "first": "jsRet",
    "second": "PackageName"
  }]
}
```

改名后，下游动作应使用 `{PackageName}` 或对应上下文变量。这个新名字也变成保留名，后续脚本不要再声明同名局部变量。

## 对话框数据流

`ShowListDialog` 常见流向：

1. JS 生成 JSON 数组字符串。
2. `ShowListDialog` 以 JSON 数据类型渲染。
3. 用户选择结果进入 `selectedListItem`。
4. 后续 JS 或 MatchJS 解析 `selectedListItem`。

用于对话框的数据建议包含：

```json
[
  {
    "name": "显示标题",
    "summary": "说明",
    "__value": "真实值",
    "__icon": "可选图标"
  }
]
```

## 输出规则

- 不用 `print` 作为真实输出。
- 不在循环中逐次输出真实结果。
- 先把结果收集到变量、数组或字符串构造器里。
- 最后只产生一个稳定结果。

真实风格：

```javascript
var rows = [];
for (var i = 0; i < dataList.length; i++) {
    rows.push(dataList[i].name);
}
rows.join("\n");
```

