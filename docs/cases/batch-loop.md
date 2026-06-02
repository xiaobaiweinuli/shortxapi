# 批量循环处理

批量处理是自动规则里很常见的需求：对一个应用集逐个处理、对列表逐项执行、等待一段时间后重试。典型结构是使用 `ForEachPkgSet` 遍历应用集，并在每个包名前加短延迟，再执行单项动作。

## 推荐模型

```text
应用集
  -> ForEachPkgSet
  -> loopAppPkgName / loopAppUserId
  -> Delay
  -> 单项动作
  -> 下一个应用
```

批量流程的重点不是“循环语法”，而是每一项的上下文、节流和失败处理。

## `ForEachPkgSet`

核心结构：

```json
{
  "@type": "type.googleapis.com/ForEachPkgSet",
  "pkgSet": "缓存走开",
  "action": [
    {
      "@type": "type.googleapis.com/Delay",
      "timeString": "300"
    },
    {
      "@type": "type.googleapis.com/ExecuteMVEL",
      "expression": "..."
    }
  ]
}
```

每次循环会把当前应用信息上传到上下文。常见变量包括 `loopAppPkgName`，具体以动作页面和当前导出为准。它们都是上下文名，脚本只能读取，不要声明同名局部变量。

## MVEL 单项处理

真实风格里会直接读取 `{loopAppPkgName}`：

```text
import android.content.Context;
import android.content.pm.PackageManager;

String targetPackageName = {loopAppPkgName};

PackageManager packageManager = context.getPackageManager();
packageManager.deleteApplicationCacheFiles(targetPackageName, null);
```

这里 `targetPackageName` 是本地变量，避免直接声明 `loopAppPkgName`。如果要写 JS，也同样不要 `var loopAppPkgName = ...`。

## 为什么要加 Delay

批量动作不要无节制连续执行。短延迟可以降低：

- 系统服务调用压力。
- 文件系统竞争。
- AppOps、PackageManager、ActivityManager 的瞬时负载。
- 后续日志和通知刷屏。

常见节流值可以从 `Delay 300ms` 起步。具体值应按动作风险调整：读取类动作可以短一些，删除、清理、启动、网络请求类动作应更保守。

## 批量 Shell 清理

`Clean Sweep` 类规则会从黑名单文件读取路径，再逐行处理。设计时建议拆成三步：

```text
ShowTextFieldDialog / 文件配置
  -> 保存黑名单
  -> 预览待处理路径
  -> 人工确认
  -> Shell 执行
  -> shellOut 改名
  -> 弹窗展示结果
```

不要把用户输入直接拼进 Shell 命令。路径列表应先验证：

- 空行跳过。
- `#` 注释跳过。
- 必须在预期目录下。
- 不允许根目录、系统目录或空字符串。
- 删除前先展示数量和路径摘要。

## 输出聚合

批量执行后，推荐输出结构化结果：

```javascript
var rows = [];
rows.push("处理完成");
rows.push("成功: " + String(SuccessCount));
rows.push("失败: " + String(FailedCount));
rows.join("\n");
```

`SuccessCount`、`FailedCount` 如果来自上游自定义输出，也不要声明同名局部变量。更稳的做法是在单个 JS 内部维护本地 `successCountValue`、`failedCountValue`。

## 失败策略

批量处理要提前定义失败策略：

| 策略 | 适合场景 |
| --- | --- |
| 单项失败继续 | 清理缓存、读取信息、批量通知 |
| 单项失败中断 | 写系统设置、迁移配置、删除数据 |
| 先预览再执行 | 文件删除、规则删除、批量写配置 |
| 分批执行 | 大量应用、大量网络请求 |

如果动作会删除文件、禁用组件或修改配置，默认应先预览，不应直接批量执行。

## 检查清单

- 循环变量是否被当作上下文名读取，而不是声明？
- 批量动作之间是否有 Delay 或节流？
- 应用集为空时是否提示？
- 单项失败会继续还是中断？
- 是否有结果汇总？
- 文件删除、配置删除是否先预览并确认？
- 自动规则是否会在高频触发器下重复批量执行？

批量处理的安全性来自边界：目标集合清楚、单项动作清楚、失败策略清楚、输出结果清楚。
