# 外部 dex/jar 加载

高级规则中有多类能力依赖外部 dex 或 jar，例如二维码识别、中文转拼音、邮件发送。核心模式是：从 ShortX 根目录定位 `lib` 文件，创建 `PathClassLoader`，加载类，再直接调用或反射调用。

## 目录约定

建议把外部库放在 ShortX 根目录下的 `lib` 目录：

```text
ShortX 根目录
  -> lib/
     -> pinyin-0.4.0.jar
     -> ZXing-3.5.4.dex
```

规则发布时要写清文件名、版本、用途和下载方式。不要只写“把 jar 放到 lib 里”，否则导入者无法判断缺哪个文件。

## 基本加载模式

```javascript
importClass(Packages.dalvik.system.PathClassLoader);
importClass(java.lang.ClassLoader);
importClass(java.io.File);
importClass(Packages.tornaco.apps.shortx.core.OooO0O0);

var serviceObj = OooO0O0.OooO00o();
var logDirPathValue = serviceObj.getLogDir();
var shortxRootPathValue = new File(String(logDirPathValue)).getParentFile().getAbsolutePath();
var libFileObj = new File(shortxRootPathValue + "/lib/example.jar");

if (!libFileObj.exists()) {
    "missing: " + libFileObj.getAbsolutePath();
} else {
    var loaderObj = new PathClassLoader(libFileObj.getAbsolutePath(), ClassLoader.getSystemClassLoader());
    "loaded: " + libFileObj.getAbsolutePath();
}
```

先验证文件存在和 loader 能创建，再写具体类调用。

## 加载类并调用

以中文转拼音为例：

```javascript
importClass(Packages.dalvik.system.PathClassLoader);
importClass(java.lang.ClassLoader);
importClass(java.io.File);
importClass(Packages.tornaco.apps.shortx.core.OooO0O0);

var serviceObj = OooO0O0.OooO00o();
var logDirPathValue = serviceObj.getLogDir();
var shortxRootPathValue = new File(String(logDirPathValue)).getParentFile().getAbsolutePath();
var libFileObj = new File(shortxRootPathValue + "/lib/pinyin-0.4.0.jar");
var resultText = "";

if (!libFileObj.exists()) {
    resultText = "missing: " + libFileObj.getAbsolutePath();
} else {
    try {
        var loaderObj = new PathClassLoader(libFileObj.getAbsolutePath(), ClassLoader.getSystemClassLoader());
        var helperClassObj = loaderObj.loadClass("com.github.houbb.pinyin.util.PinyinHelper");
        var styleClassObj = loaderObj.loadClass("com.github.houbb.pinyin.constant.enums.PinyinStyleEnum");

        var defaultEnumObj = styleClassObj.getField("DEFAULT").get(null);
        var methodObj = helperClassObj.getMethod("toPinyin", java.lang.String, styleClassObj);

        resultText = String(methodObj.invoke(null, ["我爱中文", defaultEnumObj]));
    } catch (e) {
        resultText = "error: " + String(e);
    }
}

resultText;
```

这段只输出字符串。若下游需要更多诊断信息，可以输出 JSON。

## 输出诊断信息

```javascript
var outputObj = {
    ok: resultText.indexOf("error: ") != 0 && resultText.indexOf("missing: ") != 0,
    value: resultText,
    library: libFileObj.getAbsolutePath()
};

JSON.stringify(outputObj, null, 2);
```

给别人导入时，诊断输出比静默失败更重要。外部库路径错、类名错、方法签名错都应该能看出来。

## 适合场景

- APK/系统环境没有内置库。
- 能力由 Java 库提供，例如 QR、邮件、拼音、复杂解析。
- 该库已经在当前 ShortX 环境下完成最小加载验证。

## 必须说明的依赖

教程中必须写清楚：

- dex/jar 放在哪个路径。
- 版本号是什么。
- 类名和方法名是什么。
- 输入输出是什么。
- 文件不存在时如何报错。
- 规则删除时是否需要清理库文件。

## 风险

- 外部库和系统 ClassLoader 冲突。
- 方法签名不匹配。
- dex/jar 文件缺失。
- 大图像、网络、邮件发送等耗时操作会阻塞动作链。
- 包含账号、授权码、token 的脚本不能直接公开复用。
