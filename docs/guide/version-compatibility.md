# 版本兼容与升级检查

ShortX 高级规则常同时依赖 ShortX 版本、Android 版本、ROM 行为、内部服务方法、外部 dex/jar 和设备用户空间。升级后最容易坏的不是简单文本处理，而是内部服务、系统设置、组件查询、截图/OCR、输入注入和外部库加载。

## 先分清变化来源

| 变化 | 可能影响 |
| --- | --- |
| ShortX 升级 | `shortx.*`、proto action 字段、内部服务方法、上下文输出 key |
| Android 升级 | 系统服务签名、权限检查、隐藏 API、多用户参数 |
| ROM 更新 | AppOps、通知策略、输入注入、显示设置、服务可见性 |
| 外部库更新 | dex/jar 路径、类名、方法签名、依赖类 |
| 目标 App 更新 | 包名、组件名、控件 ID、通知格式、快捷方式数据 |

每次规则异常时，先记录最近变化。不要直接改脚本，否则很容易把版本问题误判成逻辑问题。

## 升级前清单

- 导出当前规则、代码库、全局变量和关键配置。
- 记录 ShortX 版本、Android 版本、ROM 版本。
- 记录依赖文件名，例如 `ZXing-3.5.4.dex`、`pinyin-0.4.0.jar`。
- 记录规则创建或修改过的系统设置、用户限制、AppOps、组件状态。
- 对内部服务调用列一张方法表：方法名、用途、返回值、失败后的兜底动作。

## 升级后最小验证

按风险从低到高验证：

1. 只读页面：术语、文档、普通动作链是否能打开。
2. 上下文变量：通知、对话框、Shell、OCR 是否仍输出同名 key。
3. `shortx.*`：全局变量读取、ShortX 目录、UiAutomation 是否正常。
4. `shortx.executeAction(...)`：Shell、OCR、截图等 proto action 是否仍可执行。
5. 内部服务：日志目录、配置读取、插件能力、代码库读取是否正常。
6. Android 服务：Settings、PackageManager、Notification、AppOps 等是否受版本影响。
7. 写入能力：系统设置、组件启停、AppOps、用户限制是否仍可恢复。

不要从写入能力开始测。先验证只读，再验证可恢复写入。

## 内部服务检查

内部服务调用应保持最小可验证形态：

```javascript
importClass(Packages.tornaco.apps.shortx.core.OooO0O0);

var serviceObj = OooO0O0.OooO00o();
var valueObj = serviceObj == null ? null : serviceObj.getLogDir();
valueObj == null ? "" : String(valueObj);
```

如果这类最小查询失败，不要继续执行删除、更新、写入配置等操作。先确认当前版本是否仍支持该入口。

## Proto action 检查

`shortx.executeAction(...)` 的兼容风险主要在三处：

| 位置 | 检查 |
| --- | --- |
| action 类 | 类名是否仍存在 |
| builder 字段 | 字段名、枚举、`Any.pack(...)` 类型是否变化 |
| 输出 key | `contextData.get("...")` 的 key 是否仍一致 |

验证时用最小动作：

```javascript
importClass(Packages.tornaco.apps.shortx.core.proto.action.ShellCommand);

var action = ShellCommand.newBuilder()
    .setCommand("echo shortx")
    .build();

var result = shortx.executeAction(action);
var valueObj = result.contextData.get("shellOut");
valueObj == null ? "" : String(valueObj);
```

如果最小动作能跑，再验证复杂参数动作，例如 OCR、截图、区域选择。

## Android 版本检查

Android 服务和 manager API 常见变化：

- 参数数量变化。
- 新增 `userId`、`deviceId`、attribution 参数。
- 权限检查更严格。
- 工作资料或私密空间行为不同。
- 隐藏 API 不再可用。

规则中如果保存了包名，应同时确认 `userId`。只保存 `pkgName` 的规则，在工作资料、克隆应用、多用户设备上容易失效。

## 外部库检查

外部 dex/jar 规则升级后先检查文件：

```javascript
importClass(java.io.File);

var libFile = new File(shortx.getShortXDir(), "lib/ZXing-3.5.4.dex");
libFile.exists() ? libFile.getAbsolutePath() : "";
```

再检查类加载：

```javascript
importClass(dalvik.system.PathClassLoader);
importClass(java.lang.ClassLoader);

var libPathValue = shortx.getShortXDir() + "/lib/ZXing-3.5.4.dex";
var loaderObj = new PathClassLoader(libPathValue, ClassLoader.getSystemClassLoader());
var classObj = loaderObj.loadClass("com.google.zxing.MultiFormatReader");
String(classObj.getName());
```

不要在类加载还没验证前执行网络发送、数据库解密或大图识别。

## 兼容说明模板

发布规则时建议附带：

```text
适用范围：
- ShortX 版本：
- Android 版本：
- 目标 App：
- 是否支持工作资料/多用户：

依赖：
- 全局变量：
- 外部 dex/jar：
- 插件：
- 系统设置或 AppOps：

升级后检查：
- 通知/对话框输出 key：
- shortx.*：
- executeAction：
- 内部服务：
- 恢复动作：
```

这份说明能显著减少“导入后能运行，但不知道哪里坏了”的问题。
