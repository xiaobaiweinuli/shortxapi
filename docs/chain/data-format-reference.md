# 常见数据格式

ShortX 动作链里流动的值既有普通字符串，也有 JSON、Intent URI、坐标矩形、文件路径、URI、proto bytes。格式选错，下游动作就会看起来“没有输出”。

## JSON 列表项

列表对话框常用 JSON 数组：

```json
[
  {
    "name": "显示名称",
    "summary": "副标题或说明",
    "__value": "下游真实值",
    "__icon": "android-fill"
  }
]
```

字段约定：

| 字段 | 用途 |
| --- | --- |
| `name` | 主显示文本 |
| `summary` | 副标题、版本、解释 |
| `__value` | 下游真实值 |
| `__icon` | 图标名，支持情况取决于对话框动作 |
| `version` | 高级规则里也常作为包名、版本号或辅助值使用 |

下游解析：

```javascript
var optionItem = JSON.parse(selectedListItem);
String(optionItem.__value);
```

不要声明 `selectedListItem`。它是对话框输出上下文名。

## JSON 对象

区域选择、诊断、OCR 清洗后适合输出对象：

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

下游读取：

```javascript
var regionData = JSON.parse(reg);
String(regionData.rectFlattenToString);
```

`reg` 是上游改名后的上下文变量，不要写 `var reg = ...`。

## Rect 与屏幕坐标

ShortX proto action 常见 `Rect` 字段：

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
resultText == null ? "" : String(resultText);
```

注意两点：

- 坐标是屏幕像素，不是 dp。
- 复杂链路常把 `left top right bottom` 压成空格分隔字符串，便于复制和传给后续动作。

## Intent URI

Intent URI 常用于跳转、DeepLink、动态快捷方式：

```javascript
importClass(android.content.Intent);

var intentUriText = "intent:#Intent;action=com.example.OPEN;end";
var targetIntent = Intent.parseUri(intentUriText, 0);
targetIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
context.startActivity(targetIntent);
```

动作链里也可能直接使用 `StartActivityIntentUri`。如果要长期保存，建议保存完整 URI 字符串，而不是拆成 action、component、extras 后再重组。

## 文件路径与 URI

截图、下载、媒体相关动作常输出路径或 URI：

| 形态 | 示例 | 用途 |
| --- | --- | --- |
| 文件路径 | `/sdcard/.../image.png` | `java.io.File`、BitmapFactory |
| 内容 URI | `content://...` | Android 内容提供者 |
| 媒体 URI | `mediaUri` | 媒体库或分享 |

读取文件路径时先判断是否存在：

```javascript
importClass(java.io.File);

var fileObject = new File(screenshots);
fileObject.exists() ? fileObject.getAbsolutePath() : "";
```

`screenshots` 是上游输出名，不能声明为局部变量。

## ByteArrayWrapper

内部 ShortX 服务和配置数据经常使用 `ByteArrayWrapper` 包装 proto bytes。常见形态：

```javascript
importClass(Packages.tornaco.apps.shortx.core.rule.action.ByteArrayWrapper);
importClass(Packages.tornaco.apps.shortx.core.proto.pkgset.PkgSet);
importClass(Packages.tornaco.apps.shortx.core.OooO0O0);

var pkgSetBuilder = PkgSet.newBuilder()
    .setLabel("测试应用集合")
    .setDescription("")
    .setIsPrebuilt(false);

var byteData = pkgSetBuilder.build().toByteArray();
var byteWrapper = new ByteArrayWrapper(byteData);

OooO0O0.OooO00o().addPkgSet(byteWrapper);
```

这是内部服务写配置，不是普通动作链输出。只有在当前版本完成最小验证后才这样写。能用 `shortx.executeAction(...)` 的场景，优先用 proto action。

## `Any.pack`

部分 proto action 的字段是 `google.protobuf.Any`，需要把具体来源对象 pack 进去：

```javascript
importClass(com.google.protobuf.Any);
importClass(Packages.tornaco.apps.shortx.core.proto.common.RectSourceRect);

var packedRectSource = Any.pack(RectSourceRect.newBuilder().build());
```

`Any.pack(...)` 的关键是“字段需要哪个来源类型”。不要只按字段名猜，应该看动作页面、同类动作链或 proto action 类型说明。

## contextData

`shortx.executeAction(...)` 返回的执行结果里，业务输出通常在 `contextData`：

```javascript
var actionResult = shortx.executeAction(action);
var resultText = actionResult.contextData.get("ocrResult");
resultText == null ? "" : String(resultText);
```

这里的 key 不是通用的。`OcrDetect` 读取 `ocrResult`，对话框读取 `selectedListItem`，HTTP 动作读取 `httpRequestRet`。先查 [动作输出契约](/chain/action-output-contracts)，再写下游解析。

## 格式选择

| 下游目标 | 推荐格式 |
| --- | --- |
| 只显示或复制 | 字符串 |
| 分支判断 | 布尔值或短字符串 |
| 列表选择 | JSON 数组 |
| 多字段继续处理 | JSON 对象 |
| 系统跳转 | Intent URI |
| 屏幕识别 | Rect 或区域 JSON |
| 写 ShortX 配置 | proto bytes + `ByteArrayWrapper` |

格式不是越复杂越好。真正重要的是：下游动作能稳定读取，并且输出名不会和 ShortX 上下文保留名冲突。
