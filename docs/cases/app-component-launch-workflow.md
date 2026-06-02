# 完整工作流：选择应用并启动组件

这个案例把“选择一个应用 -> 查看 Activity -> 选择组件 -> 构造启动结果”串成完整流程。它适合做应用页面跳转、快捷方式创建、组件诊断和高级启动器类工具。

## 目标

规则最终应满足：

- 读取已安装应用列表。
- 用列表对话框让用户选择应用。
- 查询该应用的 Activity 列表。
- 再次让用户选择目标 Activity。
- 输出可复制的 ComponentName 或 Intent 信息。
- 不把 `pkgName`、`selectedListItem` 声明成局部变量。

## 动作链结构

```text
ExecuteJS 生成应用列表 JSON
  -> ShowListDialog 选择应用
  -> ExecuteJS 解析 selectedListItem 并查询 Activity
  -> ShowListDialog 选择 Activity
  -> ExecuteJS 输出 ComponentName 或 Intent URI
```

列表项建议统一使用：

```json
{
  "title": "显示名称",
  "summary": "说明",
  "__value": "真实值"
}
```

这样显示内容和下游真实值不会混在一起。

## 第一步：生成应用列表

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

`ShowListDialog` 读取这段 JSON。选择后，结果进入 `selectedListItem`。

## 第二步：解析选择结果

对话框返回值可能是 JSON 字符串，也可能是普通文本。脚本要兼容：

```javascript
var selectedTextValue = selectedListItem == null ? "" : String(selectedListItem);
var packageNameValue = selectedTextValue;

try {
    var itemObj = JSON.parse(selectedTextValue);
    if (itemObj.__value != null) {
        packageNameValue = String(itemObj.__value);
    }
} catch (e) {
}

packageNameValue;
```

这一步可以把 `jsRet` 改名为 `SelectedPackageName`，让下一步更清晰。

## 第三步：查询 Activity 列表

如果上一输出已改名为 `SelectedPackageName`，下一段读取该命名上下文；如果仍用默认输出，就读取 `jsRet`。

```javascript
var packageNameValue = jsRet == null ? "" : String(jsRet);
var pm = context.getPackageManager();
var rows = [];

try {
    var packageInfoObj = pm.getPackageInfo(packageNameValue, 1);
    var activityArray = packageInfoObj.activities;

    if (activityArray != null) {
        for (var i = 0; i < activityArray.length; i++) {
            var activityInfoObj = activityArray[i];
            rows.push({
                title: String(activityInfoObj.name),
                summary: activityInfoObj.exported ? "exported" : "not exported",
                __value: packageNameValue + "/" + String(activityInfoObj.name)
            });
        }
    }
} catch (e) {
    rows.push({
        title: "查询失败",
        summary: String(e),
        __value: ""
    });
}

JSON.stringify(rows, null, 2);
```

如果目标是跨用户或工作资料应用，需要同时保存用户 ID。只保存包名会在多用户设备上失效。

## 第四步：输出组件结果

用户选择 Activity 后，输出组件名：

```javascript
var selectedTextValue = selectedListItem == null ? "" : String(selectedListItem);
var componentValue = selectedTextValue;

try {
    var itemObj = JSON.parse(selectedTextValue);
    if (itemObj.__value != null) {
        componentValue = String(itemObj.__value);
    }
} catch (e) {
}

componentValue;
```

后续可以复制组件名、写入全局变量、生成快捷方式，或进入 Intent 构造动作。

## 启动前校验

启动组件前先确认：

| 项目 | 检查 |
| --- | --- |
| 包名 | 应用是否仍安装 |
| Activity | 组件是否存在 |
| exported | 非导出 Activity 可能无法普通启动 |
| 用户 ID | 是否是主用户、工作资料或克隆用户 |
| 参数 | 是否需要 action、category、data、extra |

不要把“查到了 Activity”直接等同于“可以启动”。很多页面需要权限、登录态、Intent 参数或特定任务栈。

## 发布前检查

- 列表项必须包含显示值和真实值。
- 解析 `selectedListItem` 时要兼容 JSON 和普通文本。
- 不声明 `pkgName`、`selectedListItem`、`userId` 等上下文名。
- 组件启动失败时要输出错误摘要。
- 修改组件状态、清除数据、禁用应用等操作不要接在这个流程里；它们需要单独确认和恢复路径。
