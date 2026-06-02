---
layout: home

hero:
  name: ShortX 使用说明
  text: 面向高级自动化的实战文档
  tagline: 从动作链、Rhino JS、MVEL、ShortX 内部 API 到 Android 服务能力边界
  image:
    src: /logo.svg
    alt: ShortX
  actions:
    - theme: brand
      text: 开始阅读
      link: /guide/
    - theme: alt
      text: 动作链模型
      link: /chain/
    - theme: alt
      text: Rhino JS
      link: /script/

features:
  - icon: 📌
    title: 面向实际自动化
    details: 围绕动作链、脚本运行时、上下文变量、内部 API 和系统服务边界组织内容，避免泛化 API 文案。
  - icon: 🔁
    title: 动作链优先
    details: 重点解释触发器、条件、动作、上下文变量、jsRet、mvelRet 和 customContextDataKey 的真实数据流。
  - icon: 🧩
    title: Rhino 与 MVEL 分层
    details: 明确 JS、MVEL、MatchJS 的边界，避免浏览器 JS、Node.js 或普通 App 模型误导。
  - icon: 🛠️
    title: 面向开发者
    details: 解释 shortx.*、shortx.executeAction、OooO0O0、Android API、AIDL 服务和源码查阅方法。
  - icon: ⚠️
    title: 风险分级
    details: 系统级、内部服务、破坏性操作和高权限能力会标注适用前提与风险。
  - icon: 📚
    title: 保留旧版
    details: 原网页内容已迁入旧版区，仅作为历史草稿对照。
---

## 这份文档解决什么问题

ShortX 的脚本不是浏览器 JavaScript，也不是 Node.js。真实的 ShortX 自动化经常运行在 Android/Rhino 环境里，能访问 Java 类、Android framework API、ShortX 公共脚本 API、内部 ShortX 服务、文件、线程、反射、外部 dex/jar 和系统服务。

旧版网页更多是泛化说明，很多地方没有说明动作链上下文、脚本运行边界、变量命名禁区、内部服务入口和 Android 服务风险。本版文档把重点放在“能解释规则为什么这样设计、如何安全改写、如何查证底层接口”。

## 推荐阅读顺序

1. [开始](/guide/)
2. [学习路线](/guide/learning-path)
3. [动作链总览](/chain/)
4. [脚本总览](/script/)
5. [上下文变量速查](/chain/context-variable-reference)
6. [输出模板](/chain/output-templates)
7. [状态管理与去重](/chain/state-management)
8. [API 总览](/api/)
9. [Android 服务总览](/android/)
10. [案例总览](/cases/)
11. [故障排查](/guide/troubleshooting)
12. [发布与迁移](/guide/release-migration)
13. [备份与恢复](/guide/backup-restore)
14. [安全边界](/guide/security-boundary)

## 使用建议

不要从底层服务或内部方法开始写规则。先把触发器、条件、动作输出和下游消费者设计清楚，再决定是否需要 JS、MVEL、`shortx.executeAction(...)` 或 Android 服务能力。能用内置动作完成的流程，不要降到更底层的调用。
