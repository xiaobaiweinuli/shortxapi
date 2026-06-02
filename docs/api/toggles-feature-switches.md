# 开关指令与总开关

ShortX 的“开关指令”和自动规则总开关都可以通过内部服务读取或判断。它们适合做运行前诊断、配置面板和维护工具。

## 已见真实入口

代码库片段中可见：

```javascript
Packages.tornaco.apps.shortx.core.OooO0O0.OooO00o().isRuleFeatureEnabled();
```

```javascript
Packages.tornaco.apps.shortx.core.OooO0O0.OooO00o().getAllToggles();
```

```javascript
Packages.tornaco.apps.shortx.core.OooO0O0.OooO00o().isToggleEnabled("toggle-...");
```

```javascript
Packages.tornaco.apps.shortx.core.OooO0O0.OooO00o().deleteToggle("toggle-...");
```

```javascript
Packages.tornaco.apps.shortx.core.OooO0O0.OooO00o().addToggle(ByteArrayWrapper);
```

读取和判断入口适合直接做诊断。新增入口需要 `ByteArrayWrapper`，不要在没有 proto 构造依据时凭空写入。

## 总开关诊断

自动规则不触发时，先检查总开关：

```javascript
var service = Packages.tornaco.apps.shortx.core.OooO0O0.OooO00o();
service.isRuleFeatureEnabled() ? "自动规则总开关已开启" : "自动规则总开关未开启";
```

这类诊断适合放在故障排查面板里，而不是每条规则都重复检查。

## 开关指令状态

判断指定开关：

```javascript
var service = Packages.tornaco.apps.shortx.core.OooO0O0.OooO00o();
service.isToggleEnabled("toggle-84eb65f4-115c-416b-bef2-xxxxxxxxxx") ? "已开启" : "未开启";
```

真实使用时，不要把示例 ID 当成有效 ID。应先读取开关列表，再让用户选择目标。

## 读取列表

推荐链路：

```text
getAllToggles()
  -> ExecuteJS 解析成 JSON 列表
  -> ShowListDialog
  -> selectedListItem
  -> 查看状态 / 复制 ID / 二次确认删除
```

如果返回值是内部 proto 包装对象，先做只读诊断，不要直接删除。

## 删除开关

删除动作必须有二次确认：

```text
选择开关
  -> 展示名称和 ID
  -> 确认删除
  -> deleteToggle(id)
  -> 输出结果
```

不要在自动规则中根据模糊名称批量删除开关。

## 新增开关

`addToggle(ByteArrayWrapper)` 说明新增需要完整开关配置的序列化数据。除非已经有可信的 proto 构造样例，否则文档只应说明：

- 有内部服务入口。
- 新增需要配置 proto。
- 可以通过读取已有开关反推结构，但要先备份。
- 不建议教程给半成品写入代码。

## 与规则诊断面板配合

开关和总开关适合放进运行诊断页面：

- 自动规则总开关是否开启。
- 指定开关是否开启。
- 目标规则是否启用。
- 依赖插件是否存在。
- 全局变量是否存在。

这样用户能先知道“环境是否允许执行”，再排查具体动作链。

## 风险清单

- 开关 ID 不是显示名，删除前要展示两者。
- 新增/删除开关会改变 ShortX 配置。
- `ByteArrayWrapper` 写入要谨慎，版本不兼容可能破坏配置。
- 自动规则总开关关闭时，不要误判为触发器或脚本错误。
- 诊断脚本不要把内部配置完整输出到公开通知。

开关指令管理属于 ShortX 配置维护层。默认使用读取和诊断，写入和删除必须经过确认和备份。
