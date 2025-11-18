# 设备管理 API

设备管理 API 用于管理应用、组件和系统设备。

## 应用管理

### getInstalledApps()

获取已安装的应用列表。

```java
List<AppInfo> getInstalledApps()
```

**返回：**
- 应用信息列表

**示例：**

```java
List<AppInfo> apps = shortXService.getInstalledApps();
for (AppInfo app : apps) {
    Log.d("ShortX", app.getPackageName() + ": " + app.getLabel());
}
```

### getAppIcon()

获取应用图标。

```java
Bitmap getAppIcon(String packageName, int userId)
```

**参数：**
- `packageName` - 应用包名
- `userId` - 用户 ID

**返回：**
- 应用图标 Bitmap

**示例：**

```java
Bitmap icon = shortXService.getAppIcon("com.example.app", 0);
```

### getAppLabel()

获取应用标签。

```java
String getAppLabel(ByteArrayWrapper appWrapper)
```

**参数：**
- `appWrapper` - 序列化的应用信息

**返回：**
- 应用标签字符串

**示例：**

```java
String label = shortXService.getAppLabel(appWrapper);
```

## 组件管理

### getActivities()

获取应用的活动组件。

```java
List<ActivityInfo> getActivities(int userId, String packageName)
```

**参数：**
- `userId` - 用户 ID
- `packageName` - 应用包名

**返回：**
- 活动组件列表

**示例：**

```java
List<ActivityInfo> activities = 
    shortXService.getActivities(0, "com.example.app");
```

### getServices()

获取应用的服务组件。

```java
List<ServiceInfo> getServices(int userId, String packageName)
```

**参数：**
- `userId` - 用户 ID
- `packageName` - 应用包名

**返回：**
- 服务组件列表

**示例：**

```java
List<ServiceInfo> services = 
    shortXService.getServices(0, "com.example.app");
```

### getReceivers()

获取应用的接收器组件。

```java
List<ReceiverInfo> getReceivers(int userId, String packageName)
```

**参数：**
- `userId` - 用户 ID
- `packageName` - 应用包名

**返回：**
- 接收器组件列表

**示例：**

```java
List<ReceiverInfo> receivers = 
    shortXService.getReceivers(0, "com.example.app");
```

### getProviders()

获取应用的内容提供者组件。

```java
List<ProviderInfo> getProviders(int userId, String packageName)
```

**参数：**
- `userId` - 用户 ID
- `packageName` - 应用包名

**返回：**
- 内容提供者列表

**示例：**

```java
List<ProviderInfo> providers = 
    shortXService.getProviders(0, "com.example.app");
```

## 组件状态

### getComponentEnabledSetting()

获取组件启用状态。

```java
int getComponentEnabledSetting(ByteArrayWrapper componentWrapper)
```

**参数：**
- `componentWrapper` - 序列化的组件信息

**返回：**
- 组件状态值

**示例：**

```java
int state = shortXService.getComponentEnabledSetting(componentWrapper);
```

### setComponentEnabledSetting()

设置组件启用状态。

```java
void setComponentEnabledSetting(
    ByteArrayWrapper componentWrapper,
    int newState,
    int flags
)
```

**参数：**
- `componentWrapper` - 序列化的组件信息
- `newState` - 新状态
- `flags` - 标志位

**示例：**

```java
// 启用组件
shortXService.setComponentEnabledSetting(
    componentWrapper,
    PackageManager.COMPONENT_ENABLED_STATE_ENABLED,
    PackageManager.DONT_KILL_APP
);

// 禁用组件
shortXService.setComponentEnabledSetting(
    componentWrapper,
    PackageManager.COMPONENT_ENABLED_STATE_DISABLED,
    PackageManager.DONT_KILL_APP
);
```

## 运行状态

### getRunningAppPkgs()

获取正在运行的应用包名。

```java
List<String> getRunningAppPkgs(String filter)
```

**参数：**
- `filter` - 过滤条件（可选）

**返回：**
- 包名列表

**示例：**

```java
List<String> runningApps = shortXService.getRunningAppPkgs(null);
for (String pkg : runningApps) {
    Log.d("ShortX", "Running: " + pkg);
}
```

### getRunningServices()

获取正在运行的服务。

```java
List<ServiceInfo> getRunningServices(ByteArrayWrapper queryWrapper)
```

**参数：**
- `queryWrapper` - 序列化的查询条件

**返回：**
- 服务信息列表

**示例：**

```java
List<ServiceInfo> services = shortXService.getRunningServices(queryWrapper);
```

## 蓝牙设备

### getBTBondedDevices()

获取已配对的蓝牙设备。

```java
List<BluetoothDevice> getBTBondedDevices()
```

**返回：**
- 蓝牙设备列表

**示例：**

```java
List<BluetoothDevice> devices = shortXService.getBTBondedDevices();
for (BluetoothDevice device : devices) {
    Log.d("ShortX", device.getName() + ": " + device.getAddress());
}
```

## WiFi 管理

### getWifiScanResults()

获取 WiFi 扫描结果。

```java
List<ScanResult> getWifiScanResults()
```

**返回：**
- WiFi 扫描结果列表

**示例：**

```java
List<ScanResult> results = shortXService.getWifiScanResults();
for (ScanResult result : results) {
    Log.d("ShortX", result.SSID + ": " + result.level);
}
```

### getPrivilegedConfiguredNetworks()

获取特权配置的网络。

```java
List<WifiConfiguration> getPrivilegedConfiguredNetworks()
```

**返回：**
- WiFi 配置列表

**示例：**

