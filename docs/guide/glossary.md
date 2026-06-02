# 术语表

这页用于快速统一 ShortX 高级文档里的概念。它不是官方对象大全，而是阅读本站教程时最容易混淆的词。

## 动作链

| 术语 | 含义 |
| --- | --- |
| DA | 一键指令，通常由用户手动触发，也可被脚本或 DeepLink 间接调用 |
| rule | 自动指令，依赖 fact、conditions 和 actions 自动触发 |
| fact | 事实/触发器，例如通知、应用前台、输入法显示、DeepLink |
| action | 动作链中的执行单元，例如 `ExecuteJS`、`ShowListDialog`、`ShellCommand` |
| conditions | 顶层条件，适合做快速过滤，不适合承载所有业务分支 |
| tag | fact 的入口标记，用 `RequireFactTag` 区分触发来源 |
| `customContextDataKey` | 动作元数据，用来把默认输出改名为稳定上下文名 |

## 上下文变量

| 术语 | 含义 |
| --- | --- |
| `jsRet` | `ExecuteJS` 的默认输出名 |
| `mvelRet` | MVEL 表达式的默认输出名 |
| `selectedListItem` | 列表/菜单选择结果 |
| `choices` | 选择对话框输出 |
| `textFieldInput` | 文本输入框输出 |
| `shellOut` | Shell 动作常见输出 |
| `ocrResult` | OCR 动作输出 |
| `pkgName`、`userId` | 应用/通知/进程类事实常见字段 |

这些名字都是保留名。JS/MVEL 可以读取它们，但不要声明同名局部变量、函数参数或循环变量。

## 脚本环境

| 术语 | 含义 |
| --- | --- |
| Rhino JS | ShortX 的 JavaScript 运行环境，可直接访问 Java/Android 类 |
| MVEL | 适合短条件、模板和简单表达式的表达式语言 |
| `context` | Android `Context`，不是浏览器上下文 |
| `shortx` | ShortX 公共脚本 API |
| `Packages.*` | Rhino 访问 Java/Android/ShortX 类的路径 |
| `importClass` / `importPackage` | Rhino 导入 Java 类或包 |

## API 层级

| 术语 | 含义 |
| --- | --- |
| `shortx.executeAction(...)` | 在 JS 中执行 ShortX proto action |
| `shortx.*` | 公共脚本 API，如全局变量、DA/Rule 查询、UiAutomation |
| `OooO0O0.OooO00o()` | 当前版本可验证的内部 ShortX Binder 入口 |
| `IShortX` | 内部服务接口，方法随 ShortX 版本变化 |
| `ByteArrayWrapper` | 内部 proto bytes 包装对象，不能凭空构造 |
| proto action | ShortX 动作的 protobuf 对象 |

## Android 侧

| 术语 | 含义 |
| --- | --- |
| AIDL | Android Binder 接口定义，适合查证边界，不等于可复制脚本 |
| Binder | Android 跨进程调用机制 |
| `ServiceManager.getService(...)` | 获取系统服务 Binder 的低层入口 |
| `UserHandle` | Android 用户/资料空间句柄 |
| `userId` | 用户 ID，不能默认永远是 0 |
| UiAutomation | 自动化访问节点、窗口、手势和输入事件的能力 |
| AccessibilityNodeInfo | 无障碍节点对象 |

## 数据格式

| 术语 | 含义 |
| --- | --- |
| `__value` | 对话框 JSON 中给下游消费的真实值 |
| `__icon` | 对话框 JSON 中的图标字段 |
| Rect | 屏幕区域，常用 `left/top/right/bottom` |
| Intent URI | `Intent.toUri(...)` 或 `Intent.parseUri(...)` 可处理的跳转字符串 |
| ParceledListSlice | Android 服务返回列表时常见的包装对象 |

## 风险词

| 术语 | 为什么要谨慎 |
| --- | --- |
| 删除配置 | 会丢失 DA、rule、代码库、变量或快捷方式 |
| Shell | 可能改文件、权限、系统状态 |
| 日志 | 可能含通知、URL、token、剪贴板和脚本异常 |
| 数据库 | 可能含联系人、消息、账号或业务隐私 |
| 用户限制 | 可能影响设备可用性和恢复路径 |
| 外部 dex/jar | 依赖文件路径、版本、类名和反射调用 |
