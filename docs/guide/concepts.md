# 基本概念

理解 ShortX 的核心概念将帮助你更好地使用这个强大的自动化工具。

## 规则（Rules）

规则是 ShortX 的基本单元，定义了"当发生什么时，做什么"的逻辑。

### 规则结构

```json
{
  "id": "rule-unique-id",
  "title": "规则标题",
  "description": "规则描述",
  "isEnabled": true,
  "facts": [...],
  "actions": [...],
  "conditions": [...]
}
```

### 规则生命周期

1. **创建**：通过 `addRule()` 添加规则
2. **启用/禁用**：通过 `setRuleEnabled()` 控制
3. **触发**：当事件发生时自动触发
4. **执行**：按顺序执行动作
5. **删除**：通过 `deleteRule()` 移除

## 事件（Facts）

事件是触发规则的条件，ShortX 支持多种事件类型。

### 通知事件

```json
{
  "@type": "type.googleapis.com/NotificationPosted",
  "record": {
    "contentText": ".*验证码.*",
    "apps": [{
      "pkgName": "com.tencent.mm"
    }],
    "contentRegexOptions": "RegexMatchOptions_ContainsMatchIn"
  },
  "tag": "notification-tag",
  "id": "F-001"
}
```

### 手势事件

```json
{
  "@type": "type.googleapis.com/EdgeGesture",
  "record": {
    "direction": "left",
    "position": "bottom"
  },
  "id": "F-002"
}
```

### 自定义事件

可以通过脚本发布自定义事件。

## 条件（Conditions）

条件用于进一步过滤事件，只有满足条件时才执行动作。

### 变量比较

```json
{
  "@type": "type.googleapis.com/EvaluateContextVar",
  "op": "EqualTo",
  "varName": "myVar",
  "payload": {
    "value": "expectedValue"
  },
  "isInvert": false,
  "id": "C-001"
}
```

### 支持的操作符

- `EqualTo`：等于
- `NotEqualTo`：不等于
- `GreaterThan`：大于
- `LessThan`：小于
- `Contains`：包含
- `Matches`：正则匹配

## 动作（Actions）

动作是规则触发后执行的操作。

### 基本动作

#### 文本输入

```json
{
  "@type": "type.googleapis.com/InputText",
  "text": "要输入的文本",
  "id": "A-001"
}
```

#### 剪贴板操作

```json
{
  "@type": "type.googleapis.com/WriteClipboard",
  "text": "{contextVar}",
  "id": "A-002"
}
```

#### Toast 提示

```json
{
  "@type": "type.googleapis.com/ShowToast",
  "message": "操作完成",
  "id": "A-003"
}
```

### 脚本动作

#### JavaScript

```json
{
  "@type": "type.googleapis.com/ExecuteJS",
  "expression": "console.log('Hello ShortX');",
  "id": "A-004"
}
```

#### MVEL

```json
{
  "@type": "type.googleapis.com/ExecuteMVEL",
  "expression": "return contentText.contains('验证码');",
  "id": "A-005"
}
```

### 条件动作

```json
{
  "@type": "type.googleapis.com/IfThenElse",
  "If": [{
    "@type": "type.googleapis.com/EvaluateContextVar",
    "op": "EqualTo",
    "varName": "status",
    "payload": { "value": "success" }
  }],
  "IfActions": [
    { "@type": "type.googleapis.com/ShowToast", "message": "成功" }
  ],
  "ElseActions": [
    { "@type": "type.googleapis.com/ShowToast", "message": "失败" }
  ],
  "id": "A-006"
}
```

## 上下文变量

上下文变量用于在规则执行过程中传递数据。

### 内置变量

- `{contentText}`：通知内容
- `{title}`：通知标题
- `{packageName}`：应用包名
- `{mvelRet}`：MVEL 表达式返回值
- `{jsRet}`：JavaScript 返回值

### 自定义变量

```json
{
  "customContextDataKey": {
    "myVar": "myValue"
  }
}
```

## 规则集（Rule Sets）

规则集用于组织和管理多个相关规则。

```java
// 添加规则集
shortXService.addOrUpdateRuleSet(ruleSetWrapper);

// 获取规则集
shortXService.getRuleSetById(ruleSetId, includeDetails);

// 删除规则集
shortXService.deleteRuleSet(ruleSetId);
```

## 全局变量

全局变量在所有规则之间共享。

```java
// 添加全局变量
shortXService.addGlobalVar(varWrapper);

// 获取全局变量
shortXService.getGlobalVarByName(varName);

// 删除全局变量
shortXService.deleteGlobalVar(varName);
```

## 代码库

代码库用于存储可重用的脚本代码。

```java
// 添加代码库项
shortXService.addCodeLibraryItem(itemWrapper);

// 执行代码库项
shortXService.executeCodeLibraryItem(itemId, mode);

// 删除代码库项
shortXService.deleteCodeLibraryItem(itemId);
```

## 下一步

- [规则引擎](/guide/rule-engine) - 深入了解规则引擎
- [事件系统](/guide/events) - 学习事件处理
- [动作执行](/guide/actions) - 掌握动作使用
