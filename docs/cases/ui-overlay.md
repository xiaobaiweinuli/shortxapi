# 高级案例：悬浮窗与 UI

ShortX 的 JS 可以创建 Android UI，例如悬浮按钮、气泡、菜单、列表对话框等。复杂 UI 脚本应当按 Android/Rhino 模型理解，而不是前端 DOM。悬浮窗教程的重点不是“画一个按钮”，而是线程、窗口参数、用户操作回流和资源清理。

## 适合场景

- 临时显示一个悬浮按钮，让用户确认或取消。
- 让用户框选区域，再把坐标输出给后续截图/OCR。
- 显示一个轻量状态提示，例如等待滚动、等待点击。
- 做开发期调试工具，例如显示当前节点、坐标或包名。

不适合：

- 长期常驻且无清理逻辑的 UI。
- 高频自动触发器每次都创建悬浮窗。
- 用悬浮窗绕过必要的确认或权限边界。

## 基本链路

```text
ExecuteJS 创建悬浮 UI
  -> 等待用户点击或超时
  -> 移除 View
  -> 输出 clicked / timeout / error
  -> MatchJS 判断结果
  -> 后续动作
```

长时间交互建议输出 JSON，例如点击坐标、按钮名、超时状态。短交互可以输出普通字符串。

## 最小悬浮按钮

下面示例创建一个按钮，等待用户点击 5 秒。点击或超时后都会移除 View，并把结果输出给下游。

```javascript
importClass(android.content.Context);
importClass(android.view.WindowManager);
importClass(android.view.Gravity);
importClass(android.view.View);
importClass(android.graphics.PixelFormat);
importClass(android.widget.TextView);
importClass(android.os.Handler);
importClass(android.os.Looper);
importClass(java.lang.Runnable);
importClass(java.util.concurrent.CountDownLatch);
importClass(java.util.concurrent.TimeUnit);
importClass(java.util.concurrent.atomic.AtomicReference);

var handlerObj = new Handler(Looper.getMainLooper());
var latchObj = new CountDownLatch(1);
var resultRefObj = new AtomicReference("timeout");
var viewRefObj = new AtomicReference(null);
var wmObj = context.getSystemService(Context.WINDOW_SERVICE);

handlerObj.post(new Runnable({
    run: function() {
        try {
            var textViewObj = new TextView(context);
            textViewObj.setText("点击确认");
            textViewObj.setTextSize(16);
            textViewObj.setPadding(24, 16, 24, 16);

            var paramsObj = new WindowManager.LayoutParams(
                WindowManager.LayoutParams.WRAP_CONTENT,
                WindowManager.LayoutParams.WRAP_CONTENT,
                WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY,
                WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE,
                PixelFormat.TRANSLUCENT
            );

            paramsObj.gravity = Gravity.BOTTOM | Gravity.CENTER_HORIZONTAL;
            paramsObj.y = 120;

            textViewObj.setOnClickListener(new View.OnClickListener({
                onClick: function(viewObj) {
                    resultRefObj.set("clicked");
                    latchObj.countDown();
                }
            }));

            wmObj.addView(textViewObj, paramsObj);
            viewRefObj.set(textViewObj);
        } catch (e) {
            resultRefObj.set("error: " + String(e));
            latchObj.countDown();
        }
    }
}));

latchObj.await(5, TimeUnit.SECONDS);

handlerObj.post(new Runnable({
    run: function() {
        var viewObj = viewRefObj.get();
        if (viewObj != null) {
            try {
                wmObj.removeView(viewObj);
            } catch (e) {
            }
        }
    }
}));

String(resultRefObj.get());
```

下游可以用 `MatchJS` 判断：

```javascript
var resultValue = jsRet == null ? "" : String(jsRet);
resultValue == "clicked";
```

如果上一步已经把 `jsRet` 改名为 `OverlayResult`，就读取 `OverlayResult`。

## 输出结构化结果

如果要返回按钮名、坐标或区域，建议输出 JSON：

```javascript
var outputObj = {
    ok: true,
    button: "confirm",
    x: 0,
    y: 0
};

JSON.stringify(outputObj);
```

下游再解析：

```javascript
var outputObj = JSON.parse(jsRet);
outputObj.ok == true;
```

## 清理原则

- `addView(...)` 后必须有 `removeView(...)`。
- 等待用户操作必须有超时。
- 异常分支也要释放 View。
- 不要在高频触发器里反复创建悬浮窗。
- 用户取消或超时时，下游要中断高风险动作。

## 和动作链的关系

悬浮窗 JS 只负责用户交互和输出，不应该把后续业务全部写在 UI 回调里。更稳的结构是：

```text
ExecuteJS 悬浮窗输出 OverlayResult
  -> MatchJS 判断 OverlayResult
  -> ExecuteJS / 内置动作执行后续逻辑
```

这样调试时可以单独检查 UI 输出，也能避免 UI 回调里混入大量系统写入逻辑。
