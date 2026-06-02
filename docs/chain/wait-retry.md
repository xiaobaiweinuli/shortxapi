# 等待、重试与超时

等待和重试是高级动作链的稳定性核心。页面加载、VPN 连接、OCR、滚动查找、外部网络请求都可能不是立即完成。常见工具包括 `Delay`、`WaitUtilConditionMatch`、`WhileLoop`、JS `CountDownLatch` 和超时控制。

## 三种等待

| 等待方式 | 适合 |
| --- | --- |
| `Delay` | 固定等待一小段时间 |
| `WaitUtilConditionMatch` | 等某个条件出现或超时 |
| `WhileLoop` | 重复执行直到条件不满足 |

不要用固定 `Delay` 解决所有问题。固定等待太短会不稳定，太长会拖慢规则。

## 固定延迟

批量处理里常用短延迟：

```json
{
  "@type": "type.googleapis.com/Delay",
  "timeString": "300"
}
```

适合：

- 批量应用之间节流。
- UI 打开后等待一帧。
- Shell/PackageManager 调用之间降压。

不适合：

- 等待网络连接。
- 等待某个 App 退出。
- 等待滚动页面出现目标文本。

## 条件等待

`代理Boss` 使用 `WaitUtilConditionMatch` 等待代理应用集内任意 App 重新出现：

```json
{
  "@type": "type.googleapis.com/WaitUtilConditionMatch",
  "condition": [{
    "@type": "type.googleapis.com/CurrentPkgList",
    "pkgSets": ["Proxy"],
    "op": "ANY"
  }],
  "timeout": "6000"
}
```

这种模式适合“延迟关闭”。如果等待期间用户又打开了需要代理的 App，就不执行关闭动作。

设计时要写清：

- 等待什么条件。
- 超时时间是多少。
- 超时后继续还是退出。
- 条件命中后输出给谁。

## WhileLoop

屏幕文本查找类指令会持续：

```text
读取当前页面文本
  -> 判断目标文本是否出现
  -> 判断页面是否还能滚动
  -> 注入滚动
  -> 再读页面文本
```

停止条件通常有三类：

- 找到目标。
- 页面不再变化。
- 达到最大尝试次数。

`屏幕文本查找直达` 使用页面文本 MD5 判断内容是否连续不变，并使用 `argOf$upperlimit` 控制上限。

## 用参数控制重试

重试次数不要写死：

```javascript
var limitValue = parseInt(String(argOf$upperlimit), 10);
if (isNaN(limitValue) || limitValue <= 0) {
    limitValue = 3;
}
limitValue;
```

`argOf$upperlimit` 是调用参数，不要声明同名局部变量。把它转成 `limitValue` 后再使用。

## JS UI 等待

自定义悬浮窗或气泡常用 `CountDownLatch` 等待用户操作：

```javascript
importClass(java.util.concurrent.CountDownLatch);
importClass(java.util.concurrent.TimeUnit);

var latch = new CountDownLatch(1);
var waited = latch.await(3000, TimeUnit.MILLISECONDS);
waited ? "done" : "timeout";
```

必须设置超时。没有超时的 UI 等待会让动作链卡住。

## 超时后的清理

超时后要做清理：

- 移除悬浮窗。
- 回收 Bitmap。
- 取消 Handler 回调。
- 关闭文件流。
- 给用户明确输出。

不要让超时只表现为“没有结果”。

## 重试结果格式

推荐输出 JSON：

```javascript
var output = {
    ok: false,
    reason: "timeout",
    attempts: 3
};

JSON.stringify(output);
```

下游 `MatchJS` 再判断：

```javascript
JSON.parse(jsRet).ok == true;
```

## 检查清单

- 等待是固定时间、条件等待还是循环重试？
- 每个等待是否有超时？
- 超时后是否清理资源？
- 重试次数是否可配置？
- 循环是否有明确停止条件？
- 高频触发器是否会叠加多个等待任务？
- 输出是否说明成功、失败、超时和尝试次数？

等待策略不是拖延时间，而是把不确定状态变成可判断、可停止、可恢复的动作链。
