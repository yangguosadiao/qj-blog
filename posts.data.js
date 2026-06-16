import { createContentLoader } from 'vitepress'

export default createContentLoader('posts/*.md', {
  transform(raw) {
    return raw
      .map((page) => ({
        title: page.frontmatter.title,
        url: page.url,
        date: page.frontmatter.date || '',
      }))
      .sort((a, b) => String(b.date).localeCompare(String(a.date)))
  },
})
