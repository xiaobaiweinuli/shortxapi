# API 概览

ShortX 提供了完整的 API 接口，用于管理规则、动作、设备、变量等。

## API 分类

### 规则管理

管理自动化规则的创建、更新、删除和查询。

- [规则管理 API](/api/rules)

**主要方法：**
- `addRule()` - 添加规则
- `updateRule()` - 更新规则
- `deleteRule()` - 删除规则
- `getRuleById()` - 获取规则
- `getAllRules()` - 获取所有规则
- `setRuleEnabled()` - 启用/禁用规则

### 动作管理

管理直接动作和动作集。

- [动作管理 API](/api/actions)

**主要方法：**
- `addDirectAction()` - 添加直接动作
- `executeDirectionActionById()` - 执行动作
- `addOrUpdateDASet()` - 管理动作集
- `executeAction()` - 执行动作
- `executeJS()` - 执行 JavaScript
- `executeMVEL()` - 执行 MVEL

### 设备管理

管理应用、组件和系统设备。

- [设备管理 API](/api/devices)

**主要方法：**
- `getInstalledApps()` - 获取已安装应用
- `getActivities()` - 获取活动组件
- `getServices()` - 获取服务组件
- `setComponentEnabledSetting()` - 设置组件状态
- `getBTBondedDevices()` - 获取蓝牙设备
- `getWifiScanResults()` - 获取 WiFi 扫描结果

### 全局变量

管理跨规则共享的全局变量。

- [全局变量 API](/api/variables)

**主要方法：**
- `addGlobalVar()` - 添加全局变量
- `getGlobalVarByName()` - 获取变量
- `getAllGlobalVars()` - 获取所有变量
- `deleteGlobalVar()` - 删除变量

### 代码库

管理可重用的脚本代码。

- [代码库 API](/api/code-library)

**主要方法：**
- `addCodeLibraryItem()` - 添加代码项
- `updateCodeLibraryItem()` - 更新代码项
- `executeCodeLibraryItem()` - 执行代码项
- `getAllCodeLibraryItems()` - 获取所有代码项
- `deleteCodeLibraryItem()` - 删除代码项

### 手势识别

管理手势录制和识别。

- [手势识别 API](/api/gestures)

**主要方法：**
- `startGestureRecording()` - 开始录制
- `stopGestureRecording()` - 停止录制
- `addGestureRecord()` - 添加手势记录
- `injectGestureRecord()` - 注入手势
- `fireEdgeGesture()` - 触发边缘手势

### 系统集成

系统级功能和设置。

- [系统集成 API](/api/system)

**主要方法：**
- `executeShellCommand()` - 执行 Shell 命令
- `installApk()` - 安装 APK
- `reboot()` - 重启设备
- `getScreenSize()` - 获取屏幕大小
- `getAllSystemEnv()` - 获取系统环境变量

## 数据类型

### ByteArrayWrapper

大多数 API 使用 `ByteArrayWrapper` 传递序列化数据：

```java
// 创建包装器
byte[] data = serializeObject(object);
ByteArrayWrapper wrapper = new ByteArrayWrapper(data);

// 使用 API
shortXService.addRule(wrapper);
```

### 回调接口

异步操作使用回调接口：

```java
// ICallback - 通用回调
shortXService.executeShellCommand(
    "command",
    new ICallback.Stub() {
        @Override
        public void onCallback(String result) {
            // 处理结果
        }
    }
);
```

### 观察者模式

使用观察者监听数据变化：

```java
// 注册观察者
shortXService.registerRuleObs(
    new IRuleObserver.Stub() {
        @Override
        public void onRuleAdded(String ruleId) {
            // 规则添加
        }
        
        @Override
        public void onRuleUpdated(String ruleId) {
            // 规则更新
        }
        
        @Override
        public void onRuleDeleted(String ruleId) {
            // 规则删除
        }
    }
);

// 注销观察者
shortXService.unregisterRuleObs(observer);
```

## 权限要求

不同的 API 需要不同的权限：

### 无障碍服务
- 规则触发
- 手势识别
- 界面操作

### 通知访问
- 通知监听
- 通知处理

### Root 权限
- Shell 命令执行
- 系统文件访问
- 组件状态修改

### 特殊权限
- 悬浮窗权限
- 电池优化白名单
- 自启动权限

## 错误处理

API 调用可能抛出异常，需要适当处理：

```java
try {
    shortXService.addRule(wrapper);
} catch (RemoteException e) {
    Log.e("ShortX", "Failed to add rule", e);
    // 处理错误
}
```

## 线程安全

大多数 API 是线程安全的，但建议：

1. 在主线程调用 UI 相关操作
2. 在后台线程执行耗时操作
3. 使用回调处理异步结果

## 版本兼容性

检查 API 版本：

```java
// 获取版本
String version = shortXService.version();

// 获取版本代码
String versionCode = shortXService.versionCode();
```

## 调试工具

### 日志

```java
// 启用调试日志
shortXService.setLogDebugEnable(true);

// 记录日志
shortXService.log("TAG", "Message");

// 获取日志
ParcelFileDescriptor logFd = shortXService.getJSLogFD();
```

### 转储信息

```java
// 转储调试信息
shortXService.dump(fileDescriptor, args);

// 异步转储
shortXService.dumpAsync(fileDescriptor, args);
```

## 最佳实践

1. **资源管理**：及时释放资源和注销监听器
2. **错误处理**：捕获并处理异常
3. **性能优化**：避免频繁调用 API
4. **权限检查**：在调用前检查必要权限
5. **版本兼容**：检查 API 版本兼容性

## 下一步

选择你感兴趣的 API 分类深入了解：

- [规则管理](/api/rules)
- [动作管理](/api/actions)
- [设备管理](/api/devices)
- [全局变量](/api/variables)
- [代码库](/api/code-library)
- [手势识别](/api/gestures)
- [系统集成](/api/system)
