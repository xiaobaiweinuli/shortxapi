# ExecuteJS 写法

`ExecuteJS` 适合承担动作链中的重逻辑：读取 Android 服务、解析 JSON、生成对话框数据、操作文件、调用 ShortX API、访问内部服务。

## 结构建议

短脚本可以直接写：

```javascript
var resultText = String(contentText).trim();
resultText;
```

复杂脚本建议分块：

```javascript
// ===== config =====
var targetPackageName = "tornaco.apps.shortx";

// ===== imports =====
importClass(java.io.File);
importClass(Packages.tornaco.apps.shortx.core.OooO0O0);

// ===== helpers =====
function getShortXRoot() {
    var iShortX = OooO0O0.OooO00o();
    return new File(iShortX.getLogDir()).getParentFile().getAbsolutePath();
}

// ===== main =====
var resultText = getShortXRoot();
resultText;
```

## 数据塑形

为后续 `ShowListDialog` 生成 JSON：

```javascript
var items = [
    {
        name: "打开设置",
        summary: "进入 ShortX 设置页",
        __value: "shortx://settings"
    }
];

JSON.stringify(items, null, 2);
```

## 调用真实内部服务

当某个能力确实需要内部服务时，可以使用：

```javascript
importClass(Packages.tornaco.apps.shortx.core.OooO0O0);

var iShortX = OooO0O0.OooO00o();
var resultText = iShortX.getLogDir();
resultText;
```

不要因为 `OooO0O0` 名字不美观就替换成未验证的“漂亮 API”。

## 错误处理

错误处理要服务于动作链，不要把所有错误吞掉：

```javascript
var resultText;
try {
    resultText = String(contentText).trim();
} catch (e) {
    resultText = "ERROR: " + e;
}
resultText;
```

如果下游动作需要区分成功失败，建议输出 JSON 或用 `customContextDataKey` 写入更明确的字段。

