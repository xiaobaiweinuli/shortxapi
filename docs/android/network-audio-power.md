# 网络、音频与电源

网络、音频、电源是自动化里高频但容易误判风险的服务域。读取状态通常适合做条件、诊断和提示；写入状态会影响用户体验、系统策略或应用行为，必须有确认和恢复路径。

## 网络

常见服务：

- `connectivity`
- `wifi`
- `wifiscanner`
- `ethernet`
- `tethering`

常见 ShortX 场景：

- 判断当前网络类型。
- 获取 Wi-Fi SSID、BSSID、IP、MAC。
- 扫描附近 Wi-Fi。
- 控制 USB/以太网/热点共享。

读取类能力通常风险较低；开关共享、修改热点策略、授权无线 ADB 等属于高级或危险。

输出建议：

```javascript
var outputObj = {
    connected: false,
    type: "",
    ssid: "",
    note: "按当前设备和 ROM 能力填充"
};

JSON.stringify(outputObj, null, 2);
```

网络状态经常受权限、后台限制、ROM 策略影响。失败时输出错误摘要，不要让下游把空值误判成“无网络”。

## 音频

常见服务：

- `audio`
- `media_session`
- `audio_policy`

常见场景：

- 获取当前音量。
- 调节指定 stream 音量。
- 判断录音状态。
- 控制媒体会话。

读取当前音乐音量：

```javascript
importClass(android.content.Context);
importClass(android.media.AudioManager);

var audioObj = context.getSystemService(Context.AUDIO_SERVICE);
var volumeValue = audioObj.getStreamVolume(AudioManager.STREAM_MUSIC);
String(volumeValue);
```

音量写入会影响用户当前环境，自动规则应避免在高频触发器里反复修改。写入前先保存旧值。

## 电源

常见服务：

- `power`
- `deviceidle`
- `batteryproperties`
- `batterystats`

常见场景：

- 屏幕状态。
- 息屏运行。
- 充电判断。
- Doze/idle 相关状态。

电源相关写操作和伪装类操作可能影响系统稳定性或应用行为，应标为危险或高级。

## 读写分离

对这些服务域，本站采用“读写分离”：

| 类型 | 文档写法 |
| --- | --- |
| 读取状态 | 给查询思路和输出塑形 |
| 写入状态 | 标注前提、确认步骤和恢复路径 |
| 危险操作 | 只讲边界，不给无确认的一键脚本 |

## 自动规则注意

- 网络、音频、电源状态变化可能高频触发。
- 写入动作必须节流或去重。
- 失败时要输出错误摘要。
- 涉及工作资料或多用户时，确认目标用户空间。
- 发布前说明会影响哪些系统状态。
