# 参数化调用与 DeepLink

一键指令和自动指令可以被外部入口调用。常见两类机制：一键指令的 `parameters`，以及自动规则的 `DeepLinkCall` 触发器。

## `parameters`

一键指令主体可能包含参数声明：

```json
{
  "parameters": [{
    "name": "upperlimit",
    "defaultValue": "3",
    "comments": "默认查找三次..."
  }]
}
```

参数的作用是把“写死在动作里的配置”变成调用时可传入的值。适合：

- 查找次数。
- 目标文本。
- 目标包名。
- 是否启用某个模式。
- 坐标或区域参数。

参数名进入动作链后也应视为上下文名。脚本里可以读取，但不要重新声明同名局部变量。

## 参数默认值

`defaultValue` 是没有传入参数时的兜底值。写教程或发布说明时要说明：

- 默认值是否安全。
- 参数类型是数字、文本还是 JSON。
- 参数为空时是否退出。
- 参数超出范围时是否回退。

推荐在 JS 中做显式归一化：

```javascript
var limitValue = parseInt(String(upperlimit), 10);
if (isNaN(limitValue) || limitValue <= 0) {
    limitValue = 3;
}
limitValue;
```

这里读取 `upperlimit`，但没有声明 `var upperlimit`。

## DeepLink 调用规则

自动规则可使用 `DeepLinkCall` 作为触发器。它可以和 `parameters` 一起出现，用于从外部入口调用规则。

典型流向：

```text
外部 DeepLink
  -> DeepLinkCall fact
  -> 上传参数上下文
  -> conditions 过滤
  -> actions 执行
```

适合：

- 从桌面快捷方式触发规则。
- 从其他一键指令调用自动规则。
- 从网页、通知、输入法或外部 App 打开 ShortX 流程。

## 内部触发 DeepLink

内部服务调用示例：

```javascript
Packages.tornaco.apps.shortx.core.OooO0O0.OooO00o()
    .deepLinkTriggerCalled("shortx名字");
```

这是内部 ShortX 服务路径，不是普通网页 DeepLink。只有在当前版本完成最小验证后才使用。普通跳转优先使用 ShortX 提供的动作或系统 Intent。

## Intent URI 跳转

`StartActivityIntentUri` 和 Android `Intent.parseUri(...)` 是另一类入口：它们是打开 Android 页面或 App 功能，不等同于调用 ShortX 参数。

```javascript
importClass(android.content.Intent);

var targetIntentUri = "intent:#Intent;action=android.intent.action.VIEW;end";
var targetIntent = Intent.parseUri(targetIntentUri, 0);
targetIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
context.startActivity(targetIntent);
```

区分这三类入口：

| 入口 | 用途 |
| --- | --- |
| `parameters` | 给当前 ShortX 指令传入配置 |
| `DeepLinkCall` | 用外部链接触发 ShortX 自动规则 |
| `Intent URI` | 打开 Android App、Activity 或系统页面 |

## 参数传递格式

简单值可以传字符串；多字段建议传 JSON：

```json
{
  "targetText": "设置",
  "maxScrollCount": 3,
  "mode": "find-text"
}
```

下游读取：

```javascript
var callData = JSON.parse(CallPayload);
var targetTextValue = String(callData.targetText);
targetTextValue;
```

`CallPayload` 是自定义参数或上游改名后的上下文名，不要声明为局部变量。

## 设计建议

- 参数名使用业务名，不用 `title`、`contentText`、`pkgName` 等常见上下文名。
- 每个参数都提供默认值或空值处理。
- 外部调用先做白名单或模式判断，不要把任意文本直接拼进 Shell、Intent 或文件路径。
- 参数化 DA 要写清调用方式、参数名、默认值和停止方式。
- 长时间执行的参数化指令应配合 [生命周期与退出逻辑](/chain/lifecycle-hooks)。

## 排查清单

- 参数是否真的出现在导出主体的 `parameters`？
- 参数名是否和上下文保留名冲突？
- 默认值是否能独立运行？
- DeepLink 调用是否进入了正确规则？
- Intent URI 是打开外部 App，还是误以为在调用 ShortX？
- 用户取消、参数为空、参数格式错误是否有分支？

参数化调用的目标是复用动作链，而不是把所有配置写死在脚本里。参数越多，越要把输入校验和输出契约写清楚。
