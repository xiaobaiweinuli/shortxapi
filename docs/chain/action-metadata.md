# 动作元数据

在动作链中，每个动作除了业务参数，还有一组元数据。元数据决定它在链路中如何被识别、显示、跳过和传递结果。

## `@type`

`@type` 是动作或触发器的 proto 类型 URL：

```json
{
  "@type": "type.googleapis.com/ExecuteJS",
  "expression": "String(jsRet);"
}
```

常见前缀都是 `type.googleapis.com/`。后半段才是动作名，例如 `ExecuteJS`、`SwitchCase`、`ShowListDialog`、`MethodHook`。

阅读时先按 `@type` 分组：

| 类型 | 先看什么 |
| --- | --- |
| `ExecuteJS` / `ExecuteMVEL` | 输出给谁、有没有改名 |
| `MatchJS` / `MatchMVEL` | 判断表达式是否只做判断 |
| `SwitchCase` / `IfThenElse` | 分支是否互斥、是否有兜底 |
| `ShowListDialog` / `ShowTextFieldDialog` | 输出上下文名和下游解析 |
| `AreaScreenshot` / `OcrDetect` | 输出文件路径、OCR 文本或区域来源 |
| `CreateGlobalVar` / `WriteGlobalVar` | 是否有删除和恢复路径 |

如果不确定动作字段，优先看 [Proto Action 查找](/api/proto-javadoc-lookup)。

## `id`

动作 ID 常见前缀：

| 前缀 | 含义 |
| --- | --- |
| `A-` | action 动作 |
| `C-` | condition 条件 |
| `F-` | fact 触发器 |
| `Case-` | `SwitchCase` 内部 case |
| `SHARED-DA-` | 一键指令 |
| `SHARE-rule-` | 自动指令 |
| `CODELIB-` | 代码库条目 |

ID 是导入和引用的重要标识。只做教程级修改时通常不改它。复制整条链路作为新作品时，再由 ShortX 或导出流程生成新 ID 更稳。

## `note` 和 `description`

`note` 多用于动作内部备注，`description` 常用于 `SwitchCase` 的 case 标题或导出说明。

动作链里会出现这样的结构：

```json
{
  "@type": "type.googleapis.com/ExecuteJS",
  "note": "提取验证码",
  "id": "A-..."
}
```

阅读时可以把 `note` 当成作者给自己的断点名。调试时先定位这些备注，再看对应脚本。

## `icon`

`icon` 主要影响 UI 展示，不一定影响执行：

```json
{
  "@type": "type.googleapis.com/NoAction",
  "icon": "font-search"
}
```

图标名可能来自 ShortX 自身图标体系，也可能由脚本通过 `context.createPackageContext("tornaco.apps.shortx", ...)` 加载远端资源。图标缺失通常不等于动作失败。

## `isDisabled`

`isDisabled` 表示动作在导出中被禁用。它经常用于保留调试动作、备选动作或未启用的配置流程。

例如复杂链路会把“原始输出”弹窗或延迟配置步骤保留为禁用状态。审查导出时：

- 禁用动作不应被当作当前执行路径。
- 但禁用动作可能说明作者调试意图。
- 启用它前要重新检查上下文变量是否仍然存在。

## `customContextDataKey`

`customContextDataKey` 是动作链最重要的元数据之一。它把默认输出名改成业务名：

```json
{
  "customContextDataKey": {
    "keys": [{
      "first": "jsRet",
      "second": "reg"
    }]
  }
}
```

含义是：当前动作原本输出到 `jsRet`，但链路后续使用 `reg` 读取。

这会带来两个后果：

- 下游模板应使用 `{reg}`，脚本可以直接读取 `reg`。
- `reg` 也变成保留名，后续 JS/MVEL 不应声明 `var reg` 或把它当作参数名。

更推荐把业务输出改成更清晰的名字，例如 `RegionJson`、`ExtractedCode`、`SelectedPackage`。但阅读旧导出时，要尊重原名。

## 嵌套动作

动作不只存在于顶层 `actions`。它还会嵌在：

| 位置 | 说明 |
| --- | --- |
| `SwitchCase.case[].case` | 分支条件 |
| `SwitchCase.case[].action` | 分支动作 |
| `IfThenElse.ThenActions` | 条件成立动作 |
| `IfThenElse.ElseActions` | 条件不成立动作 |
| `ShowAlertDialog.onPositive` | 弹窗按钮动作 |
| `ShowMenuDialog.items[].actions` | 菜单项动作 |
| `hook.actionsOnEnabled` | 启用规则时执行 |
| `hook.actionsOnDeleted` | 删除规则时执行 |
| `quit.actions` | 停止或退出动作 |

所以只搜索顶层 `actions` 会漏掉大量执行路径。审查导出时应递归看所有 `@type`。

## 快速审查清单

- 每个 `ExecuteJS` / `ExecuteMVEL` 输出有没有被下游读取？
- `customContextDataKey` 改名后，下游是否仍在读取旧的 `jsRet` 或 `mvelRet`？
- `SwitchCase` 是否有 `isBreak`，分支是否会继续落到下一分支？
- `hook.actionsOnEnabled` 是否创建了全局变量、应用集或配置？
- `hook.actionsOnDeleted` 是否负责清理这些状态？
- 是否存在被禁用但看起来像主流程的动作？
- 是否有 `StartActivityIntentUri`、`WriteGlobalVar`、`DeleteGlobalVar`、`SetRuleEnabled` 等会改变系统或 ShortX 状态的动作？

动作元数据是读导出的地图。先读元数据，再读脚本，排查效率会高很多。
