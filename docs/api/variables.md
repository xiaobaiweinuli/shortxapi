# 全局变量 API

全局变量 API 用于管理跨规则共享的变量。

## 添加全局变量

### addGlobalVar()

添加新的全局变量。

```java
void addGlobalVar(ByteArrayWrapper varWrapper)
```

**参数：**
- `varWrapper` - 序列化的全局变量对象

**示例：**

```java
GlobalVar var = new GlobalVar();
var.setName("counter");
var.setValue("0");
var.setDescription("计数器");

byte[] bytes = serializeGlobalVar(var);
ByteArrayWrapper wrapper = new ByteArrayWrapper(bytes);
shortXService.addGlobalVar(wrapper);
```

## 获取全局变量

### getGlobalVarByName()

通过名称获取全局变量。

```java
GlobalVar getGlobalVarByName(String varName)
```

**参数：**
- `varName` - 变量名称

**返回：**
- 全局变量对象，如果不存在则返回 null

**示例：**

```java
GlobalVar var = shortXService.getGlobalVarByName("counter");
if (var != null) {
    Log.d("ShortX", "Value: " + var.getValue());
}
```

### getAllGlobalVars()

获取所有全局变量。

```java
List<GlobalVar> getAllGlobalVars()
```

**返回：**
- 全局变量列表

**示例：**

```java
List<GlobalVar> vars = shortXService.getAllGlobalVars();
for (GlobalVar var : vars) {
    Log.d("ShortX", var.getName() + " = " + var.getValue());
}
```

## 删除全局变量

### deleteGlobalVar()

删除指定的全局变量。

```java
void deleteGlobalVar(String varName)
```

**参数：**
- `varName` - 变量名称

**示例：**

```java
shortXService.deleteGlobalVar("counter");
```

## 全局变量观察者

### registerGlobalVarObs()

注册全局变量观察者，监听变量变化。

```java
void registerGlobalVarObs(IGlobalVarObserver observer)
```

**参数：**
- `observer` - 全局变量观察者接口

**示例：**

```java
IGlobalVarObserver observer = new IGlobalVarObserver.Stub() {
    @Override
    public void onGlobalVarAdded(String varName) {
        Log.d("ShortX", "Variable added: " + varName);
    }
    
    @Override
    public void onGlobalVarUpdated(String varName, String newValue) {
        Log.d("ShortX", "Variable updated: " + varName + " = " + newValue);
    }
    
    @Override
    public void onGlobalVarDeleted(String varName) {
        Log.d("ShortX", "Variable deleted: " + varName);
    }
};

shortXService.registerGlobalVarObs(observer);
```

### unregisterGlobalVarObs()

注销全局变量观察者。

```java
void unregisterGlobalVarObs(IGlobalVarObserver observer)
```

**参数：**
- `observer` - 要注销的观察者

**示例：**

```java
shortXService.unregisterGlobalVarObs(observer);
```

## 在规则中使用

### JavaScript 中使用

```javascript
{
  "@type": "type.googleapis.com/ExecuteJS",
  "expression": `
    // 读取全局变量
    var counter = parseInt(globalVars.get('counter') || '0');
    
    // 修改变量
    counter++;
    
    // 保存变量
    globalVars.set('counter', counter.toString());
    
    return '当前计数: ' + counter;
  `,
  "id": "A-use-global-var"
}
```

### MVEL 中使用

```java
{
  "@type": "type.googleapis.com/ExecuteMVEL",
  "expression": "return globalVars.get('counter');",
  "id": "A-get-var"
}
```

## 使用场景

### 计数器

```java
// 初始化计数器
GlobalVar counter = new GlobalVar();
counter.setName("notification_count");
counter.setValue("0");
shortXService.addGlobalVar(serializeGlobalVar(counter));

// 在规则中递增
{
  "@type": "type.googleapis.com/ExecuteJS",
  "expression": `
    var count = parseInt(globalVars.get('notification_count') || '0');
    count++;
    globalVars.set('notification_count', count.toString());
    return count;
  `
}
```

### 状态标志

