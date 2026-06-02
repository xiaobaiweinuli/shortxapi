# 高级案例：HTTP 与 Shell

HTTP 和 Shell 都适合做“边界动作”：一个连接网络服务，一个连接系统命令。它们不适合把所有业务逻辑塞进一条命令里。

## 优先用内置动作

如果只是发请求或执行固定命令，优先使用 ShortX 内置 HTTP/Shell 动作。这样结果会自然进入上下文，例如：

- HTTP 请求结果：`httpRequestRet`
- Shell 输出：`shellOut`

JS 更适合放在前后两端：

```text
ExecuteJS 构造 URL/JSON
  -> HTTP 请求
  -> ExecuteJS 解析 httpRequestRet
  -> MatchJS 分支
```

```text
ExecuteJS 构造命令参数
  -> Shell 动作
  -> ExecuteJS 清洗 shellOut
  -> 写剪贴板或弹窗
```

## 解析 HTTP 结果

```javascript
var parsed = JSON.parse(String(httpRequestRet));
var resultText = parsed.data == null ? "" : String(parsed.data);
resultText;
```

不要声明 `httpRequestRet`。它是上游动作输出。

如果接口不稳定，输出 JSON 对象给下游：

```javascript
var output;
try {
    var parsed = JSON.parse(String(httpRequestRet));
    output = {
        ok: true,
        value: parsed.value == null ? "" : String(parsed.value)
    };
} catch (e) {
    output = {
        ok: false,
        error: String(e)
    };
}

JSON.stringify(output);
```

## 解析 Shell 输出

```javascript
var resultText = String(shellOut)
    .replace(/\r\n/g, "\n")
    .trim();

resultText;
```

如果命令可能失败，尽量让 Shell 动作或命令本身输出可解析状态，而不是只靠文本包含判断。

## 内部服务签名不要凭空调用

内部服务方法示例：

```text
OooO0O0.OooO00o().executeHttpRequest(ByteArrayWrapper)
OooO0O0.OooO00o().executeShellCommand(String, ICallback)
```

这说明 ShortX 内部确实有执行入口，但不代表教程应直接构造 `ByteArrayWrapper` 或 callback。没有真实参数构造样例时，应该把它作为源码查证线索，而不是给用户一段半成品脚本。

## 输出契约

HTTP/Shell 的下游通常有三种：

| 下游 | 推荐输出 |
| --- | --- |
| 弹窗/剪贴板 | 清洗后的纯文本 |
| 条件判断 | 布尔值或 JSON 中的 `ok` |
| 多步处理 | JSON 对象，并用 `customContextDataKey` 改名 |

示例改名：

```json
"customContextDataKey": {
  "keys": [{
    "first": "jsRet",
    "second": "CommandResult"
  }]
}
```

## 风险

- Shell 命令可能修改系统状态，必须明确命令来源。
- HTTP 请求可能泄露上下文变量，例如通知内容、剪贴板内容、位置信息。
- 不要把用户输入直接拼接进 Shell 命令。
- 请求日志和 Shell 日志可能保存敏感数据，需要按需清理。

