# 学习路线

ShortX 高级用法建议按“动作链 -> 脚本 -> API -> Android 服务”的顺序学习。直接从 AIDL 或内部服务开始，通常会写出难维护的链路。

## 第一阶段：动作链

目标：知道数据如何从触发器流到动作。

阅读：

1. [一键指令与自动指令](/guide/commands-and-rules)
2. [术语表](/guide/glossary)
3. [动作链数据模型](/chain/model)
4. [导出结构解剖](/chain/export-anatomy)
5. [动作元数据](/chain/action-metadata)
6. [触发器与事实变量](/chain/facts-and-triggers)
7. [触发策略](/chain/trigger-strategy)
8. [上下文变量速查](/chain/context-variable-reference)
9. [动作输出契约](/chain/action-output-contracts)
10. [常见数据格式](/chain/data-format-reference)
11. [生命周期与退出逻辑](/chain/lifecycle-hooks)
12. [参数化调用与 DeepLink](/chain/parameters-deeplink)
13. [等待、重试与超时](/chain/wait-retry)
14. [对话框交互契约](/chain/dialog-interactions)
15. [输出模板](/chain/output-templates)
16. [状态管理与去重](/chain/state-management)

能做到：

- 知道 `jsRet`、`mvelRet`、`selectedListItem` 的含义。
- 知道什么时候该用 `customContextDataKey`。
- 能判断下游需要文本、布尔值还是 JSON。
- 能先读导出外壳、动作元数据和生命周期动作，再读长脚本。
- 能判断规则第一次启用、删除和外部调用时会发生什么。
- 能把多触发器、等待条件和对话框结果拆成可维护的链路契约。

## 第二阶段：脚本

目标：写出符合 ShortX Rhino 风格的 JS/MVEL。

阅读：

1. [Rhino JS 运行环境](/script/runtime)
2. [ExecuteJS 写法](/script/js)
3. [MVEL 写法](/script/mvel)
4. [JS 与 MVEL 选择指南](/script/js-mvel-choice)
5. [MatchJS 条件](/script/matchjs)
6. [脚本审查清单](/script/review-checklist)

能做到：

- 不用浏览器或 Node.js 假设写 ShortX JS。
- 不把 JS 和 MVEL 混写。
- 不声明 ShortX 上下文保留名。
- 能把复杂输出整理成稳定 JSON。

## 第三阶段：ShortX API

目标：知道何时使用公共 API、proto action 和内部服务。

阅读：

1. [公共脚本 API](/api/script-shortx-api)
2. [ShortX API 与内部服务](/api/shortx-api)
3. [executeAction](/api/execute-action)
4. [Proto Action 查找](/api/proto-javadoc-lookup)
5. [内部 ShortX 服务](/api/internal-service)
6. [运行诊断接口](/api/runtime-diagnostics)
7. [诊断记录](/api/diagnostic-records)
8. [配置数据管理](/api/config-data-management)
9. [代码库管理](/api/code-library-management)
10. [WebDAV 配置管理](/api/webdav-management)
11. [开关指令与总开关](/api/toggles-feature-switches)

能做到：

- 优先使用动作链和公共 API。
- 能用 `shortx.executeAction(...)` 调用已知 proto action。
- 能用 `shortx.*` 查询一键指令、规则、全局变量、ShortX 目录和 UiAutomation。
- 只在当前版本中确认可用时使用 `OooO0O0.OooO00o()`。
- 能区分内部服务的读取、诊断、删除和 `ByteArrayWrapper` 写入风险。
- 能区分代码库条目的读取、执行、更新和删除风险。

## 第四阶段：Android 服务

目标：把 Android 服务说明当作查证工具，而不是代码模板。

阅读：

1. [Android 服务阅读方法](/android/service-reading)
2. [AIDL 与 Binder 边界](/android/aidl-binder-boundary)
3. [服务能力地图](/android/service-map)
4. [调度、闹钟与系统状态](/android/scheduling-state)
5. [系统交互边界](/android/system-interaction-boundary)
6. [无障碍节点检索](/android/accessibility-node-inspection)
7. [包名与用户边界](/android/user-package-boundary)
8. [用户限制与组策略](/android/user-restrictions)

能做到：

- 判断一个能力属于哪个 Android 服务族。
- 看懂 AIDL 方法签名的作用和限制。
- 不把系统服务签名或伪代码模板直接当成可运行 JS。
- 能区分系统状态读取和系统状态写入。
- 能区分输入、显示、传感器、AppOps 的读取和写入风险。
- 能把节点属性、包名和用户 ID 转成稳定的规则锚点。
- 能判断用户限制和组策略是否会影响设备可用性。

## 第五阶段：发布和维护

目标：让规则能迁移、能诊断、能恢复。

阅读：

1. [发布与迁移](/guide/release-migration)
2. [发布质量检查](/guide/release-quality)
3. [版本兼容与升级检查](/guide/version-compatibility)
4. [备份与恢复](/guide/backup-restore)
5. [安全边界](/guide/security-boundary)
6. [隐私数据处理](/guide/privacy-data)
7. [运行诊断面板](/cases/runtime-diagnostics)
8. [故障排查](/guide/troubleshooting)
9. [设置恢复](/cases/settings-restore)
10. [导入前审查](/cases/export-review)
11. [初始化向导](/cases/initialization-wizard)
12. [应用集工作流](/cases/app-set-workflow)
13. [通知验证码完整工作流](/cases/notification-code-workflow)
14. [应用组件启动工作流](/cases/app-component-launch-workflow)
15. [快捷方式解析](/cases/shortcut-parsing)
16. [批量循环处理](/cases/batch-loop)
17. [备份与同步工作流](/cases/backup-sync)
18. [Overlay 按钮工作流](/cases/overlay-button-flow)
19. [控件检索工作流](/cases/control-inspector-workflow)
20. [ShortX 目录与数据库文件](/cases/shortx-dir-database)

能做到：

- 发布前检查依赖、变量、插件和风险。
- 修改系统状态前设计恢复路径。
- 遇到失败能定位触发、上下文、脚本和日志。
- 能判断通知、剪贴板、日志、数据库和网络上传里的隐私边界。
