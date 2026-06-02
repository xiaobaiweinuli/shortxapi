# Rhino JS 运行环境

ShortX JS 是 Rhino 风格脚本，运行在 Android 环境中。它不是浏览器 JS，也不是 Node.js。

## 可见的真实特征

高级规则中高频出现：

```javascript
importClass(java.io.File);
importPackage(android.view);

var service = context.getSystemService("window");
var result = [];

function pushItem(value) {
    result.push(value);
}

Packages.tornaco.apps.shortx.core.OooO0O0.OooO00o().getLogDir();
```

这类写法在 ShortX 中是正常的，不应被当成“不标准 JS”删除。

## 不要套用的环境

不要假设存在：

- `window`
- `document`
- DOM API
- `require`
- `module.exports`
- npm 包解析
- 浏览器事件模型

## 语法偏好

优先：

- `var`
- 传统 `function`
- `importClass(...)`
- `importPackage(...)`
- `Packages.*`
- final expression 输出

避免：

- `let`
- `const`
- 箭头函数
- `async/await`
- 过度链式和现代前端写法

## 输出方式

ShortX JS 常用最后表达式作为动作结果：

```javascript
var resultText = "hello";
resultText;
```

`console.log(...)` 只能用于调试，不是链路结果。不要用 `print` 作为正式输出。

## 常见脚手架

直接 Android 调用：

```javascript
var service = context.getSystemService("power");
service;
```

内部 ShortX 服务：

```javascript
importClass(Packages.tornaco.apps.shortx.core.OooO0O0);

var iShortX = OooO0O0.OooO00o();
iShortX.getLogDir();
```

proto 动作：

```javascript
importClass(Packages.tornaco.apps.shortx.core.proto.action.ShellCommand);

var action = ShellCommand.newBuilder()
    .setCommand("echo shortx")
    .build();
var result = shortx.executeAction(action);
result.contextData.get("shellOut");
```
