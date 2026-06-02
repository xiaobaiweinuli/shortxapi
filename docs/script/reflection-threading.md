# 反射、线程与同步

复杂 ShortX JS 经常同时使用反射和线程。二维码扫描、邮件发送、悬浮窗等复杂场景通常属于这一类。

## 反射辅助函数

邮件发送导出中常见这种辅助包装：

```javascript
function callStatic(clazz, methodName, types, args) {
    return clazz.getMethod(methodName, types).invoke(null, args);
}

function create(clazz, types, args) {
    if (!types) return clazz.newInstance();
    return clazz.getConstructor(types).newInstance(args);
}

function getStatic(clazz, fieldName) {
    return clazz.getField(fieldName).get(null);
}
```

适合在以下场景使用：

- 外部 jar 类较多。
- 构造器和静态方法重复调用。
- 直接写 `getMethod(...).invoke(...)` 可读性很差。

## 线程模式

常见写法：

```javascript
importClass(java.util.concurrent.CountDownLatch);
importPackage(java.lang);

var latch = new CountDownLatch(1);
var output = null;

new Thread(function () {
    try {
        output = doWork();
    } finally {
        latch.countDown();
    }
}).start();

latch.await();
output;
```

## UI 线程

Android UI 相关脚本常用：

```javascript
importClass(android.os.Handler);
importClass(android.os.Looper);
importClass(java.lang.Runnable);

var uiHandler = new Handler(Looper.getMainLooper());

function runOnUiThread(fn) {
    uiHandler.post(new JavaAdapter(Runnable, { run: fn }));
}
```

## 什么时候需要同步

- 等待图片解码或二维码识别。
- 等待 UI 操作完成或超时。
- 等待线程读取文件、网络或外部库结果。

## 避免的问题

- 不要在循环中输出中间结果。
- 不要创建线程后立刻返回空值。
- 不要忘记在异常路径 `countDown()`。
- 不要让悬浮窗或 View 缺少清理路径。

