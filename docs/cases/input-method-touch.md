# 高级案例：输入法与触摸

输入法和触摸都属于当前交互状态。它们能提升自动输入稳定性，也可能造成误触或设备暂时不可操作。

## 输入法显示与隐藏

可以用 ShortX proto action 控制 IME inset：

```javascript
importClass(Packages.tornaco.apps.shortx.core.proto.action.ShowHideInsets);
importClass(Packages.tornaco.apps.shortx.core.proto.common.WindowInsetType);

shortx.executeAction(
    ShowHideInsets.newBuilder()
        .setIsHide(false)
        .addType(WindowInsetType.WindowInsetType_Ime)
        .build()
);

"ime shown";
```

隐藏输入法只需要把 `setIsHide(true)`：

```javascript
importClass(Packages.tornaco.apps.shortx.core.proto.action.ShowHideInsets);
importClass(Packages.tornaco.apps.shortx.core.proto.common.WindowInsetType);

shortx.executeAction(
    ShowHideInsets.newBuilder()
        .setIsHide(true)
        .addType(WindowInsetType.WindowInsetType_Ime)
        .build()
);

"ime hidden";
```

这类能力优先走 `shortx.executeAction(...)`，不要一开始就直接碰 `input_method` AIDL。

## 输入法区域

可以通过窗口服务读取当前输入法触摸区域：

```javascript
var resultText = String(android.os.ServiceManager.getService("window").getCurrentImeTouchRegion());
resultText;
```

这个结果适合用于：

- 判断输入法是否遮挡目标区域。
- 为悬浮窗或点击坐标避让 IME。
- 调试自动输入失败。

## 触摸禁用与恢复

可以通过 `input` 服务找到触摸屏设备并禁用/启用。推荐写法：

```javascript
var InputDeviceClass = android.view.InputDevice;
var inputManagerValue = android.os.ServiceManager.getService("input");
var deviceIds = inputManagerValue.getInputDeviceIds();
var touchDeviceIdValue = -1;

for (var i = 0; i < deviceIds.length; i++) {
    var deviceIdValue = deviceIds[i];
    var sourcesValue = inputManagerValue.getInputDevice(deviceIdValue).getSources();
    if ((sourcesValue & InputDeviceClass.SOURCE_TOUCHSCREEN) == InputDeviceClass.SOURCE_TOUCHSCREEN) {
        touchDeviceIdValue = deviceIdValue;
    }
}

if (touchDeviceIdValue >= 0) {
    inputManagerValue.disableInputDevice(touchDeviceIdValue);
    "touch disabled: " + touchDeviceIdValue;
} else {
    "touch device not found";
}
```

恢复：

```javascript
var InputDeviceClass = android.view.InputDevice;
var inputManagerValue = android.os.ServiceManager.getService("input");
var deviceIds = inputManagerValue.getInputDeviceIds();
var touchDeviceIdValue = -1;

for (var i = 0; i < deviceIds.length; i++) {
    var deviceIdValue = deviceIds[i];
    var sourcesValue = inputManagerValue.getInputDevice(deviceIdValue).getSources();
    if ((sourcesValue & InputDeviceClass.SOURCE_TOUCHSCREEN) == InputDeviceClass.SOURCE_TOUCHSCREEN) {
        touchDeviceIdValue = deviceIdValue;
    }
}

if (touchDeviceIdValue >= 0) {
    inputManagerValue.enableInputDevice(touchDeviceIdValue);
    "touch enabled: " + touchDeviceIdValue;
} else {
    "touch device not found";
}
```

## 风险

- 禁用触摸后，如果没有其他输入方式，恢复会困难。
- 自动规则中不要无确认禁用触摸。
- 执行触摸控制前应准备恢复一键指令。
- 输入法控制依赖当前焦点和窗口状态，失败时先排查焦点。
