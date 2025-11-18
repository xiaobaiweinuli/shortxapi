# 动作执行

动作是规则触发后执行的操作，ShortX 提供了丰富的内置动作和脚本支持。

## 基本动作

### 文本输入

自动输入文本到当前焦点的输入框。常用于验证码自动填充、表单自动填写等场景。

**核心要点：**
- 使用 `@type` 指定动作类型为 `InputText`
- `text` 字段支持上下文变量，如 `{mvelRet}` 或 `{contentText}`
- 每个动作需要唯一的 `id` 用于追踪和调试

**使用场景：**
- 验证码自动输入：从通知中提取验证码后自动填入
- 表单自动填写：预设文本快速输入
- 搜索关键词输入：配合剪贴板内容自动搜索

### 剪贴板操作

将文本写入系统剪贴板，是最常用的数据传递方式。

**核心要点：**
- 使用 `WriteClipboard` 类型
- 支持动态内容：通过 `{变量名}` 引用上下文变量
- 可以作为数据中转站：先复制再在其他应用粘贴

**使用场景：**
- 验证码复制：提取后复制，用户手动粘贴
- 链接处理：清理链接参数后复制
- 数据提取：从通知中提取订单号、快递单号等

### Toast 提示

显示短暂的提示消息，用于用户反馈。

**核心要点：**
- 使用 `ShowToast` 类型
- `message` 支持变量插值
- `duration` 可选 "short" 或 "long"
- 不会打断用户操作，适合非关键提示

**使用场景：**
- 操作确认：显示"已复制"、"已保存"等
- 状态提示：显示提取的验证码或订单号
- 错误提示：操作失败时的友好提示

## 脚本动作

### JavaScript 执行

JavaScript 是 ShortX 中最强大的动作类型，可以实现复杂的逻辑处理。

**核心概念：**
- 使用 Rhino 引擎执行 JavaScript 代码
- 可以访问 Java 类和 Android API
- 返回值通过 `{jsRet}` 在后续动作中使用
- 支持 `console.log()` 输出调试信息

**导入 Java 类的方法：**
```javascript
// 导入单个类
importClass(java.io.File);

// 导入整个包
importPackage(java.io);
importPackage(android.view);
```

**访问上下文变量：**
- 通过 `{变量名}` 在字符串中引用
- 通过 `localVarOf$变量名` 访问局部变量
- 通过 `globalVarOf$变量名` 访问全局变量

**常见使用模式：**

1. **数据提取和处理**
   - 使用正则表达式提取特定信息
   - 解析 JSON 数据
   - 字符串格式化和清理

2. **HTTP 请求**
   - 使用 `java.net.URL` 和 `HttpURLConnection`
   - 处理 API 响应
   - 下载文件或图片

3. **文件操作**
   - 读写配置文件
   - 保存数据到本地
   - 管理缓存

4. **UI 操作**
   - 创建悬浮窗
   - 显示自定义对话框
   - 动态生成界面元素

**性能优化建议：**
- 避免在循环中执行耗时操作
- 使用异步处理长时间任务
- 合理使用 try-catch 处理异常
- 及时释放资源（关闭流、断开连接）

### MVEL 执行

MVEL 是轻量级的表达式语言，适合简单的数据处理和条件判断。

**核心特点：**
- 语法类似 Java，但更简洁
- 执行速度快，适合频繁调用
- 可以直接访问上下文变量
- 返回值通过 `{mvelRet}` 使用

**与 JavaScript 的选择：**
- **使用 MVEL**：简单的字符串处理、数值计算、条件判断
- **使用 JavaScript**：需要导入 Java 类、复杂逻辑、异步操作

**常见使用模式：**

1. **正则表达式匹配**
   - 使用 `Pattern` 和 `Matcher` 提取数据
   - 验证格式是否符合要求
   - 查找最接近的匹配项

2. **字符串处理**
   - 替换、分割、拼接
   - 格式化输出
   - 清理特殊字符

3. **条件判断**
   - 检查内容是否包含关键词
   - 比较数值大小
   - 返回不同的处理结果

**实用技巧：**
- 使用 `import` 导入 Java 类
- 通过 `shortx.writeGlobalVarWithOp()` 写入全局变量
- 返回值可以是任何类型，会自动转换为字符串

## 条件动作

### If-Then-Else

```json
{
  "@type": "type.googleapis.com/IfThenElse",
  "If": [{
    "@type": "type.googleapis.com/EvaluateContextVar",
    "op": "EqualTo",
    "varName": "status",
    "payload": { "value": "success" }
  }],
  "IfActions": [
    { "@type": "type.googleapis.com/ShowToast", "message": "成功" }
  ],
  "ElseActions": [
    { "@type": "type.googleapis.com/ShowToast", "message": "失败" }
  ],
  "id": "A-006"
}
```

