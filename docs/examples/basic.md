# 基础示例

这里提供了一些基础的 ShortX 规则示例，帮助你快速上手。

## 示例 1：简单的 Toast 提示

**学习目标：** 理解规则的基本结构和变量引用

**核心概念：**
- `facts` 数组定义触发条件（事件）
- `actions` 数组定义要执行的操作
- 使用 `{变量名}` 引用事件中的数据

**实现要点：**
1. 使用 `NotificationPosted` 类型监听所有通知
2. `record` 为空对象表示不过滤，接收所有通知
3. 在 Toast 消息中使用 `{title}` 引用通知标题
4. 每个组件都需要唯一的 `id` 标识

**可复用的模式：**
- 将 `{title}` 替换为 `{contentText}` 显示通知内容
- 添加 `{packageName}` 显示来源应用
- 组合多个变量：`"来自 {packageName}: {title}"`

## 示例 2：复制通知内容

**学习目标：** 掌握应用过滤和剪贴板操作

**核心概念：**
- 使用 `apps` 数组过滤特定应用的通知
- `pkgName` 是应用的包名，可通过应用信息查看
- `WriteClipboard` 将文本写入系统剪贴板

**实现要点：**
1. 在 `record` 中添加 `apps` 数组进行应用过滤
2. 可以添加多个包名，规则会匹配任意一个
3. 使用 `{contentText}` 获取通知的正文内容

**扩展思路：**
- 添加多个应用：在 `apps` 数组中添加更多 `pkgName` 对象
- 同时过滤标题：添加 `"title": ".*关键词.*"` 字段
- 添加确认提示：在复制后添加 Toast 动作显示"已复制"

## 示例 3：使用 JavaScript 处理

**学习目标：** 掌握 JavaScript 脚本和条件判断

**核心概念：**
- `ExecuteJS` 执行 JavaScript 代码处理数据
- 返回值存储在 `{jsRet}` 变量中
- `IfThenElse` 根据条件执行不同动作
- `EvaluateContextVar` 评估变量值

**实现要点：**

1. **JavaScript 数据提取：**
   - 使用 `'{contentText}'` 获取通知内容（注意引号）
   - `text.match(/\\d{10,}/)` 使用正则提取10位以上数字
   - 返回 `null` 表示未找到，返回字符串表示找到

2. **条件判断结构：**
   - `If` 数组定义判断条件
   - `op` 指定操作符：`EqualTo`（等于）、`NotEqualTo`（不等于）
   - `varName` 指定要检查的变量名
   - `IfActions` 在条件为真时执行

3. **变量引用链：**
   - 通知内容 → `{contentText}`
   - JavaScript 返回 → `{jsRet}`
   - Toast 显示 → `{jsRet}`

**复用模式：**
- 修改正则表达式提取不同格式：快递单号 `/\d{12,}/`、手机号 `/1[3-9]\d{9}/`
- 添加 `ElseActions` 处理未找到的情况
- 使用 `||` 运算符提供默认值：`orderNo ? orderNo[0] : '未找到'`

## 示例 4：边缘手势触发

从左边缘滑动触发操作。

```json
{
  "facts": [{
    "@type": "type.googleapis.com/EdgeGesture",
    "record": {
      "direction": "left",
      "position": "middle"
    },
    "id": "F-004"
  }],
  "actions": [{
    "@type": "type.googleapis.com/ShowToast",
    "message": "左边缘手势触发",
    "id": "A-004"
  }],
  "id": "rule-gesture",
  "title": "边缘手势",
  "isEnabled": true
}
```

## 示例 5：条件判断

根据通知内容执行不同操作。

```json
{
  "facts": [{
    "@type": "type.googleapis.com/NotificationPosted",
    "record": {
      "contentText": ".*(成功|失败).*"
    },
    "id": "F-005"
  }],
  "actions": [{
    "@type": "type.googleapis.com/ExecuteMVEL",
    "expression": "return contentText.contains('成功') ? 'success' : 'failure';",
    "id": "A-005-1"
  }, {
    "@type": "type.googleapis.com/IfThenElse",
    "If": [{
      "@type": "type.googleapis.com/EvaluateContextVar",
      "op": "EqualTo",
      "varName": "mvelRet",
      "payload": { "value": "success" },
      "id": "C-005"
    }],
    "IfActions": [{
      "@type": "type.googleapis.com/ShowToast",
      "message": "✓ 操作成功",
      "id": "A-005-2"
    }],
    "ElseActions": [{
      "@type": "type.googleapis.com/ShowToast",
      "message": "✗ 操作失败",
      "id": "A-005-3"
    }],
    "id": "A-005-4"
  }],
  "id": "rule-condition",
  "title": "条件判断",
  "isEnabled": true
}
```

