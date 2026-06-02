# 高级案例：通知处理

通知是 ShortX 自动规则最常见的触发来源之一。大多数通知自动化不需要直接碰 Android 通知服务，只要把触发器上下文、提取逻辑、去重和后续动作设计清楚即可。

## 基本链路

```text
通知触发器
  -> 读取 title/contentText/pkgName/userId
  -> JS 或 MVEL 提取业务值
  -> MatchJS 判断是否命中
  -> 写剪贴板 / 弹窗 / 输入 / 跳转 / 全局变量
```

常用上下文包括：

| 变量 | 用途 |
| --- | --- |
| `title` | 通知标题 |
| `contentText` | 通知正文 |
| `pkgName` | 来源应用包名 |
| `userId` | Android 用户或资料空间 |
| `notificationTag` | 区分部分通知来源 |

这些都是上下文名，脚本中只能读取，不要声明同名局部变量。

## 提取验证码

```javascript
var contentValue = contentText == null ? "" : String(contentText);
var matchValue = contentValue.match(/[0-9]{4,8}/);
matchValue == null ? "" : matchValue[0];
```

后续用 `MatchJS` 判断是否成功：

```javascript
var resultText = jsRet == null ? "" : String(jsRet);
resultText.length > 0;
```

如果要给下游更清晰的名称，把 `jsRet` 改成 `ExtractedCode` 或类似业务名。

## 来源过滤

不要只靠正文关键词。稳定规则通常同时判断包名、标题和正文：

```javascript
var packageNameValue = pkgName == null ? "" : String(pkgName);
var titleValue = title == null ? "" : String(title);
var contentValue = contentText == null ? "" : String(contentText);

packageNameValue == "com.example.sms"
    && titleValue.length > 0
    && /[0-9]{4,8}/.test(contentValue);
```

如果同一应用有多类通知，可以先输出结构化结果：

```javascript
var output = {
    packageName: pkgName == null ? "" : String(pkgName),
    kind: "unknown",
    value: ""
};

var contentValue = contentText == null ? "" : String(contentText);
var codeMatch = contentValue.match(/[0-9]{4,8}/);

if (codeMatch != null) {
    output.kind = "code";
    output.value = codeMatch[0];
}

JSON.stringify(output);
```

## 去重

通知可能重复更新。验证码、订单号、推送提醒都应考虑去重：

```javascript
var contentValue = contentText == null ? "" : String(contentText);
var keyValue = String(pkgName) + ":" + contentValue;
var lastValue = shortx.readGlobalVar("notification_last_key");

if (String(lastValue) == keyValue) {
    "";
} else {
    shortx.writeGlobalVarWithOp("notification_last_key", keyValue, 3);
    contentValue;
}
```

去重 key 不要保存过长原文。更稳的做法是保存业务 ID、验证码或短 hash。

## 何时进入 Android 服务层

只有当需求变成“操作通知系统状态”时，才需要进入 Android 服务教程：

| 需求 | 风险 |
| --- | --- |
| 查询通知权限状态 | 高级 |
| 修改通知渠道或分组 | 高级 |
| 修改 DND/Zen 策略 | 危险 |
| 主动取消其他应用通知 | 危险 |
| 注册通知监听器或助手 | 危险 |

处理通知内容时，优先使用 ShortX 通知触发器和动作链。不要为了读取一条通知正文而直接调用系统通知服务。

## 排查清单

| 现象 | 检查 |
| --- | --- |
| 规则不触发 | 通知触发器条件、包名、用户 ID |
| 提取为空 | `contentText` 是否为空，正文是否在标题或扩展文本里 |
| 重复执行 | 是否缺少去重变量 |
| 错误应用触发 | 是否只按关键词判断，没有过滤 `pkgName` |
| 工作资料失败 | 是否同时处理 `pkgName` 和 `userId` |