```java
// 设置状态标志
GlobalVar flag = new GlobalVar();
flag.setName("is_working");
flag.setValue("false");
shortXService.addGlobalVar(serializeGlobalVar(flag));

// 检查状态
{
  "@type": "type.googleapis.com/ExecuteJS",
  "expression": `
    var isWorking = globalVars.get('is_working') === 'true';
    if (!isWorking) {
      globalVars.set('is_working', 'true');
      // 执行操作
      doWork();
      globalVars.set('is_working', 'false');
    }
  `
}
```

### 配置存储

```java
// 存储配置
GlobalVar config = new GlobalVar();
config.setName("api_endpoint");
config.setValue("https://api.example.com");
shortXService.addGlobalVar(serializeGlobalVar(config));

// 使用配置
{
  "@type": "type.googleapis.com/ExecuteJS",
  "expression": `
    var endpoint = globalVars.get('api_endpoint');
    var url = endpoint + '/data';
    // 发送请求
  `
}
```

### 临时数据缓存

```java
// 缓存数据
{
  "@type": "type.googleapis.com/ExecuteJS",
  "expression": `
    // 保存最后一条通知
    globalVars.set('last_notification', JSON.stringify({
      title: '{title}',
      content: '{contentText}',
      time: Date.now()
    }));
  `
}

// 读取缓存
{
  "@type": "type.googleapis.com/ExecuteJS",
  "expression": `
    var lastNotification = JSON.parse(
      globalVars.get('last_notification') || '{}'
    );
    return lastNotification.title;
  `
}
```

## 数据类型

全局变量值以字符串形式存储，需要手动转换：

```javascript
// 数字
var num = parseInt(globalVars.get('number') || '0');
globalVars.set('number', num.toString());

// 布尔
var bool = globalVars.get('flag') === 'true';
globalVars.set('flag', bool.toString());

// 对象
var obj = JSON.parse(globalVars.get('object') || '{}');
globalVars.set('object', JSON.stringify(obj));

// 数组
var arr = JSON.parse(globalVars.get('array') || '[]');
globalVars.set('array', JSON.stringify(arr));
```

## 最佳实践

### 1. 命名规范

使用有意义的名称，避免冲突：

```java
// 好的命名
"notification_count"
"last_sync_time"
"user_preference_theme"

// 不好的命名
"var1"
"temp"
"x"
```

### 2. 初始化检查

在使用前检查变量是否存在：

```javascript
var value = globalVars.get('myVar');
if (value === null || value === undefined) {
  // 初始化默认值
  globalVars.set('myVar', 'default');
  value = 'default';
}
```

### 3. 类型转换

明确进行类型转换：

```javascript
// 安全的数字转换
var num = parseInt(globalVars.get('counter') || '0', 10);

// 安全的 JSON 解析
try {
  var obj = JSON.parse(globalVars.get('data') || '{}');
} catch (e) {
  obj = {};
}
```

### 4. 避免频繁更新

减少不必要的变量更新：

```javascript
// 不好：每次都更新
globalVars.set('counter', '1');
globalVars.set('counter', '2');
globalVars.set('counter', '3');

// 好：批量计算后更新
var counter = 0;
counter += 1;
counter += 2;
globalVars.set('counter', counter.toString());
```

### 5. 清理不用的变量

定期清理不再使用的变量：

```java
// 删除临时变量
shortXService.deleteGlobalVar("temp_data");
```

## 限制和注意事项

1. **存储大小**：避免存储大量数据
2. **并发访问**：注意多个规则同时访问同一变量
3. **持久化**：变量在应用重启后保持
4. **性能**：频繁读写可能影响性能

## 调试

### 查看所有变量

```java
List<GlobalVar> vars = shortXService.getAllGlobalVars();
for (GlobalVar var : vars) {
    Log.d("ShortX", String.format(
        "Name: %s, Value: %s, Description: %s",
        var.getName(),
        var.getValue(),
        var.getDescription()
    ));
}
```

### 监听变量变化

```java
shortXService.registerGlobalVarObs(
    new IGlobalVarObserver.Stub() {
        @Override
        public void onGlobalVarUpdated(String varName, String newValue) {
            Log.d("ShortX", varName + " changed to: " + newValue);
        }
    }
);
```

## 相关 API

- [规则管理](/api/rules) - 在规则中使用变量
- [动作管理](/api/actions) - 在动作中操作变量
- [代码库](/api/code-library) - 在脚本中使用变量
