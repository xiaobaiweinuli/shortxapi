# 米家设备控制示例

这个示例展示如何通过 ShortX 控制米家智能家居设备。

## 前置准备

1. 米家账号和设备
2. 获取设备 ID (did)
3. 配置授权信息

## 授权配置

首先需要配置米家账号授权信息：

```javascript
// 保存授权信息到全局变量
{
  "@type": "type.googleapis.com/ExecuteJS",
  "expression": `
    var auth = {
      serviceToken: 'your_service_token',
      ssecurity: 'your_ssecurity',
      deviceId: 'your_device_id',
      userId: 'your_user_id'
    };
    
    globalVars.set('mijia_auth', JSON.stringify(auth));
  `
}
```

## 示例 1：开关灯

通过通知控制灯的开关。

```json
{
  "facts": [{
    "@type": "type.googleapis.com/NotificationPosted",
    "record": {
      "contentText": ".*(开灯|关灯).*",
      "apps": [
        { "pkgName": "com.tencent.mm" },
        { "pkgName": "com.tencent.wework" }
      ],
      "contentRegexOptions": "RegexMatchOptions_ContainsMatchIn"
    },
    "tag": "light-control",
    "id": "F-light-control"
  }],
  "actions": [{
    "@type": "type.googleapis.com/ExecuteJS",
    "expression": `
      // 从代码库加载米家控制函数
      load('CL-mijia-control');
      
      var content = '{contentText}';
      var action = content.indexOf('开灯') !== -1 ? 'on' : 'off';
      
      // 控制灯
      var result = controlLight('your_device_id', action);
      
      return result.success ? '灯已' + (action === 'on' ? '打开' : '关闭') : '控制失败';
    `,
    "id": "A-control-light"
  }, {
    "@type": "type.googleapis.com/ShowToast",
    "message": "{jsRet}",
    "id": "A-show-result"
  }],
  "id": "rule-mijia-light",
  "title": "米家灯控制",
  "isEnabled": true
}
```

## 示例 2：温度监控

监控温湿度传感器并发送通知。

```json
{
  "facts": [{
    "@type": "type.googleapis.com/TimerTrigger",
    "interval": 300000,
    "id": "F-timer-5min"
  }],
  "actions": [{
    "@type": "type.googleapis.com/ExecuteJS",
    "expression": `
      load('CL-mijia-control');
      
      // 获取温湿度
      var sensor = getDeviceProperty('sensor_device_id', 'temperature');
      var temp = sensor.temperature;
      var humidity = sensor.humidity;
      
      // 检查阈值
      if (temp > 30) {
        return '温度过高: ' + temp + '°C';
      } else if (temp < 15) {
        return '温度过低: ' + temp + '°C';
      }
      
      return null;
    `,
    "id": "A-check-temperature"
  }, {
    "@type": "type.googleapis.com/IfThenElse",
    "If": [{
      "@type": "type.googleapis.com/EvaluateContextVar",
      "op": "NotEqualTo",
      "varName": "jsRet",
      "payload": { "value": "null" },
      "id": "C-has-alert"
    }],
    "IfActions": [{
      "@type": "type.googleapis.com/ShowToast",
      "message": "{jsRet}",
      "id": "A-alert"
    }],
    "id": "A-process-temperature"
  }],
  "id": "rule-temperature-monitor",
  "title": "温度监控",
  "isEnabled": true
}
```

## 米家控制代码库

创建可重用的米家控制函数：

