# 高级案例：包与组件路由

组件路由用于从应用包名找到可打开页面、服务、广播或组件状态，再生成跳转、快捷方式或诊断动作。

## 真实入口

内部 ShortX 服务入口示例：

```javascript
Packages.tornaco.apps.shortx.core.OooO0O0.OooO00o().getActivities(0, "tornaco.apps.shortx");
Packages.tornaco.apps.shortx.core.OooO0O0.OooO00o().getServices(0, "tornaco.apps.shortx");
```

也有更底层但参数未完整展开的入口：

```text
getAppComponentInfo(ByteArrayWrapper)
getComponentEnabledSetting(ByteArrayWrapper)
```

带 `ByteArrayWrapper` 的方法不要凭空构造参数。先找完整导出或 proto 结构。

## 基本链路

```text
输入包名
  -> 查询 Activity / Service / Receiver
  -> 转成 JSON 列表
  -> ShowListDialog
  -> selectedListItem
  -> 复制组件名 / 构造 Intent / 添加快捷方式
```

如果只做检查，输出换行文本即可；如果后续还要路由，输出 JSON。

## 组件列表输出

```javascript
var packageNameValue = "tornaco.apps.shortx";
var dataList = Packages.tornaco.apps.shortx.core.OooO0O0.OooO00o()
    .getActivities(0, packageNameValue);

var items = [];
for (var i = 0; i < dataList.size(); i++) {
    var item = dataList.get(i);
    items.push({
        name: String(item),
        summary: packageNameValue,
        __value: String(item)
    });
}

JSON.stringify(items, null, 2);
```

不要写 `var pkgName = ...`，`pkgName` 是常见上下文变量。

## 与 PackageManager 的关系

如果目标是通用 Android 包信息，可以使用 `context.getPackageManager()`。如果目标是 ShortX 已封装的组件查询，优先使用当前版本已验证的内部服务入口。

选择原则：

```text
ShortX 内部组件/配置
  -> OooO0O0 内部服务

普通 Android 包信息
  -> PackageManager
```

## 风险

- 组件名和导出状态会随 App 版本变化。
- 多用户场景下，用户 ID 不能默认永远是 0。
- 禁用组件、修改组件状态属于高风险操作。
- Receiver 相关方法名和描述如果存在不一致，应以当前版本最小验证为准，不写成确定教程。

