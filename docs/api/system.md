# 系统集成 API

系统集成 API 提供系统级功能和设置。

## Shell 命令

### executeShellCommand()

执行 Shell 命令。

```java
void executeShellCommand(String command, ICallback callback)
```

**参数：**
- `command` - Shell 命令
- `callback` - 回调接口

**示例：**

```java
shortXService.executeShellCommand(
    "pm list packages",
    new ICallback.Stub() {
        @Override
        public void onCallback(String result) {
            Log.d("ShortX", "Packages: " + result);
        }
    }
);
```

### handleShellCommand()

处理 Shell 命令（带文件描述符）。

```java
void handleShellCommand(
    ParcelFileDescriptor in,
    ParcelFileDescriptor out,
    ParcelFileDescriptor err,
    String[] args
)
```

## 系统操作

### reboot()

重启设备。

```java
void reboot(String reason)
```

**参数：**
- `reason` - 重启原因

**示例：**

```java
// 普通重启
shortXService.reboot(null);

// 重启到恢复模式
shortXService.reboot("recovery");

// 重启到 bootloader
shortXService.reboot("bootloader");
```

### crashSystemServer()

崩溃系统服务器（测试用）。

```java
void crashSystemServer()
```

**警告：** 仅用于测试，会导致系统重启。

## APK 安装

### installApk()

安装 APK 文件。

```java
void installApk(
    String path,
    ParcelFileDescriptor fd,
    ICallback successCallback,
    ICallback errorCallback
)
```

**参数：**
- `path` - APK 文件路径
- `fd` - 文件描述符
- `successCallback` - 成功回调
- `errorCallback` - 错误回调

**示例：**

```java
shortXService.installApk(
    "/sdcard/app.apk",
    null,
    new ICallback.Stub() {
        @Override
        public void onCallback(String result) {
            Log.d("ShortX", "安装成功");
        }
    },
    new ICallback.Stub() {
        @Override
        public void onCallback(String error) {
            Log.e("ShortX", "安装失败: " + error);
        }
    }
);
```

## 屏幕信息

### getScreenSize()

获取屏幕大小。

```java
Point getScreenSize()
```

**返回：**
- 屏幕尺寸（宽度和高度）

**示例：**

```java
Point size = shortXService.getScreenSize();
Log.d("ShortX", "Screen: " + size.x + "x" + size.y);
```

## 系统环境

### getAllSystemEnv()

获取所有系统环境变量。

```java
Map<String, String> getAllSystemEnv()
```

**返回：**
- 环境变量映射

**示例：**

```java
Map<String, String> env = shortXService.getAllSystemEnv();
for (Map.Entry<String, String> entry : env.entrySet()) {
    Log.d("ShortX", entry.getKey() + "=" + entry.getValue());
}
```

## 目录管理

### getShortXServerDirs()

获取 ShortX 服务器目录。

```java
List<String> getShortXServerDirs()
```

**返回：**
- 目录路径列表

**示例：**

```java
List<String> dirs = shortXService.getShortXServerDirs();
for (String dir : dirs) {
    Log.d("ShortX", "Dir: " + dir);
}
```

### getLogDir()

获取日志目录。

```java
String getLogDir()
```

**返回：**
- 日志目录路径

**示例：**

```java
String logDir = shortXService.getLogDir();
```

## 日志管理

### 日志启用

```java
// 启用调试日志
shortXService.setLogDebugEnable(true);

// 检查状态
boolean enabled = shortXService.isLogDebugEnable();
```

### JavaScript 日志

```java
// 获取 JS 日志文件描述符
ParcelFileDescriptor jsFd = shortXService.getJSLogFD();

// 获取 JS 日志路径
String jsLogPath = shortXService.getJSLogPath();

// 清除 JS 日志
shortXService.clearJSLogs();
```

### 方法钩子日志

```java
// 获取方法钩子日志文件描述符
ParcelFileDescriptor hookFd = shortXService.getMethodHookLogFD();

// 获取方法钩子日志路径
String hookLogPath = shortXService.getMethodHookLogPath();

// 清除方法钩子日志
shortXService.clearMethodHookLogs();
```

### 写入日志

```java
// 写入日志到文件描述符
ParcelFileDescriptor fd = // 获取文件描述符
shortXService.writeLogsTo(fd);
```

### 记录日志

```java
// 记录日志消息
shortXService.log("TAG", "Log message");
```

## 音频管理

### 音量控制

```java
// 获取音频流最大音量
int maxVolume = shortXService.getStreamMaxVolume(
    AudioManager.STREAM_MUSIC
);

// 获取音频流最小音量
int minVolume = shortXService.getStreamMinVolume(
    AudioManager.STREAM_MUSIC
);

// 获取当前音量
int currentVolume = shortXService.getStreamVolume(
    AudioManager.STREAM_MUSIC
);
```