```javascript
{
  "id": "CL-mijia-control",
  "title": "米家设备控制库",
  "language": "javascript",
  "code": `
    // 加载授权信息
    function loadAuth() {
      var authStr = globalVars.get('mijia_auth');
      return authStr ? JSON.parse(authStr) : null;
    }
    
    // HTTP 请求函数
    function httpRequest(url, method, headers, body) {
      importClass(java.net.URL);
      importClass(java.net.HttpURLConnection);
      importClass(java.io.BufferedReader);
      importClass(java.io.InputStreamReader);
      
      var conn = new URL(url).openConnection();
      conn.setRequestMethod(method);
      conn.setConnectTimeout(15000);
      conn.setReadTimeout(30000);
      
      for (var key in headers) {
        conn.setRequestProperty(key, headers[key]);
      }
      
      if (body && (method === 'POST' || method === 'PUT')) {
        conn.setDoOutput(true);
        var os = conn.getOutputStream();
        os.write(new java.lang.String(body).getBytes('UTF-8'));
        os.close();
      }
      
      var responseCode = conn.getResponseCode();
      var reader = new BufferedReader(
        new InputStreamReader(conn.getInputStream())
      );
      
      var response = '';
      var line;
      while ((line = reader.readLine()) != null) {
        response += line;
      }
      reader.close();
      
      return {
        code: responseCode,
        body: response
      };
    }
    
    // 生成签名
    function generateSignature(uri, data, auth) {
      importClass(javax.crypto.Mac);
      importClass(javax.crypto.spec.SecretKeySpec);
      importClass(java.security.MessageDigest);
      importClass(java.util.Base64);
      
      // 生成 nonce
      var nonce = '';
      var chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
      for (var i = 0; i < 16; i++) {
        nonce += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      
      // 生成 signed nonce
      var ssecurityBytes = Base64.getDecoder().decode(auth.ssecurity);
      var nonceBytes = Base64.getDecoder().decode(nonce);
      var md = MessageDigest.getInstance('SHA-256');
      md.update(ssecurityBytes);
      md.update(nonceBytes);
      var signedNonce = Base64.getEncoder().encodeToString(md.digest());
      
      // 生成签名
      var signData = uri + '&' + signedNonce + '&' + nonce + '&data=' + data;
      var mac = Mac.getInstance('HmacSHA256');
      var key = Base64.getDecoder().decode(signedNonce);
      mac.init(new SecretKeySpec(key, 'HmacSHA256'));
      var signature = Base64.getEncoder().encodeToString(
        mac.doFinal(new java.lang.String(signData).getBytes('UTF-8'))
      );
      
      return {
        nonce: nonce,
        signature: signature
      };
    }
    
    // 发送米家 API 请求
    function mijiaRequest(uri, data) {
      var auth = loadAuth();
      if (!auth) {
        return { success: false, error: '未配置授权信息' };
      }
      
      var dataStr = JSON.stringify(data);
      var sig = generateSignature(uri, dataStr, auth);
      
      var formData = '_nonce=' + encodeURIComponent(sig.nonce) +
                     '&data=' + encodeURIComponent(dataStr) +
                     '&signature=' + encodeURIComponent(sig.signature);
      
      var headers = {
        'User-Agent': 'APP/com.xiaomi.mihome APPV/6.0.103',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cookie': 'PassportDeviceId=' + auth.deviceId + 
                  ';userId=' + auth.userId + 
                  ';serviceToken=' + auth.serviceToken
      };
      
      try {
        var response = httpRequest(
          'https://api.io.mi.com/app' + uri,
          'POST',
          headers,
          formData
        );
        
        var result = JSON.parse(response.body);
        return {
          success: result.code === 0,
          data: result.result,
          error: result.message
        };
      } catch (e) {
        return {
          success: false,
          error: e.message
        };
      }
    }
    
    // 控制灯
    function controlLight(deviceId, action) {
      var value = action === 'on' ? true : false;
      var data = {
        params: [{
          did: deviceId,
          siid: 2,
          piid: 1,
          value: value
        }]
      };
      
      return mijiaRequest('/miotspec/prop/set', data);
    }
    
    // 获取设备属性
    function getDeviceProperty(deviceId, property) {
      var data = {
        params: [{
          did: deviceId,
          siid: 2,
          piid: 1
        }]
      };
      
      var result = mijiaRequest('/miotspec/prop/get', data);
      if (result.success && result.data && result.data.length > 0) {
        return result.data[0].value;
      }
      return null;
    }
    
    // 设置设备属性
    function setDeviceProperty(deviceId, siid, piid, value) {
      var data = {
        params: [{
          did: deviceId,
          siid: siid,
          piid: piid,
          value: value
        }]
      };
      
      return mijiaRequest('/miotspec/prop/set', data);
    }
  `
}
```

## 示例 3：场景联动

根据时间自动控制设备。

```json
{
  "facts": [{
    "@type": "type.googleapis.com/TimeTrigger",
    "time": "22:00",
    "id": "F-night-time"
  }],
  "actions": [{
    "@type": "type.googleapis.com/ExecuteJS",
    "expression": `
      load('CL-mijia-control');
      
      // 关闭客厅灯
      controlLight('living_room_light_id', 'off');
      
      // 打开卧室灯（低亮度）
      setDeviceProperty('bedroom_light_id', 2, 2, 20);
      
      return '晚安模式已启动';
    `,
    "id": "A-night-mode"
  }, {
    "@type": "type.googleapis.com/ShowToast",
    "message": "{jsRet}",
    "id": "A-notify"
  }],
  "id": "rule-night-mode",
  "title": "晚安模式",
  "isEnabled": true
}
```

## 示例 4：设备状态查询

查询设备当前状态。

```json
{
  "facts": [{
    "@type": "type.googleapis.com/NotificationPosted",
    "record": {
      "contentText": ".*设备状态.*"
    },
    "id": "F-query-status"
  }],
  "actions": [{
    "@type": "type.googleapis.com/ExecuteJS",
    "expression": `
      load('CL-mijia-control');
      
      // 查询多个设备状态
      var devices = [
        { id: 'light_id', name: '客厅灯' },
        { id: 'ac_id', name: '空调' },
        { id: 'sensor_id', name: '温湿度传感器' }
      ];
      
      var status = [];
      for (var i = 0; i < devices.length; i++) {
        var device = devices[i];
        var value = getDeviceProperty(device.id, 'status');
        status.push(device.name + ': ' + (value ? '开启' : '关闭'));
      }
      
      return status.join('\\n');
    `,
    "id": "A-query-status"
  }, {
    "@type": "type.googleapis.com/ShowToast",
    "message": "{jsRet}",
    "duration": "long",
    "id": "A-show-status"
  }],
  "id": "rule-query-device-status",
  "title": "查询设备状态",
  "isEnabled": true
}
```

## 获取授权信息

使用以下方法获取米家授权信息：

1. 使用抓包工具（如 Charles、Fiddler）
2. 登录米家 APP
3. 抓取请求头中的 Cookie
4. 提取 `serviceToken`、`ssecurity`、`deviceId`、`userId`

## 注意事项

1. **安全性**：妥善保管授权信息
2. **频率限制**：避免频繁请求 API
3. **错误处理**：添加适当的错误处理
4. **设备兼容性**：不同设备的 siid/piid 可能不同
5. **授权过期**：定期更新授权信息

## 相关文档

- [基础示例](/examples/basic) - 学习基础用法
- [代码库 API](/api/code-library) - 管理脚本代码
- [动作执行](/guide/actions) - 了解动作使用
