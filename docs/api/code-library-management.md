# 代码库管理

代码库既是可复用脚本仓库，也是 ShortX 内部配置数据。真实资料里既有 `getAllCodeLibraryItems()`、`getCodeLibraryItemById(...)`、`executeCodeLibraryItem(...)`，也有 `addCodeLibraryItem(ByteArrayWrapper)`、`updateCodeLibraryItem(ByteArrayWrapper)`、`deleteCodeLibraryItem(...)`。教程要把“读取、执行、写入、删除”的风险分清楚。

## 当前确认的方法

最新 `IShortX` 签名中可见：

| 方法 | 用途 |
| --- | --- |
| `getAllCodeLibraryItems()` | 读取所有代码库条目 |
| `getCodeLibraryItemById(String)` | 按 ID 读取条目 |
| `getCodeLibraryItemCount()` | 获取数量 |
| `queryCodeLibraryItems(ByteArrayWrapper)` | 按内部查询对象搜索 |
| `executeCodeLibraryItem(String, int)` | 执行指定条目 |
| `addCodeLibraryItem(ByteArrayWrapper)` | 新增条目 |
| `updateCodeLibraryItem(ByteArrayWrapper)` | 更新条目 |
| `deleteCodeLibraryItem(String)` | 删除条目 |

读取和计数适合作为教程示例。新增、更新和查询需要内部 proto/bytes，不能凭方法名猜参数。

## 读取数量

```javascript
importClass(Packages.tornaco.apps.shortx.core.OooO0O0);

var serviceValue = OooO0O0.OooO00o();
var countValue = serviceValue.getCodeLibraryItemCount();

"code library count: " + countValue;
```

## 读取指定条目

```javascript
importClass(Packages.tornaco.apps.shortx.core.OooO0O0);

var codeLibraryIdValue = "CODELIB-xxxxxxxx";
var wrapperValue = OooO0O0.OooO00o().getCodeLibraryItemById(codeLibraryIdValue);

wrapperValue;
```

返回值通常是 `ByteArrayWrapper`，还需要按当前版本 proto 解包。文档中不要把它描述成普通字符串。

## 执行代码库条目

真实方法签名是：

```text
String executeCodeLibraryItem(String str, int i);
```

推荐写法：

```javascript
importClass(Packages.tornaco.apps.shortx.core.OooO0O0);

var codeLibraryIdValue = "CODELIB-xxxxxxxx";
var executeUserValue = 0;
var resultText = OooO0O0.OooO00o()
    .executeCodeLibraryItem(codeLibraryIdValue, executeUserValue);

resultText;
```

执行前必须知道这个代码库片段需要什么上下文。许多片段依赖当前链路变量、外部 dex、全局变量或系统状态，单独执行可能失败。

## 不要把代码库当普通函数库

代码库条目有三个层次：

| 层次 | 说明 |
| --- | --- |
| 导出文件 | JSON 加尾部类型元信息 |
| 内部配置 | 序列化后的 ShortX 对象 |
| 脚本内容 | 真正执行的 JS/MVEL |

迁移或发布时要说明：代码库条目 ID、名称、语言、依赖、输出契约和风险。只说“需要导入某代码库”不够。

## 写入和删除边界

带 `ByteArrayWrapper` 的写入入口说明参数是内部序列化对象。除非已经有完整构造样例，否则不要写“新增代码库”的半成品脚本。

删除脚本也不应直接给自动规则使用。推荐链路：

```text
读取代码库列表
  -> 展示名称、ID、描述
  -> 人工选择
  -> 二次确认
  -> 删除
  -> 输出删除结果
```

## 发布检查

- 规则依赖哪些代码库条目。
- 条目 ID 是否会在迁移后变化。
- 是否有硬编码路径、账号、token。
- 是否依赖外部 jar/dex。
- 输出是文本、JSON、布尔值还是 Java 对象。
- 是否调用 `OooO0O0.OooO00o()` 或系统服务。
- 删除或覆盖前是否有备份。
