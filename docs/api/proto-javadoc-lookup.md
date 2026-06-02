# Proto Action 查找

`shortx.executeAction(...)` 的难点不是调用本身，而是找到正确的 action 类、builder 字段和结果 key。把它当成“动态执行内置动作”的入口，而不是普通 JavaScript 函数。

## 查找顺序

推荐按这个顺序判断：

1. 先看 ShortX 页面里的动作配置，确认这个能力是否已有内置动作。
2. 再看同类动作链，找 action 的 `@type`、字段名和 `customContextDataKey`。
3. 如果当前版本能查看 proto action 类型，再查 `tornaco.apps.shortx.core.proto.action` 包。
4. 最后才看反编译结果或 Android 服务说明。

不要只凭类名猜 builder 字段。很多 action 的字段是 proto 包装对象，直接猜会写出形状看似正确但运行失败的脚本。

## 从动作结构反推 action

动作链结构通常能看到：

```json
{
  "@type": "type.googleapis.com/ExecuteJS",
  "expression": "...",
  "customContextDataKey": {}
}
```

如果是内置动作，`@type` 会指向具体 action。它可以帮助你确认：

- action 类名。
- builder 字段名。
- 上下文输出 key。
- 是否需要 `customContextDataKey`。

这一步只解决“该调用哪个类”。字段如何构造、结果从哪里取，还要继续验证。

## 从示例反推 builder

OCR action 展示了典型形态：

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

这个例子说明三件事：

- action 参数可能需要 `Any.pack(...)`。
- 坐标、路径、文本等字段要按 proto 字段类型传。
- 最终结果不一定是 action 返回值本身，而是 `contextData` 里的 key。

## 什么时候不用 `executeAction`

如果动作链直接放一个内置动作就能完成，不要为了“脚本化”而把它包进 JS。

适合直接动作的场景：

- 写剪贴板。
- 显示弹窗。
- 简单 HTTP 请求。
- 简单 Shell 命令。
- 固定参数的 OCR 或截图。

适合 `executeAction` 的场景：

- 参数需要由 JS 动态生成。
- 需要在 JS 中连续执行并解析结果。
- 需要把多个 action 的结果合并成一个输出。
- 需要复用代码库片段。

## 结果 key 要查证

常见 key 包括 `selectedListItem`、`shellOut`、`httpRequestRet`、`ocrResult`，但不能把这些当成所有动作的通用规律。

查证方式：

- 看动作页面可复制的上下文变量。
- 看同类动作链的下游如何引用 `{xxx}`。
- 看代码库样例如何 `result.contextData.get("xxx")`。
- 看 proto action 类型是否标出输出含义。

如果 key 不确定，先把 `contextData` 的键集合转成文本输出，再决定下游读取哪个值：

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

## 与内部服务的边界

`executeAction` 是公共动作执行路径；`Packages.tornaco.apps.shortx.core.OooO0O0.OooO00o()` 是内部 ShortX 服务路径。

优先级通常是：

```text
内置动作
  -> shortx.* 公共 API
  -> shortx.executeAction(...)
  -> OooO0O0 内部服务
  -> Android Binder/AIDL
```

越往后越依赖实现细节，越需要先做最小验证。
