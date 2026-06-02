# 高级案例：包与组件检查

包和组件检查常用于应用选择器、组件管理、快捷方式、插件动作、规则过滤等场景。稳定做法不是只保存包名，而是同时考虑用户空间、组件类型、启用状态和输出格式。

## 先确定目标

| 目标 | 推荐入口 |
| --- | --- |
| 查询普通安装包 | `context.getPackageManager()` |
| 查询 Activity 列表 | PackageManager 或 ShortX 内部封装 |
| 查询 ShortX 动作/规则/应用集 | ShortX API 或内部服务 |
| 判断前台应用 | ShortX 触发器上下文或 activity 服务 |
| 启停组件 | 高风险，必须记录恢复方式 |

如果目标是 ShortX 自身管理的数据，不要直接从 Android `PackageManager` 重新造一套；如果目标是普通 Android 应用信息，`PackageManager` 是更清晰的入口。

## 查询包是否存在

```javascript
var packageNameValue = "tornaco.apps.shortx";
var pm = context.getPackageManager();
var existsValue = false;

try {
    pm.getPackageInfo(packageNameValue, 0);
    existsValue = true;
} catch (e) {
    existsValue = false;
}

existsValue;
```

## 输出应用列表

给对话框使用时，推荐输出 JSON 数组，并保留 `__value` 作为真实选择值：

```javascript
var pm = context.getPackageManager();
var packageList = pm.getInstalledPackages(0);
var rows = [];

for (var i = 0; i < packageList.size(); i++) {
    var packageInfoObj = packageList.get(i);
    var appInfoObj = packageInfoObj.applicationInfo;
    var labelValue = "";

    try {
        labelValue = String(pm.getApplicationLabel(appInfoObj));
    } catch (e) {
        labelValue = packageInfoObj.packageName;
    }

    rows.push({
        title: labelValue,
        summary: packageInfoObj.packageName,
        __value: packageInfoObj.packageName
    });
}

JSON.stringify(rows, null, 2);
```

## 查询 Activity

```javascript
var packageNameValue = "tornaco.apps.shortx";
var pm = context.getPackageManager();
var packageInfoObj = pm.getPackageInfo(packageNameValue, 1);
var activityArray = packageInfoObj.activities;
var rows = [];

if (activityArray != null) {
    for (var i = 0; i < activityArray.length; i++) {
        rows.push({
            name: String(activityArray[i].name),
            exported: activityArray[i].exported
        });
    }
}

JSON.stringify(rows, null, 2);
```

不同 Android 版本的 flag 和包可见性规则可能变化。查询失败时要输出空列表或错误摘要，不要让后续对话框接收到异常。

## 命名规则

应用相关上下文常有 `pkgName`、`appLabel`、`userId`。脚本中使用：

```javascript
var packageNameValue = "tornaco.apps.shortx";
```

不要使用：

```javascript
var pkgName = "tornaco.apps.shortx";
```

## 从检查到动作

组件检查通常只是前置步骤。后续动作应明确：

- 选中的是包名、Activity 名还是完整 ComponentName。
- 是否需要 `userId`。
- 是否允许跨用户启动。
- 是否需要先校验应用仍然存在。
- 失败时是提示用户，还是走备用分支。

## 风险边界

| 操作 | 风险 |
| --- | --- |
| 查询包/组件 | 低到中 |
| 启动 Activity | 中，可能跨用户失败 |
| 禁用组件 | 高，可能影响应用可用性 |
| 清除数据/卸载/冻结 | 危险，必须有明确确认和恢复说明 |

只做教程级展示时，优先给查询和输出示例。写入类操作应单独成页说明前提、影响和恢复路径。
