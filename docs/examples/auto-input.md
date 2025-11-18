# 验证码自动输入

这个示例展示如何自动识别和输入验证码。

## 完整规则

```json
{
  "facts": [{
    "@type": "type.googleapis.com/NotificationPosted",
    "record": {
      "contentText": "验证码|校验码|检验码|确认码|激活码|动态码|安全码|验证代码|校验代码|检验代码|激活代码|确认代码|动态代码|安全代码|登入码|认证码|识别码|短信口令|动态密码|交易码|上网密码|随机码|动态口令|驗證碼|校驗碼|檢驗碼|確認碼|激活碼|動態碼|驗證代碼|校驗代碼|檢驗代碼|確認代碼|激活代碼|動態代碼|登入碼|認證碼|識別碼|Code|code|CODE|代码",
      "apps": [
        { "pkgName": "com.tencent.mm" },
        { "pkgName": "com.android.mms" },
        { "pkgName": "com.tencent.wework" }
      ],
      "contentRegexOptions": "RegexMatchOptions_ContainsMatchIn"
    },
    "id": "F-verification-code"
  }],
  "actions": [
    {
      "@type": "type.googleapis.com/ExecuteMVEL",
      "expression": "import java.util.regex.Matcher;\nimport java.util.regex.Pattern;\n\nString msgText = {contentText};\n\n// 关键词数组\nString[] keywords = {\"验证码\", \"校验码\", \"检验码\", \"确认码\", \"激活码\", \"动态码\", \"安全码\", \"验证代码\", \"校验代码\", \"检验代码\", \"激活代码\", \"确认代码\", \"动态代码\",\"代码\", \"安全代码\", \"登入码\", \"认证码\", \"识别码\", \"短信口令\", \"动态密码\", \"交易码\", \"上网密码\", \"随机码\", \"动态口令\", \"驗證碼\", \"校驗碼\", \"檢驗碼\", \"確認碼\", \"激活碼\", \"動態碼\", \"驗證代碼\", \"校驗代碼\", \"檢驗代碼\", \"確認代碼\", \"激活代碼\", \"動態代碼\", \"登入碼\", \"認證碼\", \"識別碼\", \"Code\", \"code\", \"CODE\"};\n\n// 正则表达式匹配4到8位的数字和字母混合序列\nPattern pattern = Pattern.compile(\"((?=.*[a-zA-Z])(?=.{0,4}\\\\d)[a-zA-Z0-9]{4,8})|(\\\\d{4,8})\");\nMatcher matcher = pattern.matcher(msgText);\n\n// 存储匹配到的最近的验证码及其距离\nString closestCode = null;\nint closestDistance = Integer.MAX_VALUE;\n\n// 遍历所有关键词\nfor (String keyword : keywords) { \n    int keywordPosition = msgText.indexOf(keyword);\n    \n    while (keywordPosition != -1) {\n        // 遍历所有匹配的验证码\n        while (matcher.find()) {\n            int codePosition = matcher.start();\n            int distance = Math.abs(codePosition - keywordPosition);\n            \n            if (distance < closestDistance) {\n                closestDistance = distance;\n                closestCode = matcher.group();\n            }\n        }\n        \n        matcher.reset();\n        keywordPosition = msgText.indexOf(keyword, keywordPosition + keyword.length());\n    }\n}\n\nreturn closestCode != null ? closestCode : false;",
      "id": "A-extract-code"
    },
    {
      "@type": "type.googleapis.com/IfThenElse",
      "If": [{
        "@type": "type.googleapis.com/EvaluateContextVar",
        "op": "EqualTo",
        "varName": "mvelRet",
        "payload": { "value": "false" },
        "isInvert": true,
        "id": "C-code-exists"
      }],
      "IfActions": [
        {
          "@type": "type.googleapis.com/InputText",
          "text": "{mvelRet}",
          "id": "A-input-code"
        },
        {
          "@type": "type.googleapis.com/WriteClipboard",
          "text": "{mvelRet}",
          "id": "A-copy-code"
        }
      ],
      "id": "A-conditional"
    }
  ],
  "id": "rule-auto-input-verification-code",
  "title": "自动输入验证码",
  "description": "收到验证码自动输入",
  "isEnabled": true
}
```

## 工作原理

### 1. 事件监听策略

**为什么这样设计：**
- 使用 `contentRegexOptions: "RegexMatchOptions_ContainsMatchIn"` 表示"包含匹配"
- 将所有验证码关键词用 `|` 连接成一个正则表达式
- 这样可以一次性匹配多种表达方式，提高识别率

**应用过滤的作用：**
- 限定在微信、短信、企业微信等常见验证码来源
- 减少误触发，提高性能
- 可根据实际需求添加更多应用包名

### 2. 验证码提取算法

**核心思路：距离最近原则**

MVEL 脚本的处理逻辑：

1. **关键词遍历：**
   - 遍历所有验证码关键词（验证码、code、Code等）
   - 找到每个关键词在文本中的位置

2. **正则匹配：**
   - 使用两个模式：纯数字 `\d{4,8}` 和数字字母混合
   - 数字字母混合要求至少包含一个字母：`(?=.*[a-zA-Z])`
   - 支持 4-8 位长度，覆盖大多数验证码格式

3. **距离计算：**
   - 计算每个匹配项与关键词的距离（字符位置差）
   - 选择距离最小的作为验证码
   - 这样可以准确提取"验证码：123456"中的数字

4. **返回策略：**
   - 找到返回验证码字符串
   - 未找到返回 `false`（注意不是字符串 "false"）

**为什么用 MVEL 而不是 JavaScript：**
- MVEL 可以直接使用 Java 的 `Pattern` 和 `Matcher`
- 执行速度更快，适合频繁触发的场景
- 代码更简洁，易于维护

