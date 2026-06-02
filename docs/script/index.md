# 脚本

ShortX 脚本不是浏览器 JavaScript，也不是 Node.js。它运行在 Rhino/Android 风格环境里，可以访问 Java、Android、ShortX API、内部服务、文件和反射。写脚本前先确认它在动作链中的职责：是转换上游数据、生成下游参数、做条件判断，还是调用系统能力。

## 先选脚本类型

| 需求 | 推荐入口 | 输出习惯 |
| --- | --- | --- |
| 处理 JSON、文件、Android API、外部库 | `ExecuteJS` | 最终表达式输出字符串、布尔值或 JSON |
| 做短条件、Java 风格表达式 | `ExecuteMVEL` | 表达式结果进入 `mvelRet` |
| 判断是否继续执行 | `MatchJS` | 输出布尔值 |
| 多处复用同一段逻辑 | 代码库 | 复制到动作后仍按动作输出契约处理 |
| 动态执行 ShortX 内置动作 | `shortx.executeAction(...)` | 读取 `result.contextData` |

不要把所有逻辑都塞进一段 JS。动作链能表达的步骤，优先留在动作链里；脚本只负责“动作参数和输出之间的转换”。

## 第一段 JS 怎么写

最小结构是：读取上下文、归一化、处理、最终输出。

```javascript
var titleValue = title == null ? "" : String(title);
var contentValue = contentText == null ? "" : String(contentText);
var messageValue = titleValue + "\n" + contentValue;

var matchValue = messageValue.match(/[0-9]{4,8}/);
var codeValue = matchValue == null ? "" : matchValue[0];

codeValue;
```

这里读取了 `title`、`contentText`，但没有声明 `var title` 或 `var contentText`。它们是 ShortX 上下文名，应视为保留名。

## 接到动作链里

常见链路：

```text
Notification 触发器
  -> ExecuteJS 提取验证码
  -> customContextDataKey: jsRet -> ExtractedCode
  -> MatchJS 判断 ExtractedCode 是否非空
  -> WriteClipboard: {ExtractedCode}
  -> Toast
```

链路变长后，建议用 `customContextDataKey` 把默认输出改成业务名。不要让多个下游动作都猜当前 `jsRet` 到底来自哪一步。

## 输出格式怎么选

| 下游动作 | 建议输出 |
| --- | --- |
| 剪贴板、Toast、弹窗文本 | 普通字符串 |
| `MatchJS` 条件 | 布尔值或能解析的短字符串 |
| 列表对话框 | JSON 数组字符串 |
| 后续脚本要读多个字段 | JSON 对象字符串 |
| 文件、截图、OCR | 路径或结构化 JSON |

列表对话框常用：

```javascript
var rows = [];

rows.push({
    title: "设置",
    summary: "打开系统设置",
    __value: "android.settings.SETTINGS"
});

JSON.stringify(rows, null, 2);
```

下游读取 `selectedListItem` 时只读取，不声明同名局部变量。

## 写法基线

- 使用 `var` 和传统 `function`。
- 使用 `importClass(...)`、`importPackage(...)`、`Packages.*`。
- 不使用 `let`、`const`、箭头函数、浏览器 DOM、Node.js `require`。
- 不把 JS 和 MVEL 语法混在一起。
- 不声明 `jsRet`、`mvelRet`、`selectedListItem`、`choices`、`pkgName`、`title`、`contentText` 等上下文名。
- 用最终表达式输出一个稳定结果，不用 `print` 当动作链输出。
- `console.log(...)` 只用于调试，不当作下游结果。

## 调试顺序

1. 先输出最小字符串，确认动作能执行。
2. 再输出 JSON，确认下游能解析。
3. 再接 `MatchJS` 或对话框。
4. 最后再加入 Android API、内部服务或外部库。

如果脚本失败，先检查三件事：

- 是否声明了上下文保留名。
- 是否把 `{xxx}` 动作参数占位符写进 JS。
- 是否把 MVEL 的 typed declaration 和 JS 混在一起。

## 入口

| 需求 | 推荐页面 |
| --- | --- |
| 理解运行环境 | [Rhino JS 运行环境](/script/runtime) |
| 写动作链里的 JS | [ExecuteJS 写法](/script/js) |
| 写简短条件或 Java 风格表达式 | [MVEL 写法](/script/mvel) |
| 判断该用 JS 还是 MVEL | [JS 与 MVEL 选择指南](/script/js-mvel-choice) |
| 写分支条件 | [MatchJS 条件](/script/matchjs) |
| 复用脚本片段 | [代码库复用](/script/code-library) |
| 加载外部 dex/jar | [外部 dex/jar 加载](/script/external-libs) |
| 调用反射或处理线程 | [反射、线程与同步](/script/reflection-threading) |
| 提交前检查 | [脚本审查清单](/script/review-checklist) |
