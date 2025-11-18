<div align="center">

# ShortX API 文档

> 🚀 ShortX 自动化工具的完整 API 文档项目

[![Netlify Status](https://api.netlify.com/api/v1/badges/726bcff2-415d-4e8a-8d4c-49cef92392e1/deploy-status)](https://shortxapi.netlify.app)

</div>

这是一个使用 VitePress 构建的现代化文档站点，提供 ShortX 自动化工具的完整 API 参考、使用指南和实用示例。

<div align="center">
  <a href="https://app.netlify.com/start/deploy?repository=https://github.com/xiaobaiweinuli/shortxapi">
    <img src="https://www.netlify.com/img/deploy/button.svg" alt="Deploy to Netlify" />
  </a>
</div>

---

<div align="center">
  <a href="https://www.netlify.com">
    <img src="https://www.netlify.com/v3/img/components/netlify-color-accent.svg" alt="Deploys by Netlify" width="114" height="51" />
  </a>
  <p><strong>This site is powered by Netlify</strong></p>
</div>

---

## ✨ 特性

- 📚 **完整的 API 文档** - 涵盖 200+ API 方法
- 🎯 **实用示例** - 包含验证码自动输入、米家设备控制等实用场景
- 🔍 **本地搜索** - 快速查找所需内容
- 🌙 **深色模式** - 支持明暗主题切换
- 📱 **响应式设计** - 完美适配各种设备
- ⚡ **快速构建** - 基于 Vite 的极速构建
- 🚀 **自动部署** - 推送即部署到 Netlify

## 📖 文档内容

### 指南 (6 篇)
- 简介 - ShortX 核心特性
- 快速开始 - 创建第一个规则
- 基本概念 - 规则、事件、动作等
- 规则引擎 - 深入规则引擎
- 事件系统 - 事件监听和处理
- 动作执行 - 动作类型和使用

### API 参考 (8 篇)
- API 概览
- 规则管理 API
- 动作管理 API
- 设备管理 API
- 全局变量 API
- 代码库 API
- 手势识别 API
- 系统集成 API

### 示例代码 (4 篇)
- 基础示例 - 10 个入门示例
- 验证码自动输入 - 完整实现方案
- 通知处理 - 7 个实用场景
- 米家设备控制 - 智能家居控制

## 🚀 快速开始

### 5 分钟部署到 Netlify


```bash
# 1. 克隆或下载项目
git clone https://github.com/xiaobaiweinuli/shortxapi.git
cd shortxapi

# 2. 推送到你的 GitHub 仓库
git remote set-url origin https://github.com/xiaobaiweinuli/shortxapi.git
git push -u origin main

# 3. 在 Netlify 导入仓库并部署
# 访问 https://app.netlify.com/start
```

### 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器 (http://localhost:5173)
npm run docs:dev

# 构建生产版本
npm run docs:build

# 预览生产版本
npm run docs:preview
```

## 📁 项目结构

```
shortx-docs/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions 配置
├── docs/
│   ├── .vitepress/
│   │   └── config.js           # VitePress 配置
│   ├── api/                    # API 参考文档
│   │   ├── overview.md
│   │   ├── rules.md
│   │   ├── actions.md
│   │   └── ...
│   ├── guide/                  # 使用指南
│   │   ├── introduction.md
│   │   ├── getting-started.md
│   │   └── ...
│   ├── examples/               # 示例代码
│   │   ├── basic.md
│   │   ├── auto-input.md
│   │   └── ...
│   ├── public/                 # 静态资源
│   └── index.md                # 首页
├── .gitignore
├── netlify.toml                # Netlify 配置
├── package.json
├── README.md
```

## 🛠️ 技术栈

- **[VitePress](https://vitepress.dev/)** - 基于 Vite 和 Vue 的静态站点生成器
- **[Vue 3](https://vuejs.org/)** - 渐进式 JavaScript 框架
- **[Vite](https://vitejs.dev/)** - 下一代前端构建工具
- **[Netlify](https://www.netlify.com/)** - 现代化部署平台

## 📝 更新文档

1. 编辑 `docs/` 目录下的 Markdown 文件
2. 本地预览：`npm run docs:dev`
3. 提交更改：
   ```bash
   git add .
   git commit -m "Update documentation"
   git push
   ```
4. Netlify 自动部署 ✨

## 🎨 自定义

### 修改站点配置

编辑 `docs/.vitepress/config.js`：

```javascript
export default defineConfig({
  title: '你的站点名称',
  description: '你的站点描述',
  // 更多配置...
})
```

### 修改主题样式

创建 `docs/.vitepress/theme/custom.css` 添加自定义样式。

### 添加新页面

1. 在 `docs/` 相应目录创建 `.md` 文件
2. 在 `config.js` 的 `sidebar` 中添加链接
3. 提交并推送

## 📚 相关文档

- [VitePress 文档](https://vitepress.dev/)
- [Netlify 文档](https://docs.netlify.com/)

## 🤝 贡献

欢迎贡献！请遵循以下步骤：

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 📜 行为准则

我们致力于为每个人提供友好、安全和热情的环境。请阅读我们的 [行为准则](CODE_OF_CONDUCT.md) 了解更多信息。

## 🔗 相关链接

- [在线文档](https://shortxapi.netlify.app) - 访问在线文档
- [ShortX 官方网站](https://shortx-repo.github.io/ShortX-Pages/zh/)
- [ShortX 下载](https://github.com/ShortX-Repo/ShortX/releases)
- [Telegram 频道](https://t.me/shortxmod)
- [GitHub Issues](https://github.com/xiaobaiweinuli/shortxapi/issues)

## ⭐ Star History

如果这个项目对你有帮助，请给它一个 Star！

---

**Made with ❤️ for ShortX Community**
