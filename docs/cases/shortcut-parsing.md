# 高级案例：快捷方式解析

快捷方式解析和动态快捷方式写入不是同一个任务。写入关注 `ShortcutInfo.Builder`，解析关注目标应用、用户 ID、`ShortcutService` 返回值和 Intent URI。

## 真实链路

Shortcuts 导出里常见链路：

```text
读取已安装应用和快捷方式目录
  -> 构造应用/用户选择列表
  -> ShowListDialog
  -> selectedListItem
  -> 解析目标包名和用户 ID
  -> shortcutService.getShortcuts(...)
  -> 输出 Intent URI 列表
  -> 复制 JS / MVEL / Shell 启动模板
```

这类工具的关键是保存“包名 + 用户 ID + Intent URI”，而不是只保存应用名称。

## 查询指定应用快捷方式

```javascript
var shortcutServiceValue = android.os.ServiceManager.getService("shortcut");
if (!shortcutServiceValue) {
    throw "无法获取 shortcut 服务";
}

var selectedRowValue = JSON.parse(selectedListItem[0]);
var packageNameValue = String(selectedRowValue.PackageName);
var targetUserIdValue = parseInt(String(selectedRowValue.id), 10);
var matchAllValue = 0x0000000F;

function getListFromSlice(sliceValue) {
    if (!sliceValue) {
        return [];
    }
    try {
        var listValue = sliceValue.getList();
        if (listValue) {
            return listValue;
        }
    } catch (e) {}
    return [];
}

var sliceValue = shortcutServiceValue.getShortcuts(
    packageNameValue,
    matchAllValue,
    targetUserIdValue
);
var shortcutListValue = getListFromSlice(sliceValue);
var rows = [];

if (shortcutListValue && shortcutListValue.size && shortcutListValue.size() > 0) {
    for (var indexValue = 0; indexValue < shortcutListValue.size(); indexValue++) {
        var shortcutItemValue = shortcutListValue.get(indexValue);
        var targetIntentValue = shortcutItemValue.getIntent();
        var uriText = targetIntentValue ? targetIntentValue.toUri(0) : "";
        var labelText = shortcutItemValue.getShortLabel()
            ? String(shortcutItemValue.getShortLabel())
            : "(无标签)";

        rows.push({
            name: labelText,
            summary: packageNameValue + "@" + targetUserIdValue,
            __value: uriText.indexOf("#Intent") == 0 ? "intent:" + uriText : uriText
        });
    }
}

JSON.stringify(rows, null, 2);
```

这里 `selectedListItem` 是对话框输出，只读取不声明。不要用 `var userId` 或 `var pkgName`。

## 生成启动模板

当用户选择多个快捷方式时，可以生成启动脚本：

```javascript
var targetUserIdValue = parseInt(String(shortcutUserId), 10);
var lines = [];

for (var indexValue = 0; indexValue < selectedListItem.length; indexValue++) {
    var uriText = String(selectedListItem[indexValue]);
    lines.push("importClass(android.content.Intent);");
    lines.push("importClass(android.os.UserHandle);");
    lines.push("var launchIntentValue = Intent.parseUri('" + uriText + "', 0);");
    lines.push("launchIntentValue.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);");
    lines.push("context.startActivityAsUser(launchIntentValue, UserHandle.of(" + targetUserIdValue + "));");
}

lines.join("\n");
```

如果要生成 Shell，必须注意转义。不要把未经确认的 Intent URI 拼进自动执行的 Shell。

## 和动态快捷方式写入的区别

| 任务 | 主要对象 | 风险 |
| --- | --- | --- |
| 解析快捷方式 | `shortcutService.getShortcuts(...)` | 读取目标应用快捷入口和 Intent |
| 写入动态快捷方式 | `ShortcutInfo.Builder`、`ShortcutManager` | 修改目标应用快捷入口 |
| 固定桌面快捷方式 | `requestPinShortcut(...)` | 需要 Launcher 支持和用户确认 |
| ShortX 动态快捷方式配置 | `getAllDynamicShortcutSettings()` 等内部配置 | 依赖 ShortX 内部 proto |

读取适合做工具，写入和删除必须有人工确认。

## 排查

| 现象 | 检查 |
| --- | --- |
| 列表为空 | 用户 ID 是否正确，目标应用是否真的有快捷方式 |
| Intent 无法启动 | 是否缺少 `FLAG_ACTIVITY_NEW_TASK`，目标用户是否匹配 |
| 只能读到部分 | `MATCH_*` flags 是否覆盖 manifest、dynamic、pinned、cached |
| 工作资料启动失败 | `UserHandle` 是否是目标资料空间 |
| 复制模板不可用 | URI 是否需要 `intent:` 前缀或引号转义 |
