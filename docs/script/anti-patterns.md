# 常见反例

这些反例用于提醒常见写法偏差。遇到类似需求时，应先判断它属于动作链、JS、MVEL 还是 Android 服务问题，再选择对应入口。

## 把 ShortX JS 当浏览器 JS

错误：

```javascript
document.querySelector("#btn").click();
```

ShortX JS 没有 DOM。需要 UI 时，真实写法通常是 Android `View`、`WindowManager`、`Handler` 等。

## 把 ShortX JS 当 Node.js

错误：

```javascript
var fs = require("fs");
```

ShortX JS 访问文件通常使用 Java 类：

```javascript
importClass(java.io.File);
var file = new File("/sdcard/example.txt");
file.exists();
```

## 自动现代化

不推荐：

```javascript
const items = data.map(x => x.name);
```

推荐保持真实风格：

```javascript
var rows = [];
for (var i = 0; i < data.length; i++) {
    rows.push(data[i].name);
}
rows.join("\n");
```

## 忽略下游消费者

错误：

```javascript
console.log(resultText);
```

正确：

```javascript
resultText;
```

如果下游要读 `{PackageName}`，就用 `customContextDataKey` 把 `jsRet` 改成 `PackageName`。

## 重名上下文变量

错误：

```javascript
var pkgName = "tornaco.apps.shortx";
```

正确：

```javascript
var packageNameValue = "tornaco.apps.shortx";
```
