import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'ShortX',
  description: 'ShortX 自动化工具 API 文档',
  lang: 'zh-CN',
  
  head: [
    ['link', { rel: 'icon', href: '/logo.png' }],
    ['link', { rel: 'apple-touch-icon', href: '/logo.png' }]
  ],

  themeConfig: {
    logo: '/logo.svg',
    
    nav: [
      { text: '指南', link: '/guide/introduction' },
      { text: 'API 参考', link: '/api/overview' },
      { text: '示例', link: '/examples/basic' },
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
          text: '开始',
          items: [
            { text: '简介', link: '/guide/introduction' },
            { text: '快速开始', link: '/guide/getting-started' },
            { text: '基本概念', link: '/guide/concepts' }
          ]
        },
        {
          text: '核心功能',
          items: [
            { text: '规则引擎', link: '/guide/rule-engine' },
            { text: '事件系统', link: '/guide/events' },
            { text: '动作执行', link: '/guide/actions' }
          ]
        }
      ],
      '/api/': [
        {
          text: 'API 参考',
          items: [
            { text: '概览', link: '/api/overview' },
            { text: '规则管理', link: '/api/rules' },
            { text: '动作管理', link: '/api/actions' },
            { text: '设备管理', link: '/api/devices' },
            { text: '全局变量', link: '/api/variables' },
            { text: '代码库', link: '/api/code-library' },
            { text: '手势识别', link: '/api/gestures' },
            { text: '系统集成', link: '/api/system' }
          ]
        }
      ],
      '/examples/': [
        {
          text: '示例',
          items: [
            { text: '基础示例', link: '/examples/basic' },
            { text: '验证码自动输入', link: '/examples/auto-input' },
            { text: '通知处理', link: '/examples/notifications' },
            { text: '米家设备控制', link: '/examples/mijia' },
            { text: '高级应用', link: '/examples/advanced' }
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/xiaobaiweinuli/shortxapi' }
    ],

    footer: {
      message: '基于 MIT 许可发布 | <a href="https://github.com/xiaobaiweinuli/shortxapi/blob/main/CODE_OF_CONDUCT.md" target="_blank">行为准则</a> | <a href="https://www.netlify.com" target="_blank" rel="noopener">Powered by Netlify</a>',
      copyright: 'Copyright © 2024-present ShortX'
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
