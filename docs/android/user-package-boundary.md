# 包名与用户边界

ShortX 的很多应用相关变量都同时带 `pkgName` 和 `userId`。这不是冗余信息：同一个包可以存在于主用户、工作资料、私密空间或克隆用户中，快捷方式、组件、通知、运行状态也可能按用户隔离。

## 为什么不能默认用户 0

真实 Shortcuts 导出会扫描 `/data/system_ce/<用户ID>/shortcut_service/packages/`，并把同一包名映射到多个用户 ID。后续启动 Intent 时也会使用 `UserHandle.of(...)` 和 `context.startActivityAsUser(...)`。

这说明高级规则至少要区分三件事：

| 概念 | 含义 |
| --- | --- |
| 包名 | 应用身份，如 `tornaco.apps.shortx` |
| 用户 ID | Android 用户或资料空间 |
| 应用标签 | 展示文本，不能作为唯一键 |

只保存包名会在工作资料、克隆应用和多用户设备上失效。

## 常见来源

| 来源 | 常见字段 |
| --- | --- |
| 应用前台/后台事实 | `pkgName`、`userId`、`appLabel` |
| 通知事实 | `pkgName`、`userId`、`title`、`contentText` |
| 应用集循环 | `loopAppPkgName`、`loopAppUserId` |
| 快捷方式解析 | 包名、用户 ID、Intent URI |
| 内部服务查询 | `getActivities(user, package)`、`getServices(user, package)` |

脚本中不要声明这些保留名。可以读取它们，也可以改名为业务变量。

## 从选择项启动指定用户的 Intent

`ShowListDialog` 的 `__value` 可以保存结构化数据，例如：

```json
{"PackageName":"com.example.app","id":"10","uri":"intent:#Intent;action=android.intent.action.VIEW;end"}
```

后续 JS 读取选择结果时使用安全命名：

```javascript
importClass(android.content.Intent);
importClass(android.os.UserHandle);

var selectedRowValue = JSON.parse(selectedListItem[0]);
var packageNameValue = String(selectedRowValue.PackageName);
var targetUserIdValue = Number(selectedRowValue.id);
var targetUriValue = String(selectedRowValue.uri);

var launchIntentValue = Intent.parseUri(targetUriValue, 0);
launchIntentValue.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);

context.startActivityAsUser(
    launchIntentValue,
    UserHandle.of(targetUserIdValue)
);

"started: " + packageNameValue + "@" + targetUserIdValue;
```

这里 `selectedListItem` 是对话框输出，只读取不声明。`packageNameValue` 和 `targetUserIdValue` 是脚本内部安全名字。

## 查询能力选择

| 目标 | 优先路径 |
| --- | --- |
| 查组件 | ShortX 内部服务 `getActivities`、`getServices`、`getReceivers` |
| 查快捷方式 | `shortcut` 服务或 ShortX 动态快捷方式配置 |
| 查应用集 | ShortX 应用集 / `PkgSet` |
| 查所有用户 | ShortX 内部服务 `getAllUsers()` |
| 启动跨用户 Intent | `context.startActivityAsUser(...)` |

如果只是普通规则过滤，优先使用动作链事实变量。只有需要跨用户、组件、快捷方式或系统目录信息时，才进入内部服务或系统服务层。

## 组策略和用户限制

Android 组策略管理器导出使用 `android.os.ServiceManager.getService("user")` 读取和设置用户限制，例如禁止安装应用、禁止配置 VPN、禁止创建用户等。

这类能力属于高风险写操作：

- 它修改系统长期状态。
- 它通常绑定某个用户。
- 它可能影响设备可用性。
- 它应有明确恢复入口。

教程中应把它作为“状态管理和风险控制”案例，而不是普通开关脚本。

## 审查清单

- 规则是否保存了用户 ID，而不只是包名。
- 对话框 `__value` 是否包含足够的结构化信息。
- 启动 Intent 时是否指定目标用户。
- 组件查询是否传入正确用户 ID。
- 删除、禁用、限制类动作是否有恢复方案。
- 文档示例是否避免声明 `pkgName`、`userId`、`appLabel` 等保留名。
