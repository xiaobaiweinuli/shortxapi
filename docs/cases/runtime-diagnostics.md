# 高级案例：运行诊断面板

运行诊断面板适合做成一键指令，用来查看 ShortX 当前状态、最近日志和可清理项。

## 目标

```text
读取运行状态
  -> 读取日志片段
  -> 生成诊断 JSON 列表
  -> ShowListDialog 展示
  -> 复制日志 / 清空日志 / 查看路径
```

它不是自动规则。诊断动作应由用户主动触发。

## 状态检查

可以先读取轻量状态：

```javascript
var iShortX = Packages.tornaco.apps.shortx.core.OooO0O0.OooO00o();

var output = {
    fatalError: !!iShortX.hasFatalError(),
    debugLog: !!iShortX.isLogDebugEnable(),
    logDir: String(iShortX.getLogDir())
};

JSON.stringify(output, null, 2);
```

这一步适合写入 `customContextDataKey`，例如 `DiagnosticState`。

## 日志片段

日志片段建议限制大小：

```javascript
importClass(java.io.FileInputStream);
importClass(java.nio.charset.Charset);

var iShortX = Packages.tornaco.apps.shortx.core.OooO0O0.OooO00o();
var fileInputStream = null;
var resultText = "";

try {
    fileInputStream = new FileInputStream(iShortX.getJSLogFD().getFileDescriptor());
    var buffer = java.lang.reflect.Array.newInstance(java.lang.Byte.TYPE, 4096);
    var bytesRead = fileInputStream.read(buffer);
    if (bytesRead > 0) {
        resultText = String(new java.lang.String(buffer, 0, bytesRead, Charset.forName("UTF-8")));
    }
} finally {
    if (fileInputStream != null) {
        fileInputStream.close();
    }
}

resultText;
```

不要把大日志直接塞进通知或弹窗。更好的方式是展示摘要，点击后复制完整片段。

## 对话框菜单

```javascript
var items = [
    {
        name: "复制 JS 日志片段",
        summary: "把最近读取的 JS 日志写入剪贴板",
        __value: "copy-js-log"
    },
    {
        name: "清空 JS 日志",
        summary: "需要二次确认",
        __value: "clear-js-log"
    },
    {
        name: "查看日志目录",
        summary: "复制 ShortX 日志根目录",
        __value: "copy-log-dir"
    }
];

JSON.stringify(items, null, 2);
```

后续根据 `selectedListItem` 分支。

## 二次确认

清空日志前要二次确认。清理动作示例：

```javascript
Packages.tornaco.apps.shortx.core.OooO0O0.OooO00o().clearJSLogs();
"JS logs cleared";
```

HTTP 日志和 Hook 日志同理。

## 安全边界

- 不自动上传日志。
- 不在后台周期性读取日志。
- 不把 secret 全局变量、剪贴板、通知正文写入远端。
- 清空日志前先展示清理目标。

