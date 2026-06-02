# 调试方法

ShortX 调试的核心是确认三件事：触发是否发生、上下文是否正确、输出是否符合下游动作期待。

## 分段验证

不要一开始就写完整复杂链路。推荐顺序：

1. 只放触发器和 Toast，确认能触发。
2. 显示关键上下文变量，确认数据存在。
3. 加 JS/MVEL 提取逻辑，输出到 Toast 或剪贴板。
4. 再接输入、对话框、系统服务等高风险动作。

## 查看上下文

调试通知内容：

```json
{
  "@type": "type.googleapis.com/ShowToast",
  "message": "{title}\n{contentText}\n{pkgName}"
}
```

调试 JS 输出：

```javascript
var contentValue = contentText == null ? "" : String(contentText);
var resultText = "len=" + contentValue.length;
resultText;
```

## 日志

JS 可以用 `console.log(...)` 辅助调试：

```javascript
console.log("content length: " + contentValue.length);
resultText;
```

但 `console.log(...)` 不是动作链结果。正式结果仍然应该是最后表达式或被动作明确输出的值。

MVEL 不使用 `console.log(...)`。

## 检查下游期望

写脚本前先问：

- 下游要字符串还是 JSON？
- 下游读 `{jsRet}` 还是被改名后的上下文？
- 是否需要 `customContextDataKey`？
- 是否有保留名冲突？
- 失败时应该返回 `false`、空字符串、错误文本还是 JSON？

## 常见故障

| 现象 | 优先检查 |
| --- | --- |
| 规则不触发 | 触发器条件、权限、目标应用、正则选项 |
| JS 有结果但下游为空 | 是否用了错误的上下文名 |
| 对话框显示异常 | JS 输出是否为有效 JSON 或正确分隔文本 |
| MatchJS 不生效 | 是否返回布尔表达式 |
| 自动输入到错误位置 | 焦点、延迟、桌面/目标应用判断 |
| 重复触发 | 是否需要全局变量去重 |

