# ShortX 使用说明

这是一个基于 VitePress 的 ShortX 高级使用文档站。它不再定位为泛化 API 列表，而是面向 ShortX 开发者和高级使用者，解释动作链、Rhino JS、MVEL、ShortX API、内部服务和 Android 系统服务能力边界。

## 文档定位

本项目的主文档基于本地 `shortx-rhino-js` 资料重写：

- `references/`：运行边界、变量流、模板、反例、保留名规则。
- `sources/ShortX-Pages-main`：ShortX 官方页面概念。
- `sources/ShortX-Files-main`：真实代码库、直接动作、自动规则导出，仅作为写法依据，不生成重复索引。
- `sources/ShortX/docs*`：Android 服务整理文档，用于归纳教程。
- `sources/official_sources`：AIDL、Java、ADB 原始/净化资料，用于核对签名和能力边界。

Android 服务库和 official_sources 不会被机械转换成网页。站点只写阅读理解后的教程、能力地图、查阅方法和风险说明。

## 本地开发

```bash
npm install
npm run docs:dev
npm run docs:build
npm run docs:preview
```

## 项目结构

```text
docs/
  .vitepress/config.js   VitePress 配置
  index.md               首页
  guide/                 ShortX 基础、指令模型、调试
  chain/                 动作链数据流、上下文变量、风险分级
  script/                Rhino JS、MVEL、MatchJS、反例
  api/                   shortx.*、executeAction、内部服务、全局变量
  android/               Android 服务阅读方法和高级教程
  cases/                 验证码、通知、系统服务、悬浮窗等案例
  legacy/                重构前旧版文档，仅供对照
```

## 构建与部署

Netlify 使用 `netlify.toml`：

```toml
[build]
  command = "npm run docs:build"
  publish = "docs/.vitepress/dist"
```

构建产物由 VitePress 生成到 `docs/.vitepress/dist`。

## 维护原则

- 准确性优先于保留旧文案。
- JS 示例保持 ShortX Rhino 风格：`var`、传统 `function`、`importClass`、`Packages.*`、final expression。
- MVEL 与 JS 分开讲，不混写语法。
- `jsRet`、`mvelRet`、`selectedListItem`、`pkgName`、`title`、`contentText` 等上下文名视为保留名。
- 系统级和破坏性能力必须标注风险。
