# Android 服务能力地图

本页不是接口表，而是给 ShortX 高级使用者的查阅地图。

## 核心系统

| 服务 | 关注点 |
| --- | --- |
| `activity` / `activity_task` | 前台应用、任务、Activity 启停、任务栈 |
| `package` | 安装包、组件、权限、应用信息 |
| `user` | 多用户、UserHandle、跨用户状态 |
| `appops` | 应用操作权限和隐私相关状态 |

## 输入与显示

| 服务 | 关注点 |
| --- | --- |
| `input` | 输入设备、按键、输入事件注入、输入配置 |
| `display` | 显示器、刷新率、显示状态、Wi-Fi Display |
| `window` | 窗口、焦点、布局、系统 UI 交互 |

## 通知与声音

| 服务 | 关注点 |
| --- | --- |
| `notification` | 通知、Toast、渠道、监听器、DND/Zen |
| `audio` | 音量、音频流、音频焦点、录音状态 |
| `media_session` | 媒体会话、播放控制 |

## 网络与设备

| 服务 | 关注点 |
| --- | --- |
| `connectivity` | 网络连接、网络能力、默认网络 |
| `wifi` | Wi-Fi 状态、扫描、连接信息、热点 |
| `bluetooth_manager` | 蓝牙开关、连接设备 |
| `nfc` | NFC 适配器、标签分发 |

## 调度与系统状态

| 服务 | 关注点 |
| --- | --- |
| `jobscheduler` | Job 调度、pending job、执行原因 |
| `alarm` | 闹钟、唤醒、系统时间 |
| `power` | 屏幕、电源、休眠、唤醒 |
| `deviceidle` | Doze、空闲状态 |

## 安全与危险能力

| 服务 | 关注点 |
| --- | --- |
| `lock_settings` | 锁屏凭据、合成密码、恢复机制 |
| `permissionmgr` | 权限授予、权限状态 |
| `device_policy` | 设备策略、管理状态 |
| `adb` | ADB 授权、调试连接 |

这些服务不适合作为入门复制代码。阅读它们时应先明确恢复路径和失败后果。

