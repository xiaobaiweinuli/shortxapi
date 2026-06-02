# 用户限制与组策略

Android 组策略管理器导出把大量 `UserManager` 限制整理成可切换 UI，例如禁止安装应用、禁止配置 VPN、禁止添加用户、禁止截屏、禁止开发者选项等。它的价值不是“复制所有限制名”，而是理解用户限制的读写模型和风险边界。

## 基本模型

用户限制由 `user` 系统服务管理：

```javascript
var userServiceValue = android.os.ServiceManager.getService("user");
var restrictionsValue = userServiceValue.getUserRestrictions(0);

restrictionsValue.getBoolean("no_install_apps");
```

写入限制：

```javascript
var userServiceValue = android.os.ServiceManager.getService("user");
var restrictionKeyValue = "no_install_apps";
var targetUserIdValue = 0;
var restrictedValue = true;

userServiceValue.setUserRestriction(
    restrictionKeyValue,
    restrictedValue,
    targetUserIdValue
);

restrictionKeyValue + ": " + restrictedValue;
```

这里 `restrictedValue = true` 表示启用限制，也就是“禁止某能力”。不要把它误写成“功能可用”。

## 常见限制类别

| 类别 | 示例 |
| --- | --- |
| 网络 | `no_config_wifi`、`no_config_vpn`、`no_airplane_mode` |
| 应用 | `no_install_apps`、`no_uninstall_apps`、`no_control_apps` |
| 用户 | `no_add_user`、`no_remove_user`、`no_user_switch` |
| 隐私 | `no_share_location`、`disallow_camera_toggle`、`disallow_microphone_toggle` |
| 系统 | `no_factory_reset`、`no_safe_boot`、`no_debugging_features` |

限制项需要按 Android API 等级过滤。教程里也应注明最低系统版本，不要让低版本设备执行不存在的限制名。

## 动作链设计

推荐链路：

```text
生成限制项 JSON
  -> 读取当前用户限制，补 selected
  -> ShowListDialog 展示
  -> 用户切换
  -> setUserRestriction
  -> 重新读取确认
```

不要只写一个“设置限制”的脚本。用户限制会影响设备可用性，必须让用户看到当前状态和目标状态。

## 选择目标用户

多用户设备、工作资料和私密空间都可能有不同限制。发布工具时要明确：

- 当前只操作用户 0，还是支持选择用户。
- 限制对主用户、工作资料、克隆用户是否生效。
- 是否提供解除同一限制的入口。

如果上游提供用户 ID，用安全变量名读取：

```javascript
var targetUserIdValue = parseInt(String(selectedUserId), 10);
targetUserIdValue;
```

不要声明 `userId`，它是常见 ShortX 上下文保留名。

## 恢复策略

高风险限制必须配恢复入口：

| 限制 | 恢复建议 |
| --- | --- |
| 禁止安装/卸载应用 | 保留解除限制按钮 |
| 禁止开发者选项 | 写入前二次确认 |
| 禁止恢复出厂设置 | 在发布说明里标明风险 |
| 禁止配置网络/VPN | 输出当前状态和目标用户 |
| 禁止添加/切换用户 | 不要批量启用 |

如果限制导致用户无法进入 ShortX 或目标设置页，恢复会变困难。因此组策略类工具要优先做“人工选择 + 二次确认 + 结果复核”。

## 文档边界

本站不把所有官方限制名复制成索引页。完整限制名会随 Android 版本变化，应从 Android 文档、当前系统 API 和最小验证结果查证。文档重点是读写模型、用户语义和风险控制。
