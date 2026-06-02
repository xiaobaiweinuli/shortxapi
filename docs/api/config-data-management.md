# 配置数据管理

ShortX 的一键指令、自动指令、代码库、全局变量、开关指令、动态快捷方式等都可以在内部服务层读取或管理。内部服务层有大量入口，但它们更适合做迁移、备份、检查和高级维护，不适合当作普通脚本 API 滥用。

## 数据族

| 数据 | 常见读取入口 | 常见写入/删除入口 |
| --- | --- | --- |
| 一键指令集 | `getAllDASets(true)` | `addDASet(...)`、删除指定集 |
| 自动指令集 | `getAllRuleSets(true)` | `addRuleSet(...)`、删除指定集 |
| 代码库 | `getAllCodeLibraryItems()` | `addCodeLibraryItem(ByteArrayWrapper)`、`deleteCodeLibraryItem(id)` |
| 全局变量 | `getAllGlobalVars()` | `addGlobalVar(ByteArrayWrapper)`、删除指定变量 |
| 开关指令 | `getAllSwitchActionSettings()` | 新增、删除、状态查询 |
| 动态快捷方式配置 | `getAllDynamicShortcutSettings()` | 删除指定动态快捷方式配置 |

具体方法名以当前 ShortX 版本和最小验证结果为准。带 `ByteArrayWrapper` 的写入入口说明参数通常是序列化后的 proto 数据，不应凭空构造。

## 读取比写入更适合教程

读取配置可以用于：

- 生成备份清单。
- 查找重复指令。
- 检查缺失插件、缺失全局变量。
- 统计代码库片段数量。
- 把配置整理成 `ShowListDialog` JSON。

写入和删除配置则应更谨慎：

- 先备份。
- 先查 ID。
- 先展示待删除对象。
- 删除动作由人工确认触发。
- 不要在自动规则中批量改配置。

## 全局变量解析

内部服务层读取全局变量时，不是简单字符串列表，而是 proto `GlobalVar` 和 `Any` 包装对象。高级脚本会根据类型解包：

- `StringVar`
- `Int64Var`
- `BoolVar`
- `StringListVar`
- `Int64ListVar`
- `BoolListVar`
- `GlobalVarCreatedBy_Rule`
- `GlobalVarCreatedBy_User`

因此文档中不要把全局变量描述成单一键值字符串。它有类型、密文标记、备注和创建来源。

## 管理链路建议

```text
读取配置数据
  -> JS 转成稳定 JSON
  -> ShowListDialog 展示候选项
  -> selectedListItem
  -> 二次确认
  -> 删除、复制 ID、导出或跳转
```

这里 `selectedListItem` 是对话框输出，后续 JS 只能读取，不能声明同名局部变量。

## 不要猜 `ByteArrayWrapper`

很多新增或执行入口只给出了方法签名：

```text
addCodeLibraryItem(ByteArrayWrapper)
addGlobalVar(ByteArrayWrapper)
executeAction(ByteArrayWrapper, ByteArrayWrapper, ByteArrayWrapper)
```

这说明内部服务存在能力，但不说明参数该如何构造。除非已经有完整 proto 构造样例，否则教程应停在“查证入口和风险说明”，不要给半成品写入脚本。

## 风险

- 错误删除会丢失指令、代码库或变量。
- 写入旧版本 proto 可能破坏新版本配置。
- 全局变量可能包含 secret 值，展示和导出要过滤。
- 批量修改配置前必须保留可回滚备份。

