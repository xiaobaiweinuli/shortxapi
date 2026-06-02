import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'ShortX 使用说明',
  description: '面向 ShortX 高级自动化、Rhino JS、MVEL 和 Android 服务能力的教程文档',
  lang: 'zh-CN',
  
  head: [
    ['link', { rel: 'icon', href: '/logo.png' }],
    ['link', { rel: 'apple-touch-icon', href: '/logo.png' }]
  ],

  themeConfig: {
    logo: '/logo.svg',
    
    nav: [
      { text: '开始', link: '/guide/' },
      { text: '动作链', link: '/chain/' },
      { text: '脚本', link: '/script/' },
      { text: 'API', link: '/api/' },
      { text: 'Android 服务', link: '/android/' },
      { text: '案例', link: '/cases/' },
      { text: '旧版', link: '/legacy/' },
      { text: '行为准则', link: '/code-of-conduct' },
      {
        text: '相关链接',
        items: [
          { text: 'GitHub', link: 'https://github.com/xiaobaiweinuli/shortxapi' },
          { text: '官方网站', link: 'https://shortx-repo.github.io/ShortX-Pages/zh/' },
          { text: 'ShortX 下载', link: 'https://github.com/ShortX-Repo/ShortX/releases' },
          { text: 'Telegram', link: 'https://t.me/shortxmod' }
        ]
      }
    ],

    sidebar: {
      '/guide/': [
        {
          text: '基础',
          items: [
            { text: '开始', link: '/guide/' },
            { text: '学习路线', link: '/guide/learning-path' },
            { text: '能力边界', link: '/guide/introduction' },
            { text: '一键指令与自动指令', link: '/guide/commands-and-rules' },
            { text: '术语表', link: '/guide/glossary' },
            { text: '调试方法', link: '/guide/debugging' },
            { text: '故障排查', link: '/guide/troubleshooting' },
            { text: '隐私数据处理', link: '/guide/privacy-data' },
            { text: '发布与迁移', link: '/guide/release-migration' },
            { text: '发布质量检查', link: '/guide/release-quality' },
            { text: '版本兼容与升级检查', link: '/guide/version-compatibility' },
            { text: '备份与恢复', link: '/guide/backup-restore' },
            { text: '安全边界', link: '/guide/security-boundary' }
          ]
        }
      ],
      '/chain/': [
        {
          text: '动作链',
          items: [
            { text: '动作链总览', link: '/chain/' },
            { text: '数据模型', link: '/chain/model' },
            { text: '导出结构解剖', link: '/chain/export-anatomy' },
            { text: '动作元数据', link: '/chain/action-metadata' },
            { text: '触发器与事实变量', link: '/chain/facts-and-triggers' },
            { text: '触发策略', link: '/chain/trigger-strategy' },
            { text: '上下文变量速查', link: '/chain/context-variable-reference' },
            { text: '上下文变量与保留名', link: '/chain/context-vars' },
            { text: '动作输出契约', link: '/chain/action-output-contracts' },
            { text: '常见数据格式', link: '/chain/data-format-reference' },
            { text: '生命周期与退出逻辑', link: '/chain/lifecycle-hooks' },
            { text: '参数化调用与 DeepLink', link: '/chain/parameters-deeplink' },
            { text: '等待、重试与超时', link: '/chain/wait-retry' },
            { text: '输出模板', link: '/chain/output-templates' },
            { text: '动作链设计模式', link: '/chain/design-patterns' },
            { text: '状态管理与去重', link: '/chain/state-management' },
            { text: '对话框 JSON 数据流', link: '/chain/dialog-json' },
            { text: '对话框交互契约', link: '/chain/dialog-interactions' },
            { text: 'Method Hook 触发器', link: '/chain/method-hook' },
            { text: '风险分级', link: '/chain/risk' }
          ]
        }
      ],
      '/script/': [
        {
          text: '脚本',
          items: [
            { text: '脚本总览', link: '/script/' },
            { text: 'Rhino JS 运行环境', link: '/script/runtime' },
            { text: 'ExecuteJS 写法', link: '/script/js' },
            { text: 'MVEL 写法', link: '/script/mvel' },
            { text: 'JS 与 MVEL 选择', link: '/script/js-mvel-choice' },
            { text: 'MatchJS 条件', link: '/script/matchjs' },
            { text: '代码库复用', link: '/script/code-library' },
            { text: '外部 dex/jar 加载', link: '/script/external-libs' },
            { text: '反射、线程与同步', link: '/script/reflection-threading' },
            { text: '脚本审查清单', link: '/script/review-checklist' },
            { text: '常见反例', link: '/script/anti-patterns' }
          ]
        }
      ],
      '/api/': [
        {
          text: 'ShortX API',
          items: [
            { text: 'API 总览', link: '/api/' },
            { text: '公共脚本 API', link: '/api/script-shortx-api' },
            { text: 'ShortX API 与内部服务', link: '/api/shortx-api' },
            { text: 'executeAction', link: '/api/execute-action' },
            { text: 'Proto Action 查找', link: '/api/proto-javadoc-lookup' },
            { text: '内部 ShortX 服务', link: '/api/internal-service' },
            { text: '运行诊断接口', link: '/api/runtime-diagnostics' },
            { text: '诊断记录', link: '/api/diagnostic-records' },
            { text: '插件能力发现', link: '/api/plugin-capabilities' },
            { text: '配置数据管理', link: '/api/config-data-management' },
            { text: '代码库管理', link: '/api/code-library-management' },
            { text: 'WebDAV 配置管理', link: '/api/webdav-management' },
            { text: '开关指令与总开关', link: '/api/toggles-feature-switches' },
            { text: '全局变量', link: '/api/global-vars' }
          ]
        }
      ],
      '/android/': [
        {
          text: 'Android 服务',
          items: [
            { text: 'Android 服务总览', link: '/android/' },
            { text: '服务阅读方法', link: '/android/service-reading' },
            { text: '服务能力地图', link: '/android/service-map' },
            { text: 'AIDL 与 Binder 边界', link: '/android/aidl-binder-boundary' },
            { text: '系统交互边界', link: '/android/system-interaction-boundary' },
            { text: '无障碍、截图与 OCR', link: '/android/accessibility-ocr-screenshot' },
            { text: '无障碍节点检索', link: '/android/accessibility-node-inspection' },
            { text: 'Notification 服务', link: '/android/notification-service' },
            { text: 'Input 与 Display', link: '/android/input-display' },
            { text: '应用、权限与 AppOps', link: '/android/app-permission' },
            { text: '包名与用户边界', link: '/android/user-package-boundary' },
            { text: '用户限制与组策略', link: '/android/user-restrictions' },
            { text: 'Settings Provider', link: '/android/settings-provider' },
            { text: '调度、闹钟与系统状态', link: '/android/scheduling-state' },
            { text: '网络、音频与电源', link: '/android/network-audio-power' }
          ]
        }
      ],
      '/cases/': [
        {
          text: '高级案例',
          items: [
            { text: '案例总览', link: '/cases/' },
            { text: '验证码处理', link: '/cases/verification-code' },
            { text: '通知验证码完整工作流', link: '/cases/notification-code-workflow' },
            { text: '通知处理', link: '/cases/notification' },
            { text: '通知路由', link: '/cases/notification-routing' },
            { text: 'Intent 与 DeepLink', link: '/cases/intent-deeplink' },
            { text: '系统服务调用', link: '/cases/system-services' },
            { text: '悬浮窗与 UI', link: '/cases/ui-overlay' },
            { text: 'Overlay 按钮工作流', link: '/cases/overlay-button-flow' },
            { text: '控件检索工作流', link: '/cases/control-inspector-workflow' },
            { text: '输入法与触摸', link: '/cases/input-method-touch' },
            { text: '坐标与屏幕区域', link: '/cases/coordinate-region' },
            { text: '设置项监视器', link: '/cases/settings-monitor' },
            { text: '设置恢复', link: '/cases/settings-restore' },
            { text: '显示与刷新率', link: '/cases/display-refresh' },
            { text: '截图与 OCR', link: '/cases/ocr-screenshot' },
            { text: '传感器与隐私开关', link: '/cases/sensors-privacy' },
            { text: 'AppOps 与权限状态', link: '/cases/appops-permission' },
            { text: 'HTTP 与 Shell', link: '/cases/http-shell' },
            { text: '网络状态', link: '/cases/network-state' },
            { text: '音频与音量', link: '/cases/audio-volume' },
            { text: '电源与调度', link: '/cases/power-scheduling' },
            { text: '剪贴板与文件数据', link: '/cases/clipboard-file' },
            { text: '批量循环处理', link: '/cases/batch-loop' },
            { text: '备份与同步工作流', link: '/cases/backup-sync' },
            { text: 'ShortX 目录与数据库文件', link: '/cases/shortx-dir-database' },
            { text: '运行诊断面板', link: '/cases/runtime-diagnostics' },
            { text: '任务与动作控制', link: '/cases/task-control' },
            { text: '初始化向导', link: '/cases/initialization-wizard' },
            { text: '应用集工作流', link: '/cases/app-set-workflow' },
            { text: '快捷方式解析', link: '/cases/shortcut-parsing' },
            { text: '动态快捷方式', link: '/cases/dynamic-shortcuts' },
            { text: '外部库能力', link: '/cases/external-library' },
            { text: '包与组件检查', link: '/cases/package-components' },
            { text: '应用组件启动工作流', link: '/cases/app-component-launch-workflow' },
            { text: '包与组件路由', link: '/cases/component-routing' },
            { text: '导入前审查', link: '/cases/export-review' }
          ]
        }
      ],
      '/legacy/': [
        {
          text: '旧版文档',
          items: [
            { text: '旧版说明', link: '/legacy/' },
            { text: '旧首页', link: '/legacy/old-home' },
            { text: '旧版指南', link: '/legacy/guide/introduction' },
            { text: '旧版 API', link: '/legacy/api/overview' },
            { text: '旧版示例', link: '/legacy/examples/basic' }
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/xiaobaiweinuli/shortxapi' }
    ],

    footer: {
      message: 'ShortX 高级自动化文档 | <a href="/code-of-conduct.html" target="_blank">行为准则</a> | <a href="https://www.netlify.com" target="_blank" rel="noopener">Powered by Netlify</a>',
      copyright: 'Copyright © 2025-present 星霜笔记'
    },

    search: {
      provider: 'local'
    },

    outline: {
      level: [2, 3],
      label: '页面导航'
    },

    docFooter: {
      prev: '上一页',
      next: '下一页'
    },

    lastUpdated: {
      text: '最后更新于',
      formatOptions: {
        dateStyle: 'short',
        timeStyle: 'medium'
      }
    }
  }
})
