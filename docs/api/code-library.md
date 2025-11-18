# 代码库 API

代码库 API 用于管理可重用的脚本代码。

## 添加代码库项

### addCodeLibraryItem()

添加新的代码库项。

```java
void addCodeLibraryItem(ByteArrayWrapper itemWrapper)
```

**参数：**
- `itemWrapper` - 序列化的代码库项对象

**示例：**

```java
CodeLibraryItem item = new CodeLibraryItem();
item.setId("CL-001");
item.setTitle("HTTP 请求工具");
item.setDescription("封装的 HTTP 请求函数");
item.setCode(`
function httpGet(url) {
    // HTTP GET 实现
    return result;
}
`);
item.setLanguage("javascript");

byte[] bytes = serializeCodeLibraryItem(item);
ByteArrayWrapper wrapper = new ByteArrayWrapper(bytes);
shortXService.addCodeLibraryItem(wrapper);
```

## 更新代码库项

### updateCodeLibraryItem()

更新现有的代码库项。

```java
void updateCodeLibraryItem(ByteArrayWrapper itemWrapper)
```

**参数：**
- `itemWrapper` - 序列化的代码库项对象

**示例：**

```java
CodeLibraryItem item = shortXService.getCodeLibraryItemById("CL-001");
item.setCode("// 更新后的代码");

byte[] bytes = serializeCodeLibraryItem(item);
ByteArrayWrapper wrapper = new ByteArrayWrapper(bytes);
shortXService.updateCodeLibraryItem(wrapper);
```

## 查询代码库项

### getCodeLibraryItemById()

通过 ID 获取代码库项。

```java
CodeLibraryItem getCodeLibraryItemById(String itemId)
```

**参数：**
- `itemId` - 代码库项 ID

**返回：**
- 代码库项对象

**示例：**

```java
CodeLibraryItem item = shortXService.getCodeLibraryItemById("CL-001");
if (item != null) {
    Log.d("ShortX", "Code: " + item.getCode());
}
```

### getAllCodeLibraryItems()

获取所有代码库项。

```java
List<CodeLibraryItem> getAllCodeLibraryItems()
```

**返回：**
- 代码库项列表

**示例：**

```java
List<CodeLibraryItem> items = shortXService.getAllCodeLibraryItems();
for (CodeLibraryItem item : items) {
    Log.d("ShortX", item.getTitle());
}
```

### queryCodeLibraryItems()

查询代码库项。

```java
List<CodeLibraryItem> queryCodeLibraryItems(
    ByteArrayWrapper queryWrapper
)
```

**参数：**
- `queryWrapper` - 序列化的查询条件

**返回：**
- 匹配的代码库项列表

**示例：**

```java
Query query = new Query();
query.setLanguage("javascript");
query.setKeyword("http");

byte[] bytes = serializeQuery(query);
ByteArrayWrapper wrapper = new ByteArrayWrapper(bytes);
List<CodeLibraryItem> items = shortXService.queryCodeLibraryItems(wrapper);
```

### getCodeLibraryItemCount()

获取代码库项数量。

```java
int getCodeLibraryItemCount()
```

**返回：**
- 代码库项数量

**示例：**

```java
int count = shortXService.getCodeLibraryItemCount();
Log.d("ShortX", "Total items: " + count);
```

## 执行代码库项

### executeCodeLibraryItem()

执行代码库项。

```java
String executeCodeLibraryItem(String itemId, int mode)
```

**参数：**
- `itemId` - 代码库项 ID
- `mode` - 执行模式

**返回：**
- 执行结果字符串

**示例：**

```java
String result = shortXService.executeCodeLibraryItem("CL-001", 0);
Log.d("ShortX", "Result: " + result);
```

## 删除代码库项

### deleteCodeLibraryItem()

删除指定的代码库项。

```java
void deleteCodeLibraryItem(String itemId)
```

**参数：**
- `itemId` - 代码库项 ID

**示例：**

```java
shortXService.deleteCodeLibraryItem("CL-001");
```

## 使用场景

### 1. 工具函数库

```javascript
// 添加工具函数
{
  "id": "CL-utils",
  "title": "通用工具函数",
  "code": `
    // 格式化日期
    function formatDate(timestamp) {
      var date = new Date(timestamp);
      return date.toLocaleDateString();
    }
    
    // 提取数字
    function extractNumbers(text) {
      return text.match(/\\d+/g);
    }
    
    // 发送通知
    function sendNotification(title, content) {
      // 实现通知发送
    }
  `,
  "language": "javascript"
}
```

### 2. API 封装

```javascript
// HTTP 请求封装
{
  "id": "CL-http",
  "title": "HTTP 请求库",
  "code": `
    function httpRequest(url, method, headers, body) {
      importClass(java.net.URL);
      importClass(java.net.HttpURLConnection);
      
      var conn = new URL(url).openConnection();
      conn.setRequestMethod(method);
      
      // 设置请求头
      for (var key in headers) {
        conn.setRequestProperty(key, headers[key]);
      }
      
      // 发送请求体
      if (body && (method === 'POST' || method === 'PUT')) {
        conn.setDoOutput(true);
        var os = conn.getOutputStream();
        os.write(new java.lang.String(body).getBytes('UTF-8'));
        os.close();
      }
      
      // 读取响应
      var reader = new java.io.BufferedReader(
        new java.io.InputStreamReader(conn.getInputStream())
      );
      var response = '';
      var line;
      while ((line = reader.readLine()) != null) {
        response += line;
      }
      reader.close();
      
      return response;
    }
  `,
  "language": "javascript"
}
```