## HTTP 请求

```json
{
  "@type": "type.googleapis.com/ExecuteHttpRequest",
  "url": "https://api.example.com/data",
  "method": "POST",
  "headers": {
    "Content-Type": "application/json"
  },
  "body": "{\"key\": \"value\"}",
  "id": "A-007"
}
```

**执行 API：**

```java
// 执行 HTTP 请求
ByteArrayWrapper requestWrapper = createHttpRequest();
String response = shortXService.executeHttpRequest(requestWrapper);

// 启用 HTTP 请求日志
shortXService.setHttpRequestLogEnabled(true);

// 获取日志
ParcelFileDescriptor logFd = shortXService.getHttpRequestLogFD();
String logPath = shortXService.getHttpRequestLogPath();

// 清除日志
shortXService.clearHttpRequestLogs();
```

## Shell 命令

```java
// 执行 Shell 命令
shortXService.executeShellCommand(
    "ls -la",
    new ICallback.Stub() {
        @Override
        public void onCallback(String result) {
            Log.d("ShortX", "Result: " + result);
        }
    }
);

// 启用注入 Shell
shortXService.setInjectedShellEnabled(true);

// 检查状态
boolean enabled = shortXService.isInjectedShellEnabled();
```

## 直接动作

直接动作是预定义的快捷操作。

```java
// 添加直接动作
shortXService.addDirectAction(actionWrapper);

// 获取所有直接动作
List<DirectAction> actions = 
    shortXService.getAllDirectAction(filter, offset, limit);

// 通过 ID 获取
DirectAction action = shortXService.getDirectActionById(actionId);

// 执行直接动作
shortXService.executeDirectionActionById(contextWrapper, actionId);

// 删除直接动作
shortXService.deleteDirectAction(actionId);

// 获取数量
int count = shortXService.getDirectActionCount();
```

### 直接动作集

```java
// 添加或更新 DA 集
shortXService.addOrUpdateDASet(daSetWrapper);

// 获取所有 DA 集
List<DASet> daSets = shortXService.getAllDASets(includeDetails);

// 通过 ID 获取
DASet daSet = shortXService.getDASetById(daSetId, includeDetails);

// 删除 DA 集
shortXService.deleteDASet(daSetId);

// 注册观察者
shortXService.registerDAObs(
    new IDAObserver.Stub() {
        @Override
        public void onDAChanged(String daId) {
            Log.d("ShortX", "DA changed: " + daId);
        }
    }
);
```

## 菜单动作

```java
// 触发菜单动作
shortXService.onMenuActionTrigger(menuNumber, actionId);
```

## 动作禁用

可以禁用特定动作：

```json
{
  "@type": "type.googleapis.com/ShowToast",
  "message": "这个动作被禁用了",
  "isDisabled": true,
  "id": "A-008"
}
```

## 自定义上下文数据

在动作中传递自定义数据：

```json
{
  "@type": "type.googleapis.com/ExecuteJS",
  "expression": "console.log({myCustomData});",
  "customContextDataKey": {
    "myCustomData": "custom value"
  },
  "id": "A-009"
}
```

## 动作链

按顺序执行多个动作：

```json
{
  "actions": [
    {
      "@type": "type.googleapis.com/ExecuteMVEL",
      "expression": "return contentText.match('\\\\d{6}')[0];",
      "id": "A-extract"
    },
    {
      "@type": "type.googleapis.com/WriteClipboard",
      "text": "{mvelRet}",
      "id": "A-copy"
    },
    {
      "@type": "type.googleapis.com/ShowToast",
      "message": "验证码已复制: {mvelRet}",
      "id": "A-notify"
    }
  ]
}
```

## 错误处理

在脚本中添加错误处理：

```javascript
{
  "@type": "type.googleapis.com/ExecuteJS",
  "expression": `
    try {
      // 执行操作
      var result = doSomething();
      return result;
    } catch (e) {
      console.error('Error:', e.message);
      return null;
    }
  `,
  "id": "A-010"
}
```

## 性能优化

### 异步执行

对于耗时操作，使用异步执行：

```java
// 使用回调异步执行
shortXService.OooOOO0(
    new ICallback.Stub() {
        @Override
        public void onCallback(String result) {
            // 处理结果
        }
    }
);
```

### 批量操作

