# 高级应用示例

这里展示一些复杂的实际应用场景，帮助你理解如何组合使用 ShortX 的各种功能。

## 示例 1：剪贴板监听与处理

**应用场景：** 监听剪贴板变化，自动处理特定格式的链接

**学习目标：**
- 理解 `ClipboardContentChanged` 事件
- 掌握正则表达式匹配
- 学习悬浮按钮的创建

**核心概念：**

1. **剪贴板事件监听：**
   - 使用 `@type: "type.googleapis.com/ClipboardContentChanged"`
   - `content` 字段使用正则表达式匹配特定格式
   - `matchOptions` 设置为 `RegexMatchOptions_ContainsMatchIn`

2. **局部变量的使用：**
   - `CreateLocalVar` 创建临时变量存储剪贴板内容
   - `WriteLocalVar` 将内容写入变量
   - 后续动作通过 `localVarOf$变量名` 访问

3. **悬浮按钮（Overlay Button）：**
   - 使用 `ShowOverlayButton` 显示悬浮操作按钮
   - 配置按钮样式：图标、标签、颜色、透明度
   - 设置按钮行为：点击执行的动作列表

**实现要点：**

**事件过滤：**
- 正则表达式精确匹配目标格式
- 避免误触发，提高用户体验
- 支持可选参数的匹配（使用 `(?:...)?`）

**变量传递：**
- 剪贴板内容 → 局部变量 → JavaScript 脚本
- 这种模式确保数据在整个处理流程中可用
- 局部变量在规则执行完毕后自动清理

**悬浮按钮设计：**
- `closeOnAction: true` 点击后自动关闭
- `closeOnTouchOutside: true` 点击外部关闭
- `enableGlobalDrag: true` 允许拖动
- 合理设置尺寸和位置，不遮挡重要内容

**扩展思路：**
- 添加多个按钮提供不同操作选项
- 使用不同图标区分功能
- 根据内容类型动态显示不同按钮
- 添加长按功能执行高级操作

## 示例 2：快递信息提取与通知

**应用场景：** 自动提取快递短信中的取件码、服务商、地址信息

**学习目标：**
- 掌握复杂的正则表达式提取
- 理解多模式匹配策略
- 学习持久化通知的创建

**核心概念：**

1. **多关键词匹配：**
   - 使用 `|` 连接多个关键词
   - 匹配"取件码"、"包裹"、"运单"等
   - 覆盖不同快递公司的表达方式

2. **优先级匹配策略：**
   - 定义多个正则表达式，按优先级尝试
   - 先匹配最精确的格式
   - 逐步降低要求，提高匹配率
   - 使用 `if (result === null)` 判断是否需要继续尝试

3. **信息结构化：**
   - 提取服务商：`【([^】]+)】` 匹配方括号内容
   - 提取地址：多种模式匹配不同格式
   - 提取取件码：支持纯数字和带分隔符格式

**实现要点：**

**正则表达式技巧：**
- `[^】]+` 匹配除了】之外的任意字符
- `(?:...)` 非捕获组，用于分组但不提取
- `\\s*` 匹配可选的空白字符
- `[，,。\\n]+` 匹配多种分隔符

**全局变量写入：**
- 使用 `shortx.writeGlobalVarWithOp(name, value, op)`
- `op` 参数：3 表示 Override（覆盖）
- 其他操作：1=Create, 2=Update, 3=Override
- 全局变量可在其他规则中访问

**持久化通知：**
- 使用 `PostNotification` 创建系统通知
- `onGoing: true` 设置为常驻通知
- `isImportant: true` 提高优先级
- 设置图标：`largeIcon` 和 `smallIcon`
- 使用 `%CurrentTimeMillis%` 作为唯一标签

**为什么这样设计：**
- 常驻通知不会自动消失，方便查看
- 用户可以随时在通知栏查看取件信息
- 避免忘记取件码
- 支持多个快递同时显示

## 示例 3：配置驱动的悬浮菜单

**应用场景：** 创建可配置的悬浮球快捷菜单

**学习目标：**
- 理解配置文件的读写
- 掌握动态 UI 创建
- 学习触摸事件处理

**核心概念：**

1. **配置文件管理：**
   - 使用 JSON 格式存储配置
   - 实现读取、验证、默认值、错误处理
   - 支持配置热更新

2. **配置结构设计：**
```javascript
{
  "version": "1.0",
  "items": [
    {
      "type": "shortx",  // 或 "shell"
      "id": "动作ID",     // ShortX 动作 ID
      "command": "命令",  // Shell 命令（type为shell时）
      "name": "显示名称",
      "color": "#颜色值"
    }
  ]
}
```

3. **配置验证：**
   - 检查文件是否存在
   - 验证 JSON 格式
   - 检查必需字段
   - 提供友好的错误提示

**实现要点：**

**文件操作模式：**
```javascript
// 读取配置
function readConfig() {
  var file = new File(CONFIG_PATH);
  if (!file.exists()) {
    // 创建默认配置
    writeDefaultConfig();
    return getDefaultConfig();
  }
  
  var reader = new BufferedReader(new FileReader(file));
  var jsonStr = "";
  var line;
  while ((line = reader.readLine()) != null) {
    jsonStr += line;
  }
  reader.close();
  
  return JSON.parse(jsonStr);
}
```

