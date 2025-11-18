# 通知处理示例

这里展示如何处理各种通知场景。

## 示例 1：通知过滤

只处理特定应用的通知。

```json
{
  "facts": [{
    "@type": "type.googleapis.com/NotificationPosted",
    "record": {
      "apps": [
        { "pkgName": "com.tencent.mm" },
        { "pkgName": "com.tencent.wework" }
      ]
    },
    "id": "F-filter-apps"
  }],
  "actions": [{
    "@type": "type.googleapis.com/ShowToast",
    "message": "收到来自 {packageName} 的通知",
    "id": "A-show-notification"
  }],
  "id": "rule-filter-notifications",
  "title": "通知过滤",
  "isEnabled": true
}
```

## 示例 2：通知内容提取

提取通知中的关键信息。

```json
{
  "facts": [{
    "@type": "type.googleapis.com/NotificationPosted",
    "record": {
      "contentText": ".*订单号.*"
    },
    "id": "F-order-notification"
  }],
  "actions": [{
    "@type": "type.googleapis.com/ExecuteJS",
    "expression": `
      var content = '{contentText}';
      var orderMatch = content.match(/订单号[：:](\\w+)/);
      var orderNo = orderMatch ? orderMatch[1] : null;
      return orderNo;
    `,
    "id": "A-extract-order"
  }, {
    "@type": "type.googleapis.com/IfThenElse",
    "If": [{
      "@type": "type.googleapis.com/EvaluateContextVar",
      "op": "NotEqualTo",
      "varName": "jsRet",
      "payload": { "value": "null" },
      "id": "C-has-order"
    }],
    "IfActions": [{
      "@type": "type.googleapis.com/WriteClipboard",
      "text": "{jsRet}",
      "id": "A-copy-order"
    }, {
      "@type": "type.googleapis.com/ShowToast",
      "message": "订单号已复制: {jsRet}",
      "id": "A-notify-order"
    }],
    "id": "A-process-order"
  }],
  "id": "rule-extract-order",
  "title": "提取订单号",
  "isEnabled": true
}
```

## 示例 3：通知转发

将通知转发到其他服务。

```json
{
  "facts": [{
    "@type": "type.googleapis.com/NotificationPosted",
    "record": {
      "contentText": ".*重要.*"
    },
    "id": "F-important-notification"
  }],
  "actions": [{
    "@type": "type.googleapis.com/ExecuteHttpRequest",
    "url": "https://api.example.com/webhook",
    "method": "POST",
    "headers": {
      "Content-Type": "application/json"
    },
    "body": "{\"title\": \"{title}\", \"content\": \"{contentText}\", \"package\": \"{packageName}\"}",
    "id": "A-forward-notification"
  }],
  "id": "rule-forward-notification",
  "title": "通知转发",
  "isEnabled": true
}
```

## 示例 4：通知统计

**学习目标：** 掌握全局变量的使用和数据持久化

**核心概念：**
- 使用全局变量跨规则存储数据
- `globalVars.get()` 读取变量
- `globalVars.set()` 写入变量
- 变量值以字符串形式存储

**实现要点：**

1. **全局变量操作：**
   - `globalVars.get('notification_count')` 获取计数
   - 使用 `|| '0'` 提供默认值（首次运行时）
   - `parseInt()` 将字符串转换为数字
   - `toString()` 将数字转换回字符串存储

2. **条件返回策略：**
   - 每次都递增计数并保存
   - 只在满足条件时返回提示文本
   - 返回 `null` 表示不需要提示
   - 通过 `count % 10 === 0` 实现每10条提示一次

3. **为什么这样设计：**
   - 全局变量在应用重启后仍然保留
   - 可以跨多个规则共享数据
   - 适合统计、计数、状态记录等场景

**扩展思路：**
- 按应用分类统计：使用 `notification_count_{packageName}` 作为键
- 添加重置功能：创建另一个规则清零计数
- 记录时间戳：存储 JSON 格式的数据 `{count: 10, lastTime: 1234567890}`
- 统计分析：记录每小时的通知数量，生成报表

## 示例 5：通知去重

**学习目标：** 理解状态管理和去重逻辑

**核心概念：**
- 使用全局变量存储上一次的通知内容
- 通过比较判断是否重复
- 返回标识符控制后续流程

**实现要点：**

