# 状态管理与去重

ShortX 动作链默认是一次性执行流。跨触发、跨规则、跨设备状态的逻辑，必须显式设计状态保存和清理。

## 三类状态

| 状态 | 生命周期 | 适合保存 |
| --- | --- | --- |
| 上下文变量 | 当前触发和当前动作链 | 通知内容、选择项、HTTP 结果、OCR 结果 |
| 局部变量 | 当前 JS/MVEL 片段 | 中间计算值、临时数组、格式化文本 |
| 全局变量 | 跨触发持久保存 | 配置、去重 key、快照、轻量缓存 |

不要用 `jsRet` 承担跨次运行状态。它只属于当前链路。

## 去重模式

适合验证码、通知、剪贴板、广播重复触发。

```text
触发器
  -> JS 提取业务 key
  -> 读取全局变量 lastKey
  -> 相同则停止
  -> 不同则继续处理
  -> 写回新 key
```

示例：

```javascript
var contentValue = contentText == null ? "" : String(contentText);
var currentKey = String(pkgName) + ":" + contentValue;
var lastKey = shortx.readGlobalVar("notification_last_key");

var resultText = "";
if (lastKey == null || String(lastKey) !== currentKey) {
    shortx.writeGlobalVarWithOp("notification_last_key", currentKey, 3);
    resultText = contentValue;
}

resultText;
```

`pkgName`、`contentText` 是上游变量，只读取，不声明。

## 运行锁模式

适合防止同一规则并发执行。

```text
读取 lock
  -> lock 存在则停止
  -> 写入 lock
  -> 执行业务动作
  -> 清理 lock
```

锁必须有恢复策略。否则异常中断后，规则可能永久停止。

建议：

- lock 值里保存时间戳。
- 超过阈值时允许覆盖旧锁。
- 正常结束和异常分支都清理锁。

## 快照模式

适合设置项、应用列表、组件状态、插件能力。

```text
读取当前状态
  -> 如果无旧快照，保存初始快照
  -> 如果有旧快照，比较差异
  -> 输出差异 JSON
  -> 用户确认后更新快照
```

快照适合保存 JSON 字符串，但要控制大小。不要把完整日志、剪贴板历史或大文件塞进全局变量。

## 状态命名

全局变量建议使用业务前缀：

```text
notification_last_key
settings_snapshot_json
shortcut_last_created_id
plugin_capability_snapshot
```

避免使用 `title`、`pkgName`、`jsRet`、`selectedListItem` 这类上下文名作为全局变量或 `customContextDataKey` 名。

## 清理策略

状态不是越多越好。发布规则时要说明：

- 哪些全局变量需要初始化。
- 哪些状态可以删除。
- 禁用规则后是否需要清理。
- 迁移设备时哪些状态不应该带走。

验证码去重、运行锁、临时快照通常不需要长期迁移。

