# Android 服务

Android 服务说明用于理解 ShortX 能力边界，不应该被机械搬运成接口页面。真正要回答的是：这个系统能力在 ShortX 动作链里应该怎么用、何时不该直接用、失败后怎么恢复。

## 先按场景找服务

| 你想做什么 | 优先阅读 |
| --- | --- |
| 收到通知后过滤、复制、清理 | [Notification 服务](/android/notification-service)、[通知处理](/cases/notification) |
| 查包名、Activity、权限、AppOps | [应用、权限与 AppOps](/android/app-permission)、[包名与用户边界](/android/user-package-boundary) |
| 读写系统设置 | [Settings Provider](/android/settings-provider)、[设置恢复](/cases/settings-restore) |
| 控制输入、显示、刷新率 | [Input 与 Display](/android/input-display)、[系统交互边界](/android/system-interaction-boundary) |
| 截图、OCR、控件定位 | [无障碍、截图与 OCR](/android/accessibility-ocr-screenshot)、[无障碍节点检索](/android/accessibility-node-inspection) |
| 处理网络、音频、电源状态 | [网络、音频与电源](/android/network-audio-power) |
| 理解 Binder/AIDL 能不能直接用 | [AIDL 与 Binder 边界](/android/aidl-binder-boundary) |

## 从服务到动作链

不要从 AIDL 方法签名直接开始写脚本。更稳的路径是：

```text
确认业务目标
  -> 找 ShortX 是否已有动作或上下文变量
  -> 选择 Android manager API 或 ShortX API
  -> 只读验证
  -> 设计输出格式
  -> 如需写入，先做快照和恢复动作
```

例如“读取目标应用 Activity”不需要 Binder：

```javascript
var packageNameValue = "tornaco.apps.shortx";
var pm = context.getPackageManager();
var packageInfoObj = pm.getPackageInfo(packageNameValue, 1);
var activityArray = packageInfoObj.activities;
var rows = [];

if (activityArray != null) {
    for (var i = 0; i < activityArray.length; i++) {
        rows.push({
            title: String(activityArray[i].name),
            summary: activityArray[i].exported ? "exported" : "not exported",
            __value: packageNameValue + "/" + String(activityArray[i].name)
        });
    }
}

JSON.stringify(rows, null, 2);
```

这类查询适合接 `ShowListDialog`，再由 `selectedListItem` 进入下一步。

## 读写边界

| 能力 | 文档写法 |
| --- | --- |
| 读取状态 | 给最小脚本、输出格式、空值处理 |
| 写入设置 | 说明命名空间、原值快照、恢复动作 |
| 注入输入 | 说明焦点、前台页面、超时和误触风险 |
| 清理通知或日志 | 说明范围、确认步骤和不可逆影响 |
| 禁用组件或限制用户 | 说明恢复方式，不放进高频自动触发器 |

读取失败通常应输出空字符串、空数组或错误摘要；不要让异常直接进入下游对话框或写入动作。

## 多用户和工作资料

包名不是唯一定位。高级规则经常还要考虑：

- `userId`。
- 工作资料或克隆空间。
- 组件属于主用户还是其他用户。
- 通知、权限、AppOps 是否按用户隔离。

脚本里可以读取 `pkgName`、`userId`，但不要声明 `var pkgName` 或 `var userId`。改用 `packageNameValue`、`targetUserIdValue` 这类业务变量名。

## 阅读顺序

1. [服务阅读方法](/android/service-reading)
2. [服务能力地图](/android/service-map)
3. [AIDL 与 Binder 边界](/android/aidl-binder-boundary)
4. [系统交互边界](/android/system-interaction-boundary)
5. 按能力阅读具体服务页。

## 具体服务

| 能力 | 页面 |
| --- | --- |
| 通知、渠道、监听、DND | [Notification 服务](/android/notification-service) |
| 输入、显示、刷新率、窗口 | [Input 与 Display](/android/input-display) |
| 输入、显示、传感器、权限写操作边界 | [系统交互边界](/android/system-interaction-boundary) |
| 应用、权限、AppOps | [应用、权限与 AppOps](/android/app-permission) |
| 包名、多用户、工作资料 | [包名与用户边界](/android/user-package-boundary) |
| 用户限制、组策略、设备可用性 | [用户限制与组策略](/android/user-restrictions) |
| Settings Provider | [Settings Provider](/android/settings-provider) |
| 调度、闹钟、系统状态 | [调度、闹钟与系统状态](/android/scheduling-state) |
| 网络、音频、电源 | [网络、音频与电源](/android/network-audio-power) |
| 无障碍、截图、OCR | [无障碍、截图与 OCR](/android/accessibility-ocr-screenshot) |
| 节点属性、控件锚点、UI 检索 | [无障碍节点检索](/android/accessibility-node-inspection) |

## 使用边界

- 能用 ShortX 动作解决，就不直接写 Binder。
- 能用 Android manager API，就不直接 transact。
- AIDL 方法签名只用于查证，不等于可复制脚本。
- 修改系统长期状态前，要有恢复路径。