1. **去重算法：**
   - 读取上次保存的通知内容
   - 与当前通知内容比较
   - 相同返回 `'duplicate'`，不同返回 `'new'`
   - 更新全局变量为当前内容

2. **为什么需要去重：**
   - 某些应用会重复发送相同通知
   - 避免重复处理浪费资源
   - 减少对用户的打扰

3. **状态管理模式：**
   - 先读取旧状态
   - 比较判断
   - 更新新状态
   - 这是典型的状态机模式

**改进方案：**

1. **时间窗口去重：**
   - 只在短时间内（如5秒）去重
   - 存储 `{content: "xxx", time: 1234567890}`
   - 超过时间窗口视为新通知

2. **哈希去重：**
   - 对内容计算哈希值
   - 存储哈希而不是完整内容
   - 节省存储空间

3. **多字段去重：**
   - 同时比较标题和内容
   - 使用 `title + "|" + content` 作为唯一标识
   - 更精确的去重判断

**注意事项：**
- 全局变量会一直保留，注意清理
- 如果内容很长，考虑只比较前100个字符
- 可以添加计数器记录去重次数

## 示例 6：通知分类

根据内容分类处理通知。

```json
{
  "facts": [{
    "@type": "type.googleapis.com/NotificationPosted",
    "record": {},
    "id": "F-notification"
  }],
  "actions": [{
    "@type": "type.googleapis.com/ExecuteJS",
    "expression": `
      var content = '{contentText}'.toLowerCase();
      
      if (content.indexOf('验证码') !== -1 || content.indexOf('code') !== -1) {
        return 'verification';
      } else if (content.indexOf('订单') !== -1 || content.indexOf('order') !== -1) {
        return 'order';
      } else if (content.indexOf('支付') !== -1 || content.indexOf('payment') !== -1) {
        return 'payment';
      } else {
        return 'other';
      }
    `,
    "id": "A-classify"
  }, {
    "@type": "type.googleapis.com/IfThenElse",
    "If": [{
      "@type": "type.googleapis.com/EvaluateContextVar",
      "op": "EqualTo",
      "varName": "jsRet",
      "payload": { "value": "verification" },
      "id": "C-is-verification"
    }],
    "IfActions": [{
      "@type": "type.googleapis.com/ShowToast",
      "message": "验证码通知",
      "id": "A-handle-verification"
    }],
    "ElseActions": [{
      "@type": "type.googleapis.com/IfThenElse",
      "If": [{
        "@type": "type.googleapis.com/EvaluateContextVar",
        "op": "EqualTo",
        "varName": "jsRet",
        "payload": { "value": "order" },
        "id": "C-is-order"
      }],
      "IfActions": [{
        "@type": "type.googleapis.com/ShowToast",
        "message": "订单通知",
        "id": "A-handle-order"
      }],
      "id": "A-check-order"
    }],
    "id": "A-classify-notification"
  }],
  "id": "rule-classify-notifications",
  "title": "通知分类",
  "isEnabled": true
}
```

## 示例 7：通知延迟处理

延迟处理通知，避免频繁操作。

```json
{
  "facts": [{
    "@type": "type.googleapis.com/NotificationPosted",
    "record": {},
    "id": "F-notification"
  }],
  "actions": [{
    "@type": "type.googleapis.com/ExecuteJS",
    "expression": `
      var now = Date.now();
      var lastTime = parseInt(globalVars.get('last_process_time') || '0');
      var delay = 5000; // 5秒延迟
      
      if (now - lastTime < delay) {
        return 'skip';
      }
      
      globalVars.set('last_process_time', now.toString());
      return 'process';
    `,
    "id": "A-check-delay"
  }, {
    "@type": "type.googleapis.com/IfThenElse",
    "If": [{
      "@type": "type.googleapis.com/EvaluateContextVar",
      "op": "EqualTo",
      "varName": "jsRet",
      "payload": { "value": "process" },
      "id": "C-should-process"
    }],
    "IfActions": [{
      "@type": "type.googleapis.com/ShowToast",
      "message": "处理通知: {contentText}",
      "id": "A-process"
    }],
    "id": "A-delayed-process"
  }],
  "id": "rule-delayed-notification",
  "title": "延迟处理通知",
  "isEnabled": true
}
```

## 相关文档

- [基础示例](/examples/basic) - 学习基础用法
- [验证码自动输入](/examples/auto-input) - 验证码处理
- [事件系统](/guide/events) - 了解通知事件
