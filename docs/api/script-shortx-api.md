# 公共脚本 API

`shortx` 是 ShortX 暴露给 Rhino JS 的公共脚本对象。最新本地 `ScriptShortXApi` 快照显示，它覆盖动作执行、规则/一键指令查询、全局变量、ShortX 根目录和 UiAutomation。普通教程应优先讲清这个边界，再决定是否需要 `OooO0O0.OooO00o()`。

## 方法分组

| 分组 | 方法 |
| --- | --- |
| 动作执行 | `executeAction(...)`、`executeActions(...)` |
| 一键指令 | `executeDAById(...)`、`queryDAById(...)`、`queryDAIdByTitle(...)` |
| 自动规则 | `queryRuleById(...)`、`queryRuleIdByTitle(...)`、`enableDisableRuleById(...)` |
| 全局变量 | `readGlobalVar(...)`、`writeGlobalVar(...)`、`writeGlobalVarWithOp(...)` |
| 环境能力 | `getShortXDir()`、`getUiAutomation()` |

这些属于公共脚本 API。相比内部 `IShortX` 服务，它们更适合作为教程默认入口。

## 查询和执行一键指令

按标题查找 ID：

```javascript
var directActionTitleText = "清理缓存";
var idsValue = shortx.queryDAIdByTitle(directActionTitleText);

idsValue == null ? "" : String(idsValue);
```

执行指定 ID：

```javascript
var directActionIdValue = "DA-xxxxxxxx";
shortx.executeDAById(directActionIdValue);

"executed: " + directActionIdValue;
```

执行一键指令是有副作用的。发布教程时应先说明这个 DA 会修改什么状态，不能只给一个 ID。

## 查询规则和启停规则

```javascript
var ruleTitleText = "短信验证码";
var ruleIdsValue = shortx.queryRuleIdByTitle(ruleTitleText);

ruleIdsValue == null ? "" : String(ruleIdsValue);
```

启停规则：

```javascript
var ruleIdValue = "RULE-xxxxxxxx";
var enabledValue = false;

shortx.enableDisableRuleById(ruleIdValue, enabledValue);
"rule enabled: " + enabledValue;
```

启停规则会改变长期配置。它适合初始化向导、依赖检查或人工维护，不适合在普通触发链路里频繁切换。

## 全局变量

读取：

```javascript
var savedValue = shortx.readGlobalVar("sms_dedup_hash");
savedValue == null ? "" : String(savedValue);
```

覆盖写入：

```javascript
var nextHashValue = "7A38...";
shortx.writeGlobalVarWithOp("sms_dedup_hash", nextHashValue, 3);
nextHashValue;
```

`writeGlobalVarWithOp(..., 3)` 用于覆盖写入。写入前要确认变量名、类型和恢复策略。

## ShortX 目录

`getShortXDir()` 返回 ShortX 自身数据根目录，高级规则会在它下面读写 `data/u/0/...`、`lib/...` 等路径：

```javascript
importClass(java.io.File);

var shortxRootText = shortx.getShortXDir();
var targetFileValue = new File(shortxRootText + "/data/u/0/work/report.txt");

targetFileValue.getAbsolutePath();
```

读取 ShortX 目录适合做缓存、报告、外部库定位和内部数据检查。写入前要设计清理和权限策略。

## UiAutomation

```javascript
var automationValue = shortx.getUiAutomation();
if (!automationValue.isConnected()) {
    automationValue.connect();
}

var rootNodeValue = automationValue.getRootInActiveWindow();
rootNodeValue == null ? "no root" : String(rootNodeValue.getClassName());
```

UiAutomation 适合节点检索、全局动作、手势注入和输入事件。正式规则里要加入等待、超时和失败输出，不要假设窗口一定存在。

## 何时仍需内部服务

公共 API 没覆盖以下场景时，才考虑内部服务：

- 读取所有代码库、规则、应用集、插件能力。
- 诊断运行任务、日志和服务状态。
- 查询组件、动态快捷方式配置等内部对象。
- 需要当前 APK `IShortX` 签名确认的方法。

优先级仍然是：公共 `shortx.*` 可用就不要降到内部 Binder。
