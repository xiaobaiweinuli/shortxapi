# 手势识别 API

手势识别 API 用于管理手势录制、识别和触发。

## 手势录制

### startGestureRecording()

开始录制手势。

```java
void startGestureRecording()
```

**示例：**

```java
shortXService.startGestureRecording();
```

### stopGestureRecording()

停止录制手势。

```java
void stopGestureRecording(boolean save)
```

**参数：**
- `save` - true 保存录制，false 丢弃

**示例：**

```java
// 保存录制
shortXService.stopGestureRecording(true);

// 丢弃录制
shortXService.stopGestureRecording(false);
```

### isGestureRecording()

检查是否正在录制手势。

```java
boolean isGestureRecording()
```

**返回：**
- true 正在录制，false 未录制

**示例：**

```java
boolean isRecording = shortXService.isGestureRecording();
```

## 手势记录管理

### addGestureRecord()

添加手势记录。

```java
void addGestureRecord(ByteArrayWrapper recordWrapper)
```

**参数：**
- `recordWrapper` - 序列化的手势记录对象

**示例：**

```java
GestureRecord record = new GestureRecord();
record.setId("GR-001");
record.setName("向右滑动");
record.setGestureData(gestureData);

byte[] bytes = serializeGestureRecord(record);
ByteArrayWrapper wrapper = new ByteArrayWrapper(bytes);
shortXService.addGestureRecord(wrapper);
```

### getGestureRecordById()

通过 ID 获取手势记录。

```java
GestureRecord getGestureRecordById(String recordId)
```

**参数：**
- `recordId` - 手势记录 ID

**返回：**
- 手势记录对象

**示例：**

```java
GestureRecord record = shortXService.getGestureRecordById("GR-001");
```

### getAllGestureRecords()

获取所有手势记录。

```java
List<GestureRecord> getAllGestureRecords(boolean includeDetails)
```

**参数：**
- `includeDetails` - 是否包含详细信息

**返回：**
- 手势记录列表

**示例：**

```java
List<GestureRecord> records = 
    shortXService.getAllGestureRecords(true);
```

### deleteGestureRecordById()

删除手势记录。

```java
void deleteGestureRecordById(String recordId)
```

**参数：**
- `recordId` - 手势记录 ID

**示例：**

```java
shortXService.deleteGestureRecordById("GR-001");
```

## 手势注入

### injectGestureRecord()

注入手势记录（执行手势）。

```java
void injectGestureRecord(
    String recordId,
    float speed,
    SynchronousResultReceiver receiver
)
```

**参数：**
- `recordId` - 手势记录 ID
- `speed` - 执行速度（1.0 为正常速度）
- `receiver` - 同步结果接收器

**示例：**

```java
SynchronousResultReceiver receiver = new SynchronousResultReceiver();
shortXService.injectGestureRecord("GR-001", 1.0f, receiver);

// 等待结果
Bundle result = receiver.awaitResult(5000);
boolean success = result.getBoolean("success");
```

## 边缘手势

### fireEdgeGesture()

触发边缘手势。

```java
void fireEdgeGesture(ByteArrayWrapper gestureWrapper)
```

**参数：**
- `gestureWrapper` - 序列化的边缘手势对象

**示例：**

```java
EdgeGesture gesture = new EdgeGesture();
gesture.setDirection("left");
gesture.setPosition("middle");

byte[] bytes = serializeEdgeGesture(gesture);
ByteArrayWrapper wrapper = new ByteArrayWrapper(bytes);
shortXService.fireEdgeGesture(wrapper);
```

### shouldFireEdgeGesture()

检查是否应触发边缘手势。

```java
boolean shouldFireEdgeGesture(int x, int y)
```

**参数：**
- `x` - X 坐标
- `y` - Y 坐标

**返回：**
- true 应触发，false 不应触发

**示例：**

```java
boolean shouldFire = shortXService.shouldFireEdgeGesture(10, 500);
```

## 屏幕手势

### fireScreenGesture()

触发屏幕手势。

```java
void fireScreenGesture(int x, int y, int direction)
```

