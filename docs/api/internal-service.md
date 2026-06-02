# 内部 ShortX 服务

大量高级能力通过内部服务取得。最典型入口是：

```javascript
importClass(Packages.tornaco.apps.shortx.core.OooO0O0);

var serviceObj = OooO0O0.OooO00o();
var valueObj = serviceObj == null ? null : serviceObj.getLogDir();
valueObj == null ? "" : String(valueObj);
```

`OooO0O0.OooO00o()` 名字看起来像混淆产物，但它是当前版本可验证的内部服务入口。文档不应为了“美观”把它改写成不存在的 API。

## 什么时候使用

适合：

- 查询 ShortX 目录、日志、运行状态。
- 做规则、直接动作、代码库、应用集等内部对象的诊断。
- 公共 `shortx.*` 和 proto action 覆盖不到的高级维护能力。
- 当前版本完成最小验证的内部方法。

不适合：

- 替代普通内置动作。
- 在高频自动规则里反复读大日志或大配置。
- 凭方法名猜删除、更新、写入参数。
- 把内部服务包装成面向普通用户的无确认开关。

## 最小验证

先验证服务对象和只读方法：

```javascript
importClass(Packages.tornaco.apps.shortx.core.OooO0O0);

var serviceObj = OooO0O0.OooO00o();
var resultText = "";

try {
    resultText = serviceObj == null ? "" : String(serviceObj.getLogDir());
} catch (e) {
    resultText = "error: " + String(e);
}

resultText;
```

如果这段失败，不要继续执行任何清理、删除、更新或配置写入。

## 读取 ShortX 根目录

`getLogDir()` 通常位于 ShortX 数据根目录下方，可以通过父目录得到根路径：

```javascript
importClass(java.io.File);
importClass(Packages.tornaco.apps.shortx.core.OooO0O0);

var serviceObj = OooO0O0.OooO00o();
var logDirPathValue = serviceObj.getLogDir();
var rootPathValue = "";

if (logDirPathValue != null) {
    rootPathValue = new File(String(logDirPathValue)).getParentFile().getAbsolutePath();
}

rootPathValue;
```

这个结果适合后续拼接 `lib/...`、诊断日志路径或内部数据路径。拼路径前要检查文件是否存在。

## 输出给下游

内部服务返回值经常是 Java 对象，不一定适合直接交给下游。建议统一转成：

| 下游目标 | 输出 |
| --- | --- |
| 展示路径 | 字符串 |
| 列表对话框 | JSON 数组 |
| 多字段诊断 | JSON 对象 |
| 只做条件判断 | 布尔值或短字符串 |

示例：

```javascript
importClass(Packages.tornaco.apps.shortx.core.OooO0O0);

var serviceObj = OooO0O0.OooO00o();
var outputObj = {
    logDir: "",
    hasFatalError: false,
    debugLogEnabled: false
};

try {
    outputObj.logDir = String(serviceObj.getLogDir());
    outputObj.hasFatalError = serviceObj.hasFatalError() == true;
    outputObj.debugLogEnabled = serviceObj.isLogDebugEnable() == true;
} catch (e) {
    outputObj.error = String(e);
}

JSON.stringify(outputObj, null, 2);
```

## 写入和删除能力

写入类能力必须单独设计确认和恢复：

```text
读取当前状态
  -> 展示影响
  -> 用户确认
  -> 执行写入
  -> 输出结果
  -> 提供恢复方式
```

删除规则、代码库、全局变量、应用集、WebDAV 配置等属于高风险能力。文档可以讲边界和检查方法，不应给无确认的一键删除脚本。

## 编写原则

1. 优先使用内置动作、`shortx.*` 和 `shortx.executeAction(...)`。
2. 只在当前版本完成最小验证后使用内部服务。
3. 读取类能力可以写成教程；写入/删除类能力必须加确认和恢复。
4. 输出结果要面向下游动作塑形。
5. 版本升级后重新验证内部服务方法。
