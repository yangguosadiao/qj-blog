import { createContentLoader } from 'vitepress'

export default createContentLoader('posts/*.md', {
  transform(raw) {
    return raw
      .map((page) => ({
        title: page.frontmatter.title,
        url: page.url,
        date: page.frontmatter.date || '',
      }))
      .sort((a, b) => b.date.localeCompare(a.date))
  },
})
