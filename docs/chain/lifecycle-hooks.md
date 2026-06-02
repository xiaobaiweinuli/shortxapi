# 生命周期与退出逻辑

ShortX 规则不是只有 `facts`、`conditions`、`actions`。自动规则里经常还有 `hook`、`quit`、`isEnabled`、`conflictPolicy`，这些字段决定规则启用、删除、停止和冲突时会发生什么。

## 主结构

自动指令常见结构：

```text
facts
conditions
actions
hook.actionsOnEnabled
hook.actionsOnDeleted
quit
isEnabled
conflictPolicy
```

一键指令没有普通触发器，但也可能有 `parameters`、`hook`、`quit`。例如 `屏幕文本查找直达` 使用 `quit.facts` 监听音量键停止查找。

## `isEnabled`

`isEnabled` 是导出时的启用状态。导入后是否立即运行，取决于导入流程和用户操作，但审查导出时仍要注意：

- `true` 表示作者导出时规则处于启用状态。
- 自动规则如果带高频触发器，导入后不要直接放到日常环境里运行。
- 包含 `MethodHook` 的规则通常还需要重启目标服务或设备。

## `actionsOnEnabled`

`hook.actionsOnEnabled` 在规则启用时执行，常用于初始化：

| 初始化动作 | 用途 |
| --- | --- |
| `EvaluateGlobalVar` | 判断变量是否已存在 |
| `CreateGlobalVar` | 创建配置、状态或去重变量 |
| `ShowListDialog` / `ShowChoiceDialog` | 第一次启用时让用户选择配置 |
| `CreatePkgSet` | 创建规则依赖的应用集 |
| `SetRuleEnabled` | 初始化失败或用户取消时禁用规则 |

`码上就位` 会在启用时检查 `sms_dedup_hash` 是否存在，不存在则创建；删除规则时再删除这个变量。这个模式适合去重类状态。

`代理Boss` 的启用流程更复杂：创建 `代理工具` 全局变量，扫描 VPN 工具，弹出选择对话框，创建 `Proxy` 应用集，并在用户取消关键配置时禁用自身。

## `actionsOnDeleted`

`hook.actionsOnDeleted` 在规则删除时执行，通常用于清理启用时创建的持久状态：

```json
{
  "@type": "type.googleapis.com/DeleteGlobalVar",
  "varName": "sms_dedup_hash"
}
```

审查规则时要成对检查：

| 启用时创建 | 删除时应该 |
| --- | --- |
| 全局变量 | 删除或说明保留原因 |
| 应用集 | 删除或说明由用户继续维护 |
| 动态快捷方式 | 删除对应 ID |
| 系统状态快照 | 保留为恢复依据或清理 |

没有删除动作不一定错误。有些配置是用户长期维护的数据，删除规则时不一定应该自动删。但文档或导出说明必须写清楚。

## `quit`

`quit` 是停止逻辑。它可以为空，也可以包含触发器、条件、动作和评估策略。

一键指令可以这样配置：

```json
{
  "quit": {
    "facts": [{
      "@type": "type.googleapis.com/KeyEvent",
      "keyCode": 25
    }],
    "isEnabled": true,
    "evaluatePolicy": "Quit_EvaluatePolicy_Once"
  }
}
```

这表示运行中的一键指令可以通过音量减键停止。适合长时间滚动、查找、监听、悬浮窗等流程。

设计退出逻辑时要确认：

- 退出触发器不会误触。
- 退出后能释放悬浮窗、线程、文件或临时状态。
- 退出不应破坏主规则下一次运行所需的配置。
- 长任务要有超时，不只依赖人工退出。

## `conflictPolicy`

部分规则带 `conflictPolicy`，例如 `ConflictStrategy_ReplaceOld`。它用于处理重复导入或冲突规则。

导入审查时要把它当成迁移策略：

- 替换旧规则可能保留或复用旧 ID 相关状态。
- 并存新旧规则可能导致触发重复执行。
- 如果规则创建全局变量或应用集，替换策略还要检查旧状态是否兼容新版本。

## 自禁用模式

规则可以用 `SetRuleEnabled` 处理初始化失败或用户取消：

```text
启用规则
  -> 检查必要变量
  -> 弹窗或对话框收集配置
  -> 如果用户取消关键配置
  -> SetRuleEnabled 禁用自身
```

这个模式比“静默继续运行”更安全。适合：

- 缺少应用集。
- 用户没有选择目标应用。
- 缺少外部 dex、插件或系统权限。
- 需要人工确认高风险动作。

## 生命周期审查清单

- `actionsOnEnabled` 是否创建了全局变量、应用集或其他持久状态？
- `actionsOnDeleted` 是否清理了这些状态，或说明为什么不清理？
- `quit` 是否存在，触发器是否可靠？
- 长任务是否有停止键、超时或取消分支？
- `SetRuleEnabled` 是否用于保护未完成初始化的规则？
- `conflictPolicy` 是否会影响旧版本迁移？
- 删除规则后是否仍会留下动态快捷方式、全局变量、应用集或系统设置？

生命周期是规则维护的边界。只看主动作链，无法判断一个规则导入、启用、停止和删除后的真实影响。