**动态 UI 创建：**
- 使用 `GridLayout` 创建网格布局
- 根据配置项数量动态计算行列
- 为每个按钮设置点击事件
- 使用 `GradientDrawable` 创建圆角背景

**触摸事件处理：**
- `ACTION_DOWN`：记录初始位置，启动长按检测
- `ACTION_MOVE`：判断是否拖动，更新位置
- `ACTION_UP`：区分点击和拖动，执行相应操作
- 使用阈值（threshold）判断是否为拖动

**长按检测：**
```javascript
// 使用 Handler 延迟执行
var longPressHandler = new Handler(Looper.getMainLooper());
var longPressRunnable = new Runnable({
  run: function() {
    if (!isDragging) {
      // 执行长按操作
    }
  }
});
longPressHandler.postDelayed(longPressRunnable, 800);
```

**窗口优先级：**
- 悬浮球使用 `TYPE_APPLICATION_OVERLAY`（较低优先级）
- 菜单使用 `TYPE_SYSTEM_ERROR`（最高优先级）
- 确保菜单显示在悬浮球上方
- 避免被其他窗口遮挡

**错误处理策略：**
- 配置错误时显示错误菜单
- 提供"使用默认配置修复"按钮
- 点击修复后重新加载菜单
- 用户友好的错误提示

## 示例 4：网页存档下载器

**应用场景：** 监听特定网站链接，自动下载网页存档

**学习目标：**
- 掌握 HTTP 请求处理
- 理解异步操作和回调
- 学习 MHTML 格式生成

**核心概念：**

1. **API 查询流程：**
   - 先查询存档 API 检查是否已存档
   - 如果存在，直接获取下载链接
   - 如果不存在，提交新存档请求
   - 处理重定向和各种响应码

2. **HTTP 请求封装：**
```javascript
function httpRequest(url) {
  var conn = new URL(url).openConnection();
  conn.setConnectTimeout(TIMEOUT);
  conn.setReadTimeout(TIMEOUT);
  conn.setRequestProperty("User-Agent", "Mozilla/5.0");
  
  var code = conn.getResponseCode();
  
  // 处理重定向
  if (code === 302 || code === 301) {
    return { code: code, location: conn.getHeaderField("Location") };
  }
  
  // 处理正常响应
  if (code === 200) {
    var reader = new BufferedReader(
      new InputStreamReader(conn.getInputStream(), "UTF-8")
    );
    // 读取内容...
  }
  
  return { code: code };
}
```

3. **并发下载优化：**
   - 使用线程池并发下载多张图片
   - 使用 `CountDownLatch` 等待所有任务完成
   - 使用 `ConcurrentHashMap` 线程安全地存储结果
   - 设置超时避免无限等待

**实现要点：**

**重定向处理：**
- 检查 302/301 状态码
- 获取 Location 头
- 递归或循环处理多次重定向
- 注意防止重定向循环

**MHTML 格式：**
- 使用 MIME multipart 格式
- 包含 HTML 和所有图片资源
- 图片使用 Base64 编码
- 通过 Content-ID 引用资源

**错误恢复：**
- 捕获 `FileNotFoundException` 处理 404
- 网络超时自动重试
- 部分失败不影响整体流程
- 详细的日志记录便于调试

**性能优化：**
- 分块读取大文件
- 显示下载进度
- 限制并发线程数
- 复用 HTTP 连接

## 通用设计模式

### 1. 状态机模式

用于管理复杂的状态转换：
- 定义状态枚举
- 使用全局变量存储当前状态
- 根据状态执行不同逻辑
- 状态转换时更新变量

### 2. 责任链模式

用于多步骤处理：
- 第一个动作处理并传递结果
- 第二个动作基于结果继续处理
- 使用变量传递数据
- 任何步骤都可以中断链条

### 3. 策略模式

用于可配置的行为：
- 从配置文件读取策略
- 根据策略选择不同实现
- 支持运行时切换
- 易于扩展新策略

### 4. 观察者模式

用于事件响应：
- 监听系统事件
- 触发时通知所有订阅者
- 解耦事件源和处理逻辑
- 支持多个处理器

## 调试技巧

1. **分步测试：**
   - 先测试事件触发
   - 再测试数据提取
   - 最后测试完整流程

2. **日志输出：**
   - 在关键步骤添加 `console.log()`
   - 输出变量值和执行状态
   - 记录错误信息

3. **Toast 调试：**
   - 使用 Toast 显示中间结果
   - 验证数据提取是否正确
   - 检查条件判断逻辑

4. **异常处理：**
   - 使用 try-catch 捕获异常
   - 输出详细的错误信息
   - 提供降级方案

## 相关文档

- [基础示例](/examples/basic) - 学习基础用法
- [动作执行](/guide/actions) - 了解动作类型
- [API 参考](/api/overview) - 查看完整 API
