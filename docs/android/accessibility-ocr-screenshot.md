# 无障碍、截图与 OCR

屏幕自动化通常会混用三类能力：无障碍节点、截图/图像能力、OCR。它们看起来都在“读屏幕”，但边界不同。

## 三类能力

| 能力 | 读到什么 | 适合场景 |
| --- | --- | --- |
| 无障碍节点 | view 文本、id、窗口、可交互节点 | 按钮点击、表单、结构化 UI |
| 截图/图像 | 屏幕区域、颜色、图片位置 | 游戏、画布、自绘 UI、找图找色 |
| OCR | 截图区域中的文字 | 图片文字、非标准控件、跨应用文字提取 |

优先级通常是：能用节点就用节点；节点拿不到再用截图和 OCR。

## ShortX 上下文变量

常见输出：

- `textOfTheView`：从屏幕节点读取的文本。
- `matchedViewText`：匹配到的节点文本。
- `sourceNodeId`、`windowId`：节点和窗口标识。
- `screenshotFilePath`、`screenshotFileUri`：截图输出。
- `pointX`、`pointY`、`isImageFound`：图像查找结果。
- `ocrResult`：OCR 识别结果。

这些都是保留名。脚本中不要声明同名变量。

## OCR 的推荐入口

区域 OCR 示例使用 `OcrDetect` proto action，并通过 `shortx.executeAction(action)` 读取 `ocrResult`。

这比直接调用底层 OCR 引擎更稳，因为：

- 坐标区域由 ShortX action 统一处理。
- 结果进入动作链上下文。
- 后续可以直接接 `MatchJS`、剪贴板、弹窗或 JSON 解析。

## Accessibility AIDL 的角色

Android 的 `accessibility` 服务有大量 Binder 方法，例如服务列表、事件分发、窗口 token、系统动作、输入过滤、放大、快捷方式等。

对 ShortX 文档来说，它的价值主要是解释边界：

- 无障碍不是 OCR。
- 无障碍事件不是任意 UI 控制权。
- 有些方法需要系统权限、token、service client 或测试自动化上下文。
- 不应把 AIDL 方法清单直接变成教程步骤。

## 设计建议

```text
先用节点动作定位可访问文本
  -> 节点失败时截取指定区域
  -> OCR 识别区域文字
  -> JS 清洗文本
  -> MatchJS 判断是否命中
  -> 执行动作
```

不要从一开始就全屏 OCR。全屏识别慢、误识别多，也更难把结果映射回具体 UI 区域。

## 失败处理

屏幕类自动化必须处理失败：

- 当前应用不在预期页面。
- 系统动画未结束。
- OCR 引擎不可用或结果为空。
- 多窗口、横竖屏、分辨率变化。
- 无障碍节点被 WebView 或自绘 UI 隐藏。

建议输出结构化结果：

```javascript
var output = {
    ok: String(jsRet).length > 0,
    text: String(jsRet)
};

JSON.stringify(output);
```

下游再根据 `ok` 分支，而不是把空字符串当作成功。