### 3. 条件判断与执行

**IfThenElse 的使用技巧：**

1. **条件设置：**
   - `varName: "mvelRet"` 检查 MVEL 返回值
   - `op: "EqualTo"` 配合 `isInvert: true` 实现"不等于"
   - 这样当 `mvelRet` 不是 `false` 时执行动作

2. **双重保险策略：**
   - 先执行 `InputText` 自动输入
   - 再执行 `WriteClipboard` 复制到剪贴板
   - 如果自动输入失败，用户还可以手动粘贴

**为什么这样设计：**
- 自动输入可能因焦点问题失败
- 剪贴板作为备份方案，提高成功率
- 用户体验更好：自动化优先，手动兜底

## 支持的验证码格式

- 纯数字：`1234`、`123456`、`12345678`
- 数字字母混合：`A1B2`、`X9Y8Z7`
- 长度：4-8 位

## 支持的关键词

### 中文
- 验证码、校验码、检验码、确认码
- 激活码、动态码、安全码
- 登入码、认证码、识别码
- 短信口令、动态密码、交易码
- 上网密码、随机码、动态口令

### 繁体中文
- 驗證碼、校驗碼、檢驗碼
- 確認碼、激活碼、動態碼
- 登入碼、認證碼、識別碼

### 英文
- Code、code、CODE

## 自定义配置

### 添加更多应用

**如何找到应用包名：**
1. 在应用信息中查看
2. 使用 ADB 命令：`adb shell pm list packages | grep 关键词`
3. 使用 ShortX 的 `getInstalledApps()` API

**添加步骤：**
- 在 `apps` 数组中添加新的对象
- 每个对象包含 `pkgName` 字段
- 可以添加任意多个应用

**常见应用包名：**
- 微信：`com.tencent.mm`
- QQ：`com.tencent.mobileqq`
- 钉钉：`com.alibaba.android.rimet`
- 支付宝：`com.eg.android.AlipayGphone`

### 修改验证码长度

**理解正则表达式：**
- `{4,8}` 表示匹配 4 到 8 位
- 第一个数字是最小长度，第二个是最大长度
- 根据实际验证码长度调整

**常见长度配置：**
- 4位验证码：`{4,4}` 或 `{4}`
- 6位验证码：`{6,6}` 或 `{6}`
- 4-6位：`{4,6}`
- 6-10位：`{6,10}`

**修改位置：**
在 MVEL 表达式中找到 `Pattern.compile()` 部分，修改两处：
1. 数字字母混合模式：`[a-zA-Z0-9]{4,8}` → `[a-zA-Z0-9]{你的长度}`
2. 纯数字模式：`\\d{4,8}` → `\\d{你的长度}`

### 仅复制不输入

**为什么需要这个选项：**
- 避免在桌面搜索框误输入
- 某些应用不支持自动输入
- 用户更喜欢手动控制

**实现方法：**
在 `IfActions` 数组中移除 `InputText` 动作，只保留 `WriteClipboard`

**进一步优化：**
- 添加 Toast 提示："验证码已复制: {mvelRet}"
- 添加震动反馈
- 添加声音提示

## 防止误输入

### 检查桌面环境

添加桌面检测，避免在桌面搜索框误输入：

```javascript
{
  "@type": "type.googleapis.com/ExecuteJS",
  "expression": `
    importClass(android.content.Context);
    importClass(android.app.ActivityManager);
    
    function isOnHomeScreen() {
        try {
            var am = context.getSystemService(Context.ACTIVITY_SERVICE);
            var tasks = am.getRunningTasks(1);
            
            if (tasks && tasks.size() > 0) {
                var currentPackage = tasks.get(0).topActivity.getPackageName();
                
                var launcherPackages = [
                    "com.android.launcher",
                    "com.miui.home",
                    "com.huawei.android.launcher"
                ];
                
                for (var i = 0; i < launcherPackages.length; i++) {
                    if (currentPackage.indexOf(launcherPackages[i]) !== -1) {
                        return true;
                    }
                }
            }
            return false;
        } catch (e) {
            return false;
        }
    }
    
    return !isOnHomeScreen();
  `,
  "id": "A-check-desktop"
}
```

## 调试

### 查看提取结果

添加 Toast 显示提取的验证码：

```json
{
  "@type": "type.googleapis.com/ShowToast",
  "message": "验证码: {mvelRet}",
  "id": "A-show-code"
}
```

### 日志记录

添加日志记录：

```json
{
  "@type": "type.googleapis.com/ExecuteJS",
  "expression": "console.log('提取的验证码:', '{mvelRet}');",
  "id": "A-log-code"
}
```

## 常见问题

### 验证码未被识别？

1. 检查通知内容是否包含关键词
2. 验证码格式是否符合正则表达式
3. 查看日志确认提取逻辑

### 输入到错误位置？

1. 确保目标输入框已获得焦点
2. 添加桌面环境检测
3. 考虑使用延迟输入

### 支持更多格式？

修改正则表达式以支持特殊格式：

```java
// 支持带分隔符的验证码：1-2-3-4
Pattern pattern = Pattern.compile("\\d{1,2}[-\\s]\\d{1,2}[-\\s]\\d{1,2}[-\\s]\\d{1,2}");
```

## 相关示例

- [基础示例](/examples/basic) - 学习基础用法
- [通知处理](/examples/notifications) - 更多通知处理示例

## 相关文档

- [MVEL 表达式](/guide/actions#mvel-执行) - 了解 MVEL 语法
- [动作执行](/guide/actions) - 学习动作使用
- [规则管理 API](/api/rules) - 查看完整 API
