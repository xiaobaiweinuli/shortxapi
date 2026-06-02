# 高级案例：Intent 与 DeepLink

Intent 和 DeepLink 常用于打开指定应用页面、触发内部入口、配合动态快捷方式。它们看起来简单，但最容易出错的是“入口到底属于谁”。

## 三种入口

| 入口 | 适合场景 | 风险 |
| --- | --- | --- |
| Android `Intent` | 打开 Activity、URI、系统设置页 | 目标组件可能不存在 |
| ShortX DeepLink | 触发 ShortX 已配置的 DeepLink 名称 | 依赖 ShortX 内部配置 |
| 动态快捷方式 | 给应用添加可点击入口 | 需要管理 shortcut ID |

## ShortX DeepLink

内部服务入口示例：

```javascript
Packages.tornaco.apps.shortx.core.OooO0O0.OooO00o().deepLinkTriggerCalled("shortx名字");
```

这表示 DeepLink 可以由 ShortX 内部服务触发。教程中应把它标为内部 ShortX 能力，不要包装成通用 Android API。

适用场景：

- 已经在 ShortX 中配置好 DeepLink 名称。
- 想从脚本或动作链触发这个入口。
- 不想手写目标应用的复杂 Intent URI。

## Android Intent URI

动态快捷方式样例中常见 `Intent.parseUri(...)`：

```javascript
importClass(android.content.Intent);

var targetIntentUri = "intent:#Intent;action=android.intent.action.VIEW;end";
var targetIntent = Intent.parseUri(targetIntentUri, 0);
targetIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);

targetIntent.toUri(0);
```

如果要启动 Activity，应先确认目标包和组件存在。可以配合 [包与组件路由](/cases/component-routing)。

## 设计链路

```text
生成候选入口 JSON
  -> ShowListDialog
  -> selectedListItem
  -> 解析 __value
  -> 触发 DeepLink 或启动 Intent
```

候选项建议保存：

```json
{
  "name": "打开 ShortX",
  "summary": "触发已配置 DeepLink",
  "__value": "{\"type\":\"shortx-deeplink\",\"name\":\"shortx名字\"}"
}
```

后续 JS 解析：

```javascript
var parsed = JSON.parse(String(selectedListItem));
var output = "";

if (parsed.type === "shortx-deeplink") {
    Packages.tornaco.apps.shortx.core.OooO0O0.OooO00o().deepLinkTriggerCalled(String(parsed.name));
    output = "triggered";
}

output;
```

## 常见错误

- 把 ShortX DeepLink 名称当成 Android URI。
- 直接启动组件前没有检查组件是否存在。
- 在自动规则中无条件跳转页面，造成前台应用被打断。
- 动态快捷方式添加后没有记录 shortcut ID，无法删除。

