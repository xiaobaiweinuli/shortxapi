# 一键指令与自动指令

ShortX 的基础模型来自“触发器、条件、动作”。一键指令偏手动执行，自动指令偏事件响应。两者都由动作链组成，区别在入口和生命周期。

## 一键指令

一键指令是一组动作的组合。它没有自动触发器，通常由用户主动点击、快捷方式、菜单、DeepLink 或其他动作调用。

适合：

- 把多个系统操作组合成一个按钮。
- 做一次性查询，比如读取当前 Wi-Fi、音量、屏幕信息。
- 弹出菜单或对话框，让用户选择下一步。
- 调试和封装可复用动作链。
- 做自动规则的初始化向导或诊断工具。

基础结构：

```text
一键指令
  -> ExecuteJS / 内置动作
  -> 对话框或输出
  -> 可选写入或恢复动作
```

例如“读取当前音量并展示”：

```text
ExecuteJS 读取 AudioManager
  -> customContextDataKey: jsRet -> AudioState
  -> ShowAlertDialog: {AudioState}
```

## 自动指令

自动指令由触发器、可选条件、动作组成。

典型流程：

```text
触发器产生事实
  -> 注入上下文变量
  -> 条件判断
  -> 按顺序执行动作
  -> 结果继续进入后续动作
```

适合：

- 通知、短信、剪贴板、应用前后台、手势、系统设置变化等事件响应。
- 自动复制验证码、处理通知、监视设备状态。
- 根据条件切换系统设置或执行 ShortX 内部操作。

自动规则必须比一键指令更保守。它会在后台被触发，任何写入、Shell、清理、系统设置修改，都应该有明确过滤条件和恢复路径。

## 选择一键还是自动

| 问题 | 更适合 |
| --- | --- |
| 需要用户确认或选择 | 一键指令 |
| 需要先手动验证脚本是否稳定 | 一键指令 |
| 只在收到通知或系统事件时执行 | 自动指令 |
| 高频触发，必须严格过滤 | 自动指令 |
| 会修改系统长期状态 | 先做一键指令，稳定后再接自动触发器 |
| 用于初始化变量、应用集、配置 | 一键指令或自动规则的 `actionsOnEnabled` |

很多复杂方案可以先做成一键指令，验证数据流、输出格式和恢复动作后，再拆出自动触发器。

## 动作链比单个脚本更重要

很多 ShortX 方案不是“一个 JS 脚本完成所有事”，而是多个动作互相传值：

1. `ExecuteJS` 生成数据。
2. 结果进入 `jsRet`。
3. `customContextDataKey` 可把 `jsRet` 改名为更稳定的业务名。
4. `ShowListDialog`、`WriteClipboard`、`MatchJS` 或下一段 JS 继续消费。

写文档或脚本时，必须先确定后续动作要什么形状：普通文本、JSON 字符串、布尔值、文件路径、列表项，还是命名上下文值。

## 自动规则的最小安全结构

```text
触发器
  -> MatchJS 过滤来源
  -> ExecuteJS 归一化数据
  -> customContextDataKey 改名
  -> MatchJS 判断是否继续
  -> 执行动作
  -> 记录状态或提示
```

通知类示例：

```javascript
var packageNameValue = pkgName == null ? "" : String(pkgName);
var contentValue = contentText == null ? "" : String(contentText);

packageNameValue == "com.example.sms" && contentValue.indexOf("验证码") >= 0;
```

这段适合放在 `MatchJS`。它读取 `pkgName` 和 `contentText`，但不声明同名局部变量。

## 何时使用哪一层

| 需求 | 优先选择 |
| --- | --- |
| 简单提示、复制、输入、对话框 | 内置动作 |
| 简单字符串判断、Java 风格表达式 | MVEL |
| Android API、JSON、文件、线程、UI、反射 | Rhino JS |
| 条件分支中的布尔判断 | MatchJS |
| 标准 ShortX proto 动作 | `shortx.executeAction(...)` |
| 当前版本已验证的内部 ShortX 能力 | `OooO0O0.OooO00o()` |

## 发布前自检

- 入口是否明确：手动、通知、DeepLink、应用前台还是系统变化？
- 条件是否足够过滤来源，避免误触发？
- 上下文输出是否改成稳定业务名？
- 用户取消或输入为空时是否中断？
- 写入系统状态前是否有快照和恢复动作？
- 自动规则是否会高频重复执行？
- 删除规则时是否需要清理全局变量、应用集或快捷方式？
