<script setup>
import { data as posts } from '../../../posts.data.js'
import categoriesRaw from '../../../categories.json'

const latest = posts.slice(0, 5)
const categories = categoriesRaw || []
function catName(slug) {
  const c = categories.find((x) => x.slug === slug)
  return c ? c.name : (slug ? '未分类' : '')
}
</script>

<template>
  <div v-if="latest.length" class="latest">
    <h2 class="latest-title">最新文章</h2>
    <ul class="latest-list">
      <li v-for="p in latest" :key="p.url" class="latest-item">
        <a :href="p.url" class="latest-link">{{ p.title }}</a>
        <div class="latest-meta">
          <span class="date">{{ p.date }}</span>
          <span v-if="p.category" class="badge">{{ catName(p.category) }}</span>
        </div>
      </li>
    </ul>
    <a href="/qj-blog/posts/" class="more">查看全部文章 →</a>
  </div>
</template>

<style scoped>
.latest { width: 100%; max-width: 640px; margin: 24px auto 0; text-align: left; }
.latest-title { text-align: center; font-size: 1.3rem; color: var(--vp-c-text-1); margin-bottom: 16px; }
.latest-list { list-style: none; margin: 0; padding: 0; }
.latest-item { padding: 12px 0; border-bottom: 1px solid var(--vp-c-divider); }
.latest-link { font-size: 1.05rem; font-weight: 500; color: var(--vp-c-text-1); text-decoration: none; }
.latest-link:hover { color: var(--vp-c-brand-1); }
.latest-meta { margin-top: 4px; display: flex; gap: 10px; align-items: center; font-size: 0.82em; color: var(--vp-c-text-2); }
.badge { background: rgba(92,106,196,0.12); color: var(--vp-c-brand-1); border-radius: 6px; padding: 1px 8px; }
.more { display: inline-block; margin-top: 14px; color: var(--vp-c-brand-1); text-decoration: none; font-size: 0.9em; }
</style>
