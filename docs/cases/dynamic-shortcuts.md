# 高级案例：动态快捷方式

动态快捷方式可以把一个 Intent URI 挂到指定应用的快捷入口上。高级写法既有基于 `ShortcutManager` 的写法，也有直接访问 `shortcut` 系统服务的写法。

## 推荐入口

优先使用目标应用 `Context` 的 `ShortcutManager`：

```javascript
importClass(android.content.Context);
importClass(android.content.pm.ShortcutInfo);
importClass(android.graphics.drawable.Icon);
importClass(android.content.Intent);
importClass(java.util.Collections);

var targetPackageName = "tornaco.apps.shortx";
var targetIntentUri = "intent:#Intent;action=android.intent.action.VIEW;end";
var shortcutIdValue = "shortcut_0001";

try {
    var targetContext = context.createPackageContext(
        targetPackageName,
        Context.CONTEXT_IGNORE_SECURITY
    );
    var shortcutManager = targetContext.getSystemService(Context.SHORTCUT_SERVICE);
    var targetIntent = Intent.parseUri(targetIntentUri, 0);
    targetIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);

    var shortcutInfo = new ShortcutInfo.Builder(targetContext, shortcutIdValue)
        .setShortLabel("ShortX")
        .setLongLabel("ShortX")
        .setIcon(Icon.createWithResource(targetContext, targetContext.getApplicationInfo().icon))
        .setIntent(targetIntent)
        .build();

    shortcutManager.addDynamicShortcuts(Collections.singletonList(shortcutInfo));
    shortcutIdValue;
} catch (e) {
    "写入失败: " + e;
}
```

这里避免声明 `pkgName`、`intent`、`context` 这类高风险上下文名，使用 `targetPackageName`、`targetIntentUri`、`targetContext`。

## 删除快捷方式

删除必须使用相同的快捷方式 ID：

```javascript
importClass(android.content.Context);
importClass(java.util.Collections);

var targetPackageName = "tornaco.apps.shortx";
var shortcutIdValue = "shortcut_0001";

var targetContext = context.createPackageContext(
    targetPackageName,
    Context.CONTEXT_IGNORE_SECURITY
);
var shortcutManager = targetContext.getSystemService(Context.SHORTCUT_SERVICE);
shortcutManager.removeDynamicShortcuts(Collections.singletonList(shortcutIdValue));

"已删除: " + shortcutIdValue;
```

## 系统服务直连

高级备用路径也可以直接获取 `shortcut` 服务并调用 `addDynamicShortcuts(...)` 的写法。这类写法更接近 Binder 层，参数和版本差异更敏感，应作为高级备用路径。

优先级建议：

```text
ShortcutManager
  -> ShortX 内部动态快捷方式配置
  -> shortcut 系统服务
```

## 设计清单

- 记录 `shortcutIdValue`，否则无法精准删除。
- 添加前检查已有数量和系统上限。
- Intent URI 要可解释，避免把不可见深链写入目标应用。
- 删除前先展示目标包名和 shortcut ID。
- 多用户场景不要默认只处理用户 0。

