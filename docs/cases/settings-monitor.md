# 高级案例：设置项监视器

设置项监视器用于发现系统设置在两次运行之间发生了什么变化。它适合排查 ROM 开关、系统页面、快捷设置、开发者选项和应用操作对 `Settings.System`、`Settings.Secure`、`Settings.Global` 的影响。

这个案例的目标不是盲目批量写设置，而是把“读取快照 -> 保存快照 -> 比较差异 -> 生成恢复命令”拆成可审查的动作链。

## 动作链结构

```text
ExecuteJS 读取 Settings 快照
  -> customContextDataKey: jsRet -> SettingsSnapshot
  -> 第一次运行：写入全局变量 SettingsSnapshotBase
  -> 第二次运行：读取 SettingsSnapshotBase 并比较
  -> ExecuteJS 输出差异 JSON 数组
  -> ShowListDialog 选择差异项
  -> ExecuteJS 生成恢复 JS / Shell 文本
  -> WriteClipboard
```

如果是给普通用户使用，建议做成两个按钮：

```text
按钮一：保存当前快照
按钮二：比较当前设置与快照
```

这样用户知道当前处于“记录基线”还是“比较变化”，不会误把第一次运行当成差异结果。

## 第一步：读取 Settings 快照

读取三个命名空间，输出一个 JSON 对象。示例只做读取，不写入系统设置。

```javascript
importClass(android.provider.Settings);

var resolverObj = context.getContentResolver();

function readNamespace(labelValue, uriObj) {
    var resultObj = {};
    var cursorObj = null;

    try {
        cursorObj = resolverObj.query(uriObj, null, null, null, null);
        if (cursorObj != null) {
            var nameIndexValue = cursorObj.getColumnIndex("name");
            var valueIndexValue = cursorObj.getColumnIndex("value");

            while (cursorObj.moveToNext()) {
                var nameValue = nameIndexValue >= 0 ? String(cursorObj.getString(nameIndexValue)) : "";
                var settingValue = valueIndexValue >= 0 ? cursorObj.getString(valueIndexValue) : null;
                if (nameValue.length > 0) {
                    resultObj[labelValue + ":" + nameValue] = settingValue == null ? "" : String(settingValue);
                }
            }
        }
    } catch (e) {
        resultObj[labelValue + ":__error"] = String(e);
    } finally {
        if (cursorObj != null) {
            cursorObj.close();
        }
    }

    return resultObj;
}

var snapshotObj = {};
var systemObj = readNamespace("system", Settings.System.CONTENT_URI);
var secureObj = readNamespace("secure", Settings.Secure.CONTENT_URI);
var globalObj = readNamespace("global", Settings.Global.CONTENT_URI);

function mergeInto(targetObj, sourceObj) {
    for (var itemNameValue in sourceObj) {
        targetObj[itemNameValue] = sourceObj[itemNameValue];
    }
}

mergeInto(snapshotObj, systemObj);
mergeInto(snapshotObj, secureObj);
mergeInto(snapshotObj, globalObj);

JSON.stringify(snapshotObj, null, 2);
```

把输出改名为 `SettingsSnapshot`。不要让后续动作直接依赖默认 `jsRet`。

## 第二步：保存基线

保存基线可以使用全局变量。建议变量名带项目或规则前缀，例如：

```text
settings_monitor_base_snapshot
```

链路：

```text
ExecuteJS 读取 Settings 快照
  -> WriteGlobalVar settings_monitor_base_snapshot = {SettingsSnapshot}
  -> Toast: 已保存设置快照
```

基线可能包含敏感设置名和设备状态。导出规则前要说明变量用途，删除规则时也要说明是否清理这个变量。

## 第三步：比较差异

第二次运行时，读取全局变量作为基线，再和当前快照比较。下游列表对话框需要 JSON 数组。

```javascript
var baseTextValue = shortx.readGlobalVar("settings_monitor_base_snapshot");
var currentTextValue = SettingsSnapshot == null ? "{}" : String(SettingsSnapshot);
var rows = [];

try {
    var baseObj = JSON.parse(baseTextValue == null ? "{}" : String(baseTextValue));
    var currentObj = JSON.parse(currentTextValue);
    var seenObj = {};

    for (var baseNameValue in baseObj) {
        seenObj[baseNameValue] = true;
        var oldValue = baseObj[baseNameValue] == null ? "" : String(baseObj[baseNameValue]);
        var newValue = currentObj[baseNameValue] == null ? "" : String(currentObj[baseNameValue]);

        if (oldValue != newValue) {
            rows.push({
                title: baseNameValue,
                summary: oldValue + " -> " + newValue,
                __value: JSON.stringify({
                    name: baseNameValue,
                    oldValue: oldValue,
                    newValue: newValue
                })
            });
        }
    }

    for (var currentNameValue in currentObj) {
        if (seenObj[currentNameValue] != true) {
            rows.push({
                title: currentNameValue,
                summary: "(new) -> " + String(currentObj[currentNameValue]),
                __value: JSON.stringify({
                    name: currentNameValue,
                    oldValue: "",
                    newValue: String(currentObj[currentNameValue])
                })
            });
        }
    }
} catch (e) {
    rows.push({
        title: "比较失败",
        summary: String(e),
        __value: ""
    });
}

JSON.stringify(rows, null, 2);
```

如果 `rows` 为空，可以用 `MatchJS` 判断并显示“没有差异”，不要继续弹空列表。

## 第四步：生成恢复命令

列表选择后，`selectedListItem` 进入下一段 JS。先解析 `__value`，再按 namespace 生成恢复脚本。

```javascript
var selectedTextValue = selectedListItem == null ? "" : String(selectedListItem);
var payloadTextValue = selectedTextValue;

try {
    var itemObj = JSON.parse(selectedTextValue);
    if (itemObj.__value != null) {
        payloadTextValue = String(itemObj.__value);
    }
} catch (e) {
}

var diffObj = JSON.parse(payloadTextValue);
var fullNameValue = String(diffObj.name);
var oldValueText = diffObj.oldValue == null ? "" : String(diffObj.oldValue);
var parts = fullNameValue.split(":");
var namespaceValue = parts.length > 1 ? parts[0] : "system";
var settingNameValue = parts.length > 1 ? parts.slice(1).join(":") : fullNameValue;

var codeText = "importClass(android.provider.Settings);\n" +
    "var resolverObj = context.getContentResolver();\n" +
    "Settings." + namespaceValue.charAt(0).toUpperCase() + namespaceValue.substring(1) +
    ".putString(resolverObj, \"" + settingNameValue.replace(/\"/g, "\\\"") + "\", \"" +
    oldValueText.replace(/\"/g, "\\\"") + "\");";

codeText;
```

这一步只生成文本并复制给用户，不直接执行写入。恢复命令要人工确认后再运行。

## 风险边界

- `Settings.Secure` 和 `Settings.Global` 中有很多高风险设置。
- ROM 之间 key 的意义和可写性不同。
- 部分 key 修改后不会立即生效，可能需要重启服务或页面。
- 自动生成的恢复命令必须人工确认。
- 不应鼓励批量盲写系统设置。

## 排查清单

- 第一次运行是否真的写入了 `settings_monitor_base_snapshot`？
- `SettingsSnapshot` 是否是合法 JSON？
- 差异列表为空时，是没有变化，还是读取失败？
- `selectedListItem` 是否是 JSON 字符串，是否包含 `__value`？
- 生成的恢复命令是否匹配 `system`、`secure`、`global` 命名空间？
- 规则删除时是否需要清理基线全局变量？
