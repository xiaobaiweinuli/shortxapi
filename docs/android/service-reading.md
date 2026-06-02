# Android 服务阅读方法

Android 服务页的目标不是列出所有系统接口，而是帮助你判断某个系统能力在 ShortX 里应该走哪条路径。多数场景应优先使用动作链、公共脚本 API 或 `shortx.executeAction(...)`，只有这些入口无法覆盖时，才考虑 Android manager API 或 Binder/AIDL。

## 阅读目标

阅读服务页时先回答四个问题：

| 问题 | 为什么重要 |
| --- | --- |
| 能力属于哪个服务族 | 先确定是通知、输入、显示、网络、权限还是调度问题 |
| 是否已有 ShortX 动作 | 有动作就优先走动作链，减少脚本风险 |
| 是否只是读取状态 | 读取和写入的风险完全不同 |
| 失败后如何恢复 | 修改系统状态前必须有回滚或提示 |

## 阅读顺序

1. 先确认能力属于哪类服务：通知、输入、显示、网络、音频、应用、权限、任务调度等。
2. 再确认 ShortX 是否已有内置动作、触发器、条件或公共 API。
3. 如果必须写脚本，优先使用 Android manager API，例如 `context.getSystemService(...)`。
4. 只有 manager API 不够时，才进入 Binder/AIDL 层，并单独评估权限、参数和版本差异。

## 不要直接照抄 AIDL

AIDL 方法签名只说明“服务可能有什么方法”，不等于 ShortX 脚本中应该直接调用它。

需要额外判断：

- 这个方法是否有公开 Android manager API。
- ShortX 是否已有 proto action 或内部服务封装。
- 参数是否需要 Binder token、listener、callback、UserHandle、AttributionSource。
- 调用是否会改变系统长期状态。
- 失败时是否会影响 system_server 或当前设备状态。

## 入口选择

```text
ShortX 内置动作/触发器
  -> shortx.* 公共脚本 API
  -> shortx.executeAction(proto action)
  -> Android manager API
  -> Binder/AIDL
```

越往后越接近系统实现细节，也越容易受 Android 版本、ROM、权限和调用身份影响。写教程或发布规则时，应说明为什么不能使用更上层入口。

## 常见服务族

| 服务族 | 适合写成教程的方向 |
| --- | --- |
| Notification | 通知读取、取消、渠道、监听器、DND/Zen、权限状态 |
| Input | 按键、输入设备、输入事件注入、鼠标/触摸配置 |
| Display | 显示信息、刷新率、亮度、Wi-Fi display、显示状态 |
| AppOps/Permission | 权限、AppOps、授权状态、隐私限制 |
| Jobscheduler/Alarm | 定时、任务、pending job、系统调度 |
| Connectivity/Wifi | 网络状态、Wi-Fi 信息、热点、共享、扫描 |
| Audio | 音量、音频焦点、录音状态、流配置 |

## 与 ShortX 的关系

Android 服务页回答“系统层有什么能力”。落到 ShortX 规则时，还必须回答：

- 这个能力在 ShortX 动作链里用什么入口最合适。
- 结果如何进入 `jsRet`、`mvelRet` 或命名上下文。
- 是否需要全局变量保存状态。
- 是否应归类为高级或危险。

## 实战判断示例

| 需求 | 推荐思路 |
| --- | --- |
| 收到验证码后复制 | 通知触发器 -> JS/MVEL 提取 -> 剪贴板 |
| 判断 Wi-Fi 或网络状态 | 先查 ShortX 是否有状态动作，再考虑 `ConnectivityManager` |
| 调整刷新率或亮度 | 使用系统设置/显示相关动作，写入前准备恢复值 |
| 查询某应用权限状态 | 先区分权限、AppOps、用户限制，再选择服务族 |
| 注入输入事件 | 属于高风险能力，需要页面校验、超时和失败输出 |

## 发布前说明

凡是涉及系统状态写入、监听器注册、callback、直接 Binder 或多用户参数的教程，都要在页面中说明：

- 支持的 Android 版本或前提。
- 会修改什么状态。
- 如何恢复到修改前。
- 失败时下游动作应该读哪个输出。
