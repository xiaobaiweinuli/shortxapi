# 规则管理 API

规则管理 API 用于创建、更新、删除和查询自动化规则。

## 添加规则

### addRule()

添加新规则到系统。

```java
void addRule(ByteArrayWrapper ruleWrapper)
```

**参数：**
- `ruleWrapper` - 序列化的规则对象

**示例：**

```java
// 创建规则
Rule rule = new Rule();
rule.setId("rule-001");
rule.setTitle("验证码自动复制");
rule.setEnabled(true);

// 序列化并添加
byte[] ruleBytes = serializeRule(rule);
ByteArrayWrapper wrapper = new ByteArrayWrapper(ruleBytes);
shortXService.addRule(wrapper);
```

## 更新规则

规则通过重新添加来更新（使用相同的 ID）。

## 删除规则

### deleteRule()

删除指定的规则。

```java
void deleteRule(String ruleId)
```

**参数：**
- `ruleId` - 规则 ID

**示例：**

```java
shortXService.deleteRule("rule-001");
```

## 查询规则

### getRuleById()

通过 ID 获取规则。

```java
Rule getRuleById(String ruleId)
```

**参数：**
- `ruleId` - 规则 ID

**返回：**
- 规则对象，如果不存在则返回 null

**示例：**

```java
Rule rule = shortXService.getRuleById("rule-001");
if (rule != null) {
    Log.d("ShortX", "Rule: " + rule.getTitle());
}
```

### getAllRules()

获取所有规则（分页）。

```java
List<Rule> getAllRules(String filter, int offset, int limit)
```

**参数：**
- `filter` - 过滤条件（可选）
- `offset` - 偏移量
- `limit` - 限制数量

**返回：**
- 规则列表

**示例：**

```java
// 获取前 20 条规则
List<Rule> rules = shortXService.getAllRules(null, 0, 20);

// 获取下一页
List<Rule> nextPage = shortXService.getAllRules(null, 20, 20);
```

### getRuleCount()

获取规则总数。

```java
int getRuleCount()
```

**返回：**
- 规则数量

**示例：**

```java
int count = shortXService.getRuleCount();
Log.d("ShortX", "Total rules: " + count);
```

## 启用/禁用规则

### setRuleEnabled()

启用或禁用规则。

```java
void setRuleEnabled(String ruleId, boolean enabled)
```

**参数：**
- `ruleId` - 规则 ID
- `enabled` - true 启用，false 禁用

**示例：**

```java
// 启用规则
shortXService.setRuleEnabled("rule-001", true);

// 禁用规则
shortXService.setRuleEnabled("rule-001", false);
```

## 规则集管理

### addOrUpdateRuleSet()

添加或更新规则集。

```java
void addOrUpdateRuleSet(ByteArrayWrapper ruleSetWrapper)
```

**参数：**
- `ruleSetWrapper` - 序列化的规则集对象

**示例：**

```java
RuleSet ruleSet = new RuleSet();
ruleSet.setId("RS-001");
ruleSet.setTitle("通知处理规则集");
ruleSet.addRuleId("rule-001");
ruleSet.addRuleId("rule-002");

byte[] bytes = serializeRuleSet(ruleSet);
ByteArrayWrapper wrapper = new ByteArrayWrapper(bytes);
shortXService.addOrUpdateRuleSet(wrapper);
```

### getRuleSetById()

通过 ID 获取规则集。

```java
RuleSet getRuleSetById(String ruleSetId, boolean includeDetails)
```

**参数：**
- `ruleSetId` - 规则集 ID
- `includeDetails` - 是否包含详细信息

**返回：**
- 规则集对象

**示例：**

```java
RuleSet ruleSet = shortXService.getRuleSetById("RS-001", true);
```

### getAllRuleSets()

获取所有规则集。

```java
List<RuleSet> getAllRuleSets(boolean includeDetails)
```

**参数：**
- `includeDetails` - 是否包含详细信息

**返回：**
- 规则集列表

**示例：**

```java
List<RuleSet> ruleSets = shortXService.getAllRuleSets(false);
```

### deleteRuleSet()

删除规则集。

```java
void deleteRuleSet(String ruleSetId)
```

