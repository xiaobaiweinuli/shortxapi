# 完整工作流：通知验证码去重复制

这个案例从零设计一条“收到通知 -> 提取验证码 -> 去重 -> 写剪贴板或提示”的规则。它适合作为通知类规则的模板：先把数据流做稳，再决定是否自动输入。

## 目标

规则最终应满足：

- 只处理指定应用或指定标题的通知。
- 从通知正文提取 4 到 8 位验证码。
- 同一条通知重复更新时不重复执行。
- 提取成功时把验证码输出给下游。
- 提取失败时输出空字符串，让下游自然跳过。
- 不保存完整通知正文作为长期状态。

## 动作链结构

```text
Notification 触发器
  -> ExecuteJS 提取并去重
  -> MatchJS 判断 jsRet 是否非空
  -> WriteClipboard 写入验证码
  -> Toast / Dialog 提示结果
```

如果后续还要自动输入，建议先保留剪贴板作为兜底。自动输入容易受焦点、输入法、页面动画影响。

## 第一步：过滤来源

在触发器或条件层先限制应用和标题，不要让所有通知都进入脚本。脚本里仍可以做二次过滤：

```javascript
var packageNameValue = pkgName == null ? "" : String(pkgName);
var titleValue = title == null ? "" : String(title);
var contentValue = contentText == null ? "" : String(contentText);

var isTargetApp = packageNameValue == "com.example.sms";
var isMaybeCode = titleValue.indexOf("验证码") >= 0 || contentValue.indexOf("验证码") >= 0;

isTargetApp && isMaybeCode;
```

这段适合放在 `MatchJS`。如果包名不固定，可以先只做关键词判断，再进入下一步。

## 第二步：提取验证码

把提取和去重放到 `ExecuteJS`，输出验证码字符串：

```javascript
var titleValue = title == null ? "" : String(title);
var contentValue = contentText == null ? "" : String(contentText);
var messageValue = titleValue + "\n" + contentValue;

var matchValue = messageValue.match(/[0-9A-Za-z]{4,8}/);
var codeValue = matchValue == null ? "" : matchValue[0];

if (codeValue.length == 0) {
    "";
} else {
    codeValue;
}
```

如果通知里经常同时包含订单号、手机号和验证码，可以改用“离关键词最近”的算法；简单规则先从可读性更高的版本开始。

## 第三步：去重

通知可能重复刷新。去重可以保存“包名 + 验证码”的短 key：

```javascript
var titleValue = title == null ? "" : String(title);
var contentValue = contentText == null ? "" : String(contentText);
var messageValue = titleValue + "\n" + contentValue;

var matchValue = messageValue.match(/[0-9A-Za-z]{4,8}/);
var codeValue = matchValue == null ? "" : matchValue[0];

if (codeValue.length == 0) {
    "";
} else {
    var packageNameValue = pkgName == null ? "" : String(pkgName);
    var keyValue = packageNameValue + ":" + codeValue;
    var lastValue = shortx.readGlobalVar("notification_code_last_key");

    if (lastValue != null && String(lastValue) == keyValue) {
        "";
    } else {
        shortx.writeGlobalVarWithOp("notification_code_last_key", keyValue, 3);
        codeValue;
    }
}
```

这里不要把完整 `contentText` 长期写入全局变量。验证码或短 key 足够去重，也更少泄露隐私。

## 第四步：判断是否继续

`MatchJS` 只判断 `jsRet`：

```javascript
var resultText = jsRet == null ? "" : String(jsRet);
resultText.length > 0;
```

后续 `WriteClipboard` 读取 `{jsRet}`。如果要让下游更清晰，可以把 `jsRet` 改名为 `ExtractedCode`。

## 第五步：输出和提示

推荐动作：

```text
WriteClipboard: {jsRet}
Toast: 已复制验证码
```

如果规则要给别人导入，提示里不要显示完整通知正文。只显示验证码或成功状态即可。

## 扩展：结构化输出

如果下游需要知道来源、标题和验证码，可以输出 JSON：

```javascript
var titleValue = title == null ? "" : String(title);
var contentValue = contentText == null ? "" : String(contentText);
var packageNameValue = pkgName == null ? "" : String(pkgName);
var messageValue = titleValue + "\n" + contentValue;
var matchValue = messageValue.match(/[0-9A-Za-z]{4,8}/);
var codeValue = matchValue == null ? "" : matchValue[0];

var output = {
    ok: codeValue.length > 0,
    code: codeValue,
    packageName: packageNameValue,
    title: titleValue
};

JSON.stringify(output);
```

这种输出适合接列表、弹窗、HTTP 或复杂路由。普通复制验证码则不需要 JSON。

## 发布前检查

| 检查项 | 标准 |
| --- | --- |
| 来源过滤 | 至少过滤包名、标题或关键词之一 |
| 去重变量 | 变量名唯一，值足够短 |
| 隐私 | 不长期保存完整通知正文 |
| 失败路径 | 提取失败输出空字符串 |
| 下游动作 | 先复制，再考虑自动输入 |
| 工作资料 | 如果目标应用在工作资料中，确认 `userId` 是否影响触发 |
