# 运行诊断接口

ShortX 的日志、运行状态和错误状态，大多属于内部服务能力。诊断示例主要通过 `Packages.tornaco.apps.shortx.core.OooO0O0.OooO00o()` 访问。

这类接口适合做诊断工具，不适合放在普通业务链路里长期频繁调用。

## 可诊断的信息

| 目标 | 内部服务入口 | 用途 |
| --- | --- | --- |
| 日志根目录 | `getLogDir()` | 定位 ShortX 日志目录 |
| JS 执行日志 FD | `getJSLogFD()` | 读取 JS 执行日志 |
| HTTP 请求日志 FD | `getHttpRequestLogFD()` | 读取 HTTP 请求日志 |
| Hook 日志 FD | `getHookMethodCallLogFD()` | 读取方法 Hook 调用日志 |
| 详细日志开关 | `isLogDebugEnable()` | 判断 debug 日志是否启用 |
| HTTP 日志开关 | `isHttpRequestLogEnable()` | 判断 HTTP 请求日志是否启用 |
| 致命错误状态 | `hasFatalError()` | 判断 ShortX 是否处于 fatal error 状态 |
| 清空 JS 日志 | `clearJSLogs()` | 清理 JS 日志 |
| 清空 HTTP 日志 | `clearHttpRequestLogs()` | 清理 HTTP 日志 |

不同 ShortX 版本可能变动，写教程或工具时应先在当前版本验证。

## 读取日志内容

日志内容可以通过 `ParcelFileDescriptor` 读取。推荐写法：

```javascript
importClass(Packages.tornaco.apps.shortx.core.OooO0O0);
importClass(java.io.FileInputStream);
importClass(java.nio.charset.Charset);

var iShortX = OooO0O0.OooO00o();
var logFd = iShortX.getJSLogFD();
var fileInputStream = null;
var resultText = "";

try {
    fileInputStream = new FileInputStream(logFd.getFileDescriptor());
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

这里的输出是日志片段，不保证读取完整文件。需要完整读取时，应循环读取并限制最大字节数，避免把动作链输出撑爆。

## 诊断链路建议

```text
一键指令
  -> 判断 hasFatalError / isLogDebugEnable
  -> 读取 JS 或 HTTP 日志片段
  -> JS 提取关键行
  -> ShowListDialog 展示
  -> 选择后复制或清理
```

不要在每个自动规则触发时都读取大日志。日志 FD 读取、字符串构造和弹窗都会增加运行成本。

## 清理日志

清理接口应放在明确的人工动作后：

```javascript
Packages.tornaco.apps.shortx.core.OooO0O0.OooO00o().clearJSLogs();
"JS logs cleared";
```

对于 HTTP、Hook 日志同理。清理前最好先展示日志路径或最近片段，避免误删排障依据。

## 风险

- 日志可能包含通知内容、URL、请求体、剪贴板、脚本异常和本地路径。
- 读取日志后不要默认上传到 HTTP 服务。
- 清空日志是破坏性诊断操作，应由用户显式触发。
- FD 读取后要关闭流。
