# 应用集工作流

应用集是 ShortX 规则里常见的配置边界。它把“哪些 App 参与这个规则”从脚本里拆出来，交给用户维护。

## 什么时候用应用集

适合使用应用集的场景：

- 一组需要代理的 App。
- 一组需要检查更新的 App。
- 一组需要清理缓存的 App。
- 一组需要特殊通知处理的 App。
- 一组需要排除或白名单的 App。

不适合：

- 只有一个固定包名。
- 包名由当前触发器 `pkgName` 决定。
- 每次执行都要动态生成临时列表。

## 创建应用集

动作链可用 `CreatePkgSet` 创建空应用集：

```json
{
  "@type": "type.googleapis.com/CreatePkgSet",
  "label": "Proxy"
}
```

创建空集后，应通过弹窗或发布说明告诉用户把目标 App 加进去。不要假设应用集创建后已经包含应用。

## 读取应用集

高级脚本可以通过内部 ShortX 服务读取应用集，并转成对话框 JSON。高级脚本通常解析 `PkgSet` proto 和 `AppPkg`：

```javascript
importClass(Packages.tornaco.apps.shortx.core.OooO0O0);
importClass(Packages.tornaco.apps.shortx.core.proto.pkgset.PkgSet);
importClass(java.io.ByteArrayInputStream);

var resultItems = [];
var service = OooO0O0.OooO00o();
var wrapper = service.getPkgSetByLabel("Proxy");

if (wrapper) {
    var byteData = wrapper.getByteData();
    var byteStream = new ByteArrayInputStream(byteData);
    var pkgSetData = PkgSet.parseFrom(byteStream);
    var appList = pkgSetData.getAppPkgsList();

    for (var i = 0; i < appList.size(); i++) {
        var appData = appList.get(i);
        resultItems.push({
            name: appData.getLabel ? appData.getLabel() : appData.getPkgName(),
            __value: appData.getPkgName(),
            __icon: "app://" + appData.getPkgName()
        });
    }
}

JSON.stringify(resultItems, null, 2);
```

这是内部服务读取配置，适合高级维护和诊断。普通规则优先使用 ShortX 内置应用集条件或动作。

## 与触发器配合

应用集通常在条件层使用：

```text
AppBecomeFg
  -> 判断 pkgName 是否在应用集
  -> 执行动作
```

如果动作需要展示应用列表，可以把应用集转为 `ShowListDialog` JSON；如果只是判断当前触发包是否匹配，优先用内置条件。

## 与全局变量配合

应用集适合保存“目标 App 集合”，全局变量适合保存“规则配置”：

| 数据 | 推荐位置 |
| --- | --- |
| 需要代理的 App 列表 | 应用集 |
| 代理工具包名 | 全局变量 |
| 延迟关闭 VPN 的毫秒数 | 全局变量 |
| 上一次触发 hash | 全局变量 |
| 更新检测目标 App | 应用集 |

不要把几十个包名塞进一个全局变量字符串，除非只是临时缓存或导出清单。

## 删除与迁移

删除规则时是否删除应用集，要看应用集归属：

| 归属 | 删除策略 |
| --- | --- |
| 规则自动创建、只给本规则使用 | 可随规则删除 |
| 用户手动维护、可能被多规则复用 | 不自动删除，说明保留原因 |
| 迁移用临时集合 | 迁移完成后提示清理 |

迁移时应先创建应用集，再启用依赖它的规则。否则规则第一次触发可能读到空配置。

## 常见问题

- 应用集为空：主规则应提示配置缺失，不要静默执行。
- 包名多用户不一致：检查 `userId`，不要默认所有场景都是用户 0。
- App 被卸载：列表读取要允许找不到标签或图标。
- 应用集重名：发布说明里给出唯一名称，必要时加规则前缀。
- 删除规则后残留应用集：这是设计选择，但必须可解释。

## 设计清单

- 应用集名称是否清晰且不容易冲突？
- 初始化时是否只创建空集，不覆盖用户已有集合？
- 规则触发前是否检查应用集非空？
- 用户需要添加哪些 App 是否写清楚？
- 应用集是否可能被多个规则共用？
- 删除规则时是否保留或清理应用集？

应用集的作用是把“谁参与规则”外置成配置。它能显著降低脚本硬编码，但也要求文档写清初始化、维护和迁移方式。
