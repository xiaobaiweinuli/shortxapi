# 上下文变量速查

这页用于写规则时快速确认变量来源和命名禁区。完整变量以 ShortX 页面可复制的上下文变量和当前动作链为准。

## 使用方式

动作参数中使用占位符：

```text
{contentText}
{jsRet}
{selectedListItem}
```

JS/MVEL 中读取运行时变量：

```javascript
var contentValue = contentText == null ? "" : String(contentText);
contentValue;
```

读取可以，声明同名局部变量不可以。

## 高频变量

| 来源 | 变量 | 常见用途 |
| --- | --- | --- |
| `ExecuteJS` | `jsRet` | JS 默认输出 |
| `ExecuteMVEL` | `mvelRet` | MVEL 默认输出 |
| 通知 | `pkgName`、`userId`、`title`、`contentText`、`notificationTag` | 通知过滤、验证码提取、通知清理 |
| 应用前后台 | `pkgName`、`userId`、`appLabel` | 应用状态规则、应用集判断 |
| Activity / Task | `componentName`、`activityIntentUri`、`taskId`、`taskLabel` | 组件跳转、任务处理 |
| 对话框 | `selectedListItem`、`choices`、`textFieldInput` | 交互选择、输入后处理 |
| HTTP / Shell / OCR | `httpRequestRet`、`shellOut`、`ocrResult` | 请求解析、命令输出、识别文本 |
| 剪贴板 | `clipboardContent` | 文本清洗、剪贴板规则 |
| 正则文本 | `isMatch`、`matchResult`、`replaceResult`、`textProcessResult` | 文本提取和替换 |
| 循环 | `foreachIndex`、`foreachData` | 批量处理 |
| 应用集循环 | `loopAppLabel`、`loopAppPkgName`、`loopAppUserId` | 批量应用处理 |
| 截图 / 图像 | `screenshotFilePath`、`screenshotFileUri`、`pointX`、`pointY`、`isImageFound` | 截图、找图、OCR |
| 节点 | `textOfTheView`、`matchedViewText`、`sourceNodeId`、`windowId` | 无障碍节点处理 |

## 触发器变量族

| 触发器族 | 典型变量 |
| --- | --- |
| App 安装/删除/更新 | `pkgName`、`userId`、`label`、`fromVersionCode`、`toVersionCode` |
| App 进程 | `processName`、`appLabel`、`userId`、`pkgName` |
| 通知 | `userId`、`pkgName`、`title`、`contentText`、`notificationTag` |
| 音频焦点 | `userId`、`pkgName`、`isGain`、`isLost` |
| Wi-Fi | `ssid`、`isWifiEnabled`、`wifiStatusLabel`、`rssi`、`level` |
| 蓝牙 | `btDeviceAlias`、`btDeviceAddress`、`btDeviceBatteryLevel` |
| 电量/温度 | `batteryLevel`、`batteryTemperature` |
| 系统设置变化 | `settingsUrl`、`settingsValue` |
| 广播 | `intent` |
| 按键 | `keyCode`、`pressTimes` |
| 手势 | `eventX`、`eventY` |
| 传感器 | `accX`、`accY`、`accZ`、`lightIntensity`、`distance`、`decibels` |

## 禁止声明的名字

不要在 JS/MVEL 中声明这些名字，也不要用作函数参数或循环变量：

```text
jsRet, mvelRet, selectedListItem, shellOut, httpRequestRet, ocrResult,
pkgName, userId, title, contentText, taskId, textFieldInput, choices,
clipboardContent, selectedText, matchResult, replaceResult
```

以及当前链路中任何上游输出和 `customContextDataKey` 产生的新名字。

## 推荐临时名

```text
result, output, resultText, finalText, rows, items, dataList,
parsed, contentValue, taskIdValue, notificationTitleText,
dialogTitleText, packageNameValue
```

这些名字没有特殊含义，只是更不容易和 ShortX 上下文变量冲突。