## 示例 6：HTTP 请求

发送 HTTP 请求并处理响应。

```json
{
  "facts": [{
    "@type": "type.googleapis.com/NotificationPosted",
    "record": {
      "contentText": ".*webhook.*"
    },
    "id": "F-006"
  }],
  "actions": [{
    "@type": "type.googleapis.com/ExecuteHttpRequest",
    "url": "https://api.example.com/webhook",
    "method": "POST",
    "headers": {
      "Content-Type": "application/json"
    },
    "body": "{\"message\": \"{contentText}\"}",
    "id": "A-006"
  }],
  "id": "rule-http",
  "title": "HTTP 请求",
  "isEnabled": true
}
```

## 示例 7：多个动作链

按顺序执行多个动作。

```json
{
  "facts": [{
    "@type": "type.googleapis.com/NotificationPosted",
    "record": {
      "contentText": ".*重要.*"
    },
    "id": "F-007"
  }],
  "actions": [
    {
      "@type": "type.googleapis.com/WriteClipboard",
      "text": "{contentText}",
      "id": "A-007-1"
    },
    {
      "@type": "type.googleapis.com/ShowToast",
      "message": "已复制到剪贴板",
      "id": "A-007-2"
    },
    {
      "@type": "type.googleapis.com/ExecuteJS",
      "expression": "console.log('重要通知:', '{contentText}');",
      "id": "A-007-3"
    }
  ],
  "id": "rule-chain",
  "title": "动作链",
  "isEnabled": true
}
```

## 示例 8：使用全局变量

在规则中使用全局变量。

```javascript
// 首先添加全局变量
shortXService.addGlobalVar({
  name: "counter",
  value: "0"
});

// 规则中使用
{
  "facts": [{
    "@type": "type.googleapis.com/NotificationPosted",
    "record": {},
    "id": "F-008"
  }],
  "actions": [{
    "@type": "type.googleapis.com/ExecuteJS",
    "expression": `
      var counter = parseInt(globalVars.get('counter') || '0');
      counter++;
      globalVars.set('counter', counter.toString());
      return '通知计数: ' + counter;
    `,
    "id": "A-008-1"
  }, {
    "@type": "type.googleapis.com/ShowToast",
    "message": "{jsRet}",
    "id": "A-008-2"
  }],
  "id": "rule-global-var",
  "title": "全局变量计数",
  "isEnabled": true
}
```

## 示例 9：正则表达式匹配

使用正则表达式过滤通知。

```json
{
  "facts": [{
    "@type": "type.googleapis.com/NotificationPosted",
    "record": {
      "contentText": "^\\[.*\\].*$",
      "contentRegexOptions": "RegexMatchOptions_Matches"
    },
    "id": "F-009"
  }],
  "actions": [{
    "@type": "type.googleapis.com/ShowToast",
    "message": "匹配到带方括号的通知",
    "id": "A-009"
  }],
  "id": "rule-regex",
  "title": "正则匹配",
  "isEnabled": true
}
```

## 示例 10：应用过滤

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
    "id": "F-010"
  }],
  "actions": [{
    "@type": "type.googleapis.com/ShowToast",
    "message": "来自 {packageName} 的通知",
    "id": "A-010"
  }],
  "id": "rule-app-filter",
  "title": "应用过滤",
  "isEnabled": true
}
```

## 下一步

- [验证码自动输入](/examples/auto-input) - 高级示例
- [米家设备控制](/examples/mijia) - 智能家居控制
- [通知处理](/examples/notifications) - 复杂通知处理

## 相关文档

- [基本概念](/guide/concepts) - 了解核心概念
- [规则引擎](/guide/rule-engine) - 深入规则引擎
- [API 参考](/api/overview) - 查看完整 API
