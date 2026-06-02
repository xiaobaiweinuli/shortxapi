# 备份与同步工作流

备份规则通常使用定时触发器执行 `ExportBackup`，把备份路径放在全局变量 `backup_dir`，再根据输出路径判断成功或失败并发送通知。这个案例适合学习“可维护备份”而不是只学习一个动作。

## 推荐链路

```text
启用规则
  -> 创建 backup_dir 全局变量
  -> 弹窗选择默认路径或自定义路径
  -> 写入 backup_dir

定时触发
  -> ExportBackup
  -> backupFilePath 改名 shortx_backup
  -> 判断输出
  -> 成功/失败通知

删除规则
  -> 删除 backup_dir
```

## 初始化路径

规则启用时可以创建 `backup_dir`，然后弹窗让用户选择：

- 默认路径：`/storage/emulated/0/Download/`
- 自定义路径：通过 `ShowTextFieldDialog` 写入。

这种设计比把路径写死在 `ExportBackup` 中更适合迁移。路径是设备相关参数，应放在全局变量或配置项里。

## 执行备份

核心动作：

```json
{
  "@type": "type.googleapis.com/ExportBackup",
  "destDir": "globalVarOf$backup_dir",
  "customContextDataKey": {
    "keys": [{
      "first": "backupFilePath",
      "second": "shortx_backup"
    }]
  }
}
```

这里 `backupFilePath` 是动作输出，改名为 `shortx_backup` 后，下游用 `{shortx_backup}` 读取。脚本或表达式里不要声明这两个名字。

## 成功判断

可以用 MVEL 判断输出里是否包含目标路径，再发成功或失败通知。这类判断要注意：

- 不要只判断字符串非空。
- 最好判断路径、文件存在或动作返回状态。
- 失败通知要告诉用户检查路径、权限或存储空间。

推荐发布说明里写清楚备份文件保存在哪里，以及恢复时应如何导入。

## WebDAV 同步

代码库中能看到 WebDAV 配置相关内部服务：

```text
getAllWebDavProfiles()
addWebDavProfile(ByteArrayWrapper)
removeWebDavProfile("配置名字")
```

读取和删除有明确入口；新增需要 `ByteArrayWrapper`，说明它依赖序列化后的配置对象。没有完整 proto 构造样例时，不要给用户半成品新增脚本。

更稳的同步设计：

```text
ExportBackup
  -> 获取备份文件路径
  -> 检查 WebDAV 配置是否存在
  -> 交给 ShortX 内置同步能力或已验证动作
  -> 通知结果
```

## 备份内容边界

备份前要考虑：

- 是否包含全局变量 secret。
- 是否包含代码库里的令牌、接口地址或私有路径。
- 是否包含调试日志、HTTP 日志、Shell 输出。
- 是否需要排除临时状态，例如验证码去重 hash。

规则备份不是隐私脱敏。自动上传到云端前要先做清单或提醒。

## 恢复顺序

恢复时建议：

1. 先导入代码库。
2. 再导入全局变量和应用集。
3. 再导入一键指令和自动指令。
4. 禁用状态测试。
5. 最后启用自动触发器。

如果规则依赖插件、外部 dex 或系统服务能力，恢复前先检查依赖是否存在。

## 检查清单

- 备份路径是否来自可修改配置？
- `backupFilePath` 是否被改成清晰的业务名？
- 成功判断是否足够可靠？
- 失败是否通知用户具体原因？
- WebDAV 新增是否避免凭空构造 `ByteArrayWrapper`？
- 备份是否可能包含 secret 或敏感日志？
- 删除规则时是否清理备份路径变量？

备份规则的价值在于可恢复。只生成文件但没有路径、验证、通知和恢复顺序，不能算完整备份方案。
