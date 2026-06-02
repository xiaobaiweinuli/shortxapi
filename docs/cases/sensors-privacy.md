# 高级案例：传感器与隐私开关

传感器能力分为读取普通传感器数据和修改传感器隐私状态。两者风险不同。

## 普通传感器读取

读取光线传感器时，可以使用 `SensorManager`、主线程 `Handler` 和 `CountDownLatch` 等待一次回调。

简化模式：

```text
获取 SensorManager
  -> 获取目标传感器
  -> 注册 listener
  -> 等待一次数据
  -> 注销 listener
  -> 输出结果
```

读取类能力适合用于：

- 光线强度判断。
- 设备方向判断。
- 距离、加速度、重力、磁场状态诊断。

## 监听器必须注销

传感器读取脚本要保证：

- 等待时间有限。
- 获取失败有明确输出。
- 无论成功失败都注销 listener。
- 不在高频规则中长时间注册。

## 传感器隐私状态

读取摄像头/麦克风隐私开关：

```javascript
android.os.ServiceManager.getService("sensor_privacy")
    .isToggleSensorPrivacyEnabled(1, 2);
```

常见 sensor 值：

```text
1 = 麦克风
2 = 摄像头
```

设置隐私开关示例：

```javascript
android.os.ServiceManager.getService("sensor_privacy")
    .setToggleSensorPrivacy(0, 0, 1, true);

"microphone privacy enabled";
```

这会关闭对应传感器使用能力，属于高风险写操作。

## 推荐链路

```text
读取当前隐私状态
  -> 保存旧状态
  -> 用户确认
  -> 修改隐私开关
  -> 提供恢复动作
```

不要只写“关闭麦克风/摄像头”，不写“恢复”。

## 风险

- 摄像头/麦克风隐私开关会影响所有应用。
- 传感器隐私状态可能被系统 UI 显示或拦截。
- 自动规则中频繁切换会造成用户困惑。
- 读普通传感器时要考虑设备不支持和超时。
