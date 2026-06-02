# 触发器、条件与事实变量

自动指令不是“定时执行一段脚本”。它的入口是触发器，触发器把当次事件携带的信息上传为上下文变量，条件和动作再消费这些变量。

## 基本模型

```text
触发器产生事实
  -> 上传上下文变量
  -> 条件读取变量并决定是否继续
  -> 动作链读取、转换、重命名、保存结果
```

官方公开说明把上下文变量描述为 `{xxx}` 形式的可引用值。高级用法需要再补一层理解：这些变量不只会出现在文本参数里，也会影响 JS、MVEL、MatchJS 的命名空间。

## 变量来自哪里

| 来源 | 常见变量 | 典型用途 |
| --- | --- | --- |
| 通知触发器 | `pkgName`、`title`、`contentText`、`notificationTag` | 过滤通知、提取验证码、清理通知 |
| 应用/进程触发器 | `pkgName`、`userId`、`appLabel`、`componentName` | 前台应用判断、组件跳转、应用集处理 |
| 输入/手势/传感器 | `keyCode`、`pressTimes`、`eventX`、`eventY`、`lightIntensity` | 按键分支、手势区域、环境状态判断 |
| 屏幕/节点/图像 | `screenshotFilePath`、`matchedViewText`、`textOfTheView`、`pointX`、`pointY` | 截图、OCR、找图、节点文本处理 |
| 剪贴板/文本处理 | `clipboardContent`、`matchResult`、`replaceResult` | 文本清洗、正则提取、剪贴板链路 |
| 网络/文件动作 | `httpRequestRet`、`downloadFilePath`、`webdavResources` | 请求结果解析、下载后处理、远端资源同步 |
| 对话框/循环 | `selectedListItem`、`choices`、`foreachIndex`、`foreachData` | 交互选择、批量处理、后续分支 |

这些名字都应视为保留名。不要在 JS 或 MVEL 里把它们声明成局部变量。

## `{xxx}` 与 JS 变量不是一回事

`{contentText}` 是 ShortX 动作参数中的占位符。`contentText` 是脚本运行环境里的上下文变量。两者属于不同层：

```text
动作参数文本:  "通知内容：{contentText}"
JS 表达式:     String(contentText).trim()
```

不要把占位符语法写进 JS：

```javascript
// 错误：这是动作参数占位符，不是 JS 字符串插值
var resultText = "{contentText}";
```

如果要在 JS 里处理通知内容，直接读取上下文变量：

```javascript
var resultText = String(contentText).trim();
resultText;
```

这里没有声明 `contentText`，只是读取 ShortX 上传的变量。

## 条件层应该保持轻量

条件的职责是判断“要不要继续”，不适合承担复杂的数据整理。推荐拆法：

```text
触发器：通知到达
条件：pkgName 是否匹配、contentText 是否包含关键字
ExecuteJS：提取验证码或构造 JSON
MatchJS：判断提取结果是否为空
动作：写剪贴板、弹窗、执行下一步
```

`MatchJS` 最好只输出布尔值：

```javascript
String(jsRet).length > 0;
```

复杂正则、JSON 解析、列表生成应放在 `ExecuteJS`。

## 跨步骤变量会继续保留

如果某一步用 `customContextDataKey` 把 `jsRet` 改名为 `PackageName`，那么后续步骤中的 `PackageName` 也是保留名。

```json
"customContextDataKey": {
  "keys": [{
    "first": "jsRet",
    "second": "PackageName"
  }]
}
```

后续 JS 可以读取它，但不要重新声明：

```javascript
var resultText = String(PackageName);
resultText;
```

## 设计规则

- 先确认触发器到底上传了哪些变量。
- 条件只做快速过滤，不在条件层写大段转换逻辑。
- 上下文变量、动作输出、对话框输出、循环变量都当作保留名。
- 多步链路中，把关键中间结果用 `customContextDataKey` 改成稳定名称。
- 下游要读 JSON 就输出 JSON 字符串；下游要判断就输出布尔值或明确文本。

