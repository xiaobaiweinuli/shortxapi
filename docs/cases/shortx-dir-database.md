# 高级案例：ShortX 目录与数据库文件

真实“真实好友”导出大量使用 `shortx.getShortXDir()`：复制微信数据库、读取密钥文件、加载外部 `SqlcipherTool.dex`、打开解密后的 SQLite 数据库、导出 CSV 报告。这类工作流很强，但也最容易混入隐私、路径、权限和版本风险。

## 工作流拆解

```text
检查依赖文件
  -> 复制源数据到 ShortX 目录
  -> 生成或读取密钥
  -> 加载外部 dex/jar
  -> 解密或转换数据库
  -> SQLite 只读查询
  -> 输出 JSON / CSV
  -> 清理临时文件
```

不要把这些步骤压成一个长脚本。每一步都应该有明确输出，方便用户知道失败在哪里。

## 路径约定

常见路径：

| 路径 | 用途 |
| --- | --- |
| `shortx.getShortXDir() + "/lib/..."` | 外部 dex/jar |
| `shortx.getShortXDir() + "/data/u/0/..."` | 临时数据和报告 |
| `/data/user/<用户ID>/<包名>/...` | 目标应用私有目录 |

教程示例中不要硬编码用户 0。来自对话框或应用选择器的用户 ID 应改名保存：

```javascript
var selectedUserIdValue = parseInt(String(selectedUserId), 10);
var sourcePathText = "/data/user/" + selectedUserIdValue + "/com.tencent.mm/files/KeyInfo.bin";
sourcePathText;
```

`selectedUserId` 是上游自定义上下文名时只能读取，正式发布前要说明它来自哪里。

## 文件复制

```javascript
importClass(java.io.File);
importClass(java.io.FileInputStream);
importClass(java.io.FileOutputStream);

var sourcePathText = "/data/user/0/example.app/files/data.db";
var targetPathText = shortx.getShortXDir() + "/data/u/0/example/data.db";

function ensureDirectory(dirValue) {
    if (dirValue != null && !dirValue.exists()) {
        dirValue.mkdirs();
    }
}

function copyFile(sourceFilePathText, targetFilePathText) {
    var sourceFileValue = new File(sourceFilePathText);
    if (!sourceFileValue.exists()) {
        return "源文件不存在: " + sourceFilePathText;
    }

    var targetFileValue = new File(targetFilePathText);
    ensureDirectory(targetFileValue.getParentFile());

    var inputStreamValue = null;
    var outputStreamValue = null;
    try {
        inputStreamValue = new FileInputStream(sourceFileValue);
        outputStreamValue = new FileOutputStream(targetFileValue, false);
        var bufferValue = java.lang.reflect.Array.newInstance(java.lang.Byte.TYPE, 8192);
        var readSizeValue = 0;
        while ((readSizeValue = inputStreamValue.read(bufferValue)) != -1) {
            outputStreamValue.write(bufferValue, 0, readSizeValue);
        }
        outputStreamValue.flush();
        return "复制成功";
    } catch (e) {
        return "复制失败: " + e;
    } finally {
        if (inputStreamValue != null) {
            try { inputStreamValue.close(); } catch (e1) {}
        }
        if (outputStreamValue != null) {
            try { outputStreamValue.close(); } catch (e2) {}
        }
    }
}

copyFile(sourcePathText, targetPathText);
```

## SQLite 只读查询

读取数据库时优先只读打开，并在 `finally` 里关闭：

```javascript
importClass(android.database.sqlite.SQLiteDatabase);

var dbPathText = shortx.getShortXDir() + "/data/u/0/example/data.db";
var dbValue = null;
var rows = [];

try {
    dbValue = SQLiteDatabase.openDatabase(dbPathText, null, SQLiteDatabase.OPEN_READONLY);
    var cursorValue = dbValue.rawQuery("SELECT name FROM sqlite_master WHERE type = ?", ["table"]);
    while (cursorValue.moveToNext()) {
        rows.push(String(cursorValue.getString(0)));
    }
    cursorValue.close();
} catch (e) {
    rows.push("数据库读取失败: " + e);
} finally {
    if (dbValue != null) {
        dbValue.close();
    }
}

JSON.stringify(rows, null, 2);
```

## CSV 导出

CSV 适合导出报告，但要处理引号、换行和 UTF-8：

```javascript
function escapeCsvCell(textValue) {
    var output = textValue == null ? "" : String(textValue);
    if (/[",\r\n]/.test(output)) {
        output = '"' + output.replace(/"/g, '""') + '"';
    }
    return output;
}
```

导出报告可以写入 BOM，方便部分表格软件识别 UTF-8。发布说明要告诉用户报告路径和是否包含敏感数据。

## 风险边界

- 目标应用私有数据可能包含隐私、账号、联系人、验证码或令牌。
- 外部 dex/jar 必须说明来源、版本和路径。
- 数据库结构可能随目标应用版本变化。
- Shell 复制和 `chmod` 会改变文件权限，不应静默执行。
- 临时数据库和 CSV 应提供删除或覆盖策略。
- 任何上传、分享、截图反馈前都要过滤敏感字段。
