# 插件能力发现

ShortX 插件可以提供额外自动化动作和条件。内部服务层有一组入口用于发现已安装插件能力。

## 真实入口

```javascript
Packages.tornaco.apps.shortx.core.OooO0O0.OooO00o().getInstalledPluginFacts();
Packages.tornaco.apps.shortx.core.OooO0O0.OooO00o().getInstalledPluginActions();
Packages.tornaco.apps.shortx.core.OooO0O0.OooO00o().getInstalledPluginConditions();
```

它们分别面向：

- 已安装 ShortX 扩展插件。
- 插件提供的自动化动作。
- 插件提供的自动化条件。

这些入口适合做能力清单、兼容性检查和文档生成辅助，不应直接假设返回对象就是普通 JSON。

## 使用场景

| 场景 | 做法 |
| --- | --- |
| 检查某插件是否安装 | 读取插件列表并匹配包名或标识 |
| 判断某动作是否可用 | 读取 plugin actions 后匹配动作名称或类型 |
| 给用户展示能力 | 转成 `ShowListDialog` JSON |
| 排查导入失败 | 对比规则依赖的插件能力和当前设备能力 |

## 推荐输出

面向对话框时，先把内部对象整理成稳定 JSON：

```javascript
var items = [];
var dataList = Packages.tornaco.apps.shortx.core.OooO0O0.OooO00o().getInstalledPluginActions();

for (var i = 0; i < dataList.size(); i++) {
    var item = dataList.get(i);
    items.push({
        name: String(item),
        summary: "Plugin action",
        __value: String(item)
    });
}

JSON.stringify(items, null, 2);
```

如果返回项是 `ByteArrayWrapper` 或 proto 对象，应先查真实结构再解析，不要把 `toString()` 当成稳定协议。

## 与插件执行的边界

“发现插件动作”不等于“随意执行插件动作”。执行仍然要回到 ShortX action 链路：

```text
发现插件能力
  -> 判断依赖是否存在
  -> 构造或导入对应动作
  -> 通过动作链执行
  -> 读取上下文输出
```

如果要动态执行动作配置，优先找 `shortx.executeAction(...)` 或`executeAction` 的已验证形态。内部服务中 `executeAction(ByteArrayWrapper, ByteArrayWrapper, ByteArrayWrapper)` 这类入口没有完整参数构造说明时，不应写成教程示例。

## 风险

- 插件能力依赖安装状态和版本。
- 插件动作输出的上下文 key 可能和现有变量冲突。
- 插件卸载后，规则导入或执行可能失败。
- 生成文档时应标注“能力发现结果来自当前设备”，不是通用 ShortX 标准库。

