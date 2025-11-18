# 事件系统

ShortX 的事件系统负责监听和分发各种系统事件，是触发规则的基础。

## 事件类型

### 通知事件

监听系统通知的发布。

```json
{
  "@type": "type.googleapis.com/NotificationPosted",
  "record": {
    "contentText": ".*关键词.*",
    "title": ".*标题.*",
    "apps": [{
      "pkgName": "com.example.app"
    }],
    "titleRegexOptions": "RegexMatchOptions_ContainsMatchIn",
    "contentRegexOptions": "RegexMatchOptions_ContainsMatchIn"
  },
  "tag": "notification-tag",
  "id": "F-001"
}
```

**可用变量：**
- `{contentText}` - 通知内容
- `{title}` - 通知标题
- `{packageName}` - 应用包名
- `{postTime}` - 发布时间

### 手势事件

监听边缘手势和屏幕手势。

```json
{
  "@type": "type.googleapis.com/EdgeGesture",
  "record": {
    "direction": "left",
    "position": "bottom"
  },
  "id": "F-002"
}
```

**手势方向：**
- `left` - 从左边缘
- `right` - 从右边缘
- `top` - 从顶部边缘
- `bottom` - 从底部边缘

**相关 API：**

```java
// 触发边缘手势
shortXService.fireEdgeGesture(gestureWrapper);

// 触发屏幕手势
shortXService.fireScreenGesture(x, y, direction);

// 检查是否应触发手势
boolean shouldFire = shortXService.shouldFireEdgeGesture(x, y);
```

### 前台应用变化

监听前台应用切换。

```java
// 注册前台应用变化监听器
shortXService.registerFrontAppChangeListener(
    new ICallback.Stub() {
        @Override
        public void onCallback(String packageName) {
            Log.d("ShortX", "Front app: " + packageName);
        }
    }
);

// 注销监听器
shortXService.unRegisterFrontAppChangeListener(callback);
```

### 配置变化

监听系统配置变化（如屏幕旋转、语言切换等）。

```java
// 注册配置变化监听器
shortXService.registerConfigurationChangedListener(
    new ICallback.Stub() {
        @Override
        public void onCallback(String config) {
            Log.d("ShortX", "Configuration changed: " + config);
        }
    }
);
```

### NFC 标签

监听 NFC 标签扫描。

```java
// 注册 NFC 标签监听器
shortXService.registerNFCTagEndpointListener(
    new INFCTagEndpointListener.Stub() {
        @Override
        public void onTagDetected(byte[] tagData) {
            Log.d("ShortX", "NFC tag detected");
        }
    }
);

// 分发标签端点
shortXService.dispatchTagEndpoint(tagData);
```

### 传感器使用

监听传感器使用情况。

```java
// 注册传感器使用监听器
shortXService.registerSensorUsageListener(
    new ISensorUsageListener.Stub() {
        @Override
        public void onSensorUsed(String sensorType) {
            Log.d("ShortX", "Sensor used: " + sensorType);
        }
    }
);

// 查询传感器使用情况
List<SensorUsage> usages = shortXService.querySensorUsages();
```

### 音频录制

监听音频录制状态。

```java
// 注册音频录制观察者
shortXService.registerAudioRecordingObs(
    new IAudioRecordingListener.Stub() {
        @Override
        public void onRecordingStateChanged(boolean isRecording) {
            Log.d("ShortX", "Recording: " + isRecording);
        }
    }
);

// 检查录制状态
boolean isRecording = shortXService.isAudioRecording();

// 停止录制
shortXService.stopAudioRecording();
```

### 任务状态

监听后台任务状态。

```java
// 注册任务状态监听器
shortXService.registerJobStatusListener(
    new IJobStatusListener.Stub() {
        @Override
        public void onJobStarted(String jobId) {
            Log.d("ShortX", "Job started: " + jobId);
        }
        
        @Override
        public void onJobFinished(String jobId) {
            Log.d("ShortX", "Job finished: " + jobId);
        }
    }
);

// 获取活跃任务
List<Job> activeJobs = shortXService.getActiveJobs();

// 取消任务
shortXService.cancelJobs(jobIds);
```

## 事实发布

### 发布自定义事实

```java
// 获取事实发布记录
List<FactPublishRecord> records = 
    shortXService.getFactPublishRecords();
```

### 深度链接触发

```java
// 触发深度链接
shortXService.deepLinkTriggerCalled("shortx://action/trigger");
```

## 事件过滤

### 应用过滤

使用包集过滤特定应用的事件：

```java
// 创建包集
PkgSet pkgSet = new PkgSet();
pkgSet.setId("PS-001");
pkgSet.setLabel("社交应用");
pkgSet.addPackage("com.tencent.mm");
pkgSet.addPackage("com.tencent.wework");

// 添加包集
shortXService.addPkgSet(serializePkgSet(pkgSet));

// 在规则中使用
{
  "facts": [{
    "@type": "type.googleapis.com/NotificationPosted",
    "record": {
      "pkgSetId": "PS-001"
    }
  }]
}
```

### 正则表达式过滤

```json
{
  "contentText": ".*验证码.*",
  "contentRegexOptions": "RegexMatchOptions_ContainsMatchIn"
}
```

**正则选项：**
- `RegexMatchOptions_ContainsMatchIn` - 包含匹配
- `RegexMatchOptions_Matches` - 完全匹配
- `RegexMatchOptions_Find` - 查找匹配

## 系统就绪

监听系统启动完成。

```java
// 注册系统就绪监听器
shortXService.registerSystemReadyListener(
    new ICallback.Stub() {
        @Override
        public void onCallback(String data) {
            Log.d("ShortX", "System ready");
        }
    }
);

// 注销监听器
shortXService.unRegisterSystemReadyListener(callback);
```

## 强制禁用

监听强制禁用事件。

```java
// 注册强制禁用监听器
shortXService.registerForceDisableListener(
    new IForceDisableListener.Stub() {
        @Override
        public void onForceDisabled(boolean disabled) {
            Log.d("ShortX", "Force disabled: " + disabled);
        }
    }
);

// 启用按键强制禁用
shortXService.setForceDisableShortXByKeyPressEnabled(true);

// 检查状态
boolean enabled = 
    shortXService.isForceDisableShortXByKeyPressEnabled();
```

## 最佳实践

1. **及时注销监听器**：避免内存泄漏
2. **合理使用过滤**：减少不必要的规则触发
3. **异步处理**：避免阻塞主线程
4. **错误处理**：捕获监听器中的异常
5. **资源管理**：及时释放不需要的资源

## 下一步

- [动作执行](/guide/actions) - 学习动作使用
- [规则引擎](/guide/rule-engine) - 了解规则引擎
- [API 参考](/api/overview) - 查看完整 API
