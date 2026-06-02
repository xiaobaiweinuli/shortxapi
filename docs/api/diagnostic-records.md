# 诊断记录

除了日志文件，最新 `IShortX` 签名还暴露了多类诊断记录入口，例如动作评估、条件评估、事实发布、Settings 读写记录。这些更像“事件记录表”，适合构建排障面板，不适合在业务规则里频繁读取。

## 已确认入口

| 方法 | 可能用途 |
| --- | --- |
| `getActionEvaluateRecords()` | 查看动作执行/评估记录 |
| `getConditionEvaluateRecords()` | 查看条件判断记录 |
| `getFactPublishRecords()` | 查看事实发布记录 |
| `getReadSettingsRecord()` | 查看 Settings 读取记录 |
| `getWriteSettingsRecord()` | 查看 Settings 写入记录 |

这些方法返回 `List<ByteArrayWrapper>`。是否能直接解析，取决于当前 ShortX 版本的 proto 类是否可用。

## 读取数量

```javascript
importClass(Packages.tornaco.apps.shortx.core.OooO0O0);

var serviceValue = OooO0O0.OooO00o();
var actionRecordsValue = serviceValue.getActionEvaluateRecords();
var conditionRecordsValue = serviceValue.getConditionEvaluateRecords();
var factRecordsValue = serviceValue.getFactPublishRecords();

var output = {
    actionRecords: actionRecordsValue == null ? 0 : actionRecordsValue.size(),
    conditionRecords: conditionRecordsValue == null ? 0 : conditionRecordsValue.size(),
    factRecords: factRecordsValue == null ? 0 : factRecordsValue.size()
};

JSON.stringify(output, null, 2);
```

数量统计是安全的第一步。不要一开始就把所有记录解包并展示。

## 面板设计

推荐链路：

```text
读取记录数量
  -> 展示可查看项目
  -> 用户选择记录族
  -> 限制读取最近 N 条
  -> 解析摘要
  -> 复制或清理
```

如果缺少 proto 解析类，就只展示数量、原始 wrapper 类型和风险说明，不要伪造字段。

## 和日志的区别

| 类型 | 适合看什么 |
| --- | --- |
| JS 日志 | 脚本异常、`console.log` 调试输出 |
| HTTP 日志 | 请求 URL、响应、失败原因 |
| Hook 日志 | Hook 方法调用情况 |
| 评估记录 | 动作/条件是否被 ShortX 执行或判断 |
| 事实记录 | 触发器是否真的发布了事实 |
| Settings 记录 | 系统设置读写行为 |

排查时先看触发事实，再看条件，再看动作，最后看脚本日志。

## 安全边界

- 记录可能包含包名、通知内容、设置项、动作参数和错误信息。
- 不要自动上传记录。
- 不要在自动规则中高频读取。
- 展示前优先做摘要和脱敏。
- 清理能力若存在，应作为人工操作。
