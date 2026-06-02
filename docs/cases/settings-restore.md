# 高级案例：设置恢复

设置恢复的重点不是“写一个设置值”，而是记录原值、执行修改、验证结果、提供回滚。

## 基本模式

```text
读取原始状态
  -> 保存快照
  -> 执行修改
  -> 验证结果
  -> 生成恢复动作
```

适合 Settings Provider、导航栏模式、省电模式、传感器状态、显示模式、音量等长期状态。

## Settings Provider 恢复

读取和写入 Settings 前要明确命名空间：

- `Settings.System`
- `Settings.Secure`
- `Settings.Global`

建议保存 JSON 快照：

```javascript
var output = {
    namespace: "Global",
    name: "example_key",
    oldValue: "0",
    newValue: "1"
};

JSON.stringify(output);
```

恢复动作从 `oldValue` 生成，不要靠记忆手写。

## 系统服务状态恢复

直接系统服务调用示例：

```javascript
android.os.ServiceManager.getService("power").setPowerSaveModeEnabled(true);
```

以及导航栏模式：

```javascript
android.os.ServiceManager.getService("statusbar").setNavBarMode(1);
```

这类调用通常会改变用户可感知的系统状态。教程中应同时说明反向操作和原值记录，而不是只给“开启”脚本。

## 恢复菜单

设置监视器类工作流适合输出 JSON 对话框：

```javascript
var items = [
    {
        name: "恢复导航栏模式",
        summary: "把当前模式恢复为快照中的旧值",
        __value: JSON.stringify({
            type: "statusbar-nav",
            oldValue: 0
        })
    }
];

JSON.stringify(items, null, 2);
```

后续解析 `selectedListItem` 并执行恢复。

## 风险

- Settings key 在不同 ROM 上含义可能不同。
- 有些值写入后不会立即生效。
- 有些系统服务调用没有公开稳定 API。
- 修改输入、显示、锁屏、权限、传感器状态前必须确认回滚路径。
- 自动规则不应无确认批量恢复系统设置。

## 发布建议

分享包含设置修改的规则时，必须写明：

- 修改了哪个命名空间或系统服务。
- 原值保存在哪里。
- 如何执行恢复。
- 适用 Android/ROM 前提。
- 失败后如何手动关闭规则。

