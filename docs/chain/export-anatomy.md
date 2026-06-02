# 导出结构解剖

ShortX 的导出文件不是普通代码片段。真实的 DA、rule、代码库条目通常由 JSON 主体加尾部类型元信息组成。会读这个结构，才能安全修改、迁移和排查链路。

本页讲导出外壳、主体字段和修改原则，帮助你安全迁移和排查链路。

## 文件外壳

导出文件的基本形态：

```text
{
  "actions": [],
  "id": "SHARED-DA-...",
  "title": "一键指令名称",
  "description": "说明",
  "versionCode": "6",
  "hook": {},
  "quit": {}
}
###------###
{"type":"da"}
```

`###------###` 后面的对象是导出类型标记，不属于 JSON 主体。阅读或校验时应先按这个分隔符拆开，再解析前半段。

常见类型：

| 尾部类型 | 主体含义 |
| --- | --- |
| `{"type":"da"}` | 一键指令 |
| `{"type":"rule"}` | 自动指令 |
| `{"type":"CodeLibraryItem"}` | 代码库条目 |

不要把整个文件直接当成纯 JSON 解析；否则会在分隔符处失败。

## 一键指令主体

DA 主体的常见字段：

| 字段 | 说明 |
| --- | --- |
| `actions` | 主动作链，按顺序执行 |
| `id` | 指令唯一 ID，常见前缀为 `SHARED-DA-` |
| `lastUpdateTime` / `createTime` | 时间戳，迁移时可作为版本参考 |
| `author` | 作者信息 |
| `title` / `description` | 导入后显示的信息 |
| `versionCode` | 导出版本号，不等同 ShortX 版本 |
| `parameters` | DeepLink 或外部调用参数，部分 DA 才有 |
| `hook` | 启用、删除等生命周期动作，DA 中通常为空 |
| `quit` | 退出或停止逻辑，部分 DA 会放停止触发器 |

`选择屏幕区域 2.8` 的主体只有 4 个顶层动作，但第二个 `ExecuteJS` 内部包含完整悬浮框选 UI，后面的 `SwitchCase` 再根据 `clickedButton` 分支执行截图、OCR、贴图、二维码识别等动作。不要只按动作数量判断复杂度。

## 自动指令主体

rule 主体比 DA 多了触发和条件：

```text
facts -> conditions -> actions
```

常见字段：

| 字段 | 说明 |
| --- | --- |
| `facts` | 触发器列表，例如应用前台、包停止运行、Method Hook |
| `conditions` | 主链路条件，可能为空 |
| `actions` | 条件通过后执行的主动作 |
| `isEnabled` | 导出时的启用状态 |
| `conflictPolicy` | 冲突策略，部分规则才有 |
| `hook.actionsOnEnabled` | 规则启用时执行的初始化动作 |
| `hook.actionsOnDeleted` | 规则删除时执行的清理动作 |
| `quit` | 停止、退出或反向规则，部分规则会包含完整动作链 |

例如 `代理Boss 2.7` 的主动作只有一个 `SwitchCase`，但 `hook.actionsOnEnabled` 会创建全局变量、选择代理工具、创建应用集并写入配置。导入审查时必须同时看 `hook`，不能只看 `actions`。

## 代码库条目

代码库导出不是动作链：

```text
{
  "id": "CODELIB-...",
  "name": "列表对话框 JSON格式",
  "description": "ShowListDialog Action",
  "type": "CodeType_JAVASCRIPT",
  "content": "...",
  "tags": []
}
###------###
{"type":"CodeLibraryItem","author":"HeWei"}
```

核心字段是 `content`。它只是可复用片段，不会自动成为动作输出。放入 `ExecuteJS` 后，仍然要遵守 [动作输出契约](/chain/action-output-contracts)。

## 读导出顺序

1. 先看尾部类型，确认是 `da`、`rule` 还是代码库。
2. 看 `title`、`description`、`versionCode`，判断它想解决什么问题。
3. 看顶层 `facts`、`actions`、`hook`、`quit`，确认入口、主链路和生命周期动作。
4. 看每个动作的 `@type`、`id`、`note`、`isDisabled`、`customContextDataKey`。
5. 再读长 `expression`，不要从大段脚本开始。

## 修改原则

- 不改 `id`，除非你明确要把它变成另一个独立指令。
- 不删除 `hook.actionsOnDeleted`，除非你已经确认没有全局变量、应用集或状态需要清理。
- 不随意改 `customContextDataKey`，它会影响下游所有 `{变量}` 引用。
- 不把 DA 的 `actions` 直接复制到 rule，rule 还需要 `facts`、`conditions` 和启用状态语义。
- 不把代码库 `content` 当作可直接导入的动作链。

导出文件是配置、动作和脚本的组合体。真正的阅读目标不是“看懂每段代码”，而是先还原链路结构，再判断每个脚本段在链路中的职责。
