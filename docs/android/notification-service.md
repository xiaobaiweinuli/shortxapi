# Notification 服务教程

`notification` 服务对应 `android.app.INotificationManager`。它是 Android 通知系统的核心服务，覆盖通知发布、取消、Toast、通知渠道、监听器、通知助手、DND/Zen、通知策略和历史记录。

## 在 ShortX 中先用动作链

如果需求是“收到通知后处理内容”，不要从 AIDL 开始。优先使用 ShortX 通知触发器和上下文变量：

- `title`
- `contentText`
- `pkgName`
- `userId`
- `notificationTag`

典型动作链：

```text
Notification 触发器 -> JS/MVEL 提取 -> IfThenElse/MatchJS 判断 -> 剪贴板/输入/对话框/全局变量
```

## 什么时候看 NotificationManagerService

只有当需求变成“操作通知系统状态”时，才需要进入 Android 服务说明：

- 查询或修改通知权限状态。
- 通知渠道、分组、DND/Zen 规则。
- 通知监听器或助手授权。
- 主动取消其他应用通知。
- 查询历史通知或活动通知。

这些能力通常比“处理通知文本”风险更高。

## 方法族理解

从 Android 通知服务接口可以按用途拆出这些方法族：

| 方法族 | 说明 | 风险 |
| --- | --- | --- |
| `enqueue*`, `cancel*` | 发布、取消 Toast 或通知 | 高级/危险 |
| `*NotificationChannel*` | 通知渠道和渠道组 | 高级 |
| `registerListener`, `requestBindListener` | 通知监听器 | 高级 |
| `setZenMode`, `getZenMode*` | DND/Zen 状态和规则 | 危险 |
| `setNotificationPolicy*` | 通知策略授权 | 危险 |
| `getActiveNotifications*` | 活动通知查询 | 高级 |

## 推荐写法

处理通知内容时，保持动作链风格：

```javascript
var contentValue = contentText == null ? "" : String(contentText);
var resultText = "";

if (contentValue.indexOf("验证码") >= 0) {
    resultText = "maybe-code";
} else {
    resultText = "ignored";
}

resultText;
```

如果后续需要多步消费，把结果改名：

```json
"customContextDataKey": {
  "keys": [{
    "first": "jsRet",
    "second": "notificationKind"
  }]
}
```

## 风险提示

通知服务里很多方法需要 listener、token、ComponentName、UserHandle 或策略授权。AIDL 签名存在不代表应该直接从 ShortX 脚本调用。能用 ShortX 触发器和内置动作解决的场景，不要降到服务层。
