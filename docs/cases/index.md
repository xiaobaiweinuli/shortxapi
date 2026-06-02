# 高级案例

案例页按任务组织工作流，重点讲入口选择、上下文数据流、脚本边界和恢复策略。

## 按任务选择

| 任务 | 页面 |
| --- | --- |
| 处理短信或通知验证码 | [验证码处理](/cases/verification-code) |
| 从通知提取验证码、去重并复制 | [通知验证码完整工作流](/cases/notification-code-workflow) |
| 过滤、解析、清理通知 | [通知处理](/cases/notification) |
| 按来源和内容分发通知 | [通知路由](/cases/notification-routing) |
| 打开应用页面或触发入口 | [Intent 与 DeepLink](/cases/intent-deeplink) |
| 调用 Android 或 ShortX 服务 | [系统服务调用](/cases/system-services) |
| 做悬浮窗、覆盖层、交互 UI | [悬浮窗与 UI](/cases/ui-overlay) |
| 用悬浮按钮承接输入法、DeepLink 或快捷入口 | [Overlay 按钮工作流](/cases/overlay-button-flow) |
| 把目标控件转换成稳定规则锚点 | [控件检索工作流](/cases/control-inspector-workflow) |
| 控制输入法和触摸状态 | [输入法与触摸](/cases/input-method-touch) |
| 选择坐标、截图区域、区域 OCR | [坐标与屏幕区域](/cases/coordinate-region) |
| 监控系统设置变化 | [设置项监视器](/cases/settings-monitor) |
| 修改系统状态后恢复 | [设置恢复](/cases/settings-restore) |
| 读取显示信息和刷新率 | [显示与刷新率](/cases/display-refresh) |
| 屏幕识别文字 | [截图与 OCR](/cases/ocr-screenshot) |
| 读取传感器或切换隐私开关 | [传感器与隐私开关](/cases/sensors-privacy) |
| 诊断权限与 AppOps 状态 | [AppOps 与权限状态](/cases/appops-permission) |
| 网络请求和 Shell 命令 | [HTTP 与 Shell](/cases/http-shell) |
| 判断 Wi-Fi、移动网络和扫描结果 | [网络状态](/cases/network-state) |
| 读取或调整音频流音量 | [音频与音量](/cases/audio-volume) |
| 判断省电模式和 idle wake | [电源与调度](/cases/power-scheduling) |
| 处理剪贴板历史和文件 | [剪贴板与文件数据](/cases/clipboard-file) |
| 遍历应用集、列表和黑名单 | [批量循环处理](/cases/batch-loop) |
| 定时备份和同步前检查 | [备份与同步工作流](/cases/backup-sync) |
| 读取 ShortX 目录、数据库和导出报告 | [ShortX 目录与数据库文件](/cases/shortx-dir-database) |
| 诊断 ShortX 运行状态 | [运行诊断面板](/cases/runtime-diagnostics) |
| 查看或取消运行中任务 | [任务与动作控制](/cases/task-control) |
| 首次启用时创建变量和配置 | [初始化向导](/cases/initialization-wizard) |
| 用应用集维护目标 App | [应用集工作流](/cases/app-set-workflow) |
| 解析目标应用快捷方式和 Intent URI | [快捷方式解析](/cases/shortcut-parsing) |
| 管理动态快捷方式 | [动态快捷方式](/cases/dynamic-shortcuts) |
| 加载外部库 | [外部库能力](/cases/external-library) |
| 检查包与组件 | [包与组件检查](/cases/package-components) |
| 选择应用、查询 Activity 并输出组件 | [应用组件启动工作流](/cases/app-component-launch-workflow) |
| 从组件列表生成跳转或快捷方式 | [包与组件路由](/cases/component-routing) |
| 导入外部 DA、rule 前审查 | [导入前审查](/cases/export-review) |

## 学习方式

读案例时重点看三件事：

- 入口：触发器、手动指令、脚本还是内部服务。
- 数据流：上游输出进入哪个上下文名，下游读取什么。
- 风险：是否修改系统状态、ShortX 配置或用户数据。
