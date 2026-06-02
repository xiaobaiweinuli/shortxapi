# WebDAV 配置管理

ShortX 内部服务暴露了 WebDAV 配置的读取、删除和新增入口。它们适合做配置检查、备份同步前诊断和维护工具，不适合作为普通动作链的默认写入方式。

## 已见真实入口

代码库片段中可见：

```javascript
Packages.tornaco.apps.shortx.core.OooO0O0.OooO00o().getAllWebDavProfiles();
```

```javascript
Packages.tornaco.apps.shortx.core.OooO0O0.OooO00o().removeWebDavProfile("配置名字");
```

```javascript
Packages.tornaco.apps.shortx.core.OooO0O0.OooO00o().addWebDavProfile(ByteArrayWrapper);
```

前两个入口的调用形状较清楚：读取全部配置、按名字删除配置。新增入口需要 `ByteArrayWrapper`，必须先知道 WebDAV profile 的真实 proto 结构和序列化方式。

## 推荐用途

适合：

- 检查是否已有 WebDAV 配置。
- 在备份前确认目标配置存在。
- 生成配置清单。
- 删除用户确认过的旧配置。

不适合：

- 在不知道 proto 结构时新增配置。
- 自动规则静默删除 WebDAV 配置。
- 把 WebDAV 账号、密码、令牌写进普通文档或日志。

## 读取配置

读取入口返回的对象形态要以当前 ShortX 版本为准。教程里建议先输出诊断信息，不直接做删除：

```javascript
var service = Packages.tornaco.apps.shortx.core.OooO0O0.OooO00o();
var profiles = service.getAllWebDavProfiles();
profiles == null ? "[]" : String(profiles);
```

如果能解析为列表，再转为 `ShowListDialog` JSON；如果不能解析，先把原始类型和字符串输出到调试页面。

## 删除配置

删除必须经过选择和确认：

```text
读取 WebDAV 配置
  -> 生成列表
  -> ShowListDialog 选择
  -> ShowAlertDialog 二次确认
  -> removeWebDavProfile(name)
  -> 通知结果
```

不要把配置名写死在自动规则里静默删除。

## 新增配置

`addWebDavProfile(ByteArrayWrapper)` 说明新增需要序列化后的配置对象。没有完整构造样例时，文档应只写：

- 确认存在内部入口。
- 需要查证配置 proto。
- 不提供半成品写入脚本。
- 推荐用户先在 ShortX UI 中创建配置，再由脚本读取和检查。

这样比给出无法保证兼容的 `ByteArrayWrapper` 构造更安全。

## 与备份配合

备份同步前的推荐检查：

1. 检查 `backup_dir` 是否存在。
2. 执行 `ExportBackup`。
3. 检查 WebDAV 配置是否存在。
4. 如果配置缺失，发通知提示用户去 ShortX UI 创建。
5. 如果配置存在，再执行已验证的同步动作。

## 安全边界

- WebDAV 配置通常包含服务器地址、用户名、密码或 token。
- 不要把完整配置写进通知、剪贴板或公开日志。
- 删除配置前必须展示配置名。
- 新增配置前必须明确密钥存储方式。
- 迁移时应区分“配置存在”和“凭据仍有效”。

WebDAV 能力适合做备份链路的后半段，但配置管理本身属于敏感配置维护，应以读取检查和人工确认删除为主。
