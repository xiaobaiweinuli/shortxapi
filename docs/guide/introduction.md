# ShortX 能力边界

ShortX 是 Android 自动化工具，但高级用法不能只理解成“收到事件后点几个按钮”。实际使用时，它至少包含四层能力：动作链、脚本、ShortX 服务、Android 系统。文档的目标是帮你判断该用哪一层，而不是把所有底层入口都变成可复制脚本。

## 四层能力

| 层级          | 典型用途                                                       | 文档中的处理方式         |
| ----------- | ---------------------------------------------------------- | ---------------- |
| 动作链层        | 一键指令、自动指令、触发器、条件、动作、变量传递                                   | 作为普通用户和高级用户共同基础  |
| 脚本层         | ExecuteJS、ExecuteMVEL、MatchJS、代码库片段                        | 重点讲运行时、变量流和稳定写法  |
| ShortX 服务层  | `shortx.*`、`shortx.executeAction(...)`、`OooO0O0.OooO00o()` | 面向开发者说明适用场景和风险   |
| Android 系统层 | framework API、AIDL 服务、系统设置、输入、通知、显示、网络                     | 作为高级能力说明，不机械搬运接口 |

## 推荐决策顺序

遇到一个需求，先这样判断：

```text
能不能用现成动作完成？
  -> 能：优先动作链
不能：
  -> 能不能用 JS/MVEL 转换数据？
不能：
  -> 能不能用 shortx.* 或 executeAction？
不能：
  -> 是否确实需要内部 ShortX 服务？
最后：
  -> 才考虑 Android manager API、Binder/AIDL
```

例如“收到验证码后复制”，核心是通知触发、文本提取、去重和剪贴板动作，不需要碰 Android 通知 Binder。  
例如“查询应用 Activity 列表”，可以从 `context.getPackageManager()` 开始，不需要直接调用 package AIDL。  
例如“清理 ShortX 日志”，才会进入内部 ShortX 服务，并且应该作为诊断工具，不放进普通高频自动规则。

## 默认运行模型

本文档默认把 ShortX JS/MVEL 建模为 Android/Rhino/system-server 风格环境，而不是普通第三方 App。

这意味着：

- 可以出现 `importClass(...)`、`importPackage(...)`、`Packages.*`。
- 可以直接调用 Java/Android 类。
- 可以用 `context.getSystemService(...)`、`context.getPackageManager()`、`context.getContentResolver()`。
- 可以在确认当前版本支持后，通过 `Packages.tornaco.apps.shortx.core.OooO0O0.OooO00o()` 访问内部 ShortX 服务。
- 不把 `window`、`document`、`require`、`module.exports` 当成可用环境。

## 数据流边界

动作链变量和脚本局部变量必须分清：

| 位置            | 示例                | 注意            |
| ------------- | ----------------- | ------------- |
| 动作参数占位符       | `{contentText}`   | 用在动作配置文本中     |
| JS/MVEL 上下文变量 | `contentText`     | 可以读取，不要声明同名变量 |
| 动作默认输出        | `jsRet`、`mvelRet` | 适合短链路，长链路建议改名 |
| 自定义输出名        | `ExtractedCode`   | 推荐给业务值使用      |

错误写法：

```javascript
var contentText = String(contentText);
```

正确写法：

```javascript
var contentValue = contentText == null ? "" : String(contentText);
contentValue;
```

## 风险分级

| 级别  | 含义                                     | 示例                                             |
| --- | -------------------------------------- | ---------------------------------------------- |
| 普通  | 主要影响当前动作链或用户可恢复状态                      | Toast、剪贴板、文本处理、列表对话框                           |
| 高级  | 需要理解 Android/ShortX 运行边界，可能影响系统设置或长期状态 | 全局变量、组件状态、通知访问、传感器、显示设置                        |
| 危险  | 可能造成数据丢失、系统重启、服务崩溃、锁屏/ADB/安全状态变化       | reboot、crashSystemServer、删除规则/代码库、锁屏凭据、系统服务写操作 |

危险能力不会在本站被包装成“复制就用”的普通教程。它们会以原理、查阅路径、前提和风险说明为主。

## 从需求到文档

| 需求             | 起点                                     |
| -------------- | -------------------------------------- |
| 想写第一条规则        | [一键指令与自动指令](/guide/commands-and-rules) |
| 不知道变量怎么流动      | [动作链数据模型](/chain/model)                |
| 想写 JS          | [脚本总览](/script/)                       |
| 想调用 ShortX 能力  | [API 总览](/api/)                        |
| 想理解 Android 服务 | [Android 服务总览](/android/)              |
| 想看完整任务         | [高级案例](/cases/)                        |

# 
