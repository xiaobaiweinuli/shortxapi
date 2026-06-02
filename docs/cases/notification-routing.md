# 高级案例：通知路由

通知路由不是简单地“收到通知就执行动作”。稳定规则需要先识别来源、提取业务值、去重，再决定是复制、跳转、清理还是展示。

## 推荐链路

```text
通知触发器
  -> 条件过滤 pkgName / title / contentText
  -> ExecuteJS 提取业务值
  -> 去重状态检查
  -> MatchJS 判断是否继续
  -> 路由到剪贴板 / 弹窗 / DeepLink / 清理通知
```

通知变量常见有 `pkgName`、`title`、`contentText`、`notificationTag`、`userId`。这些名字只能读取，不能声明局部变量。

## 提取业务值

```javascript
var contentValue = contentText == null ? "" : String(contentText);
var matcher = java.util.regex.Pattern.compile("\\d{4,8}").matcher(contentValue);
var resultText = matcher.find() ? matcher.group() : "";
resultText;
```

后续用 `MatchJS` 判断：

```javascript
var resultText = jsRet == null ? "" : String(jsRet);
resultText.length > 0;
```

## 去重

通知可能重复更新。可以把通知来源和正文组合成 key：

```javascript
var titleText = title == null ? "" : String(title);
var contentValue = contentText == null ? "" : String(contentText);
var currentKey = String(pkgName) + ":" + titleText + ":" + contentValue;
var lastKey = shortx.readGlobalVar("notification_route_last_key");

var resultText = "";
if (lastKey == null || String(lastKey) !== currentKey) {
    shortx.writeGlobalVarWithOp("notification_route_last_key", currentKey, 3);
    resultText = contentValue;
}

resultText;
```

## 路由表

复杂规则可以用 JSON 描述路由：

```javascript
var routes = [
    {
        packageName: "com.example.sms",
        keyword: "验证码",
        action: "copy"
    },
    {
        packageName: "com.example.chat",
        keyword: "工单",
        action: "deeplink"
    }
];

JSON.stringify(routes);
```

路由表可以放在全局变量里，便于迁移和修改。

## 清理通知

直接调用状态栏服务清除通知属于高级路径：

```javascript
android.os.ServiceManager.getService("statusbar").onClearAllNotifications(0);
"cleared";
```

这是系统服务级能力，风险高于普通通知处理。只建议在明确用户、明确范围、明确确认后使用。不要把“清空所有通知”直接接在普通通知触发器后。

## 安全边界

- 通知内容可能包含验证码、订单、账号、隐私信息。
- HTTP 上传通知内容前必须明确字段和目标。
- 写日志时不要完整记录敏感通知。
- 清理通知前要确认是否会影响用户未读信息。

