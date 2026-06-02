# 高级案例：AppOps 与权限状态

AppOps 是 Android 对应用操作的细粒度控制和记录机制。它和运行时权限相关，但不是同一个概念。权限允许某个能力，AppOps 决定某个具体操作是否允许、忽略、记录或被限制。

## 什么时候看 AppOps

适合查看 AppOps 的场景：

- 判断应用是否被允许执行某类操作。
- 理解隐私访问记录。
- 解释为什么权限看似存在但操作仍失败。
- 做高级诊断，而不是普通规则条件。

常见例子：

| 现象 | 可能原因 |
| --- | --- |
| 应用有定位权限但拿不到定位 | AppOps 或后台策略限制 |
| 悬浮窗权限看似开启但创建失败 | AppOps、窗口类型或 ROM 策略限制 |
| 通知监听正常但清理失败 | 通知策略、用户空间或服务状态影响 |
| 工作资料应用状态异常 | `userId` 与主用户不同 |

## 诊断链路

```text
输入包名
  -> 查 packageInfo / uid
  -> 查目标 op 状态
  -> 输出诊断 JSON
  -> 用户决定是否手动处理
```

包名变量建议写成：

```javascript
var packageNameValue = "com.example.app";
packageNameValue;
```

不要写 `var pkgName = ...`。`pkgName` 是常见上下文名。

## 与权限的区别

| 项目 | 说明 |
| --- | --- |
| Runtime permission | 用户或系统授予的权限 |
| AppOps mode | 某个具体操作的允许、忽略、错误等模式 |
| Permission manager | 权限授予、撤销和策略 |
| AppOps active/noted | 操作是否正在发生或被记录 |

一个能力失败，可能是权限问题，也可能是 AppOps、用户限制、后台策略或 ROM 限制。

## 输出诊断结果

诊断类页面建议输出 JSON，而不是只输出“允许/不允许”：

```javascript
var outputObj = {
    packageName: packageNameValue,
    userId: 0,
    permissionGranted: false,
    appOpMode: "",
    note: "先确认包名和用户空间，再判断 AppOps"
};

JSON.stringify(outputObj, null, 2);
```

如果包名来自上游对话框，先解析 `selectedListItem`，再改名为 `SelectedPackageName` 交给下一步。

## 写入边界

AppOps 写入属于高风险能力。教程不应默认给“批量设置允许/拒绝”的一键脚本。若确实要做，应拆成：

```text
读取当前 mode
  -> 展示目标 op、包名、userId、旧值和新值
  -> 二次确认
  -> 写入
  -> 再次读取确认
  -> 提供恢复旧值动作
```

## 风险

- AppOps 写入可能影响隐私、安全和后台行为。
- 重置模式可能破坏用户自定义设置。
- 历史记录和活跃状态可能包含敏感行为信息。
- 分享规则时不要默认批量修改其他应用的 AppOps。
