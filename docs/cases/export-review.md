# 导入前审查

本页不是导出索引，而是面向开发者和高级用户的导入审查流程。任何来自外部的 DA、rule 或代码库条目，都应该先读结构、再读风险、最后再导入。

## 第一步：确认类型

先看文件尾部：

```text
###------###
{"type":"rule"}
```

类型决定审查重点：

| 类型 | 重点 |
| --- | --- |
| `da` | 主 `actions`、参数、退出逻辑 |
| `rule` | `facts`、`conditions`、`actions`、`hook`、`quit` |
| `CodeLibraryItem` | `content`、依赖、是否会写配置或调用内部服务 |

不要直接导入“看起来像 JSON”的文件。尾部类型和主体字段都要匹配。

## 第二步：找入口

DA 的入口通常是手动执行或 DeepLink 参数。rule 的入口在 `facts`：

| 触发器 | 风险点 |
| --- | --- |
| `AppBecomeFg` | 应用前台变化会频繁触发 |
| `PkgStartRunning` / `PkgStopRunning` | 可能影响进程状态判断 |
| `MethodHook` | 需要 Hook 目标进程，通常要重启服务或设备 |
| 通知、短信、设置变化 | 可能包含隐私数据 |

例如验证码规则使用 `MethodHook` 挂到电话服务链路，这类规则导入后不是简单“等通知”，而是在更底层的触发点执行。

## 第三步：读生命周期动作

自动指令的 `hook` 很容易被忽略：

```text
hook.actionsOnEnabled
hook.actionsOnDeleted
quit
```

重点看它是否：

- 创建或删除全局变量。
- 创建应用集、包集合或 ShortX 配置。
- 弹出初始化选择对话框。
- 启用、禁用或删除其他规则。
- 写入系统设置、权限、AppOps 或服务状态。

如果 `actionsOnEnabled` 创建状态，应该有对应清理或恢复路径。没有清理路径的导出，迁移和卸载时要谨慎。

## 第四步：查危险动作

优先搜索这些动作或调用：

| 关键字 | 含义 |
| --- | --- |
| `WriteGlobalVar` / `DeleteGlobalVar` | 修改 ShortX 全局变量 |
| `CreateGlobalVar` | 新建持久状态 |
| `CreatePkgSet` | 新建应用集 |
| `SetRuleEnabled` | 启用或禁用规则 |
| `StartActivityIntentUri` | 启动外部 Intent |
| `StartService` | 启动服务 |
| `ExecuteJS` | 需要继续读脚本内容 |
| `OooO0O0.OooO00o()` | 调用内部 ShortX 服务 |
| `ServiceManager.getService` | 直接访问 Android Binder 服务 |
| `PathClassLoader` | 动态加载外部 dex/jar |
| `WindowManager.addView` | 添加悬浮窗 |
| `Instrumentation` | 模拟输入 |
| `java.io.File` | 读写或删除文件 |

这些动作不一定不能用，但必须知道它们会改什么、依赖什么、失败后如何恢复。

## 第五步：追踪输出名

导出审查时要画出数据流：

```text
ExecuteJS -> jsRet -> customContextDataKey -> reg
reg -> MatchJS -> AreaScreenshot -> screenshots
screenshots -> ExecuteJS -> jsRet
```

重点检查：

- 下游是否还在读取旧的 `jsRet`。
- `selectedListItem`、`choices`、`textFieldInput` 是否来自对应对话框。
- 自定义输出名是否和脚本局部变量冲突。
- `MatchJS` 是否读到了正确格式。

如果链路里有 JSON，先确认取消分支是否已经处理。否则 `JSON.parse(...)` 会在用户取消时失败。

## 第六步：看脚本风格

ShortX JS 应是 Rhino/Android 风格：

```javascript
importClass(java.io.File);

var fileObject = new File(screenshots);
fileObject.exists() ? fileObject.getAbsolutePath() : "";
```

审查时注意：

- 不应出现浏览器 DOM、`window`、`document`、Node.js `require`。
- 复杂 Android UI 应使用 `Handler`、`Looper`、`Runnable`。
- MVEL 表达式不要混入 JS 语法。
- `console.log(...)` 只能当调试信息，不是链路输出。
- 不要把 `jsRet`、`selectedListItem`、`screenshots`、`ocrResult` 等上下文名声明成局部变量。

## 第七步：试运行策略

建议按这个顺序试：

1. 先禁用高风险动作，只保留输出或弹窗。
2. 先复制输出到剪贴板，确认格式。
3. 再启用分支动作。
4. 最后启用写配置、写系统状态或输入模拟。

对于 `MethodHook`、系统服务、AppOps、设置写入、悬浮窗、外部 dex 加载，先在可恢复环境测试，不要直接放入日常自动规则。

## 导入前清单

- 类型尾部是否正确？
- `title`、`description`、`versionCode` 是否可信？
- rule 的 `facts` 是否会高频触发？
- `hook.actionsOnEnabled` 和 `actionsOnDeleted` 是否读过？
- 有没有内部服务、系统 Binder、文件删除、动态 dex、模拟输入？
- 所有 `customContextDataKey` 是否能被下游匹配？
- 用户取消、空结果、超时是否有分支？
- 修改系统状态前是否有恢复动作？

导入前审查的目标不是阻止使用复杂导出，而是避免“能导入、能运行，但不知道它改了什么”。
