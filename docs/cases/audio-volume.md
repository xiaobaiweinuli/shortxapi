# 高级案例：音频与音量

音频自动化常见需求是情景音量、静音判断、音频焦点判断和录音状态检查。写规则时要避免高频反复修改用户音量。

## 读取音量

内部服务入口示例：

```javascript
Packages.tornaco.apps.shortx.core.OooO0O0.OooO00o().getStreamVolume(4);
```

也有获取最小、最大音量的同族入口。具体 stream type 需要按 Android 音频流定义确认。

## 设置音量

可以通过 `audio` 服务设置音量：

```javascript
var audioManager = context.getSystemService("audio");
android.os.ServiceManager.getService("audio")
    .setStreamVolume(audioManager.STREAM_ALARM, 7, 0, null);

"volume set";
```

这是写入用户可感知状态。建议只放在手动动作或明确条件后，不放在频繁触发器后直接执行。

## 情景音量链路

```text
触发器：进入指定应用 / 连接指定蓝牙 / 时间段
  -> 读取当前音量
  -> 保存旧音量到全局变量
  -> 设置目标音量
  -> 退出场景时恢复旧音量
```

关键是保存旧值。不要只写“设置为 7”，不提供恢复。

## 输出结构

保存旧值可以输出 JSON：

```javascript
var streamTypeValue = context.getSystemService("audio").STREAM_ALARM;
var oldValue = Packages.tornaco.apps.shortx.core.OooO0O0.OooO00o()
    .getStreamVolume(streamTypeValue);

var output = {
    streamType: streamTypeValue,
    oldVolume: Number(String(oldValue)),
    targetVolume: 7
};

JSON.stringify(output);
```

后续可以把 JSON 写入全局变量，恢复时再读取。

## 风险

- 音量写入会影响闹钟、媒体、通知或通话体验。
- 不同 ROM 对 stream type 和安全音量策略可能不同。
- 自动恢复要处理规则中断，否则可能永久停留在目标音量。
- 音频焦点只是状态信号，不等于可以随意控制其他应用播放。
