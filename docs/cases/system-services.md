# 高级案例：系统服务调用

ShortX 高级脚本可以调用 Android 系统服务，但服务调用不是越底层越好。稳定写法应该先选择最上层可用入口，再把结果塑形成动作链能消费的输出。

## 选择路径

```text
内置动作
  -> shortx.* 公共 API
  -> shortx.executeAction(...)
  -> OooO0O0 内部 ShortX 服务
  -> Android manager API
  -> AIDL / Binder 级服务
```

越往下，能力越强，风险和维护成本越高。

## 读取类能力

读取状态通常风险较低，例如：

- 当前 Wi-Fi 名称、BSSID、IP。
- 当前音量。
- 当前显示信息。
- 当前 ShortX 日志路径。
- 当前规则/代码库数量。

读取示例：获取当前音乐流音量。

```javascript
importClass(android.content.Context);
importClass(android.media.AudioManager);

var audioObj = context.getSystemService(Context.AUDIO_SERVICE);
var volumeValue = audioObj.getStreamVolume(AudioManager.STREAM_MUSIC);
String(volumeValue);
```

如果下游要展示更多信息，输出 JSON：

```javascript
importClass(android.content.Context);
importClass(android.media.AudioManager);

var audioObj = context.getSystemService(Context.AUDIO_SERVICE);
var outputObj = {
    music: audioObj.getStreamVolume(AudioManager.STREAM_MUSIC),
    ring: audioObj.getStreamVolume(AudioManager.STREAM_RING),
    alarm: audioObj.getStreamVolume(AudioManager.STREAM_ALARM)
};

JSON.stringify(outputObj, null, 2);
```

## 写入类能力

写入状态风险更高，例如：

- 修改音量。
- 修改系统设置。
- 禁用组件。
- 设置传感器隐私。
- 改显示刷新率。
- 开关 ADB 或网络共享。

写入类链路建议：

```text
读取当前状态
  -> 展示当前值和目标值
  -> 用户确认
  -> 执行写入
  -> 再次读取确认
  -> 输出恢复信息
```

音量写入示例适合放在手动一键指令中：

```javascript
importClass(android.content.Context);
importClass(android.media.AudioManager);

var audioObj = context.getSystemService(Context.AUDIO_SERVICE);
var oldValue = audioObj.getStreamVolume(AudioManager.STREAM_MUSIC);
var targetValue = 5;

audioObj.setStreamVolume(AudioManager.STREAM_MUSIC, targetValue, 0);

var outputObj = {
    oldValue: oldValue,
    newValue: audioObj.getStreamVolume(AudioManager.STREAM_MUSIC)
};

JSON.stringify(outputObj, null, 2);
```

不要把这类写入直接接在高频触发器后。先做手动验证，再决定是否自动化。

## 输出契约

系统服务返回值可能是 Java 对象，不一定能直接拼接字符串。建议统一处理：

| 下游目标 | 输出 |
| --- | --- |
| Toast / 剪贴板 | 字符串 |
| 对话框列表 | JSON 数组 |
| 多字段诊断 | JSON 对象 |
| 条件判断 | 布尔值或短字符串 |

变量命名避开 `pkgName`、`userId`、`title`、`contentText`、`text` 等上下文名。

## 危险能力

以下能力只适合作为高级参考，不适合作为入门复制示例：

- 重启设备。
- 主动触发 system_server 崩溃。
- 修改锁屏凭据。
- 删除 ShortX 规则、动作、代码库、全局变量。
- 清除 ADB 授权或改变系统安全状态。

## 排查清单

- 这个能力是否已有内置动作？
- 是否可以用 Android manager API，而不是 Binder/AIDL？
- 返回值是否转成了字符串或 JSON？
- 写入前是否保存了旧值？
- 自动触发器是否会重复执行？
- 失败时下游是否能看到错误摘要？
