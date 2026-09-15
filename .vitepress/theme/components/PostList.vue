<script setup>
import { ref, computed } from 'vue'
import { data as posts } from '../../../posts.data.js'
import categoriesRaw from '../../../categories.json'

const categories = categoriesRaw || []
const active = ref('')

const filtered = computed(() => {
  if (!active.value) return posts
  return posts.filter((p) => p.category === active.value)
})
function catName(slug) {
  const c = categories.find((x) => x.slug === slug)
  return c ? c.name : (slug ? '未分类' : '无')
}
function count(slug) {
  return slug ? posts.filter((p) => p.category === slug).length : posts.length
}
</script>

<template>
  <div class="post-list">
    <div class="filters">
      <button :class="['chip', { on: !active }]" @click="active = ''">全部 ({{ count('') }})</button>
      <button
        v-for="c in categories"
        :key="c.slug"
        :class="['chip', { on: active === c.slug }]"
        @click="active = c.slug"
      >{{ c.name }} ({{ count(c.slug) }})</button>
    </div>

    <ul v-if="filtered.length" class="items">
      <li v-for="p in filtered" :key="p.url" class="item">
        <a :href="p.url" class="item-title">{{ p.title }}</a>
        <div class="item-meta">
          <span class="date">{{ p.date }}</span>
          <span v-if="p.category" class="badge">{{ catName(p.category) }}</span>
        </div>
        <p v-if="p.excerpt" class="excerpt">{{ p.excerpt }}…</p>
      </li>
    </ul>
    <p v-else class="empty">这里还没有文章。</p>
  </div>
</template>

<style scoped>
.post-list { max-width: 820px; margin: 0 auto; }
.filters { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 24px; }
.chip {
  border: 1px solid var(--vp-c-divider); background: transparent; color: var(--vp-c-text-2);
  border-radius: 999px; padding: 5px 14px; cursor: pointer; font-size: 0.9em; transition: all .2s;
}
.chip:hover { color: var(--vp-c-brand-1); border-color: var(--vp-c-brand-1); }
.chip.on { background: var(--vp-c-brand-1); color: #fff; border-color: var(--vp-c-brand-1); }
.items { list-style: none; margin: 0; padding: 0; }
.item { padding: 18px 0; border-bottom: 1px solid var(--vp-c-divider); }
.item-title { font-size: 1.25rem; font-weight: 600; color: var(--vp-c-text-1); text-decoration: none; }
.item-title:hover { color: var(--vp-c-brand-1); }
.item-meta { margin-top: 6px; display: flex; gap: 10px; align-items: center; font-size: 0.85em; color: var(--vp-c-text-2); }
.badge { background: rgba(92,106,196,0.12); color: var(--vp-c-brand-1); border-radius: 6px; padding: 2px 8px; }
.excerpt { margin-top: 8px; color: var(--vp-c-text-2); line-height: 1.7; }
.empty { text-align: center; color: var(--vp-c-text-2); padding: 40px 0; }
</style>
