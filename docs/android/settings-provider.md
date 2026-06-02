# Settings Provider 教程

系统设置项是 ShortX 高级自动化中非常实用的一类能力。真实的“设置项监视器”导出展示了一个完整模式：读取 Settings 三个命名空间，保存前后快照，比较差异，再生成可复用代码。

## 三类设置

Android 常见设置命名空间：

- `Settings.System`
- `Settings.Secure`
- `Settings.Global`

JS 侧常用：

```javascript
importPackage(android.provider);

var resolver = context.getContentResolver();
var cursor = resolver.query(Settings.Global.CONTENT_URI, null, null, null, null);
```

MVEL 侧常见：

```java
android.provider.Settings$System.getFloat(context.contentResolver, "font_scale")
```

注意 JS 与 MVEL 写法不同，不要混用。

## 监视器模式

常见链路：

```text
读取全部设置项
  -> 输出到 SettingsItem
  -> 若全局变量 Setting 不存在，保存初始快照
  -> 若已存在，比较前后差异
  -> 生成 JSON 列表给 ShowListDialog
  -> 用户选择后生成 JS / MVEL / Shell 命令
```

这是典型的动作链数据塑形案例。

## 差异 JSON

适合输出给列表对话框：

```javascript
var rows = [];
rows.push({
    name: settingName,
    summary: settingType + "\n" + beforeValue + " -> " + afterValue,
    __value: JSON.stringify({
        key: settingType,
        name: settingName,
        summary: "变更前: " + beforeValue + " -> " + afterValue
    })
});

JSON.stringify(rows, null, 2);
```

## 风险

读取设置通常是高级但安全的。写入设置则可能影响系统显示、输入、网络、安全和应用行为。

写入教程必须说明：

- 写入哪个命名空间。
- key 的含义是否明确。
- 原值如何备份。
- 如何恢复。
- 是否适用于所有 ROM。