```java
List<WifiConfiguration> configs = 
    shortXService.getPrivilegedConfiguredNetworks();
```

### getMaxSignalLevel()

获取最大信号水平。

```java
int getMaxSignalLevel()
```

**返回：**
- 最大信号水平值

**示例：**

```java
int maxLevel = shortXService.getMaxSignalLevel();
```

## SIM 卡管理

### getActiveSubscriptionInfoList()

获取活跃的 SIM 卡订阅信息。

```java
List<SubscriptionInfo> getActiveSubscriptionInfoList()
```

**返回：**
- 订阅信息列表

**示例：**

```java
List<SubscriptionInfo> subs = 
    shortXService.getActiveSubscriptionInfoList();
for (SubscriptionInfo sub : subs) {
    Log.d("ShortX", "SIM: " + sub.getDisplayName());
}
```

## 用户管理

### getAllUsers()

获取所有用户。

```java
List<UserInfo> getAllUsers()
```

**返回：**
- 用户信息列表

**示例：**

```java
List<UserInfo> users = shortXService.getAllUsers();
for (UserInfo user : users) {
    Log.d("ShortX", "User: " + user.name + " (ID: " + user.id + ")");
}
```

## 快捷方式

### getInstalledShortcutApps()

获取已安装快捷方式的应用。

```java
List<AppInfo> getInstalledShortcutApps()
```

**返回：**
- 应用信息列表

**示例：**

```java
List<AppInfo> apps = shortXService.getInstalledShortcutApps();
```

### getRequestPinShortcuts()

获取请求固定的快捷方式。

```java
List<ShortcutInfo> getRequestPinShortcuts()
```

**返回：**
- 快捷方式信息列表

**示例：**

```java
List<ShortcutInfo> shortcuts = shortXService.getRequestPinShortcuts();
```

### getRequestPinAppWidgets()

获取请求固定的小部件。

```java
List<AppWidgetProviderInfo> getRequestPinAppWidgets()
```

**返回：**
- 小部件信息列表

**示例：**

```java
List<AppWidgetProviderInfo> widgets = 
    shortXService.getRequestPinAppWidgets();
```

## 插件管理

### getInstalledPlugins()

获取已安装的插件。

```java
List<PluginInfo> getInstalledPlugins()
```

**返回：**
- 插件信息列表

**示例：**

```java
List<PluginInfo> plugins = shortXService.getInstalledPlugins();
```

### getInstalledPluginActions()

获取已安装插件的动作。

```java
List<PluginAction> getInstalledPluginActions()
```

**返回：**
- 插件动作列表

**示例：**

```java
List<PluginAction> actions = shortXService.getInstalledPluginActions();
```

### getInstalledPluginConditions()

获取已安装插件的条件。

```java
List<PluginCondition> getInstalledPluginConditions()
```

**返回：**
- 插件条件列表

**示例：**

```java
List<PluginCondition> conditions = 
    shortXService.getInstalledPluginConditions();
```

### getInstalledPluginFacts()

获取已安装插件的事实。

```java
List<PluginFact> getInstalledPluginFacts()
```

**返回：**
- 插件事实列表

**示例：**

```java
List<PluginFact> facts = shortXService.getInstalledPluginFacts();
```

## 应用组件信息

### getAppComponentInfo()

获取应用组件详细信息。

```java
ComponentInfo getAppComponentInfo(ByteArrayWrapper componentWrapper)
```

**参数：**
- `componentWrapper` - 序列化的组件信息

**返回：**
- 组件详细信息

**示例：**

```java
ComponentInfo info = shortXService.getAppComponentInfo(componentWrapper);
```

### pkgToApp()

将包名转换为应用信息。

```java
AppInfo pkgToApp(ByteArrayWrapper pkgWrapper)
```

**参数：**
- `pkgWrapper` - 序列化的包名

**返回：**
- 应用信息

**示例：**

```java
AppInfo app = shortXService.pkgToApp(pkgWrapper);
```

## 使用场景

### 1. 应用启动器

```java
// 获取所有应用
List<AppInfo> apps = shortXService.getInstalledApps();

// 显示应用列表
for (AppInfo app : apps) {
    // 创建启动项
    createLauncherItem(app);
}
```

### 2. 组件管理器

```java
// 禁用不需要的组件
List<ReceiverInfo> receivers = 
    shortXService.getReceivers(0, "com.example.app");

for (ReceiverInfo receiver : receivers) {
    if (shouldDisable(receiver)) {
        shortXService.setComponentEnabledSetting(
            serializeComponent(receiver),
            PackageManager.COMPONENT_ENABLED_STATE_DISABLED,
            0
        );
    }
}
```

### 3. 网络监控

```java
// 扫描 WiFi
List<ScanResult> results = shortXService.getWifiScanResults();

// 找到最强信号
ScanResult best = null;
for (ScanResult result : results) {
    if (best == null || result.level > best.level) {
        best = result;
    }
}
```

### 4. 蓝牙设备管理

```java
// 获取配对设备
List<BluetoothDevice> devices = shortXService.getBTBondedDevices();

// 连接特定设备
for (BluetoothDevice device : devices) {
    if (device.getName().equals("My Device")) {
        connectDevice(device);
        break;
    }
}
```

## 最佳实践

1. **权限检查**：确保有必要的权限
2. **异常处理**：捕获可能的异常
3. **性能优化**：缓存查询结果
4. **用户体验**：提供加载指示
5. **兼容性**：处理不同 Android 版本

## 相关 API

- [规则管理](/api/rules) - 基于设备状态的规则
- [动作管理](/api/actions) - 设备控制动作
- [系统集成](/api/system) - 系统级操作
