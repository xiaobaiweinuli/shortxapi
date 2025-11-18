# 快速开始

本指南将帮助你快速上手 ShortX，创建你的第一个自动化规则。

## 安装

1. 从以下渠道下载最新版本：
   - [GitHub Releases](https://github.com/ShortX-Repo/ShortX/releases) - 官方发布版本
   - [Telegram 频道](https://t.me/shortxmod) - 获取最新动态
2. 安装 APK 文件
3. 授予必要的权限（无障碍服务、通知访问等）

## 创建第一个规则

让我们创建一个简单的规则：当收到包含"验证码"的通知时，自动复制到剪贴板。

### 1. 定义事件

```json
{
  "facts": [{
    "@type": "type.googleapis.com/NotificationPosted",
    "record": {
      "contentText": ".*验证码.*",
      "contentRegexOptions": "RegexMatchOptions_ContainsMatchIn"
    }
  }]
}
```

### 2. 添加动作

```json
{
  "actions": [{
    "@type": "type.googleapis.com/WriteClipboard",
    "text": "{contentText}"
  }]
}
```

### 3. 完整规则

```json
{
  "facts": [{
    "@type": "type.googleapis.com/NotificationPosted",
    "record": {
      "contentText": ".*验证码.*",
      "contentRegexOptions": "RegexMatchOptions_ContainsMatchIn"
    },
    "id": "F-notification-001"
  }],
  "actions": [{
    "@type": "type.googleapis.com/WriteClipboard",
    "text": "{contentText}",
    "id": "A-clipboard-001"
  }],
  "id": "rule-001",
  "title": "验证码自动复制",
  "description": "收到验证码通知时自动复制",
  "isEnabled": true
}
```

## 使用 API 添加规则

### 通过 ByteArrayWrapper

```java
// 将规则序列化为字节数组
byte[] ruleBytes = serializeRule(rule);
ByteArrayWrapper wrapper = new ByteArrayWrapper(ruleBytes);

// 添加规则
shortXService.addRule(wrapper);
```

### 通过 JavaScript

```javascript
// 使用 ShortX 的 JavaScript API
var rule = {
  facts: [{
    "@type": "type.googleapis.com/NotificationPosted",
    record: {
      contentText: ".*验证码.*",
      contentRegexOptions: "RegexMatchOptions_ContainsMatchIn"
    }
  }],
  actions: [{
    "@type": "type.googleapis.com/WriteClipboard",
    text: "{contentText}"
  }],
  title: "验证码自动复制",
  isEnabled: true
};

// 执行添加
shortx.addRule(rule);
```

## 测试规则

1. 确保规则已启用
2. 发送一条包含"验证码"的测试通知
3. 检查剪贴板是否包含通知内容

## 常见问题

### 规则没有触发？

- 检查无障碍服务是否已启用
- 确认通知访问权限已授予
- 验证规则的正则表达式是否正确
- 查看规则是否已启用

### 如何调试规则？

使用日志功能：

```javascript
// 在动作中添加日志
{
  "@type": "type.googleapis.com/ExecuteJS",
  "expression": "console.log('规则触发:', {contentText});"
}
```

## 下一步

- [基本概念](/guide/concepts) - 深入了解规则引擎
- [规则管理 API](/api/rules) - 学习更多规则管理方法
- [示例集合](/examples/basic) - 查看更多实用示例
