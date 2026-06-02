# 调度、闹钟与系统状态

Alarm、JobScheduler、Power、Network、Audio 这类服务都属于“系统状态”能力。它们在 ShortX 里很实用，但不应该默认从 AIDL 开始写脚本。

## 服务边界

| 服务族 | 关注点 | ShortX 中的常见用法 |
| --- | --- | --- |
| Alarm | 闹钟、空闲唤醒、系统时间、时区 | 查询下次 idle wake、时间相关诊断 |
| JobScheduler | 系统任务调度、pending job、user initiated job | 理解后台任务限制，通常不直接调度 |
| Power | 省电模式、屏幕/电源状态、idle | 判断或切换省电模式，评估触发条件 |
| Network / Wi-Fi | 网络类型、Wi-Fi 信息、扫描、热点 | 作为自动规则条件或状态展示 |
| Audio | stream 音量、静音、音频焦点、录音 | 情景音量、音频状态判断 |

## 优先级

写 ShortX 自动化时建议按这个顺序：

```text
ShortX 触发器 / 条件
  -> ShortX 内置动作
  -> context.getSystemService(...)
  -> OooO0O0 内部服务
  -> ServiceManager / AIDL
```

比如判断网络变化，优先使用 ShortX 已有触发器和上下文。只有需要读取底层状态或补充信息时，才进入系统服务。

## 读写分离

读取状态通常适合作为条件：

```javascript
var result = android.os.ServiceManager.getService("power").isPowerSaveMode();
result;
```

写入状态需要恢复路径：

```javascript
android.os.ServiceManager.getService("power").setPowerSaveModeEnabled(true);
"power save enabled";
```

第二段会改变用户设备状态，不应该放在高频自动触发器后面无确认执行。

## Alarm 与 JobScheduler

Alarm 适合理解“设备什么时候会被唤醒”。可以读取 `alarm` 服务的 `getNextWakeFromIdleTime()`，再换算成 wall clock 时间。

JobScheduler 更适合做系统行为理解：

- 哪些任务在等网络、充电、空闲。
- 为什么后台任务没有立刻执行。
- Android 版本和电源策略如何影响任务。

不建议在文档中把 JobScheduler AIDL 直接包装成 ShortX 调度教程。它涉及 `JobInfo`、包名、权限、回调和系统策略，远比动作链里的定时/触发器复杂。

## 系统状态动作的风险

- 网络扫描和热点可能受系统限制影响。
- 音量调整会影响用户当前环境。
- 省电模式、电源模式会影响全局 App 行为。
- 系统时间和时区属于危险状态修改。
- 传感器、显示、刷新率、输入状态要有回滚。

写教程时，读取状态可以给短示例；写入状态必须说明前提、影响和恢复方式。
