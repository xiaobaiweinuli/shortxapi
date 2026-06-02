# 全局变量

全局变量是跨规则、跨动作链共享的持久数据。它适合保存配置、轻量状态、去重标记和小型缓存，不适合保存大文件、完整通知历史或高频变化的数据流。

## 什么时候用

| 需求 | 是否适合 |
| --- | --- |
| 保存验证码去重 hash | 适合 |
| 保存用户选择的默认包名 | 适合 |
| 保存 WebDAV 配置 ID | 适合 |
| 缓存上一次系统设置值 | 适合，但要有恢复说明 |
| 保存整条通知正文列表 | 不适合 |
| 高频写入传感器或网络状态 | 不适合 |
| 保存账号密码明文 | 不适合 |

## 读取

```javascript
var value = shortx.readGlobalVar("sms_dedup_hash");
value == null ? "" : String(value);
```

读取时要处理 `null`。不要假设变量一定存在，也不要把空字符串和“未配置”混为一谈。

## 写入

```javascript
shortx.writeGlobalVarWithOp("sms_dedup_hash", currentHash, 3);
currentHash;
```

写入前应确认：

- 变量名不会和其他规则冲突。
- 写入值是否需要 JSON 序列化。
- 是否需要在规则删除或禁用时清理。
- 是否存在并发触发导致覆盖的问题。

## 命名建议

全局变量名应当带用途前缀：

```text
sms_dedup_hash
shortcut_last_package
settings_backup_screen_off_timeout
webdav_profile_id
```

不要使用 `token`、`password`、`secret` 这类含义不清的短名。确实保存敏感配置时，应在发布说明中写清变量用途、风险和清理方式。

## 用作去重

验证码规则中常见模式：

1. 从短信或通知构造去重 key。
2. 计算 hash。
3. 和全局变量里的上次 hash 比较。
4. 不重复才继续处理。
5. 处理后写回新 hash。

示例：

```javascript
var contentValue = contentText == null ? "" : String(contentText);
var codeMatch = contentValue.match(/[0-9]{4,8}/);
var codeValue = codeMatch == null ? "" : codeMatch[0];
var lastValue = shortx.readGlobalVar("sms_dedup_hash");

if (codeValue.length > 0 && String(lastValue) != codeValue) {
    shortx.writeGlobalVarWithOp("sms_dedup_hash", codeValue, 3);
    codeValue;
} else {
    "";
}
```

这类状态必须保持“小而明确”，不要把整条通知或大块原始内容无限累积进全局变量。

## 和局部变量区别

| 类型 | 生命周期 | 适合 |
| --- | --- | --- |
| 上下文变量 | 当前触发/动作链 | 传递触发器和动作输出 |
| 局部变量 | 当前脚本片段 | 计算中间值 |
| 全局变量 | 跨规则持久保存 | 配置、状态、去重、轻量缓存 |

## 维护和恢复

全局变量是持久状态，发布规则时应写清：

- 创建了哪些变量。
- 每个变量的类型和值范围。
- 删除规则后是否需要清理。
- 变量丢失时如何重新初始化。
- 敏感变量是否会被备份或导出。
