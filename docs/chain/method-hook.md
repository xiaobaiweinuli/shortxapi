# Method Hook 触发器

Method Hook 是 ShortX 自动规则中的高级触发器。它不是普通通知监听，也不是广播监听，而是在指定包、类、方法和生命周期上提取上下文。Hook 能更早拿到数据，但也更依赖目标包、类名、方法签名和 ROM 实现。

## 典型结构

```json
{
  "@type": "type.googleapis.com/MethodHook",
  "packageName": "com.android.phone",
  "className": "com.android.internal.telephony.InboundSmsHandler",
  "methodName": "dispatchIntent",
  "beforeMethod": true,
  "lifecycle": "LoadedPackage",
  "expressions": [{
    "expressionMVEL": "intentObj = param.args[0]; intentObj == null ? '' : intentObj.toString();",
    "contextKey": "SmsIntentText"
  }]
}
```

它的重点是 `expressions`：每个表达式从 hook 参数中提取一个上下文变量，供条件和动作使用。

## `param` 对象

Hook 表达式常通过 `param.args[index]` 读取方法参数。短信类规则可能提取：

- `SmsBody`
- `SmsFrom`
- `SmsTimestamp`
- `SmsDedupKey`

这些 `contextKey` 生成的名字会成为动作链上下文变量。后续 JS/MVEL 可以读取，但不要重名声明。

## 从 Hook 到动作链

推荐结构：

```text
MethodHook fact 提取 SmsBody / SmsFrom / SmsDedupKey
  -> MatchJS 判断 SmsBody 是否包含验证码
  -> ExecuteJS 提取验证码并去重
  -> WriteClipboard
  -> Toast
```

Hook 只负责“把底层参数转成动作链上下文”。不要在 Hook 表达式里写大量业务逻辑。

## 为什么用 Hook

Hook 可以比通知更早拿到数据。例如短信验证码：

- 通知路径：短信 App 处理并发通知后才触发。
- 广播路径：部分系统可能不完全走标准广播。
- Hook 路径：可在短信分发链路更早提取。

但 Hook 不是默认入口。普通通知触发器能满足时，优先使用通知触发器。

## `contextKey` 命名

推荐使用业务名：

| 好名字 | 不推荐 |
| --- | --- |
| `SmsBody` | `contentText` |
| `SmsFrom` | `title` |
| `SmsDedupKey` | `jsRet` |
| `HookMethodName` | `text` |

避免覆盖 ShortX 常见上下文名。Hook 输出进入动作链后，和其他上下文名一样应视为保留名。

## 去重

Hook 可能被重复触发。去重可以保存短 hash 或短 key：

```javascript
var bodyValue = SmsBody == null ? "" : String(SmsBody);
var fromValue = SmsFrom == null ? "" : String(SmsFrom);
var keyValue = fromValue + ":" + bodyValue.hashCode();
var lastValue = shortx.readGlobalVar("sms_hook_last_key");

if (lastValue != null && String(lastValue) == keyValue) {
    "";
} else {
    shortx.writeGlobalVarWithOp("sms_hook_last_key", keyValue, 3);
    bodyValue;
}
```

不要长期保存完整短信正文作为去重状态。

## 风险与维护

Method Hook 属于危险/高级边界：

- 目标包升级可能改变类名或方法签名。
- 需要重启目标服务或设备后生效。
- 错误表达式可能导致上下文为空，甚至影响目标流程。
- 不同 ROM 的短信、电话、系统服务实现可能不同。

## 编写原则

1. 只在普通触发器无法满足时使用。
2. 明确目标包和方法属于哪个系统链路。
3. `contextKey` 使用业务名，不要覆盖通用变量。
4. 先用只读表达式提取数据，再逐步加条件和动作。
5. 添加去重，全局变量只保存短 hash 或状态。
6. 发布前说明目标 Android/ROM 版本和验证方法。
