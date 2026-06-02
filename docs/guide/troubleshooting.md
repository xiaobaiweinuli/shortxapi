# 故障排查

ShortX 规则失败时，先按动作链排查，不要直接怀疑 Android 服务或内部 API。

## 快速定位

| 现象 | 先查 |
| --- | --- |
| 规则完全不触发 | 触发器、总开关、目标应用、条件、权限状态 |
| 触发了但没动作 | 条件是否拦截、动作是否禁用、是否有运行中任务冲突 |
| JS 运行但下游为空 | 输出名是否是 `jsRet` 或改名后的上下文 |
| MVEL 结果不对 | 是否混用了 JS 语法、是否声明了 `mvelRet` |
| 对话框显示异常 | JSON 是否合法、字段是否包含 `name` / `summary` / `__value` |
| `selectedListItem` 解析失败 | 对话框输出是文本还是 JSON 项 |
| MatchJS 不分支 | 是否返回布尔表达式 |
| HTTP 结果解析失败 | `httpRequestRet` 是否为空、返回是否真的是 JSON |
| Shell 输出异常 | `shellOut` 是否包含错误流、命令是否需要环境前提 |
| OCR 为空 | OCR 引擎、识别区域、页面时机、坐标和屏幕方向 |
| 内部服务失败 | 方法是否在当前 ShortX 版本存在、参数是否已查证 |

## 四步排查法

1. 只保留触发器和 Toast，确认触发发生。
2. 输出关键上下文变量，确认数据存在。
3. 单独运行 JS/MVEL，确认最终输出形状。
4. 接上下游动作，确认上下文名和类型。

## 查看上下文

通知调试：

```text
pkg={pkgName}
title={title}
content={contentText}
```

JS 调试：

```javascript
var contentValue = contentText == null ? "" : String(contentText);
var resultText = "len=" + contentValue.length + "\n" + contentValue;
resultText;
```

`console.log(...)` 只用于 JS 调试，不是动作链输出。

## 输出形状检查

如果下游是：

- 剪贴板：确认输出是字符串。
- `ShowListDialog`：确认输出是 JSON 数组或正确分隔文本。
- MatchJS：确认表达式最终是布尔值。
- 后续 JS：确认读取的是 `jsRet`、`mvelRet` 或改名后的上下文名。

## 保留名冲突

看到这些写法，优先改：

```javascript
var title = String(title);
var selectedListItem = String(selectedListItem);
var jsRet = "ok";
function pick(pkgName) {
    return pkgName;
}
```

改成：

```javascript
var notificationTitleText = String(title);
var selectedItemText = String(selectedListItem);
var resultText = "ok";

function pickPackage(packageNameValue) {
    return packageNameValue;
}

resultText;
```

## 诊断日志

需要看日志时，优先使用 [运行诊断面板](/cases/runtime-diagnostics) 或 [运行诊断接口](/api/runtime-diagnostics)。

日志可能包含敏感数据，不要默认上传到网络服务。

