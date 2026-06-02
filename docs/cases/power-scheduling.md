# 高级案例：电源与调度

电源和调度能力适合回答两个问题：当前设备状态是什么，以及系统下一次可能什么时候唤醒。它们不适合无提示修改系统长期策略。

## 省电模式判断

示例：

```javascript
android.os.ServiceManager.getService("power").isPowerSaveMode();
```

这个结果适合作为动作链条件：

```javascript
var isPowerSave = android.os.ServiceManager.getService("power").isPowerSaveMode();
isPowerSave ? "power-save" : "normal";
```

后续用 `MatchJS` 判断是否继续。

## 设置省电模式

示例：

```javascript
android.os.ServiceManager.getService("power").setPowerSaveModeEnabled(true);
"enabled";
```

这是写操作。建议链路：

```text
读取旧状态
  -> 用户确认
  -> 设置新状态
  -> 保存恢复动作
```

不要在通知、剪贴板、Wi-Fi 变化这类高频触发器后无确认切换省电模式。

## 下次 idle wake

读取 `alarm` 服务示例：

```javascript
var nextValue = android.os.ServiceManager.getService("alarm").getNextWakeFromIdleTime();
var resultText;

if (nextValue >= 9000000000) {
    resultText = "当前没有任何会唤醒设备的闹钟";
} else {
    var realTimeValue = java.lang.System.currentTimeMillis() +
        nextValue - android.os.SystemClock.elapsedRealtime();
    resultText = String(new java.text.SimpleDateFormat("yyyy-MM-dd HH:mm:ss")
        .format(new java.util.Date(realTimeValue)));
}

resultText;
```

这里不要使用 `next`、`real` 这类过于含糊的全局式变量名，文档示例用 `nextValue`、`realTimeValue` 更清晰。

## JobScheduler 的位置

JobScheduler 解释的是系统后台任务为什么等待、延迟或取消。ShortX 自动规则本身通常不需要直接构造 `JobInfo` 去调度系统 job。

如果规则目标是定时执行，优先看 ShortX 的自动规则触发器和动作链状态管理。只有做系统诊断或高级兼容分析时，才需要读 JobScheduler 服务资料。

## 风险

- 电源模式会影响所有 App。
- 系统时间、时区属于危险写操作。
- Doze/idle 行为受 Android 版本和 ROM 策略影响。
- 调度诊断结果不等于规则一定能按时运行。