```java
// 批量执行动作
List<ByteArrayWrapper> actions = new ArrayList<>();
for (Action action : actionList) {
    actions.add(serializeAction(action));
}

// 执行
for (ByteArrayWrapper wrapper : actions) {
    shortXService.executeAction(wrapper, null, contextWrapper);
}
```

## 高级技巧

### 局部变量与全局变量

**局部变量（Local Variables）：**
- 使用 `CreateLocalVar` 创建
- 使用 `WriteLocalVar` 写入
- 通过 `localVarOf$变量名` 访问
- 仅在当前规则执行期间有效
- 适合临时数据存储

**全局变量（Global Variables）：**
- 使用 `CreateGlobalVar` 创建
- 使用 `WriteGlobalVar` 写入
- 通过 `globalVarOf$变量名` 访问
- 跨规则共享，应用重启后保留
- 适合持久化数据和跨规则通信

**使用场景对比：**
- 局部变量：临时计算结果、中间数据、单次处理
- 全局变量：计数器、配置信息、状态标志、缓存数据

### 悬浮窗和 UI 创建

**核心概念：**
- 使用 `WindowManager` 添加悬浮视图
- 通过 `WindowManager.LayoutParams` 配置窗口属性
- 使用 `TYPE_APPLICATION_OVERLAY` 或 `TYPE_SYSTEM_ERROR` 类型
- 需要悬浮窗权限

**关键参数：**
- `FLAG_NOT_FOCUSABLE`：不获取焦点，不影响其他应用
- `FLAG_LAYOUT_NO_LIMITS`：允许超出屏幕边界
- `FLAG_NOT_TOUCH_MODAL`：触摸事件可以穿透到下层
- `PixelFormat.TRANSLUCENT`：支持透明背景

**实现模式：**
1. 获取 WindowManager 服务
2. 创建视图（TextView、Button、Layout等）
3. 配置 LayoutParams
4. 调用 `addView()` 显示
5. 使用 `removeView()` 移除

### 文件操作和配置管理

**配置文件模式：**
- 使用 JSON 格式存储配置
- 通过 `File`、`FileReader`、`FileWriter` 操作
- 实现读取、写入、验证、默认值等功能

**推荐目录：**
- ShortX 数据目录：`/data/system/shortx_*/data/`
- 使用子目录组织不同功能的配置
- 注意权限问题，确保可读写

**配置验证：**
- 读取后验证 JSON 格式
- 检查必需字段是否存在
- 提供默认配置作为后备
- 捕获异常并友好提示

### HTTP 请求最佳实践

**连接管理：**
- 设置合理的超时时间（连接超时、读取超时）
- 使用 try-finally 确保连接关闭
- 处理重定向（302、301状态码）
- 检查响应码并分类处理

**性能优化：**
- 使用连接池复用连接
- 并发下载使用线程池
- 大文件分块读取
- 添加 User-Agent 避免被拒绝

**错误处理：**
- 捕获 `FileNotFoundException`（404错误）
- 处理超时异常
- 网络异常重试机制
- 记录详细的错误日志

### 并发处理

**使用场景：**
- 批量下载图片
- 并行处理多个任务
- 提高响应速度

**实现方式：**
- 使用 `java.util.concurrent.Executors` 创建线程池
- 使用 `CountDownLatch` 等待所有任务完成
- 使用 `ConcurrentHashMap` 存储结果
- 设置合理的线程数量

**注意事项：**
- 及时关闭线程池（`shutdownNow()`）
- 设置超时避免无限等待
- 处理线程异常
- 避免过多线程导致资源耗尽

## 最佳实践

1. **合理选择动作类型**：
   - 简单操作用内置动作（Toast、Clipboard）
   - 数据处理用 MVEL（正则匹配、字符串操作）
   - 复杂逻辑用 JavaScript（HTTP请求、文件操作、UI创建）

2. **错误处理策略**：
   - 在脚本中添加 try-catch 块
   - 提供有意义的错误提示
   - 记录错误日志便于调试
   - 设计降级方案

3. **性能优化**：
   - 避免在主线程执行耗时操作
   - 使用异步处理和回调
   - 缓存重复计算的结果
   - 及时释放资源

4. **代码组织**：
   - 将通用函数提取到代码库
   - 使用有意义的变量名和注释
   - 模块化设计，便于复用
   - 保持代码简洁清晰

5. **调试技巧**：
   - 使用 `console.log()` 输出调试信息
   - 分步骤测试，逐步完善
   - 使用 Toast 显示中间结果
   - 查看 ShortX 日志文件

## 下一步

- [规则引擎](/guide/rule-engine) - 了解规则引擎
- [事件系统](/guide/events) - 学习事件处理
- [API 参考](/api/actions) - 查看完整 API
