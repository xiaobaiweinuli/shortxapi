# 高级案例：验证码处理

验证码处理是 ShortX 动作链、变量、JS/MVEL 和风险控制的综合案例。

## 推荐思路

1. 选择触发器：通知、短信 Hook、剪贴板或其他来源。
2. 提取上下文：短信正文、通知内容、发件人、时间戳。
3. 用关键词判断是否像验证码。
4. 用正则提取 4-8 位数字或字母数字混合候选。
5. 按“距离关键词最近”选择候选。
6. 做去重，避免同一条消息重复触发。
7. 输出到 `jsRet` 或命名上下文。
8. 执行输入、复制、气泡、Toast 或通知。

## 真实风格片段

```javascript
importClass(java.util.regex.Pattern);
importClass(java.util.regex.Matcher);
importClass(java.lang.Integer);

var keywords = ["验证码", "校验码", "Code", "code", "OTP", "otp"];
var pattern = Pattern.compile("((?=.*[a-zA-Z])(?=.{0,4}\\\\d)[a-zA-Z0-9]{4,8})|(\\\\d{4,8})");
var matcher = pattern.matcher(smsBody);
var candidates = [];

while (matcher.find()) {
    candidates.push({ code: matcher.group(), pos: matcher.start() });
}

var keywordPositions = [];
for (var i = 0; i < keywords.length; i++) {
    var keywordText = keywords[i];
    var pos = smsBody.indexOf(keywordText);
    while (pos !== -1) {
        keywordPositions.push(pos);
        pos = smsBody.indexOf(keywordText, pos + keywordText.length);
    }
}

var closestPinCode = null;
var closestDistance = Integer.MAX_VALUE;

for (var k = 0; k < keywordPositions.length; k++) {
    var keywordPosition = keywordPositions[k];
    for (var c = 0; c < candidates.length; c++) {
        var item = candidates[c];
        var distance = Math.abs(item.pos - keywordPosition);
        if (distance < closestDistance) {
            closestDistance = distance;
            closestPinCode = item.code;
        }
    }
}

closestPinCode != null ? closestPinCode : false;
```

## 解释版

这段代码不是简单 `match(/\d{6}/)`。它先提取所有候选验证码，再找所有关键词位置，最后选离关键词最近的候选。这样能处理“订单号、手机号、验证码同时出现”的通知或短信。

## 去重

常见做法是把发件人、正文 hash、时间戳拼成 key，再写入全局变量。下一次触发时先比较 hash，不同才继续处理。

## 风险点

- 通知触发速度慢于底层短信 Hook，但更安全易懂。
- 方法 Hook 更快，但属于高级能力，依赖目标包和系统实现。
- 自动输入可能输错焦点，建议保留复制到剪贴板作为兜底。
- 不要把 `smsBody`、`jsRet`、`contentText` 这类上下文名重新声明成局部变量。