### 铃声管理

```java
// 获取所有铃声
List<Ringtone> ringtones = shortXService.getAllRingtones();
```

## QS Tile 管理

### getAllQSTiles()

获取所有快速设置 Tile。

```java
List<QSTile> getAllQSTiles()
```

**返回：**
- QS Tile 列表

**示例：**

```java
List<QSTile> tiles = shortXService.getAllQSTiles();
```

### updateQSTileActiveState()

更新 QS Tile 活跃状态。

```java
void updateQSTileActiveState(int state)
```

**参数：**
- `state` - 状态值

**示例：**

```java
shortXService.updateQSTileActiveState(Tile.STATE_ACTIVE);
```

### QS Tile 优化

```java
// 启用 QS Tile 优化
shortXService.setQSTileOptEnabled(true);

// 检查状态
boolean enabled = shortXService.isQSTileOptEnabled();
```

## 设置捕获

### 启用设置捕获

```java
// 启用设置捕获
shortXService.setSettingsCatcherEnabled(true);

// 检查状态
boolean enabled = shortXService.isSettingsCatcherEnabled();
```

### 读取设置记录

```java
// 获取读取设置记录
List<SettingsRecord> readRecords = 
    shortXService.getReadSettingsRecord();

// 清除读取设置记录
shortXService.clearReadSettingsRecord();
```

### 写入设置记录

```java
// 获取写入设置记录
List<SettingsRecord> writeRecords = 
    shortXService.getWriteSettingsRecord();

// 清除写入设置记录
shortXService.clearWriteSettingsRecord();
```

### 设置回调

```java
// 读取设置回调
shortXService.onReadSettings(String key, String value);

// 写入设置回调
shortXService.onWriteSettings(String key, String value);
```

## 指针位置

```java
// 启用指针位置
shortXService.setPointerLocationEnabled(true);

// 检查状态
boolean enabled = shortXService.isPointerLocationEnabled();
```

## 按键事件

### 按键检测

```java
// 设置按键长按超时（毫秒）
shortXService.setKeyDetectorLongPressTimeoutMS(500L);

// 获取按键长按超时
long timeout = shortXService.getKeyDetectorLongPressTimeoutMS();
```

### 按键事件提示

```java
// 启用按键事件提示
shortXService.setKeyEventPromptEnabled(true);

// 检查状态
boolean enabled = shortXService.isKeyEventPromptEnabled();
```

## 应用功能

### 功能启用

```java
// 启用应用功能
shortXService.setAppFeatureEnabled(featureId, true);

// 检查功能状态
boolean enabled = shortXService.isAppFeatureEnabled(featureId);
```

## 版本信息

### version()

获取版本号。

```java
String version()
```

**返回：**
- 版本字符串

**示例：**

```java
String version = shortXService.version();
Log.d("ShortX", "Version: " + version);
```

### versionCode()

获取版本代码。

```java
String versionCode()
```

**返回：**
- 版本代码字符串

**示例：**

```java
String versionCode = shortXService.versionCode();
```

### fingerprint()

获取服务指纹。

```java
String fingerprint()
```

**返回：**
- 指纹字符串

**示例：**

```java
String fingerprint = shortXService.fingerprint();
```

## 错误处理

### 致命错误

```java
// 检查是否有致命错误
boolean hasFatalError = shortXService.hasFatalError();

// 报告致命错误
shortXService.reportFATALError("Error description");
```

### 未捕获异常

```java
// 处理未捕获异常
shortXService.uncaughtException("Exception details");
```

## 使用场景

### 1. 系统信息收集

```java
// 收集系统信息
Map<String, String> systemInfo = new HashMap<>();
systemInfo.put("version", shortXService.version());
systemInfo.put("screen", shortXService.getScreenSize().toString());
systemInfo.put("logDir", shortXService.getLogDir());
```

### 2. 自动化安装

```java
// 自动安装 APK
shortXService.installApk(
    apkPath,
    null,
    successCallback,
    errorCallback
);
```

### 3. 系统监控

```java
// 监控系统设置变化
shortXService.setSettingsCatcherEnabled(true);
List<SettingsRecord> records = shortXService.getReadSettingsRecord();
```

### 4. 日志分析

```java
// 收集日志
ParcelFileDescriptor logFd = shortXService.getJSLogFD();
// 分析日志内容
```

## 最佳实践

1. **权限管理**：确保有必要的系统权限
2. **错误处理**：捕获并处理异常
3. **资源清理**：及时关闭文件描述符
4. **安全考虑**：谨慎使用系统级操作
5. **日志记录**：记录重要操作

## 相关 API

- [规则管理](/api/rules) - 系统事件触发规则
- [动作管理](/api/actions) - 系统操作动作
- [设备管理](/api/devices) - 设备信息查询
