# 动作链

动作链是 ShortX 文档的主线。脚本、API、Android 服务最终都要落回触发器、条件、动作和上下文变量之间的数据流。先把链路设计清楚，再写 JS/MVEL，后续维护会容易很多。

## 一条链怎么设计

从零设计时按这个顺序写：

```text
入口
  -> 过滤条件
  -> 数据提取或转换
  -> 输出改名
  -> 分支判断
  -> 执行动作
  -> 提示、记录或恢复
```

例如通知验证码：

```text
Notification 触发器
  -> MatchJS 过滤包名和关键词
  -> ExecuteJS 提取验证码
  -> customContextDataKey: jsRet -> ExtractedCode
  -> MatchJS 判断 ExtractedCode 非空
  -> WriteClipboard: {ExtractedCode}
  -> Toast
```

这条链的关键不是正则，而是每一步输出给谁、下游读取什么、失败时怎么跳过。

## 上下文数据流

动作链里常见三类值：

| 类型 | 示例 | 使用方式 |
| --- | --- | --- |
| 触发器上传值 | `pkgName`、`contentText`、`userId` | JS/MVEL 可读取，不能声明同名变量 |
| 动作默认输出 | `jsRet`、`mvelRet`、`selectedListItem` | 适合短链路，长链路建议改名 |
| 命名业务输出 | `ExtractedCode`、`SelectedPackageName` | 推荐给下游长期读取 |

示例：

```javascript
var contentValue = contentText == null ? "" : String(contentText);
var matchValue = contentValue.match(/[0-9]{4,8}/);
var codeValue = matchValue == null ? "" : matchValue[0];
codeValue;
```

这段会输出到 `jsRet`。如果后面还有多个动作，建议把 `jsRet` 改名为 `ExtractedCode`。

## 什么时候改名

链路超过两步时，就应该考虑 `customContextDataKey`。

| 不改名的问题 | 改名后的收益 |
| --- | --- |
| 下游不知道 `jsRet` 来自哪一步 | 业务名能说明来源 |
| 多段 JS 覆盖同一个 `jsRet` | 每个结果都有稳定名字 |
| 调试时难定位断点 | 可以逐步输出每个命名结果 |
| 导入后别人看不懂 | 动作链本身就是说明 |

命名建议使用业务名，例如 `SelectedPackageName`、`RegionJson`、`ExtractedCode`、`BackupDir`。不要使用 `title`、`text`、`pkgName` 这类常见上下文名。

## 条件放哪里

| 条件类型 | 推荐位置 |
| --- | --- |
| 包名、标题、关键词过滤 | 触发器条件或 `MatchJS` |
| JSON 解析、列表生成、正则提取 | `ExecuteJS` |
| 简单布尔判断 | `MatchJS` |
| 多分支选择 | `SwitchCase` 或菜单/列表对话框 |
| 需要用户确认 | 弹窗或对话框按钮动作 |

不要让 `MatchJS` 做复杂数据清洗。`MatchJS` 的目标是返回 true/false；复杂转换放在 `ExecuteJS`，并把结果改名后交给条件判断。

## 常见链路模板

手动查询：

```text
一键指令
  -> ExecuteJS 读取状态
  -> ShowAlertDialog 展示
```

列表选择：

```text
ExecuteJS 输出 JSON 数组
  -> ShowListDialog
  -> ExecuteJS 解析 selectedListItem
  -> 后续动作
```

自动过滤：

```text
触发器
  -> MatchJS 过滤来源
  -> ExecuteJS 提取业务值
  -> MatchJS 判断业务值
  -> 动作
```

写入前确认：

```text
ExecuteJS 读取当前状态
  -> ShowAlertDialog 展示影响
  -> positive 执行写入
  -> negative 中断
  -> 写入后保存恢复信息
```

## 先读什么

1. [数据模型](/chain/model)：理解 `jsRet`、`mvelRet`、`customContextDataKey`。
2. [导出结构解剖](/chain/export-anatomy)：读懂 DA、rule 和代码库文件外壳。
3. [动作元数据](/chain/action-metadata)：理解 `@type`、`id`、`note`、`customContextDataKey`。
4. [触发器与事实变量](/chain/facts-and-triggers)：理解触发器上传了什么。
5. [触发策略](/chain/trigger-strategy)：用 tag、条件和入口分支组织复杂规则。
6. [上下文变量速查](/chain/context-variable-reference)：写规则时查变量来源。
7. [上下文变量与保留名](/chain/context-vars)：避免变量名冲突。
8. [动作输出契约](/chain/action-output-contracts)：确认下游消费什么。
9. [常见数据格式](/chain/data-format-reference)：处理 JSON、Rect、Intent URI 和 ByteArrayWrapper。
10. [生命周期与退出逻辑](/chain/lifecycle-hooks)：理解启用、删除、停止和冲突策略。
11. [参数化调用与 DeepLink](/chain/parameters-deeplink)：理解外部调用和参数传递。
12. [等待、重试与超时](/chain/wait-retry)：设计等待条件、超时和重试边界。
13. [对话框交互契约](/chain/dialog-interactions)：理解菜单、文本输入和选择结果如何回流。
14. [输出模板](/chain/output-templates)：复制最小输出形状。

## 常见任务

| 任务 | 文档 |
| --- | --- |
| 对话框传递结构化数据 | [对话框 JSON 数据流](/chain/dialog-json) |
| 设计菜单、文本框和选择动作 | [对话框交互契约](/chain/dialog-interactions) |
| 阅读导出结构 | [导出结构解剖](/chain/export-anatomy) |
| 审查动作 ID、备注和输出改名 | [动作元数据](/chain/action-metadata) |
| 区分多入口规则的触发来源 | [触发策略](/chain/trigger-strategy) |
| 选择链路数据格式 | [常见数据格式](/chain/data-format-reference) |
| 审查启用、删除和退出逻辑 | [生命周期与退出逻辑](/chain/lifecycle-hooks) |
| 设计外部调用和参数 | [参数化调用与 DeepLink](/chain/parameters-deeplink) |
| 等待 UI、应用状态或异步结果 | [等待、重试与超时](/chain/wait-retry) |
| 选择链路结构 | [动作链设计模式](/chain/design-patterns) |
| 跨触发保存状态和去重 | [状态管理与去重](/chain/state-management) |
| Method Hook 触发规则 | [Method Hook 触发器](/chain/method-hook) |
| 判断能力风险 | [风险分级](/chain/risk) |
| 调试动作链无输出 | [调试方法](/guide/debugging) |

## 健康检查

一个健康的动作链通常满足：

- 每个上游输出都能被下游明确消费。
- 关键中间值有稳定名字，而不是全程依赖 `jsRet`。
- JS/MVEL 不声明 ShortX 上下文变量同名局部变量。
- 分支条件只做判断，复杂转换放在 `ExecuteJS`。
- 取消、空值、解析失败都有分支。
- 高风险动作前有确认、备份或回滚路径。
