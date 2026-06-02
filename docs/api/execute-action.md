# `shortx.executeAction(...)`

`shortx.executeAction(...)` 是脚本层调用 ShortX 标准动作的重要入口。它适合在 JS 中构造一个 proto action，然后让 ShortX 用自己的动作执行器去执行。

## 什么时候用

优先考虑它的场景：

- 目标能力本来就是 ShortX 动作。
- 需要在 JS 中动态构造动作参数。
- 需要执行动作后读取 `contextData`。
- 不想直接碰 Android 服务或内部 ShortX service。

不建议用它绕开简单内置动作。如果动作链里直接放一个 `WriteClipboard` 就够，不必先写 JS 再 `executeAction`。

## 基本形态

```javascript
importClass(Packages.tornaco.apps.shortx.core.proto.action.ShellCommand);

var action = ShellCommand.newBuilder()
    .setCommand("echo shortx")
    .build();

var resultObj = shortx.executeAction(action);
var outputObj = resultObj.contextData.get("shellOut");
outputObj == null ? "" : String(outputObj);
```

关键是三件事：

1. 找到正确的 proto action 类。
2. 用 builder 设置字段。
3. 读取正确的 `contextData` key。

## 先探测输出 key

不确定输出 key 时，可以先输出 `contextData` 中的所有键和值。

```javascript
importClass(Packages.tornaco.apps.shortx.core.proto.action.ShellCommand);

var action = ShellCommand.newBuilder()
    .setCommand("echo shortx")
    .build();

var resultObj = shortx.executeAction(action);
var keysObj = resultObj.contextData.keySet().toArray();
var rows = [];

for (var i = 0; i < keysObj.length; i++) {
    var keyValue = String(keysObj[i]);
    var valueObj = resultObj.contextData.get(keyValue);
    rows.push(keyValue + "=" + (valueObj == null ? "" : String(valueObj)));
}

rows.join("\n");
```

确认 key 后，再把脚本改成稳定输出。不要让正式规则依赖“输出所有 key”这种诊断结果。

## 带参数的动态动作

`executeAction` 的价值在于参数可以由 JS 生成。例如根据上游变量生成 Shell 命令：

```javascript
importClass(Packages.tornaco.apps.shortx.core.proto.action.ShellCommand);

var inputValue = jsRet == null ? "" : String(jsRet);
var commandText = "echo " + inputValue.replace(/[^0-9A-Za-z_.:-]/g, "");

var action = ShellCommand.newBuilder()
    .setCommand(commandText)
    .build();

var resultObj = shortx.executeAction(action);
var outputObj = resultObj.contextData.get("shellOut");
outputObj == null ? "" : String(outputObj);
```

如果命令来自用户输入，必须白名单或转义。不要把任意文本直接拼进 Shell、Intent、文件路径或系统设置。

## 复杂字段和 `Any.pack`

部分 proto action 的字段不是普通字符串，而是嵌套 proto 或 `google.protobuf.Any`。区域 OCR 就属于这种形态：

```javascript
importClass(Packages.tornaco.apps.shortx.core.proto.action.OcrDetect);
importClass(Packages.tornaco.apps.shortx.core.proto.common.RectSourceRect);
importClass(Packages.tornaco.apps.shortx.core.proto.common.Rect);
importClass(com.google.protobuf.Any);

var action = OcrDetect.newBuilder()
    .setRectSrc(
        Any.pack(
            RectSourceRect.newBuilder()
                .setRect(
                    Rect.newBuilder()
                        .setLeft("0")
                        .setTop("0")
                        .setRight("1080")
                        .setBottom("2400")
                        .build()
                )
                .build()
        )
    )
    .build();

var resultObj = shortx.executeAction(action);
var outputObj = resultObj.contextData.get("ocrResult");
outputObj == null ? "" : String(outputObj);
```

这类动作不能只凭字段名猜。要确认字段类型、是否需要 `Any.pack(...)`、输出 key 是什么。

## 和动作链的关系

`executeAction` 不是动作链的替代品。它更像是“在 JS 里临时执行一个 ShortX 动作”。执行结果仍然要被塑形成下游能读懂的值：

- 普通文本：最后输出字符串。
- 列表：输出 JSON 数组字符串。
- 结构化数据：输出 JSON 对象字符串。
- 后续多步消费：用 `customContextDataKey` 改成稳定名称。

## 常见失败

| 现象 | 排查 |
| --- | --- |
| 类不存在 | action 类名不适配当前 ShortX 版本 |
| builder 方法不存在 | 字段名或 proto 版本不匹配 |
| 返回为空 | 读错了 `contextData` key |
| 参数形状正确但运行失败 | 字段需要嵌套 proto、枚举或 `Any.pack(...)` |
| 下游拿不到结果 | 未输出最终表达式，或没有改名给下游读取 |

## 查证动作类

如果要写新动作调用，优先查：

- ShortX 动作配置里是否已经有对应能力。
- 同类动作的 `@type`、builder 字段和输出 key。
- 参数是否需要 `Any.pack(...)`、Rect、路径、布尔值或枚举。
- 下游读取的是哪个 `contextData` key。

不要仅凭动作名猜 builder 字段。
