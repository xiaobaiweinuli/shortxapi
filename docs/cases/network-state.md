# 高级案例：网络状态

网络状态适合作为自动规则条件，也适合做诊断面板。它不适合在规则中频繁强制修改热点、共享或无线 ADB。

## 推荐链路

```text
网络相关触发器或一键指令
  -> 读取当前网络 / Wi-Fi 信息
  -> JS 整理成文本或 JSON
  -> MatchJS 判断
  -> 执行动作
```

## 当前网络类型

底层诊断路径可以通过 telephony 服务读取移动网络类型：

```javascript
com.android.internal.telephony.ITelephony.Stub
    .asInterface(android.os.ServiceManager.getService("phone"))
    .getDataNetworkType("android", "");
```

这是底层服务路径，适合诊断和高级规则。普通“Wi-Fi 已连接/断开”优先用 ShortX 触发器和上下文变量。

## Wi-Fi 信息

Wi-Fi 信息的底层读取形态：

```javascript
android.os.ServiceManager.getService("wifi").getConnectionInfo("android", null);
```

也有通过 Android manager 触发扫描：

```javascript
context.getSystemService("wifi").startScan();
```

以及通过 ShortX 内部服务读取扫描结果：

```javascript
Packages.tornaco.apps.shortx.core.OooO0O0.OooO00o().getWifiScanResults();
```

选择路径时按需求判断：

- 只判断连接状态：优先触发器或 Android manager。
- 读取 ShortX 已封装扫描结果：可用内部服务。
- 直接 ServiceManager：用于底层诊断，注意版本差异。

## 输出给规则

如果只是给用户看：

```javascript
var resultText = String(android.os.ServiceManager.getService("wifi").getConnectionInfo("android", null));
resultText;
```

如果下游要判断，建议输出 JSON：

```javascript
var output = {
    source: "wifi",
    value: String(android.os.ServiceManager.getService("wifi").getConnectionInfo("android", null))
};

JSON.stringify(output);
```

## 风险

- Wi-Fi 扫描可能被系统节流。
- SSID/BSSID 属于位置相关敏感信息。
- 热点、共享、无线 ADB 属于高级或危险能力。
- 网络状态变化频繁，自动规则要做去抖或去重。
