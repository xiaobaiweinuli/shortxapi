# 简介

ShortX 是一款强大的 Android 自动化工具，基于规则引擎实现各种自动化场景。

## 什么是 ShortX？

ShortX 提供了一个灵活的自动化框架，允许你通过定义规则来自动执行各种任务。每个规则由三部分组成：

- **事件（Facts）**：触发规则的条件，如收到通知、手势操作等
- **条件（Conditions）**：可选的额外判断条件
- **动作（Actions）**：满足条件后执行的操作

## 核心特性

### 规则引擎

基于事件驱动的规则引擎，支持：
- 通知监听
- 手势识别
- 传感器监控
- 系统事件
- 自定义事件

### 丰富的动作

内置多种动作类型：
- 文本输入
- 剪贴板操作
- 脚本执行（JavaScript/MVEL）
- HTTP 请求
- 设备控制
- 系统操作

### 脚本支持

支持两种脚本语言：
- **JavaScript**：使用 Rhino 引擎，支持完整的 JavaScript 语法
- **MVEL**：轻量级表达式语言，适合简单的逻辑处理

### 设备集成

- 米家智能家居设备控制
- 蓝牙设备管理
- NFC 标签识别
- WiFi 网络管理

## 应用场景

- 验证码自动识别和输入
- 智能家居自动化控制
- 通知自动处理
- 快捷操作触发
- 定时任务执行
- 传感器响应

## 系统要求

- Android 7.0 (API 24) 或更高版本
- 需要无障碍服务权限
- 部分功能需要 Root 权限

## 获取 ShortX

- [GitHub Releases](https://github.com/ShortX-Repo/ShortX/releases) - 下载最新版本
- [Telegram 频道](https://t.me/shortxmod) - 加入社区，获取支持

## 下一步

- [快速开始](/guide/getting-started) - 创建你的第一个规则
- [基本概念](/guide/concepts) - 了解核心概念
- [API 参考](/api/overview) - 查看完整 API
