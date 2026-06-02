---
layout: home

hero:
  name: ShortX
  text: Android 自动化工具
  tagline: 强大的规则引擎，让自动化触手可及
  image:
    src: /logo.svg
    alt: ShortX
  actions:
    - theme: brand
      text: 快速开始
      link: /guide/getting-started
    - theme: alt
      text: API 参考
      link: /api/overview
    - theme: alt
      text: GitHub
      link: https://github.com/xiaobaiweinuli/shortxapi

features:
  - icon: 🎯
    title: 规则引擎
    details: 基于事件-条件-动作的强大规则引擎，支持复杂的自动化场景
  - icon: 🚀
    title: 丰富的 API
    details: 提供完整的 API 接口，支持规则、动作、设备、变量等全方位管理
  - icon: 🎨
    title: 灵活扩展
    details: 支持 JavaScript 和 MVEL 脚本，可自定义动作和条件
  - icon: 📱
    title: 系统集成
    details: 深度集成 Android 系统，支持通知、手势、传感器等多种触发方式
  - icon: 🔧
    title: 设备控制
    details: 支持米家等智能家居设备控制，实现跨平台自动化
  - icon: 🛡️
    title: 安全可靠
    details: 完善的权限管理和错误处理机制，确保自动化任务稳定运行
---

## 快速上手

### 安装

从以下渠道下载最新版本的 ShortX：

- [GitHub Releases](https://github.com/ShortX-Repo/ShortX/releases) - 官方发布版本
- [Telegram 频道](https://t.me/shortxmod) - 获取最新动态和支持

### 创建第一个规则

```javascript
// 示例：收到验证码自动复制
{
  "facts": [{
    "@type": "type.googleapis.com/NotificationPosted",
    "record": {
      "contentText": ".*验证码.*",
      "contentRegexOptions": "RegexMatchOptions_ContainsMatchIn"
    }
  }],
  "actions": [{
    "@type": "type.googleapis.com/WriteClipboard",
    "text": "{contentText}"
  }]
}
```

### 了解更多

- [快速开始指南](/legacy/guide/getting-started) - 学习如何创建和管理规则
- [API 参考](/legacy/api/overview) - 查看完整的 API 文档
- [示例集合](/legacy/examples/basic) - 浏览实用的自动化示例
- [高级应用](/legacy/examples/advanced) - 探索复杂场景的实现方法

## 核心功能

### 事件驱动
监听系统事件自动触发规则：通知、剪贴板、手势、传感器等

### 脚本引擎
支持 JavaScript 和 MVEL 两种脚本语言，实现复杂的数据处理和逻辑判断

### 变量系统
局部变量和全局变量支持，实现数据持久化和跨规则通信

### UI 创建
动态创建悬浮窗、对话框、通知等界面元素，提供丰富的交互体验

## 社区

- [在线文档](/) - 访问本文档站点
- [GitHub Issues](https://github.com/xiaobaiweinuli/shortxapi/issues) - 报告问题和建议
- [官方网站](https://shortx-repo.github.io/ShortX-Pages/zh/) - ShortX 官方文档
- [Telegram 频道](https://t.me/shortxmod) - 加入社区讨论
- [行为准则](/code-of-conduct.html) - 社区行为准则

---

<div style="text-align: center; margin: 40px auto 0; padding: 20px; background: #f5f5f5; border-radius: 8px; max-width: 300px; width: 100%;">
  <a href="https://www.netlify.com" target="_blank" rel="noopener" style="display: inline-block;">
    <img src="https://www.netlify.com/v3/img/components/netlify-color-accent.svg" alt="Deploys by Netlify" style="width: 114px; height: 51px; margin: 0 auto;" />
  </a>
  <p style="margin-top: 10px; color: #666; text-align: center;">This site is powered by Netlify</p>
</div>
