# ShortX API 与内部服务

ShortX 脚本里常见两类能力：公共脚本 API 和内部服务入口。

公共脚本 API 的完整决策说明见 [公共脚本 API](/api/script-shortx-api)。本页重点说明它和内部服务的选择边界。

## `shortx.*`

`shortx` 是公共 ShortX 脚本 API。常见用途包括：

- 读写全局变量。
- 执行标准 ShortX proto action。
- 获取动作结果上下文。

示例：

```javascript
var value = shortx.readGlobalVar("name");
value == null ? "" : String(value);
```

写入全局变量时，常见写法：

```javascript
shortx.writeGlobalVarWithOp("sms_dedup_hash", currentHash, 3);
currentHash;
```

其中 `3` 在真实案例中用于覆盖写入。写入全局变量属于持久状态变更，应确认变量名和恢复逻辑。

## `shortx.executeAction(...)`

当能力已经有 ShortX proto action，优先用标准动作而不是手写底层服务。

典型流程：

```javascript
importClass(Packages.tornaco.apps.shortx.core.proto.action.ShellCommand);

var action = ShellCommand.newBuilder()
    .setCommand("echo shortx")
    .build();
var result = shortx.executeAction(action);
result.contextData.get("shellOut");
```

重点不是 builder 语法，而是结果读取：很多动作会把输出放到 `result.contextData`，后续脚本需要读正确 key。

## `OooO0O0.OooO00o()`

这是内部 ShortX 服务访问路径：

```javascript
importClass(Packages.tornaco.apps.shortx.core.OooO0O0);

var iShortX = OooO0O0.OooO00o();
iShortX.getLogDir();
```

适合：

- 公共 `shortx.*` 不覆盖的 ShortX 内部能力。
- 当前版本已有同类方法完成最小验证。
- 读取 ShortX 目录、日志、规则/动作/代码库/运行状态等内部数据。

不适合：

- 为了“看起来高级”绕开已有 proto action。
- 没有当前版本验证时猜方法名。
- 对危险操作做无提示封装。

## 选择顺序

1. 内置动作能完成，优先内置动作。
2. 标准 proto action 能完成，优先 `shortx.executeAction(...)`。
3. 公共 `shortx.*` 能完成，优先公共 API。
4. 当前版本已验证内部服务方法，再使用 `OooO0O0.OooO00o()`。
5. Android/AIDL 服务调用作为高级方案，需要单独查证接口和风险。
