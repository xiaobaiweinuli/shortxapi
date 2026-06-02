# Overlay 按钮工作流

`ShowOverlayButton` 可以把一组操作挂在屏幕上。典型用法是输入法显示时触发 Overlay，再用按钮输入手机号、邮箱、证件号等内容，并通过 `shortx://trigger?tag=...` 回到上一层菜单。

## 推荐结构

```text
IMEVisibilityChange / DeepLinkCall
  -> ShowOverlayButton 主按钮
  -> 点击主按钮
  -> HideOverlayButton 主按钮
  -> ShowOverlayButton 子按钮组
  -> 点击子按钮
  -> InputText argOf$...
  -> HideOverlayButton 子按钮组
  -> StartActivityUrlSchema shortx://trigger?tag=...
```

这类设计把 Overlay 当成交互入口，而不是把所有逻辑塞进一个按钮。

## overlay tag

每组 Overlay 都应有 tag：

```json
{
  "@type": "type.googleapis.com/ShowOverlayButton",
  "tag": "Text"
}
```

隐藏时按 tag：

```json
{
  "@type": "type.googleapis.com/HideOverlayButton",
  "overlayTags": ["Text"]
}
```

tag 要稳定、可读、避免和其他规则冲突。多个规则都叫 `Text` 会很难排查。

## 按钮动作

按钮可以有：

- `actions`：短按动作。
- `longClickActions`：长按动作。
- `icon`：图标。
- `label`：显示文本。
- `id`：按钮 ID。

例如“QQ/微信”按钮可以短按输入 `argOf$QQ`，长按输入 `argOf$WeChat`。这种设计适合相近功能，但发布说明必须写清长按行为。

## `argOf$...`

Overlay 按钮常读取 DeepLink 或参数化入口传入的值：

```json
{
  "@type": "type.googleapis.com/InputText",
  "text": "argOf$phone"
}
```

`argOf$phone` 表示调用参数，不是 JS 变量。它一般出现在动作参数文本里，不要把它当成 JS 局部变量声明。

## 回到上一级

可以用 URL schema 重新触发入口：

```json
{
  "@type": "type.googleapis.com/StartActivityUrlSchema",
  "urlSchema": "shortx://trigger?tag=Text editin"
}
```

注意顺序：通常先隐藏当前 Overlay，再触发上一级。否则会出现多个 Overlay 叠在一起。

## 与输入法触发配合

输入法显示时弹出 Overlay 很方便，但也是高频入口。建议：

- 只在需要的 App 或输入框场景启用。
- 提供手动关闭按钮。
- 不要每次输入法显示都创建重复 Overlay。
- 配合 tag 先隐藏旧按钮再显示新按钮。

## 风险

- Overlay 残留会影响用户操作。
- 输入文本依赖当前焦点，焦点错了会输到错误位置。
- DeepLink 回调可能造成循环显示。
- `argOf$...` 参数缺失时应有兜底，不要输入字面量。

## 检查清单

- 每组 Overlay 是否有唯一 tag？
- 每个按钮短按和长按动作是否写清？
- 子菜单出现前是否隐藏主菜单？
- 返回上一级是否会造成递归？
- 参数缺失时是否停止输入？
- 输入动作是否只在焦点可靠时执行？
- 删除或禁用规则时是否隐藏相关 Overlay？

Overlay 按钮适合做轻量交互入口。它不是普通弹窗，必须设计显示、隐藏、回退和参数缺失时的行为。
