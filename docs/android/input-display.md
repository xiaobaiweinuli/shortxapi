# Input 与 Display 服务教程

`input` 和 `display` 是 ShortX 高级自动化里最常用的系统能力之一。它们分别对应输入设备/输入事件和显示设备/刷新率/显示状态。

## Input 服务

`input` 服务对应 `android.hardware.input.IInputManager`，常见能力包括：

- 查询输入设备。
- 键盘布局、按键字符映射。
- 输入事件注入。
- 鼠标、指针、触摸配置。
- 虚拟键盘、震动、输入设备监听。

在 ShortX 中，输入类能力常见于：

- 自动输入验证码。
- 模拟按键或触摸。
- 读取输入设备信息。
- 根据按键事件触发规则。

## Display 服务

`display` 服务对应 `android.hardware.display.IDisplayManager`，常见能力包括：

- 查询显示器信息和 display id。
- 显示状态、刷新率、亮度相关信息。
- Wi-Fi Display 扫描、连接、暂停、恢复。
- 显示事件监听。

在 ShortX 中，显示类能力常见于：

- 查询屏幕尺寸和当前显示。
- 调整刷新率或读取刷新率支持状态。
- 与 SurfaceFlinger 或显示电源状态配合。
- 为悬浮窗、坐标、截图、OCR 提供基础数据。

## 动作链中的注意点

输入和显示能力经常依赖当前界面状态。写自动化时要明确：

- 当前焦点是否正确。
- 屏幕是否亮屏。
- 当前坐标是否适配屏幕尺寸。
- 多显示器或横竖屏是否影响结果。
- 输入事件是否可能误作用到桌面或错误应用。

## 示例：显示尺寸作为后续动作输入

```javascript
var displayMetrics = context.getResources().getDisplayMetrics();
var resultText = displayMetrics.widthPixels + "x" + displayMetrics.heightPixels;
resultText;
```

如果后续需要拆分宽高，建议输出 JSON：

```javascript
var displayMetrics = context.getResources().getDisplayMetrics();
var result = {
    width: displayMetrics.widthPixels,
    height: displayMetrics.heightPixels,
    density: displayMetrics.density
};

JSON.stringify(result);
```

## 风险提示

输入注入、显示刷新率锁定、显示电源控制等能力可能造成误触、黑屏、显示异常或难以恢复。教程中应优先讲查询和判断，再讲写入或控制。

