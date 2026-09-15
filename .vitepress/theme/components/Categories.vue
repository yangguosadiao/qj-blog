<script setup>
import { data as posts } from '../../../posts.data.js'
import categoriesRaw from '../../../categories.json'

const categories = (categoriesRaw || []).map((c) => ({
  ...c,
  posts: posts.filter((p) => p.category === c.slug),
})).filter((c) => c.posts.length > 0)
</script>

<template>
  <div class="cat-page">
    <p v-if="categories.length === 0" class="empty">还没有任何分区。管理员可在「管理后台」创建分区。</p>
    <section v-for="c in categories" :key="c.slug" class="cat-block">
      <h2 class="cat-name">{{ c.name }} <span class="count">{{ c.posts.length }}</span></h2>
      <ul class="cat-items">
        <li v-for="p in c.posts" :key="p.url">
          <a :href="p.url">{{ p.title }}</a>
          <span class="date">{{ p.date }}</span>
        </li>
      </ul>
    </section>
  </div>
</template>

<style scoped>
.cat-page { max-width: 820px; margin: 0 auto; }
.cat-block { margin-bottom: 28px; }
.cat-name { font-size: 1.4rem; color: var(--vp-c-text-1); border-left: 4px solid var(--vp-c-brand-1); padding-left: 12px; }
.count { font-size: 0.8em; color: var(--vp-c-text-2); font-weight: 400; }
.cat-items { list-style: none; margin: 12px 0 0; padding: 0; }
.cat-items li { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px dashed var(--vp-c-divider); }
.cat-items a { color: var(--vp-c-text-1); text-decoration: none; }
.cat-items a:hover { color: var(--vp-c-brand-1); }
.date { color: var(--vp-c-text-2); font-size: 0.85em; }
.empty { text-align: center; color: var(--vp-c-text-2); padding: 40px 0; }
</style>
