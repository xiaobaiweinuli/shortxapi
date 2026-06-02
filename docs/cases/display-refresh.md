# 高级案例：显示与刷新率

显示能力经常用于坐标适配、截图/OCR、刷新率诊断和悬浮窗布局。写入显示状态时必须谨慎。

## 屏幕尺寸

内部服务入口示例：

```javascript
var resultText = String(Packages.tornaco.apps.shortx.core.OooO0O0.OooO00o().getScreenSize());
resultText;
```

普通 Android 方式也可以读 display metrics：

```javascript
var displayMetrics = context.getResources().getDisplayMetrics();
var output = {
    width: displayMetrics.widthPixels,
    height: displayMetrics.heightPixels,
    density: displayMetrics.density
};

JSON.stringify(output);
```

如果下游用于坐标计算，推荐输出 JSON。

## 刷新率支持状态

可以通过 display 服务读取 supported modes：

```javascript
var displayInfo = android.os.ServiceManager.getService("display")
    .getDisplayInfo(android.view.Display.DEFAULT_DISPLAY);
var modes = displayInfo.supportedModes;
var rows = [];

for (var i = 0; i < modes.length; i++) {
    var modeValue = modes[i];
    rows.push("id=" + modeValue.getModeId() + ": " + modeValue.getRefreshRate() + "Hz");
}

rows.join("\n");
```

这类读取适合做诊断和选择菜单。

## 刷新率显示开关

可以通过 SurfaceFlinger transact 控制刷新率显示。这是底层能力，适合高级诊断，不适合普通规则频繁调用。

文档中只建议按模式理解：

```text
0 = 关闭
1 = 开启
2 = 查询
3 = 切换
```

直接 transact 依赖事务码和系统实现，版本差异风险高。

## 窗口模式

`window.setWindowingMode(...)` 这类窗口模式调用应作为风险提示处理：不要因为能看到方法名，就把它写成可复制教程。

## 风险

- 显示写操作可能造成黑屏、刷新率异常或窗口模式异常。
- SurfaceFlinger transact 依赖版本和 ROM。
- 多显示屏、横竖屏、密度变化会影响坐标。
- 修改显示前应先记录原始状态，提供恢复动作。