**参数：**
- `ruleSetId` - 规则集 ID

**示例：**

```java
shortXService.deleteRuleSet("RS-001");
```

## 规则执行

### directExecuteRuleActions()

直接执行规则的动作。

```java
void directExecuteRuleActions(
    ByteArrayWrapper actionsWrapper,
    String contextData
)
```

**参数：**
- `actionsWrapper` - 序列化的动作列表
- `contextData` - 上下文数据

**示例：**

```java
List<Action> actions = new ArrayList<>();
actions.add(createToastAction("测试"));

byte[] bytes = serializeActions(actions);
ByteArrayWrapper wrapper = new ByteArrayWrapper(bytes);
shortXService.directExecuteRuleActions(wrapper, "{}");
```

## 规则观察者

### registerRuleObs()

注册规则观察者，监听规则变化。

```java
void registerRuleObs(IRuleObserver observer)
```

**参数：**
- `observer` - 规则观察者接口

**示例：**

```java
IRuleObserver observer = new IRuleObserver.Stub() {
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
};

shortXService.registerRuleObs(observer);
```

### unregisterRuleObs()

注销规则观察者。

```java
void unregisterRuleObs(IRuleObserver observer)
```

**参数：**
- `observer` - 要注销的观察者

**示例：**

```java
shortXService.unregisterRuleObs(observer);
```

## 规则功能控制

### setRuleFeatureEnabled()

启用或禁用规则功能。

```java
void setRuleFeatureEnabled(boolean enabled)
```

**参数：**
- `enabled` - true 启用，false 禁用

**示例：**

```java
// 启用规则功能
shortXService.setRuleFeatureEnabled(true);
```

### isRuleFeatureEnabled()

检查规则功能是否启用。

```java
boolean isRuleFeatureEnabled()
```

**返回：**
- true 已启用，false 已禁用

**示例：**

```java
boolean enabled = shortXService.isRuleFeatureEnabled();
```

### setRuleEngineEnabled()

启用或禁用特定规则引擎。

```java
void setRuleEngineEnabled(String engineType, boolean enabled)
```

**参数：**
- `engineType` - 引擎类型
- `enabled` - true 启用，false 禁用

**示例：**

```java
shortXService.setRuleEngineEnabled("default", true);
```

### isRuleEngineEnabled()

检查规则引擎是否启用。

```java
boolean isRuleEngineEnabled(String engineType)
```

**参数：**
- `engineType` - 引擎类型

**返回：**
- true 已启用，false 已禁用

**示例：**

```java
boolean enabled = shortXService.isRuleEngineEnabled("default");
```

## 规则状态监听

### registerRuleFeatureStateListener()

注册规则功能状态监听器。

```java
void registerRuleFeatureStateListener(
    IRuleFeatureStateListener listener
)
```

**参数：**
- `listener` - 状态监听器

**示例：**

```java
IRuleFeatureStateListener listener = 
    new IRuleFeatureStateListener.Stub() {
        @Override
        public void onStateChanged(boolean enabled) {
            Log.d("ShortX", "Rule feature: " + enabled);
        }
    };

shortXService.registerRuleFeatureStateListener(listener);
```

## 在线规则

### loadOnlineRules()

从在线加载规则。

```java
void loadOnlineRules(
    String url,
    String ruleSetId,
    ICallback callback
)
```

**参数：**
- `url` - 规则 URL
- `ruleSetId` - 规则集 ID
- `callback` - 回调接口

**示例：**

```java
shortXService.loadOnlineRules(
    "https://example.com/rules.json",
    "RS-online",
    new ICallback.Stub() {
        @Override
        public void onCallback(String result) {
            Log.d("ShortX", "Loaded: " + result);
        }
    }
);
```

## 最佳实践

1. **使用规则集**：组织相关规则
2. **合理命名**：使用有意义的 ID 和标题
3. **及时清理**：删除不需要的规则
4. **监听变化**：使用观察者跟踪规则状态
5. **错误处理**：捕获 API 调用异常

## 相关 API

- [动作管理](/api/actions) - 管理动作
- [事件系统](/guide/events) - 了解事件
- [规则引擎](/guide/rule-engine) - 规则引擎详解
