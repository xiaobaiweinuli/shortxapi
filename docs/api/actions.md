# 动作管理 API

动作管理 API 用于执行各种自动化操作和管理直接动作。

## 动作执行

### executeAction()

执行单个动作。

```java
void executeAction(
    ByteArrayWrapper actionWrapper,
    ByteArrayWrapper conditionWrapper,
    ByteArrayWrapper contextWrapper
)
```

**参数：**
- `actionWrapper` - 序列化的动作对象
- `conditionWrapper` - 条件对象（可选）
- `contextWrapper` - 上下文数据

**示例：**

```java
Action action = createToastAction("Hello");
byte[] actionBytes = serializeAction(action);
ByteArrayWrapper actionWrapper = new ByteArrayWrapper(actionBytes);

byte[] contextBytes = serializeContext(context);
ByteArrayWrapper contextWrapper = new ByteArrayWrapper(contextBytes);

shortXService.executeAction(actionWrapper, null, contextWrapper);
```

### executeActionBlocking()

阻塞执行动作（等待完成）。

```java
void executeActionBlocking(
    ByteArrayWrapper actionWrapper,
    ByteArrayWrapper contextWrapper
)
```

**参数：**
- `actionWrapper` - 序列化的动作对象
- `contextWrapper` - 上下文数据

**示例：**

```java
shortXService.executeActionBlocking(actionWrapper, contextWrapper);
Log.d("ShortX", "Action completed");
```

## 脚本执行

### executeJS()

执行 JavaScript 代码。

```java
String executeJS(String script, int mode)
```

**参数：**
- `script` - JavaScript 代码
- `mode` - 执行模式

**返回：**
- 执行结果字符串

**示例：**

```java
String script = "var result = 1 + 1; return result;";
String result = shortXService.executeJS(script, 0);
Log.d("ShortX", "Result: " + result); // "2"
```

### executeMVEL()

执行 MVEL 表达式。

```java
String executeMVEL(String expression, int mode)
```

**参数：**
- `expression` - MVEL 表达式
- `mode` - 执行模式

**返回：**
- 执行结果字符串

**示例：**

```java
String expression = "return 'Hello ' + 'World';";
String result = shortXService.executeMVEL(expression, 0);
Log.d("ShortX", "Result: " + result); // "Hello World"
```

## 条件评估

### evaluateCondition()

评估条件表达式。

```java
boolean evaluateCondition(
    ByteArrayWrapper conditionWrapper,
    ByteArrayWrapper contextWrapper
)
```

**参数：**
- `conditionWrapper` - 序列化的条件对象
- `contextWrapper` - 上下文数据

**返回：**
- true 条件满足，false 条件不满足

**示例：**

```java
Condition condition = createCondition("status", "success");
byte[] conditionBytes = serializeCondition(condition);
ByteArrayWrapper conditionWrapper = new ByteArrayWrapper(conditionBytes);

boolean result = shortXService.evaluateCondition(
    conditionWrapper,
    contextWrapper
);
```

## 直接动作

### addDirectAction()

添加直接动作。

```java
void addDirectAction(ByteArrayWrapper actionWrapper)
```

**参数：**
- `actionWrapper` - 序列化的直接动作对象

**示例：**

```java
DirectAction action = new DirectAction();
action.setId("DA-001");
action.setTitle("快捷操作");
action.setAction(createToastAction("快捷操作触发"));

byte[] bytes = serializeDirectAction(action);
ByteArrayWrapper wrapper = new ByteArrayWrapper(bytes);
shortXService.addDirectAction(wrapper);
```

### getDirectActionById()

通过 ID 获取直接动作。

```java
DirectAction getDirectActionById(String actionId)
```

**参数：**
- `actionId` - 动作 ID

**返回：**
- 直接动作对象

**示例：**

```java
DirectAction action = shortXService.getDirectActionById("DA-001");
```

### getAllDirectAction()

获取所有直接动作（分页）。

```java
List<DirectAction> getAllDirectAction(
    String filter,
    int offset,
    int limit
)
```

**参数：**
- `filter` - 过滤条件
- `offset` - 偏移量
- `limit` - 限制数量

**返回：**
- 直接动作列表

**示例：**

```java
List<DirectAction> actions = 
    shortXService.getAllDirectAction(null, 0, 20);
```

### executeDirectionActionById()

通过 ID 执行直接动作。

```java
void executeDirectionActionById(
    ByteArrayWrapper contextWrapper,
    String actionId
)
```

**参数：**
- `contextWrapper` - 上下文数据
- `actionId` - 动作 ID

**示例：**

```java
shortXService.executeDirectionActionById(contextWrapper, "DA-001");
```

### deleteDirectAction()

删除直接动作。

```java
void deleteDirectAction(String actionId)
```

**参数：**
- `actionId` - 动作 ID

**示例：**

```java
shortXService.deleteDirectAction("DA-001");
```

### getDirectActionCount()

获取直接动作数量。

```java
int getDirectActionCount()
```

**返回：**
- 动作数量

**示例：**

```java
int count = shortXService.getDirectActionCount();
```

## 直接动作集

### addOrUpdateDASet()

添加或更新直接动作集。

```java
void addOrUpdateDASet(ByteArrayWrapper daSetWrapper)
```

**参数：**
- `daSetWrapper` - 序列化的 DA 集对象

**示例：**

```java
DASet daSet = new DASet();
daSet.setId("DAS-001");
daSet.setTitle("常用操作集");
daSet.addActionId("DA-001");
daSet.addActionId("DA-002");

byte[] bytes = serializeDASet(daSet);
ByteArrayWrapper wrapper = new ByteArrayWrapper(bytes);
shortXService.addOrUpdateDASet(wrapper);
```

