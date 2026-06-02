# 高级案例：截图与 OCR

这个案例讲的是“从屏幕区域提取文字并交给动作链”，不是直接封装一个 OCR 引擎。

## 推荐链路

```text
触发器或一键指令
  -> 等待页面稳定
  -> 指定区域 OCR
  -> 清洗识别文本
  -> MatchJS 判断是否有效
  -> 写剪贴板 / 弹窗 / 后续动作
```

## 为什么要指定区域

全屏 OCR 容易引入噪声：

- 状态栏、导航栏文字。
- 背景中的广告和推荐内容。
- 多个相同字段。
- 横竖屏和分辨率差异。

真实自动化应尽量缩小识别区域，并把坐标来源记录清楚。

## JS 中执行 OCR action

区域 OCR 可以使用 `OcrDetect` action。写法如下：

```javascript
importClass(Packages.tornaco.apps.shortx.core.proto.action.OcrDetect);
importClass(Packages.tornaco.apps.shortx.core.proto.common.RectSourceRect);
importClass(Packages.tornaco.apps.shortx.core.proto.common.Rect);
importClass(com.google.protobuf.Any);

var action = OcrDetect.newBuilder()
    .setRectSrc(
        Any.pack(
            RectSourceRect.newBuilder()
                .setRect(
                    Rect.newBuilder()
                        .setLeft("120")
                        .setTop("500")
                        .setRight("960")
                        .setBottom("900")
                        .build()
                )
                .build()
        )
    )
    .build();

var result = shortx.executeAction(action);
var resultText = result.contextData.get("ocrResult");
resultText == null ? "" : String(resultText).trim();
```

`ocrResult` 是动作输出 key，不要写 `var ocrResult = ...`。

## 清洗识别结果

可以把 OCR 和清洗拆成两步。这样更容易调试：

```javascript
var resultText = String(jsRet)
    .replace(/\s+/g, "")
    .replace(/[^\u4e00-\u9fa5A-Za-z0-9]/g, "");

resultText;
```

下游再用 `MatchJS`：

```javascript
String(jsRet).length > 0;
```

## 输出结构化结果

如果下游需要知道识别区域、是否命中和原始文本，可以输出 JSON：

```javascript
var output = {
    ok: String(jsRet).length > 0,
    source: "screen-rect",
    text: String(jsRet)
};

JSON.stringify(output);
```

## 常见问题

- OCR 结果为空：确认 OCR 引擎是否启用、区域是否正确、页面是否已经加载完成。
- 结果不稳定：缩小区域，增加等待，减少全屏识别。
- 后续无法读取：确认使用的是 `jsRet`、改名后的上下文名，或 `ocrResult` 对应的 action 输出。
- 坐标错位：检查分辨率、显示缩放、横竖屏和多显示屏。

