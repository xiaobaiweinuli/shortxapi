# 高级案例：剪贴板与文件数据

剪贴板有两种完全不同的语境：Android 系统当前剪贴板，以及 ShortX 自己保存的全局剪贴板历史。不要混为一谈。

## 当前剪贴板

当前剪贴板适合用 ShortX 内置动作或 Android `ClipboardManager`：

```text
ReadClipboard
  -> clipboardContent
  -> ExecuteJS 清洗
  -> WriteClipboard / ShowAlertDialog
```

读取时直接消费 `clipboardContent`，不要声明同名变量：

```javascript
var resultText = String(clipboardContent).trim();
resultText;
```

## ShortX 全局剪贴板历史

一种高级做法是解析 ShortX 全局剪贴板数据。它不是普通剪贴板 API，而是读取 ShortX 数据目录中的文件：

```text
ShortX 根目录
  -> data/u/0/data_store/InputService.pb
  -> 读取 ServiceIns 作为密钥来源
  -> data/u/0/data_store/Clip.pb
  -> proto 解析 ClipboardItemList
  -> AES 解密 item value
  -> 输出 JSON
```

这类能力依赖 ShortX 内部文件格式和加密方式，属于高级读档，不适合作为普通剪贴板教程的默认入口。

## 推荐输出结构

如果确实要处理历史记录，第一步应该输出 JSON 数组：

```json
[
  {
    "id": "...",
    "createAt": 1775293916646,
    "createAtText": "2026-04-04 12:00:00",
    "text": "内容",
    "isPinned": false,
    "ownerPkgName": "example.app",
    "ownerUserId": 0
  }
]
```

后续动作再选择其中一条：

```javascript
var items = JSON.parse(jsRet);
var output = "没有可用剪贴板历史";

if (items.length >= 2) {
    var item = items[1];
    output = "时间：" + item.createAtText + "\n" +
        "应用：" + item.ownerPkgName + "\n" +
        "内容：" + item.text;
}

output;
```

## 文件读取注意事项

- 使用 `java.io.FileInputStream` 后要在 `finally` 中关闭。
- 二进制 proto 文件不要按普通文本读取。
- 版本升级后内部文件路径和字段可能变化。
- 解密失败要输出明确错误，不要静默返回空列表。
- 历史剪贴板可能包含密码、验证码、令牌和个人内容，展示和上传都要谨慎。

## 和 AIDL 剪贴板的关系

Android `clipboard` AIDL 能查到 `getPrimaryClip`、`hasPrimaryClip`、`setPrimaryClip`、剪贴板访问通知开关等方法。但这只覆盖系统当前剪贴板，不覆盖 ShortX 自己保存的历史数据库。

因此：

- 当前内容：用剪贴板动作或 Android Clipboard API。
- 历史记录：读 ShortX 内部文件和 proto 数据。
- 访问通知开关：属于系统服务或 ShortX 封装能力，修改前要确认风险。
