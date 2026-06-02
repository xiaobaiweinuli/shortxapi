# 代码库复用

ShortX 代码库片段通常是可复用能力样本，而不是完整文档页。本站不重复生成官方代码库索引，但会解释如何读和复用这些片段。

## 代码库导出格式

常见结构是：

```text
{
  "id": "...",
  "name": "...",
  "description": "...",
  "type": "CodeType_JAVASCRIPT",
  "content": "真正脚本内容"
}
###------###
{"type": "CodeLibraryItem", "author": "..."}
```

阅读时重点看 `content`，元数据用于判断名称、描述、语言和来源。

## 复用方式

代码库片段常见三种用途：

| 用途 | 做法 |
| --- | --- |
| 直接执行 | 作为一个原子能力使用 |
| 嵌入动作链 | 复制核心逻辑到 `ExecuteJS` |
| 改写教程 | 提炼配置、导入、辅助函数、输出契约 |

不要把代码库导出原样搬成教程。真实教程应该说明输入、输出、依赖和风险。

## 读代码库时看什么

- 需要哪些 Android/Java/ShortX 类。
- 是否依赖 `OooO0O0.OooO00o()`。
- 是否依赖外部 dex/jar。
- 输出是字符串、JSON、布尔值还是 Java 对象。
- 是否有硬编码路径、包名、账号、token。
- 是否会修改系统或 ShortX 长期状态。

## 改写成动作链时

代码库片段通常没有完整上下文。放进动作链前要确定：

- 上游变量名是什么。
- 是否需要 `customContextDataKey`。
- 下游要消费哪个结果。
- 是否要把配置放在脚本顶部。

示例：

```javascript
// config
var packageNameValue = "tornaco.apps.shortx";

// main
var result = Packages.tornaco.apps.shortx.core.OooO0O0
    .OooO00o()
    .getActivities(0, packageNameValue);

// output
result;
```

这里刻意不用 `pkgName` 作为变量名，因为它是常见上下文保留名。

