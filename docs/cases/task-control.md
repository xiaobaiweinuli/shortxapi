# 高级案例：任务与动作控制

ShortX 内部服务可以查询正在执行的任务和动作，也能取消指定任务。它适合排查卡住的动作链，不能当作普通流程控制的第一选择。

## 真实入口

内部服务调用示例：

```javascript
Packages.tornaco.apps.shortx.core.OooO0O0.OooO00o().getActiveJobs();
Packages.tornaco.apps.shortx.core.OooO0O0.OooO00o().getEvaluatingActions();
Packages.tornaco.apps.shortx.core.OooO0O0.OooO00o().cancelJobs(dataList);
```

`cancelJobs(...)` 需要传入任务列表或任务对象集合。没有确认对象结构前，不要只凭任务 ID 猜参数。

## 适合的链路

```text
一键指令
  -> getActiveJobs()
  -> JS 整理为 ShowListDialog JSON
  -> 用户选择任务
  -> 二次确认
  -> cancelJobs(...)
```

如果只是避免重复执行，优先在规则设计上加条件、全局变量锁或执行间隔，而不是事后取消任务。

## 展示运行中任务

如果返回对象不能稳定解析，可以先用诊断视图展示：

```javascript
var iShortX = Packages.tornaco.apps.shortx.core.OooO0O0.OooO00o();
var dataList = iShortX.getActiveJobs();
var rows = [];

for (var i = 0; i < dataList.size(); i++) {
    rows.push(String(dataList.get(i)));
}

rows.join("\n");
```

当你确认对象字段后，再改成结构化 JSON。

## 取消动作的风险

取消任务可能发生在动作链中间：

- 前一步已经修改系统设置。
- 后一步尚未回滚。
- 文件写入只完成一半。
- 全局变量锁未释放。
- UI 弹窗或悬浮窗还在。

因此，长链路应该自己设计补偿动作，而不是依赖外部取消。

## 设计建议

- 长任务开始时写入全局变量状态。
- 正常结束和异常结束都清理状态。
- 可取消任务要有明确的任务对象来源。
- 取消前展示任务信息并二次确认。
- 只把任务控制放在手动诊断入口，不放进频繁触发的自动规则。

