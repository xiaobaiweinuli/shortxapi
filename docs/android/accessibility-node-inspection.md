# 无障碍节点检索

无障碍节点检索用于把屏幕上的控件变成稳定的规则锚点。它和坐标点击不同：坐标依赖分辨率、方向和缩放，节点检索依赖控件结构、文本、描述、资源 ID 和可点击状态，更适合长期维护。

## 适合场景

| 场景 | 推荐锚点 |
| --- | --- |
| 固定按钮、菜单项 | `viewId`、`text`、`description` |
| 列表中的某一项 | 列表容器 + 子节点文本 |
| 输入框 | `className`、`editable`、附近标签 |
| 多个同名按钮 | 父子路径、附近文本、窗口标题 |
| WebView 或自绘界面 | 先尝试节点，失败后再用 OCR 或坐标 |

优先级通常是：`viewId` > `description` / `text` > 父子结构 > bounds > 坐标。坐标只能作为兜底，不应成为第一选择。

## 检索流程

```text
确认目标页面
  -> 等待页面稳定
  -> 获取当前窗口节点
  -> 遍历节点树
  -> 提取候选属性
  -> 选择最稳定锚点
  -> 写入动作链并设置超时
```

不要只在目标控件出现时测试一次。至少要在冷启动、返回页面、横竖屏变化、列表滚动后各验证一次。

## 读取节点属性

检索节点时重点看这些字段：

| 属性 | 用途 |
| --- | --- |
| `getViewIdResourceName()` | 最稳定的应用内控件 ID |
| `getText()` | 适合按钮、标签、列表项 |
| `getContentDescription()` | 适合图标按钮和无文本控件 |
| `getClassName()` | 判断按钮、输入框、列表、容器 |
| `getBoundsInScreen(...)` | 兜底点击、截图区域、附近关系 |
| `isClickable()` | 判断点击当前节点还是找父节点 |
| `isEditable()` | 判断是否可输入 |
| `isScrollable()` | 判断是否需要滚动后再找 |

节点文本和描述可能为空，脚本要按 `null` 处理，不要直接拼接。

## 遍历示例

下面示例只做节点摘要输出，适合开发期定位锚点。变量名避开了 `text`、`title`、`pkgName` 等上下文保留名。

```javascript
importClass(android.graphics.Rect);

var automationObj = shortx.getUiAutomation();
var rootNode = automationObj == null ? null : automationObj.getRootInActiveWindow();
var rows = [];

function valueOfNode(valueObj) {
    return valueObj == null ? "" : String(valueObj);
}

function walkNode(nodeObj, depthValue) {
    if (nodeObj == null || rows.length >= 80) {
        return;
    }

    var rectObj = new Rect();
    nodeObj.getBoundsInScreen(rectObj);

    rows.push({
        depth: depthValue,
        id: valueOfNode(nodeObj.getViewIdResourceName()),
        label: valueOfNode(nodeObj.getText()),
        desc: valueOfNode(nodeObj.getContentDescription()),
        cls: valueOfNode(nodeObj.getClassName()),
        clickable: nodeObj.isClickable(),
        editable: nodeObj.isEditable(),
        bounds: rectObj.left + " " + rectObj.top + " " + rectObj.right + " " + rectObj.bottom
    });

    var childCountValue = nodeObj.getChildCount();
    for (var i = 0; i < childCountValue; i++) {
        walkNode(nodeObj.getChild(i), depthValue + 1);
    }
}

walkNode(rootNode, 0);
JSON.stringify(rows, null, 2);
```

## 从节点到动作链

节点检索不是最终动作。最终规则应把检索结果压缩成稳定条件：

```text
等待 Activity 或页面特征
  -> 查找 viewId 或文本
  -> 校验附近节点
  -> 点击节点或父节点
  -> 输出执行结果
```

如果一个页面有多个同名按钮，不要只匹配文本。应同时加入父容器、附近说明文字、列表位置或 `viewId`。

## 常见失败

| 问题 | 处理 |
| --- | --- |
| 根节点为空 | 等待页面、检查无障碍/自动化能力是否可用 |
| 文本为空 | 尝试 `contentDescription`、`viewId`、父子节点 |
| 点击无效 | 当前节点不可点击时找父节点 |
| 列表项复用 | 先滚动到目标项，再重新获取节点 |
| WebView 只有少量节点 | 改用 OCR、截图区域或应用内可访问入口 |

## 发布前检查

- 不把开发期节点列表作为正式输出。
- 不把坐标作为唯一锚点。
- 每个等待都有超时。
- 每个失败路径都有可读输出。
- 脚本里不声明 `text`、`pkgName`、`userId`、`selectedListItem` 等上下文保留名。
