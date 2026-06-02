# 坐标与屏幕区域

很多高级自动化最终都落到屏幕区域：框选一块图、截一块屏、识别一块文字、点击一个点，或把这块区域交给二维码识别和贴图。完整工作流的思路是：先用悬浮 UI 产生区域 JSON，再用 `SwitchCase` 按按钮选择不同后续动作。

## 推荐链路

```text
选择屏幕区域
  -> 输出区域 JSON
  -> customContextDataKey 改名为 reg
  -> MatchJS 判断 clickedButton
  -> 截图 / OCR / 分享 / 贴图 / 二维码识别
```

区域输出示例：

```json
{
  "rectLeft": 120,
  "rectTop": 500,
  "rectRight": 960,
  "rectBottom": 900,
  "rectFlattenToString": "120 500 960 900",
  "clickedButton": "ocr"
}
```

`clickedButton` 是工作流选择，`rect*` 是真实坐标，`rectFlattenToString` 方便给动作、剪贴板或人工复制。

## 坐标来源

真实框选脚本通常通过 Android 视图层读取：

- `DisplayMetrics.widthPixels` 和 `heightPixels` 得到当前显示尺寸。
- `WindowManager.getDefaultDisplay().getRealSize(...)` 得到真实屏幕尺寸。
- `MotionEvent.getRawX()` / `getRawY()` 得到触摸坐标。
- 悬浮窗用 `WindowManager.LayoutParams` 覆盖屏幕区域。

坐标单位是像素，不是 dp。脚本内部可以用 `dp(value)` 计算按钮尺寸，但输出给 OCR、截图、点击的区域应是屏幕像素。

## 读取区域 JSON

下游不要重新声明 `reg`。直接解析它：

```javascript
var regionData = JSON.parse(reg);
String(regionData.rectFlattenToString);
```

分支判断：

```javascript
JSON.parse(reg).clickedButton == "ocr";
```

这是 `MatchJS` 风格，可以直接作为条件。不要把它写成 MVEL。

## 区域 OCR

把区域交给 `OcrDetect`：

```javascript
importClass(Packages.tornaco.apps.shortx.core.proto.action.OcrDetect);
importClass(Packages.tornaco.apps.shortx.core.proto.common.RectSourceRect);
importClass(Packages.tornaco.apps.shortx.core.proto.common.Rect);
importClass(com.google.protobuf.Any);

var regionData = JSON.parse(reg);

var action = OcrDetect.newBuilder()
    .setRectSrc(
        Any.pack(
            RectSourceRect.newBuilder()
                .setRect(
                    Rect.newBuilder()
                        .setLeft(String(regionData.rectLeft))
                        .setTop(String(regionData.rectTop))
                        .setRight(String(regionData.rectRight))
                        .setBottom(String(regionData.rectBottom))
                        .build()
                )
                .build()
        )
    )
    .build();

var actionResult = shortx.executeAction(action);
var resultText = actionResult.contextData.get("ocrResult");
resultText == null ? "" : String(resultText).trim();
```

`ocrResult` 是动作输出 key，不要声明同名局部变量。

## 区域截图

区域截图链路常用 `AreaScreenshot` 先输出截图路径，再由后续动作读取 `screenshots`。读取前先检查文件：

```javascript
importClass(java.io.File);

var imageFile = new File(screenshots);
imageFile.exists() ? imageFile.getAbsolutePath() : "";
```

如果后续要二维码识别或贴图，建议先把截图路径改名，例如 `RegionImagePath`。否则链路变长后很难判断 `screenshots` 来自哪一步。

## 贴图与悬浮窗

`全局贴图 1.0` 的思路是：

1. 区域截图。
2. 用 `BitmapFactory.decodeFile(...)` 读取截图。
3. 用 `WindowManager` 添加悬浮 `ImageView`。
4. 支持拖动、缩放、双击关闭。

这类脚本必须注意：

- UI 操作放到主线程 `Handler(Looper.getMainLooper())`。
- 等待用户交互时使用 `CountDownLatch`，并设置超时。
- 移除悬浮窗时回收 Bitmap，避免长时间占用内存。
- 选择 `TYPE_SYSTEM_ERROR`、`TYPE_PHONE`、`TYPE_APPLICATION_OVERLAY` 时要考虑设备版本和权限边界。

## 二维码识别

一种高级做法是：截图后动态加载 `ZXing-3.5.4.dex`，用 `PathClassLoader` 解码。这个路径适合高级用户，但要满足：

- dex 文件已经放在 ShortX 可访问目录。
- 截图路径真实存在。
- Bitmap 读取后要释放。
- 解码失败要返回稳定字符串，而不是中断整条链。

如果只是识别屏幕文字，优先用 OCR；如果要识别二维码，再考虑外部库。

## 坐标错位排查

| 现象 | 排查点 |
| --- | --- |
| OCR 识别到状态栏 | 区域太大，缩小 top/bottom |
| 横屏后坐标错 | 重新读取屏幕方向和真实尺寸 |
| 选区包含导航栏 | 区分 `heightPixels` 与 `getRealSize` |
| 多显示屏异常 | 明确使用哪个 display |
| 悬浮窗无法添加 | 检查窗口类型、系统版本和权限 |
| 下游解析失败 | 检查上游是否输出了 `"已取消"` 而不是 JSON |

## 最小输出规范

区域类指令建议至少输出：

```json
{
  "rectLeft": 0,
  "rectTop": 0,
  "rectRight": 0,
  "rectBottom": 0,
  "rectFlattenToString": "0 0 0 0",
  "clickedButton": "confirm"
}
```

如果用户取消，输出一个明确短字符串，例如 `已取消`，并在 `SwitchCase` 第一分支处理它。这样后续 JSON 解析不会误吞异常。
