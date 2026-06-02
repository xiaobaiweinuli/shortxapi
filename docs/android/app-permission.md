# 应用、权限与 AppOps

应用管理、权限和 AppOps 是很多高级自动化的基础。它们常用于应用选择器、批量规则、前台应用判断、隐私状态检查、组件管理和工作资料适配。

## 能力地图

| 能力 | 相关服务 | ShortX 场景 |
| --- | --- | --- |
| 查询安装应用 | `package` | 应用选择器、批量处理、应用集 |
| 查询组件 | `package` | Activity/Service/Receiver 管理 |
| 前台应用/任务 | `activity`, `activity_task` | 自动规则条件、前台应用判断 |
| 权限状态 | `permissionmgr` | 判断功能是否可用 |
| AppOps | `appops` | 定位、后台、悬浮窗、通知等特殊操作状态 |
| 用户/资料空间 | `user` | 主用户、工作资料、克隆应用隔离 |

## 入口选择

优先级建议：

```text
ShortX 应用选择/应用集动作
  -> shortx.* 或内部 ShortX 服务
  -> Android PackageManager / AppOpsManager
  -> Binder/AIDL
```

对于 ShortX 自身管理的动作、规则、应用集、插件等对象，优先使用 ShortX 已封装入口。对于通用 Android 包信息，可以使用 `context.getPackageManager()`。

## 查询包信息

```javascript
var packageNameValue = "tornaco.apps.shortx";
var pm = context.getPackageManager();
var appInfo = pm.getApplicationInfo(packageNameValue, 0);
var labelValue = pm.getApplicationLabel(appInfo);

String(labelValue);
```

如果目标应用可能不存在，必须捕获异常：

```javascript
var packageNameValue = "com.example.missing";
var pm = context.getPackageManager();
var resultText = "";

try {
    var appInfo = pm.getApplicationInfo(packageNameValue, 0);
    resultText = String(pm.getApplicationLabel(appInfo));
} catch (e) {
    resultText = "";
}

resultText;
```

## 权限和 AppOps 的区别

| 类型 | 含义 | 示例 |
| --- | --- | --- |
| Permission | Android 权限授予状态 | 相机、定位、读取联系人 |
| AppOps | 某类操作是否允许执行 | 后台定位、悬浮窗、通知、使用情况访问 |
| 用户限制 | 用户或资料空间层面的策略 | 禁止安装应用、禁止配置 VPN |
| 组件状态 | Activity/Service/Receiver 是否启用 | 禁用某个入口或接收器 |

不要把 AppOps 简化成权限。一个应用可能拥有权限，但对应 AppOp 被限制；也可能在工作资料中和主用户状态不同。

## 命名注意

应用相关触发器常注入：

- `pkgName`
- `userId`
- `componentName`
- `appLabel`
- `taskId`

不要写：

```javascript
var pkgName = "com.example";
```

建议：

```javascript
var packageNameValue = "com.example";
```

## 发布前检查

- 是否同时保存 `pkgName` 和 `userId`。
- 是否处理应用不存在、被卸载、被冻结、位于工作资料等情况。
- 是否说明权限/AppOps 写入的恢复方式。
- 是否避免把危险操作包装成普通开关。
- 是否在失败时输出可读结果，而不是让脚本异常中断。

查询类能力通常是高级但可控。组件启停、应用隐藏、权限/AppOps 写入、清除数据、卸载阻止等属于危险或接近危险能力，必须写明恢复方式。
