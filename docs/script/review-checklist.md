# 脚本审查清单

写完 ShortX JS/MVEL 后，不要只看“能不能运行”。还要检查它是否符合动作链输出、命名边界和运行环境。

## 运行环境

- 没有使用 `window`、`document`、DOM API。
- 没有使用 `require`、`module.exports`、npm 包假设。
- JS 使用 `var` 和传统 `function`，不使用 `let`、`const`、箭头函数。
- `importClass(...)`、`importPackage(...)`、`Packages.*` 符合 ShortX/Rhino 风格。

## JS 与 MVEL 边界

- JS 里不写 MVEL 的 `foreach` 或强类型局部声明。
- MVEL 里不写 `console.log(...)`。
- 没把 `context.contentResolver` 这类 MVEL 风格直接混进 JS 示例。
- MatchJS 只做布尔判断，不承担大段数据转换。

## 保留名

检查所有命名位置，不只是 `var`：

- 局部变量。
- 函数参数。
- helper 参数。
- 循环变量。
- 对象解构目标。
- MVEL typed declaration。

不能使用：

```text
jsRet, mvelRet, selectedListItem, shellOut, pkgName, userId,
title, contentText, taskId, httpRequestRet, ocrResult,
textFieldInput, choices
```

以及当前触发器、上游动作、对话框、循环、`customContextDataKey` 产生的所有上下文名。

## 输出契约

- 下游需要文本时，最终输出字符串。
- 下游需要列表对话框时，输出合法 JSON 数组或明确分隔文本。
- 下游需要分支判断时，输出布尔值或让 MatchJS 判断。
- 下游需要多字段时，输出 JSON 对象。
- 不用 `print` 作为真实输出。
- 不在循环里逐次输出真实结果。

## 内部服务

如果使用 `OooO0O0.OooO00o()`：

- 已在当前版本做过最小调用验证。
- 方法参数形状已经确认。
- 不是因为“看起来方便”而绕过 ShortX 公共动作。
- 修改配置、删除数据、清空日志前有用户确认。

## 文件和日志

- `FileInputStream`、`FileOutputStream` 在 `finally` 中关闭。
- 大日志读取有限制，不直接塞入通知或弹窗。
- 不上传剪贴板、通知、日志、全局变量 secret。
- 读取内部文件时标注版本和格式风险。

## 最小自测

1. 单独运行触发器或一键指令，确认能触发。
2. 用 Toast、弹窗或剪贴板查看关键上下文。
3. 单独运行 JS/MVEL，确认输出形状。
4. 接上下游动作，确认上下文名正确。
5. 再启用高风险动作。

