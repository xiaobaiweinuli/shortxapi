# 开始

这里是 ShortX 高级自动化文档的入口。建议先按任务选择阅读路径，再进入具体页面。不要从内部服务或 Android AIDL 开始；先把动作链、上下文变量和输出契约理解清楚，后面的脚本和系统能力才不会失控。

## 三条最快路径

如果你刚开始整理 ShortX 文档，可以按这三条路径选择：

| 目标 | 阅读顺序 |
| --- | --- |
| 写一条稳定规则 | [一键指令与自动指令](/guide/commands-and-rules) -> [动作链](/chain/) -> [动作输出契约](/chain/action-output-contracts) |
| 写 JS/MVEL | [脚本](/script/) -> [Rhino JS 运行环境](/script/runtime) -> [ExecuteJS 写法](/script/js) -> [MatchJS 条件](/script/matchjs) |
| 调内部或系统能力 | [API](/api/) -> [内部 ShortX 服务](/api/internal-service) -> [Android 服务](/android/) -> [风险分级](/chain/risk) |

## 按角色阅读

| 角色 | 推荐入口 |
| --- | --- |
| 刚开始整理 ShortX 概念 | [能力边界](/guide/introduction)、[一键指令与自动指令](/guide/commands-and-rules) |
| 看不懂变量和术语 | [术语表](/guide/glossary)、[上下文变量速查](/chain/context-variable-reference) |
| 想写稳定动作链 | [动作链数据模型](/chain/model)、[动作输出契约](/chain/action-output-contracts) |
| 想写 JS/MVEL | [脚本总览](/script/)、[JS 与 MVEL 选择指南](/script/js-mvel-choice)、[脚本审查清单](/script/review-checklist) |
| 想调用内部能力 | [API 总览](/api/)、[内部 ShortX 服务](/api/internal-service) |
| 想理解 Android 服务 | [Android 服务总览](/android/)、[AIDL 与 Binder 边界](/android/aidl-binder-boundary) |
| 想迁移或发布规则 | [发布与迁移](/guide/release-migration)、[发布质量检查](/guide/release-quality)、[版本兼容与升级检查](/guide/version-compatibility)、[备份与恢复](/guide/backup-restore) |
| 规则会处理敏感内容 | [隐私数据处理](/guide/privacy-data)、[安全边界](/guide/security-boundary) |
| 规则已经出问题 | [故障排查](/guide/troubleshooting)、[运行诊断面板](/cases/runtime-diagnostics) |

## 从需求到链路

把需求先写成动作链，不要先写脚本。例如“收到通知验证码并复制”：

```text
Notification 触发器
  -> MatchJS 过滤包名和关键词
  -> ExecuteJS 提取验证码
  -> customContextDataKey: jsRet -> ExtractedCode
  -> MatchJS 判断 ExtractedCode 非空
  -> WriteClipboard: {ExtractedCode}
  -> Toast
```

这条链里每一步都有职责：

- 触发器提供 `pkgName`、`title`、`contentText`。
- `MatchJS` 只负责是否继续。
- `ExecuteJS` 负责提取和格式化。
- `customContextDataKey` 把默认输出改成业务名。
- 下游动作只读取稳定业务名。

## 核心原则

- 先设计动作链，再写脚本。
- 先确定下游要什么输出，再决定 JS/MVEL 的结果形状。
- 先确认当前 ShortX 版本和设备环境，再写内部服务或 Android 服务调用。
- 长链路不要一直依赖 `jsRet`，关键结果要改名。
- 读写系统状态要分开讲：读取可以给示例，写入必须有确认和恢复。
- 不把 AIDL 方法表机械搬运成教程。

## 快速实战

如果只想快速进入实战，可以从这些页面开始：

1. [动作链数据模型](/chain/model)
2. [ExecuteJS 写法](/script/js)
3. [上下文变量速查](/chain/context-variable-reference)
4. [输出模板](/chain/output-templates)
5. [通知验证码完整工作流](/cases/notification-code-workflow)
6. [应用组件启动工作流](/cases/app-component-launch-workflow)
7. [发布质量检查](/guide/release-quality)
8. [版本兼容与升级检查](/guide/version-compatibility)
9. [故障排查](/guide/troubleshooting)

完整路线见 [学习路线](/guide/learning-path)。
