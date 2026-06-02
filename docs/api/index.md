# API

这里的 API 文档不是方法大全，而是 ShortX 脚本调用路径的决策指南。写 API 调用前先问：这个能力能不能用内置动作完成？能不能用 `shortx.*` 完成？只有前两层不够时，才进入 proto action、内部服务或 Android 服务。

## 调用路径

优先级通常是：

```text
内置动作
  -> shortx.* 公共 API
  -> shortx.executeAction(proto action)
  -> OooO0O0 内部 ShortX 服务
  -> Android manager API
  -> Binder/AIDL
```

越往后越依赖内部实现和系统版本，也越需要先确认当前 ShortX 版本和设备环境是否支持。

## 怎么选择入口

| 目标 | 首选 | 何时升级到更底层 |
| --- | --- | --- |
| 复制、弹窗、HTTP、Shell、OCR | 内置动作 | 参数需要 JS 动态生成时用 `executeAction` |
| 读取或写入 ShortX 全局变量 | `shortx.*` | 需要管理 proto 配置时再看内部服务 |
| 执行一个 ShortX 标准动作 | `shortx.executeAction(...)` | 动作类、字段和输出 key 都已确认 |
| 查询 ShortX 日志、插件、配置 | 内部 ShortX 服务 | 只做诊断、备份或高级维护 |
| 查询应用、包、权限、设置 | Android manager API | manager 不够时才看 Binder/AIDL |
| 修改系统长期状态 | 受控动作链 | 必须有确认、快照和恢复路径 |

不要把内部服务当成更高级的捷径。它适合解决“公共动作和公共 API 没覆盖”的问题，不适合替代普通动作链。

## 最小验证流程

写一个 API 教程或脚本时，按这个顺序验证：

1. 输出固定字符串，确认 `ExecuteJS` 本身能运行。
2. 调用只读 API，输出简单文本。
3. 把结果改成 JSON，确认下游能解析。
4. 增加失败分支，避免异常中断整条链。
5. 如果涉及写入，先做快照或备份。
6. 写入后提供恢复动作或恢复说明。

只读示例：

```javascript
var rootDir = shortx.getShortXDir();
rootDir == null ? "" : String(rootDir);
```

内部服务最小查询示例：

```javascript
importClass(Packages.tornaco.apps.shortx.core.OooO0O0);

var serviceObj = OooO0O0.OooO00o();
var valueObj = serviceObj == null ? null : serviceObj.getLogDir();
valueObj == null ? "" : String(valueObj);
```

如果最小查询都失败，不要继续写删除、更新、清理日志、写配置等操作。

## `executeAction` 的位置

`shortx.executeAction(...)` 适合“在 JS 中动态执行一个 ShortX 动作”：

```javascript
importClass(Packages.tornaco.apps.shortx.core.proto.action.ShellCommand);

var action = ShellCommand.newBuilder()
    .setCommand("echo shortx")
    .build();

var resultObj = shortx.executeAction(action);
var outputObj = resultObj.contextData.get("shellOut");
outputObj == null ? "" : String(outputObj);
```

这类脚本要同时确认三件事：action 类、builder 字段、`contextData` 输出 key。缺一个都不应该写成可复制教程。

## 风险分层

| 层级 | 可以怎么写文档 |
| --- | --- |
| 只读查询 | 可以给完整示例和输出格式 |
| 可恢复写入 | 给确认步骤、快照、恢复动作 |
| 破坏性操作 | 只讲边界和审查，不给无确认的一键脚本 |
| 内部配置写入 | 说明版本依赖、bytes/proto 形态和失败兜底 |
| Binder/AIDL | 用于理解能力边界，不直接当普通教程入口 |

## 页面索引

| 页面 | 解决什么问题 |
| --- | --- |
| [公共脚本 API](/api/script-shortx-api) | 使用 `shortx.*` 查询、执行、读写变量和访问运行环境 |
| [ShortX API 与内部服务](/api/shortx-api) | 判断该走公共 API 还是内部服务 |
| [executeAction](/api/execute-action) | 在 JS 中执行 ShortX proto action |
| [Proto Action 查找](/api/proto-javadoc-lookup) | 查 action 类、builder 字段和输出 key |
| [内部 ShortX 服务](/api/internal-service) | 使用 `OooO0O0.OooO00o()` 的边界 |
| [运行诊断接口](/api/runtime-diagnostics) | 日志、fatal 状态、运行诊断 |
| [诊断记录](/api/diagnostic-records) | 查看动作、条件、事实和 Settings 记录 |
| [插件能力发现](/api/plugin-capabilities) | 查看插件提供的动作和条件 |
| [配置数据管理](/api/config-data-management) | 管理一键指令、自动指令、代码库、全局变量 |
| [代码库管理](/api/code-library-management) | 读取、执行和审查代码库条目 |
| [WebDAV 配置管理](/api/webdav-management) | 检查、删除和审查 WebDAV 配置入口 |
| [开关指令与总开关](/api/toggles-feature-switches) | 诊断自动规则总开关和开关指令状态 |
| [全局变量](/api/global-vars) | 跨链路持久状态 |