### 3. 数据处理

```javascript
// 验证码提取
{
  "id": "CL-extract-code",
  "title": "验证码提取",
  "code": `
    function extractVerificationCode(text) {
      var keywords = ['验证码', 'code', 'Code'];
      var pattern = /\\d{4,8}/g;
      
      var closestCode = null;
      var closestDistance = Infinity;
      
      for (var i = 0; i < keywords.length; i++) {
        var keyword = keywords[i];
        var keywordIndex = text.indexOf(keyword);
        
        if (keywordIndex !== -1) {
          var matches = text.match(pattern);
          if (matches) {
            for (var j = 0; j < matches.length; j++) {
              var codeIndex = text.indexOf(matches[j]);
              var distance = Math.abs(codeIndex - keywordIndex);
              
              if (distance < closestDistance) {
                closestDistance = distance;
                closestCode = matches[j];
              }
            }
          }
        }
      }
      
      return closestCode;
    }
  `,
  "language": "javascript"
}
```

### 4. 设备控制

```javascript
// 米家设备控制
{
  "id": "CL-mijia",
  "title": "米家设备控制",
  "code": `
    function controlMijiaDevice(deviceId, action, value) {
      // 米家设备控制实现
      var endpoint = 'https://api.io.mi.com/app';
      var data = {
        did: deviceId,
        action: action,
        value: value
      };
      
      return httpRequest(endpoint, 'POST', {
        'Content-Type': 'application/json'
      }, JSON.stringify(data));
    }
  `,
  "language": "javascript"
}
```

## 在规则中使用

### 直接调用

```json
{
  "@type": "type.googleapis.com/ExecuteJS",
  "expression": `
    // 加载代码库
    load('CL-utils');
    
    // 使用函数
    var formatted = formatDate(Date.now());
    return formatted;
  `,
  "id": "A-use-library"
}
```

### 通过 ID 执行

```java
// 在 Java 中执行
String result = shortXService.executeCodeLibraryItem("CL-utils", 0);
```

## 代码组织

### 模块化设计

```javascript
// 基础模块
{
  "id": "CL-base",
  "code": "var Base = { version: '1.0' };"
}

// 扩展模块
{
  "id": "CL-extension",
  "code": `
    load('CL-base');
    Base.extend = function() { /* ... */ };
  `
}
```

### 命名空间

```javascript
{
  "id": "CL-namespace",
  "code": `
    var MyApp = MyApp || {};
    
    MyApp.Utils = {
      formatDate: function(date) { /* ... */ },
      parseJSON: function(json) { /* ... */ }
    };
    
    MyApp.API = {
      get: function(url) { /* ... */ },
      post: function(url, data) { /* ... */ }
    };
  `
}
```

## 最佳实践

### 1. 文档注释

```javascript
/**
 * HTTP GET 请求
 * @param {string} url - 请求 URL
 * @param {object} headers - 请求头
 * @return {string} 响应内容
 */
function httpGet(url, headers) {
  // 实现
}
```

### 2. 错误处理

```javascript
function safeExecute(fn) {
  try {
    return fn();
  } catch (e) {
    console.error('Error:', e.message);
    return null;
  }
}
```

### 3. 参数验证

```javascript
function validateParams(params) {
  if (!params || typeof params !== 'object') {
    throw new Error('Invalid parameters');
  }
  return true;
}
```

### 4. 版本管理

```javascript
{
  "id": "CL-mylib",
  "version": "1.0.0",
  "code": `
    var MyLib = {
      version: '1.0.0',
      // 功能实现
    };
  `
}
```

### 5. 依赖管理

```javascript
{
  "id": "CL-advanced",
  "dependencies": ["CL-base", "CL-utils"],
  "code": `
    // 确保依赖已加载
    if (typeof Base === 'undefined') {
      load('CL-base');
    }
    if (typeof Utils === 'undefined') {
      load('CL-utils');
    }
    
    // 使用依赖
    var Advanced = {
      // 实现
    };
  `
}
```

## 调试

### 日志输出

```javascript
function debug(message) {
  console.log('[DEBUG] ' + message);
}

function info(message) {
  console.log('[INFO] ' + message);
}

function error(message) {
  console.error('[ERROR] ' + message);
}
```

### 性能测试

```javascript
function benchmark(fn, iterations) {
  var start = Date.now();
  for (var i = 0; i < iterations; i++) {
    fn();
  }
  var end = Date.now();
  return (end - start) / iterations;
}
```

## 相关 API

- [动作管理](/api/actions) - 执行脚本
- [规则管理](/api/rules) - 在规则中使用
- [全局变量](/api/variables) - 存储数据
