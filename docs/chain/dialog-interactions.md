# 对话框交互契约

对话框不只是“问用户一个问题”。在复杂动作链里，弹窗按钮、菜单项、输入框、选择框都会把用户行为转成动作链上下文，再驱动后续分支。

## 常见对话框

| 动作 | 输出或行为 |
| --- | --- |
| `ShowAlertDialog` | 按钮触发 `onPositive`、`onNegative`、`onNeutral` |
| `ShowListDialog` | 输出 `selectedListItem` |
| `ShowChoiceDialog` | 输出 `choices` |
| `ShowTextFieldDialog` | 输出 `textFieldInput1` 等 |
| `ShowMenuDialog` | 菜单项触发 `clickActions` |

这些输出名都是上下文名，不要声明成局部变量。

## AlertDialog 按钮动作

弹窗按钮可以直接放动作：

```text
ShowAlertDialog
  positive -> WriteGlobalVar / Shell / SetRuleEnabled
  negative -> ShowTextFieldDialog / 说明 / 取消
  neutral  -> CreateLocalVar / 禁用规则
```

设计时要注意：按钮动作也是动作链的一部分，会改变状态。审查导出时不能只看弹窗文本。

## TextField 输出

输入框输出通常是 `textFieldInput1`、`textFieldInput2`。例如备份规则用它写入 `backup_dir`。

推荐先校验：

```javascript
var inputValue = String(textFieldInput1).trim();
inputValue.length > 0 ? inputValue : "";
```

不要声明 `textFieldInput1`。它是对话框输出。

## Choice 输出

`ShowChoiceDialog` 输出 `choices`，下游常这样判断：

```json
{
  "@type": "type.googleapis.com/EvaluateContextVar",
  "varName": "choices",
  "payload": {
    "value": "[延迟]"
  }
}
```

注意输出可能带方括号，尤其是多选或内部格式。不要只凭显示文本猜结果，先用弹窗或剪贴板输出一次确认。

## MenuDialog clickActions

`ShowMenuDialog` 的菜单项会直接执行 `clickActions`。例如屏幕文本查找先让用户选择“往后查找”或“往前查找”，再把 `mvelRet` 改名为 `direction`。

```text
ShowMenuDialog
  -> clickActions ExecuteMVEL 输出 "down"
  -> customContextDataKey: mvelRet -> direction
  -> 后续脚本读取 direction
```

`direction` 被改名后也是上下文名，不要在后续脚本里声明同名局部变量。

## 取消分支

每个交互都要设计取消行为：

- 用户关闭列表对话框。
- 用户不填输入框。
- 用户取消菜单。
- 用户按弹窗的取消按钮。

推荐做法：

```text
对话框
  -> EvaluateContextVar IsNotExists / EqualTo 空
  -> isBreak
  -> ShowToast / ShowDanmu "已取消"
```

不要让取消后继续进入 JSON 解析或 Shell 写入。

## 对话框与状态写入

交互后写全局变量时，建议：

1. 先展示当前值。
2. 用户输入新值。
3. 校验格式。
4. 二次确认。
5. 写入全局变量。
6. 输出结果。

不要在输入框关闭后无校验写入系统设置、文件路径、Shell 命令或 WebDAV 配置。

## 检查清单

- 对话框输出名是否被当作保留名？
- 按钮动作是否会修改全局变量、规则或文件？
- 输入框是否校验空值？
- `choices` 的真实格式是否确认过？
- 菜单项输出是否用 `customContextDataKey` 改成业务名？
- 取消分支是否在高风险动作前中断？
- 用户选择是否被记录到发布说明或初始化向导？

对话框交互的关键是“用户行为如何进入动作链”。只写显示文案，不写输出契约，后续维护一定会出问题。
