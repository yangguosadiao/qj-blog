import fs from 'node:fs'
import path from 'node:path'

const title = process.argv[2]

if (!title) {
  console.log('用法: npm run new "文章标题"')
  process.exit(1)
}

const today = new Date().toISOString().slice(0, 10)

// 生成 URL 友好的文件名
const slug = title
  .replace(/[^\w一-鿿-]/g, '-')  // 保留中英文和连字符
  .replace(/-+/g, '-')
  .replace(/^-|-$/g, '')
  .toLowerCase() || 'untitled'

const filename = `${today}-${slug}.md`
const filepath = path.join(import.meta.dirname, '..', 'posts', filename)

const content = `---
title: ${title}
date: ${today}
---

# ${title}

`
fs.writeFileSync(filepath, content, 'utf-8')
console.log(`已创建: posts/${filename}`)
console.log(`用编辑器打开它就可以开始写了。`)
