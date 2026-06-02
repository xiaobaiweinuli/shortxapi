# 高级案例：外部库能力

二维码扫描、拼音转换、邮件发送都展示了 ShortX JS 的一个重要能力：加载外部 dex/jar。外部库能扩展脚本能力，但也会带来路径、版本、性能和敏感配置风险。

## 通用结构

```text
配置块
  -> 计算 ShortX 根目录
  -> 拼出 dex/jar 路径
  -> 检查文件是否存在
  -> 创建 PathClassLoader
  -> 加载目标类
  -> 调用方法或反射构造对象
  -> 输出稳定结果
```

典型加载方式：

```javascript
importClass(java.io.File);
importClass(dalvik.system.PathClassLoader);
importClass(java.lang.ClassLoader);

var jarFile = new File(shortx.getShortXDir(), "lib/ZXing-3.5.4.dex");
if (!jarFile.exists()) {
    "missing: " + jarFile.getAbsolutePath();
} else {
    var loader = new PathClassLoader(jarFile.getAbsolutePath(), ClassLoader.getSystemClassLoader());
    var readerClass = loader.loadClass("com.google.zxing.MultiFormatReader");
    String(readerClass.getName());
}
```

## 二维码扫描

二维码识别通常需要：

1. 验证图片文件存在。
2. 解码 Bitmap。
3. 加载 ZXing 类。
4. 构造解码 hints。
5. 尝试不同缩放比例或裁剪区域。
6. 收集识别结果并一次性输出。

不要在循环中把结果逐条 `console.log(...)` 当作输出。应在循环结束后统一输出字符串或 JSON。

## 中文转拼音

拼音转换适合做成小工具或代码库片段：

```javascript
importClass(dalvik.system.PathClassLoader);
importClass(java.lang.ClassLoader);

var pinyinJarPath = shortx.getShortXDir() + "/lib/pinyin-0.4.0.jar";
var loader = new PathClassLoader(pinyinJarPath, ClassLoader.getSystemClassLoader());
// 后续按库的类名加载并调用
```

这类脚本必须写清楚 jar 文件名、版本、放置目录和失败提示。

## 邮件发送

邮件发送通常会加载 Jakarta Mail 相关 dex/jar，并通过反射构造会话、消息、收件人和正文。它适合高级用户，但发布时必须避免：

- 把授权码硬编码进共享规则。
- 把 SMTP 账号、收件人和正文写死。
- 在失败时输出完整密码或 token。
- 在没有网络检查的情况下直接发送。

配置建议放在全局变量或用户输入步骤中，并在发布说明中写明如何清理。

## 风险和排查

| 问题 | 处理 |
| --- | --- |
| 路径错误 | 输出 `getAbsolutePath()`，确认文件在 ShortX 目录下 |
| 类加载失败 | 检查 dex/jar 版本和类名 |
| 方法签名不匹配 | 改用反射前先输出参数类型 |
| 图片处理慢 | 缩小区域、限制重试次数 |
| 网络发送失败 | 输出错误类型，不输出敏感配置 |

## 发布要求

外部库教程必须写清：

- 依赖文件名和版本。
- 文件应该放在哪里。
- 输入数据是什么。
- 输出格式是什么。
- 是否包含账号、密码、token、图片、数据库等敏感内容。