### getDASetById()

通过 ID 获取 DA 集。

```java
DASet getDASetById(String daSetId, boolean includeDetails)
```

**参数：**
- `daSetId` - DA 集 ID
- `includeDetails` - 是否包含详细信息

**返回：**
- DA 集对象

**示例：**

```java
DASet daSet = shortXService.getDASetById("DAS-001", true);
```

### getAllDASets()

获取所有 DA 集。

```java
List<DASet> getAllDASets(boolean includeDetails)
```

**参数：**
- `includeDetails` - 是否包含详细信息

**返回：**
- DA 集列表

**示例：**

```java
List<DASet> daSets = shortXService.getAllDASets(false);
```

### deleteDASet()

删除 DA 集。

```java
void deleteDASet(String daSetId)
```

**参数：**
- `daSetId` - DA 集 ID

**示例：**

```java
shortXService.deleteDASet("DAS-001");
```

## DA 观察者

### registerDAObs()

注册 DA 观察者。

```java
void registerDAObs(IDAObserver observer)
```

**参数：**
- `observer` - DA 观察者接口

**示例：**

```java
IDAObserver observer = new IDAObserver.Stub() {
    @Override
    public void onDAAdded(String daId) {
        Log.d("ShortX", "DA added: " + daId);
    }
    
    @Override
    public void onDAUpdated(String daId) {
        Log.d("ShortX", "DA updated: " + daId);
    }
    
    @Override
    public void onDADeleted(String daId) {
        Log.d("ShortX", "DA deleted: " + daId);
    }
};

shortXService.registerDAObs(observer);
```

### unregisterDAObs()

注销 DA 观察者。

```java
void unregisterDAObs(IDAObserver observer)
```

**参数：**
- `observer` - 要注销的观察者

**示例：**

```java
shortXService.unregisterDAObs(observer);
```

## HTTP 请求

### executeHttpRequest()

执行 HTTP 请求。

```java
String executeHttpRequest(ByteArrayWrapper requestWrapper)
```

**参数：**
- `requestWrapper` - 序列化的 HTTP 请求对象

**返回：**
- HTTP 响应字符串

**示例：**

```java
HttpRequest request = new HttpRequest();
request.setUrl("https://api.example.com/data");
request.setMethod("GET");
request.addHeader("Accept", "application/json");

byte[] bytes = serializeHttpRequest(request);
ByteArrayWrapper wrapper = new ByteArrayWrapper(bytes);
String response = shortXService.executeHttpRequest(wrapper);
```

### HTTP 请求日志

```java
// 启用 HTTP 请求日志
shortXService.setHttpRequestLogEnabled(true);

// 检查状态
boolean enabled = shortXService.isHttpRequestLogEnabled();

// 获取日志文件描述符
ParcelFileDescriptor logFd = shortXService.getHttpRequestLogFD();

// 获取日志路径
String logPath = shortXService.getHttpRequestLogPath();

// 清除日志
shortXService.clearHttpRequestLogs();
```

## Shell 命令

### executeShellCommand()

执行 Shell 命令。

```java
void executeShellCommand(String command, ICallback callback)
```

**参数：**
- `command` - Shell 命令
- `callback` - 回调接口

**示例：**

```java
shortXService.executeShellCommand(
    "ls -la /sdcard",
    new ICallback.Stub() {
        @Override
        public void onCallback(String result) {
            Log.d("ShortX", "Output: " + result);
        }
    }
);
```

### 注入 Shell

```java
// 启用注入 Shell
shortXService.setInjectedShellEnabled(true);

// 检查状态
boolean enabled = shortXService.isInjectedShellEnabled();
```

## 菜单动作

### onMenuActionTrigger()

触发菜单动作。

```java
void onMenuActionTrigger(int menuNumber, String actionId)
```

**参数：**
- `menuNumber` - 菜单编号
- `actionId` - 动作 ID

**示例：**

```java
shortXService.onMenuActionTrigger(1, "action-001");
```

## 动作评估

### 评估记录

```java
// 启用动作评估记录
shortXService.setEvaluateRecordEnabled("action", true);

// 检查状态
boolean enabled = shortXService.isEvaluateRecordEnabled("action");

// 获取评估记录
List<ActionEvaluateRecord> records = 
    shortXService.getActionEvaluateRecords();

// 清除记录
shortXService.clearEvaluateRecords();
```

### 评估监听器

```java
// 注册动作评估监听器
shortXService.registerActionEvaluateListener(
    new IActionEvaluateListener.Stub() {
        @Override
        public void onActionEvaluate(ActionEvaluateRecord record) {
            Log.d("ShortX", "Action evaluated: " + record);
        }
    }
);

// 注销监听器
shortXService.unregisterActionEvaluateListener(listener);
```

## 正在评估的动作

### getEvaluatingActions()

获取正在评估的动作列表。

```java
List<Action> getEvaluatingActions()
```

**返回：**
- 正在评估的动作列表

**示例：**

```java
List<Action> actions = shortXService.getEvaluatingActions();
for (Action action : actions) {
    Log.d("ShortX", "Evaluating: " + action.getId());
}
```

## 最佳实践

1. **异步执行**：使用回调处理耗时操作
2. **错误处理**：在脚本中添加 try-catch
3. **资源管理**：及时注销观察者
4. **日志记录**：启用日志便于调试
5. **性能优化**：避免频繁执行复杂脚本

## 相关 API

- [规则管理](/api/rules) - 管理规则
- [代码库](/api/code-library) - 管理脚本
- [动作执行](/guide/actions) - 动作使用指南
