import { createContentLoader } from 'vitepress'

// 加载 posts/ 下所有文章（自动排除文章列表页本身）
export default createContentLoader('posts/*.md', {
  includeSrc: true,
  transform(raw) {
    return raw
      .filter((page) => page.relativePath !== 'posts/index.md')
      .map((page) => {
        const src = page.src || ''
        // 去除 frontmatter，提取正文前 80 字作为摘要
        const body = src.replace(/^---[\s\S]*?---/, '').trim()
        const excerpt = body
          .replace(/[#>*`\-\[\]!]/g, '')
          .replace(/\s+/g, ' ')
          .slice(0, 80)
        return {
          title: page.frontmatter.title || page.title,
          url: page.url,
          date: page.frontmatter.date || '',
          category: page.frontmatter.category || '',
          excerpt,
        }
      })
      .sort((a, b) => String(b.date).localeCompare(String(a.date)))
  },
})
