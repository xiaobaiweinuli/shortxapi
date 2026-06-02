# AIDL 与 Binder 边界

AIDL 和 Binder 是 Android 系统服务的底层边界。它们可以帮助你理解服务接口，但不应该作为 ShortX 自动化的默认入口。多数规则应先使用 ShortX 动作、公共 API、proto action 或 Android manager API。

## AIDL 能告诉你什么

| 信息 | 用途 |
| --- | --- |
| 服务名 | `ServiceManager` 中的 service 名称，例如 `clipboard`、`alarm` |
| 接口描述符 | Binder 接口，例如 `android.content.IClipboard` |
| 事务码 | 排查版本差异或底层调用时参考 |
| 方法签名 | 参数类型、返回值、是否需要 callback/token/listener |
| 实现类方法 | 理解服务内部职责和权限检查 |

这些信息回答“Android 系统服务有什么接口”，不回答“ShortX 动作链应该怎么设计”。

## 为什么不能直接照抄接口形态

有些接口形态看起来像这样：

```text
android.os.ServiceManager.getService("clipboard").getPrimaryClip(...)
```

这只是理解服务方法的提示，不是完整 JS。真实 Binder 调用通常还需要：

- 通过 `Stub.asInterface(...)` 把 `IBinder` 转成接口。
- 传入调用包名、attribution tag、userId、deviceId 等参数。
- 处理隐藏 API、系统权限、签名权限。
- 提供 listener、callback、token 或 `PendingIntent`。
- 兼容不同 Android 版本的签名变化。

## ShortX 中的优先入口

开发 ShortX 自动化时，优先级应当是：

```text
ShortX 内置动作
  -> shortx.* 公共脚本 API
  -> shortx.executeAction(proto action)
  -> OooO0O0 内部 ShortX 服务
  -> Android manager API
  -> Binder/AIDL
```

AIDL 适合做最后的查证层，而不是默认执行层。

## 典型边界判断

| 能力 | 推荐入口 | 说明 |
| --- | --- | --- |
| OCR | `OcrDetect` action / `shortx.executeAction(...)` | 比直接操作截图和识别引擎稳定 |
| Shell | 内置 Shell 动作优先 | JS 内部服务调用需要 callback 和取消信号 |
| HTTP | 内置 HTTP 动作优先 | 内部 `executeHttpRequest(ByteArrayWrapper)` 不适合凭空构造 |
| 剪贴板当前内容 | ShortX 剪贴板动作或 Android `ClipboardManager` | AIDL 需要调用身份参数 |
| 读 ShortX 全局剪贴板历史 | 内部文件和 proto 解析 | 属于高级文件读取，不等同系统剪贴板 API |
| 闹钟/任务调度 | Android manager 或动作封装 | 直接 AIDL 涉及 `PendingIntent`、listener、权限 |

## 版本差异

AIDL 是系统接口，Android 版本和 ROM 都可能改变：

- 参数数量改变。
- 权限检查变严。
- 隐藏 API 被限制。
- 系统服务内部类名变化。
- 多用户、工作资料、设备 ID 参数增多。

因此底层服务接口只应作为能力地图。真正写脚本时，要在当前设备和当前 ShortX 版本中确认入口是否可用。

## 风险分级

- 只读查询：相对安全，但仍需处理 `null`、权限拒绝和版本差异。
- 状态修改：需要明确回滚方式，例如设置项、通知策略、剪贴板通知开关。
- 全局系统修改：高风险，例如系统时间、输入注入、应用权限、任务取消。
- callback/listener 注册：高风险，错误对象可能导致服务异常或资源泄露。
- 直接 Binder transact：最高风险，除非正在做底层调试，否则不建议写入教程示例。

## 最小可用原则

如果必须写到底层服务，脚本应保持最小：

1. 先做只读查询。
2. 明确输出结构。
3. 对 `null`、权限拒绝、异常做兜底。
4. 不在同一段脚本里混入 UI、文件写入和状态修改。
5. 状态写入必须配套恢复动作或人工恢复说明。
