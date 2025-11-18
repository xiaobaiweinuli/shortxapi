# 规则引擎

ShortX 的规则引擎是整个自动化系统的核心，负责监听事件、评估条件并执行动作。

## 规则引擎架构

```
事件监听器 → 规则引擎 → 条件评估 → 动作执行
     ↓           ↓          ↓          ↓
  通知/手势    规则匹配    变量检查    脚本/操作
```

## 启用和禁用

### 全局控制

```java
// 启用规则功能
shortXService.setRuleFeatureEnabled(true);

// 检查规则功能状态
boolean isEnabled = shortXService.isRuleFeatureEnabled();

// 启用特定规则引擎
shortXService.setRuleEngineEnabled("default", true);

// 检查规则引擎状态
boolean engineEnabled = shortXService.isRuleEngineEnabled("default");
```

### 单个规则控制

```java
// 启用规则
shortXService.setRuleEnabled(ruleId, true);

// 禁用规则
shortXService.setRuleEnabled(ruleId, false);
```

## 规则评估

### 评估记录

规则引擎会记录每次评估的详细信息：

```java
// 启用评估记录
shortXService.setEvaluateRecordEnabled("action", true);
shortXService.setEvaluateRecordEnabled("condition", true);

// 获取动作评估记录
List<ActionEvaluateRecord> actionRecords = 
    shortXService.getActionEvaluateRecords();

// 获取条件评估记录
List<ConditionEvaluateRecord> conditionRecords = 
    shortXService.getConditionEvaluateRecords();

// 清除评估记录
shortXService.clearEvaluateRecords();
```

### 评估监听器

```java
// 注册动作评估监听器
shortXService.registerActionEvaluateListener(
    new IActionEvaluateListener.Stub() {
        @Override
        public void onActionEvaluate(ActionEvaluateRecord record) {
            // 处理评估事件
            Log.d("ShortX", "Action evaluated: " + record);
        }
    }
);

// 注销监听器
shortXService.unregisterActionEvaluateListener(listener);
```

## 规则执行

### 直接执行

```java
// 直接执行规则动作
ByteArrayWrapper contextWrapper = createContext();
shortXService.directExecuteRuleActions(actionsWrapper, contextWrapper);
```

### 条件执行

```java
// 评估条件
ByteArrayWrapper conditionWrapper = createCondition();
ByteArrayWrapper contextWrapper = createContext();
boolean result = shortXService.evaluateCondition(
    conditionWrapper, 
    contextWrapper
);

// 执行动作
if (result) {
    shortXService.executeAction(
        actionWrapper, 
        conditionWrapper, 
        contextWrapper
    );
}
```

### 阻塞执行

```java
// 阻塞执行动作（等待完成）
shortXService.executeActionBlocking(actionWrapper, contextWrapper);
```

## 规则优先级

规则按照添加顺序执行，可以通过规则集来组织优先级：

```java
// 创建高优先级规则集
RuleSet highPrioritySet = new RuleSet();
highPrioritySet.setId("RS-high-priority");
highPrioritySet.setPriority(100);

// 创建低优先级规则集
RuleSet lowPrioritySet = new RuleSet();
lowPrioritySet.setId("RS-low-priority");
lowPrioritySet.setPriority(10);
```

## 规则调试

### 日志记录

```java
// 启用调试日志
shortXService.setLogDebugEnable(true);

// 记录日志
shortXService.log("TAG", "Debug message");

// 获取日志
ParcelFileDescriptor logFd = shortXService.getJSLogFD();
```

### 错误处理

```java
// 检查致命错误
boolean hasFatalError = shortXService.hasFatalError();

// 报告错误
shortXService.reportFATALError("Error description");

// 处理未捕获异常
shortXService.uncaughtException("Exception details");
```

## 性能优化

### 规则缓存

规则引擎会自动缓存已编译的规则，提高执行效率。

### 批量操作

```java
// 批量添加规则
List<ByteArrayWrapper> rules = new ArrayList<>();
for (Rule rule : ruleList) {
    rules.add(serializeRule(rule));
}

// 使用事务添加
for (ByteArrayWrapper wrapper : rules) {
    shortXService.addRule(wrapper);
}
```

### 异步执行

```java
// 使用回调异步执行
shortXService.executeShellCommand(
    "ls -la",
    new ICallback.Stub() {
        @Override
        public void onResult(String result) {
            // 处理结果
        }
    }
);
```

## 规则状态监听

```java
// 注册规则功能状态监听器
shortXService.registerRuleFeatureStateListener(
    new IRuleFeatureStateListener.Stub() {
        @Override
        public void onStateChanged(boolean enabled) {
            Log.d("ShortX", "Rule feature state: " + enabled);
        }
    }
);

// 注册规则观察者
shortXService.registerRuleObs(
    new IRuleObserver.Stub() {
        @Override
        public void onRuleAdded(String ruleId) {
            Log.d("ShortX", "Rule added: " + ruleId);
        }
        
        @Override
        public void onRuleUpdated(String ruleId) {
            Log.d("ShortX", "Rule updated: " + ruleId);
        }
        
        @Override
        public void onRuleDeleted(String ruleId) {
            Log.d("ShortX", "Rule deleted: " + ruleId);
        }
    }
);
```

## 最佳实践

1. **合理使用评估记录**：仅在调试时启用，避免性能影响
2. **规则分组**：使用规则集组织相关规则
3. **错误处理**：在脚本中添加 try-catch 块
4. **资源清理**：及时注销监听器和观察者
5. **测试规则**：在生产环境前充分测试

## 下一步

- [事件系统](/guide/events) - 了解事件处理
- [动作执行](/guide/actions) - 学习动作使用
- [规则管理 API](/api/rules) - 查看完整 API