**参数：**
- `x` - X 坐标
- `y` - Y 坐标
- `direction` - 方向

**示例：**

```java
// 从 (100, 100) 向右滑动
shortXService.fireScreenGesture(100, 100, DIRECTION_RIGHT);
```

### shouldFireScreenGesture()

检查是否应触发屏幕手势。

```java
boolean shouldFireScreenGesture(int x, int y, int direction)
```

**参数：**
- `x` - X 坐标
- `y` - Y 坐标
- `direction` - 方向

**返回：**
- true 应触发，false 不应触发

**示例：**

```java
boolean shouldFire = shortXService.shouldFireScreenGesture(
    100, 100, DIRECTION_RIGHT
);
```

## 手势设置

### 手势区域大小

```java
// 设置手势区域大小
shortXService.setGestureAreaSize(50);

// 获取手势区域大小
int size = shortXService.getGestureAreaSize();
```

### 滑动阈值

```java
// 设置滑动距离阈值（dp）
shortXService.setSwipeDistanceThresholdDp(100);

// 获取滑动距离阈值
int threshold = shortXService.getSwipeDistanceThresholdDp();
```

### 滑动长度比例

```java
// 设置滑动长度比例
shortXService.setSwipeLengthScale(1.5f);

// 获取滑动长度比例
float scale = shortXService.getSwipeLengthScale();
```

## 手势设置监听

### registerGestureSettingsListener()

注册手势设置监听器。

```java
void registerGestureSettingsListener(ICallback callback)
```

**参数：**
- `callback` - 回调接口

**示例：**

```java
shortXService.registerGestureSettingsListener(
    new ICallback.Stub() {
        @Override
        public void onCallback(String data) {
            Log.d("ShortX", "Gesture settings changed");
        }
    }
);
```

### unregisterGestureSettingsListener()

注销手势设置监听器。

```java
void unregisterGestureSettingsListener(ICallback callback)
```

## 记录器状态监听

### registerRecorderStateListener()

注册记录器状态监听器。

```java
void registerRecorderStateListener(ICallback callback)
```

**参数：**
- `callback` - 回调接口

**示例：**

```java
shortXService.registerRecorderStateListener(
    new ICallback.Stub() {
        @Override
        public void onCallback(String state) {
            Log.d("ShortX", "Recorder state: " + state);
        }
    }
);
```

### unregisterRecorderStateListener()

注销记录器状态监听器。

```java
void unregisterRecorderStateListener(ICallback callback)
```

## 使用场景

### 1. 录制自定义手势

```java
// 开始录制
shortXService.startGestureRecording();

// 用户执行手势...

// 停止并保存
shortXService.stopGestureRecording(true);
```

### 2. 执行预定义手势

```java
// 执行向右滑动手势
SynchronousResultReceiver receiver = new SynchronousResultReceiver();
shortXService.injectGestureRecord("swipe-right", 1.0f, receiver);
```

### 3. 边缘手势触发

```json
{
  "facts": [{
    "@type": "type.googleapis.com/EdgeGesture",
    "record": {
      "direction": "left",
      "position": "bottom"
    }
  }],
  "actions": [{
    "@type": "type.googleapis.com/ShowToast",
    "message": "左边缘手势触发"
  }]
}
```

### 4. 自动化操作

```javascript
// 在脚本中执行手势
{
  "@type": "type.googleapis.com/ExecuteJS",
  "expression": `
    // 注入手势
    shortx.injectGestureRecord('unlock-gesture', 1.0);
    
    // 等待完成
    sleep(1000);
    
    // 继续其他操作
  `
}
```

## 最佳实践

1. **合理设置速度**：根据实际需求调整手势执行速度
2. **错误处理**：检查手势执行结果
3. **避免冲突**：确保手势不会与系统手势冲突
4. **测试验证**：在不同设备上测试手势兼容性
5. **用户体验**：提供清晰的手势录制指引

## 相关 API

- [事件系统](/guide/events) - 手势事件
- [规则管理](/api/rules) - 手势触发规则
- [动作管理](/api/actions) - 手势动作
