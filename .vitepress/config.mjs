import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'QJ',
  description: 'QJ的个人博客',
  lang: 'zh-CN',
  base: '/qj-blog/',
  cleanUrls: true,

  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      { text: '文章', link: '/posts/' },
      { text: '关于', link: '/about' },
    ],
    socialLinks: [
      { icon: 'github', link: 'https://github.com' },
    ],
    outline: {
      level: [2, 3],
      label: '目录',
    },
    lastUpdated: {
      text: '最后更新',
    },
    docFooter: {
      prev: '上一篇',
      next: '下一篇',
    },
    darkModeSwitchLabel: '主题',
    sidebarMenuLabel: '菜单',
    returnToTopLabel: '回到顶部',
  },
})
