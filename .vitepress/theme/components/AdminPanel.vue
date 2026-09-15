<script setup>
import { ref, reactive, watch, nextTick, onMounted } from 'vue'
import { data as sitePosts } from '../../../posts.data.js'
// Toast UI 编辑器为纯浏览器组件，且在 SSR（构建）阶段会引用 window/Element 全局，
// 因此改为「仅在客户端登录后」动态加载，避免破坏静态构建。

/* ===== 基础配置（可按需修改） ===== */
const REPO = 'yangguosadiao/qj-blog'
const BRANCH = 'master'
const SITE_BASE = '/qj-blog'
const API = `https://api.github.com/repos/${REPO}/contents`
// 管理页密码（仅用于隐藏编辑界面，真正的写权限由下方 GitHub 令牌控制）。
// 强烈建议你改成自己的密码后再部署。
const ADMIN_PASSWORD = 'qjblog-admin-2026'

/* ===== 响应式状态 ===== */
const passwordInput = ref('')
const authed = ref(false)
const pat = ref(typeof localStorage !== 'undefined' ? localStorage.getItem('qjblog_pat') || '' : '')
const patSaved = ref(typeof localStorage !== 'undefined' ? !!localStorage.getItem('qjblog_pat') : false)

const posts = reactive([...sitePosts])
const categories = reactive([])
let catSha = null

const mode = ref('new') // new | edit
const form = reactive({ title: '', category: '' })
const currentSlug = ref('')
const currentSha = ref('')
const currentUrl = ref('')

const status = ref('')
const busy = ref(false)

let editor = null
const editorEl = ref(null)

/* ===== 工具函数 ===== */
function b64Encode(str) { return btoa(unescape(encodeURIComponent(str))) }
function b64Decode(b64) { return decodeURIComponent(escape(atob(b64))) }
function blobToB64(blob) {
  return new Promise((resolve, reject) => {
    const fr = new FileReader()
    fr.onload = () => resolve(fr.result.split(',')[1])
    fr.onerror = reject
    fr.readAsDataURL(blob)
  })
}
function today() { return new Date().toISOString().slice(0, 10) }
function slugify(title) {
  const d = today()
  const s = (title || 'untitled')
    .replace(/[^\w一-鿿-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase() || 'untitled'
  return `${d}-${s}`
}
function slugifyRaw(name) {
  return (name || '')
    .trim()
    .replace(/[^\w一-鿿-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase() || 'cat'
}

/* ===== GitHub API ===== */
async function gh(path, opts = {}) {
  const headers = {
    Authorization: `Bearer ${pat.value}`,
    Accept: 'application/vnd.github+json',
  }
  if (opts.body) headers['Content-Type'] = 'application/json'
  const res = await fetch(API + path, { ...opts, headers })
  if (!res.ok && res.status !== 404) {
    const t = await res.text()
    throw new Error(`GitHub API ${res.status}: ${t.slice(0, 200)}`)
  }
  return res
}
async function getFile(path) {
  const res = await gh('/' + path)
  if (res.status === 404) return null
  return res.json()
}
async function putFile(path, contentB64, message, sha) {
  const body = { message, content: contentB64, branch: BRANCH }
  if (sha) body.sha = sha
  const res = await gh('/' + path, { method: 'PUT', body: JSON.stringify(body) })
  return res.json()
}
async function deleteFile(path, sha, message) {
  const body = { message, sha, branch: BRANCH }
  const res = await gh('/' + path, { method: 'DELETE', body: JSON.stringify(body) })
  return res.json()
}

/* ===== 鉴权 ===== */
function login() {
  if (passwordInput.value === ADMIN_PASSWORD) {
    authed.value = true
  } else {
    status.value = '密码错误'
  }
}
function logout() {
  authed.value = false
}

/* ===== 编辑器 ===== */
watch(authed, async (v) => {
  if (v) {
    await nextTick()
    await initEditor()
    await loadCategories()
  }
})
async function initEditor() {
  if (editor) { try { editor.destroy() } catch (e) {} editor = null }
  if (!editorEl.value) return
  const { default: Editor } = await import('@toast-ui/editor')
  await import('@toast-ui/editor/dist/toastui-editor.css')
  editor = new Editor({
    el: editorEl.value,
    height: '620px',
    initialEditType: 'wysiwyg',
    previewStyle: 'vertical',
    usageStatistics: false,
    hooks: {
      addImageBlobHook: async (blob, callback) => {
        try {
          const url = await uploadImage(blob)
          if (url) callback(url, blob.name || 'image')
        } catch (e) {
          status.value = '图片上传失败：' + e.message
        }
        return false
      },
    },
  })
}

async function uploadImage(blob) {
  if (!pat.value) {
    alert('请先在右上角填写并保存 GitHub 令牌(PAT)再上传图片。')
    throw new Error('缺少 PAT')
  }
  const ext = (blob.type.split('/')[1] || 'png').replace('jpeg', 'jpg')
  const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
  const b64 = await blobToB64(blob)
  await putFile(`public/uploads/${name}`, b64, `upload image ${name}`)
  return `${SITE_BASE}/uploads/${name}`
}

/* ===== 分类 ===== */
async function loadCategories() {
  try {
    const f = await getFile('categories.json')
    if (f) {
      catSha = f.sha
      const arr = JSON.parse(b64Decode(f.content))
      categories.splice(0, categories.length, ...arr)
    }
  } catch (e) {
    status.value = '读取分类失败：' + e.message
  }
}
async function saveCategories() {
  const b64 = b64Encode(JSON.stringify(categories, null, 2))
  const r = await putFile('categories.json', b64, 'update categories', catSha)
  catSha = r.content?.sha || catSha
}
function addCategory() {
  const name = prompt('请输入新分区（分类）名称：')
  if (!name) return
  const slug = slugifyRaw(name)
  if (categories.find((c) => c.slug === slug)) {
    alert('该分区已存在')
    return
  }
  if (!pat.value) {
    alert('请先在右上角填写并保存 GitHub 令牌(PAT)再新建分区。')
    return
  }
  categories.push({ slug, name })
  saveCategories()
    .then(() => { status.value = '✅ 分区已保存，GitHub Actions 正在重新部署，约 1-2 分钟后所有人可见。' })
    .catch((e) => { status.value = '分区保存失败：' + e.message })
}
function delCategory(slug) {
  if (!confirm('确定删除该分区？已发布文章的分区标记不会自动改动。')) return
  if (!pat.value) {
    alert('请先在右上角填写并保存 GitHub 令牌(PAT)再删除分区。')
    return
  }
  const i = categories.findIndex((c) => c.slug === slug)
  if (i >= 0) categories.splice(i, 1)
  saveCategories()
    .then(() => { status.value = '✅ 分区已删除，重新部署后生效。' })
    .catch((e) => { status.value = '分区删除失败：' + e.message })
}

/* ===== 文章 ===== */
function newPost() {
  mode.value = 'new'
  form.title = ''
  form.category = ''
  currentSlug.value = ''
  currentSha.value = ''
  currentUrl.value = ''
  if (editor) editor.setMarkdown('')
  status.value = ''
}
async function editPost(post) {
  const rel = post.url.replace(SITE_BASE, '')           // /posts/xxx
  const path = rel.slice(1) + '.md'                    // posts/xxx.md
  const f = await getFile(path)
  if (!f) { status.value = '未找到文件：' + path; return }
  const full = b64Decode(f.content)
  const m = full.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/)
  let title = post.title, category = '', body = full
  if (m) {
    m[1].split('\n').forEach((line) => {
      const mm = line.match(/^(\w+):\s*(.*)$/)
      if (mm) {
        if (mm[1] === 'title') title = mm[2]
        if (mm[1] === 'category') category = mm[2]
      }
    })
    body = m[2]
  }
  mode.value = 'edit'
  form.title = title
  form.category = category
  currentSlug.value = rel.split('/')[2]
  currentSha.value = f.sha
  currentUrl.value = post.url
  if (editor) editor.setMarkdown(body)
  status.value = '正在编辑：' + title
}
async function deletePost(post) {
  if (!confirm('确定删除《' + post.title + '》？此操作会提交到仓库并重新部署。')) return
  const rel = post.url.replace(SITE_BASE, '')
  const path = rel.slice(1) + '.md'
  const f = await getFile(path)
  if (!f) { status.value = '未找到文件'; return }
  busy.value = true
  try {
    await deleteFile(path, f.sha, 'delete post: ' + post.title)
    const i = posts.findIndex((p) => p.url === post.url)
    if (i >= 0) posts.splice(i, 1)
    status.value = '已删除，正在重新部署…'
  } catch (e) {
    status.value = '删除失败：' + e.message
  } finally { busy.value = false }
}
async function savePost() {
  if (!pat.value) { status.value = '请先填写并保存 GitHub 令牌(PAT)'; return }
  if (!form.title.trim()) { status.value = '请填写文章标题'; return }
  busy.value = true
  try {
    const md = editor.getMarkdown()
    const fm = `---\ntitle: ${form.title.trim()}\ndate: ${today()}` +
      (form.category ? `\ncategory: ${form.category}` : '') + '\n---\n\n' + md
    let slug = currentSlug.value || slugify(form.title)
    let path = `posts/${slug}.md`
    if (mode.value === 'new') {
      let existing = await getFile(path)
      let i = 2
      while (existing) {
        slug = `${slugify(form.title).replace(/-\d+$/,'')}-${i}`
        path = `posts/${slug}.md`
        existing = await getFile(path)
        i++
      }
    }
    const b64 = b64Encode(fm)
    const res = await putFile(path, b64, `${mode.value === 'new' ? 'add' : 'update'} post: ${form.title}`, mode.value === 'edit' ? currentSha.value : null)
    // 更新本地列表（公开站点将在部署后更新）
    const entry = {
      title: form.title.trim(),
      url: `${SITE_BASE}/posts/${slug}`,
      date: today(),
      category: form.category,
      excerpt: md.replace(/[#>*`\-\[\]!]/g, '').replace(/\s+/g, ' ').slice(0, 80),
    }
    const idx = posts.findIndex((p) => p.url === entry.url)
    if (idx >= 0) posts[idx] = entry
    else posts.unshift(entry)
    posts.sort((a, b) => String(b.date).localeCompare(String(a.date)))
    mode.value = 'edit'
    currentSlug.value = slug
    currentSha.value = res.content?.sha || currentSha.value
    currentUrl.value = entry.url
    status.value = '✅ 已保存，GitHub Actions 正在重新部署，约 1-2 分钟后所有人可见。'
  } catch (e) {
    status.value = '保存失败：' + e.message
  } finally { busy.value = false }
}

/* ===== PAT 保存 ===== */
function savePat() {
  localStorage.setItem('qjblog_pat', pat.value)
  patSaved.value = true
  status.value = 'GitHub 令牌已保存到本浏览器。'
}
function forgetPat() {
  localStorage.removeItem('qjblog_pat')
  patSaved.value = false
  status.value = '已清除本地令牌。'
}

function categoryName(slug) {
  const c = categories.find((x) => x.slug === slug)
  return c ? c.name : (slug ? '未分类' : '无')
}

onMounted(() => {
  // 占位，鉴权后再初始化编辑器
})
</script>

<template>
  <div class="admin-wrap">
    <!-- 登录门 -->
    <div v-if="!authed" class="admin-login">
      <h2>管理后台</h2>
      <p class="muted">请输入管理密码以进入。</p>
      <input v-model="passwordInput" type="password" placeholder="管理密码" @keyup.enter="login" />
      <button class="btn-primary" @click="login">进入</button>
      <p class="status">{{ status }}</p>
    </div>

    <!-- 仪表盘 -->
    <div v-else class="admin-dash">
      <header class="admin-top">
        <div class="brand">管理后台</div>
        <div class="pat-box">
          <input v-model="pat" type="password" placeholder="GitHub 令牌 PAT（repo 权限）" />
          <button class="btn-small" @click="savePat">保存</button>
          <button class="btn-small ghost" @click="forgetPat">清除</button>
          <span v-if="patSaved" class="saved">已保存</span>
          <button class="btn-small ghost" @click="logout">退出</button>
        </div>
      </header>

      <div class="admin-body">
        <!-- 左栏：文章 + 分类 -->
        <aside class="side">
          <section class="panel">
            <div class="panel-head">
              <span>文章</span>
              <button class="btn-small" @click="newPost">+ 新建</button>
            </div>
            <ul class="list">
              <li v-for="p in posts" :key="p.url" class="item">
                <div class="item-main" @click="editPost(p)">
                  <div class="item-title">{{ p.title }}</div>
                  <div class="item-meta">{{ p.date }} · {{ categoryName(p.category) }}</div>
                </div>
                <button class="del" title="删除" @click.stop="deletePost(p)">×</button>
              </li>
              <li v-if="posts.length === 0" class="muted small">暂无文章</li>
            </ul>
          </section>

          <section class="panel">
            <div class="panel-head">
              <span>分区（分类）</span>
              <button class="btn-small" @click="addCategory">+ 新建</button>
            </div>
            <ul class="list">
              <li v-for="c in categories" :key="c.slug" class="item">
                <div class="item-main"><div class="item-title">{{ c.name }}</div></div>
                <button class="del" title="删除" @click="delCategory(c.slug)">×</button>
              </li>
              <li v-if="categories.length === 0" class="muted small">暂无分区</li>
            </ul>
          </section>
        </aside>

        <!-- 右栏：编辑器 -->
        <main class="editor-pane">
          <div class="editor-bar">
            <input v-model="form.title" class="title-input" placeholder="文章标题" />
            <select v-model="form.category" class="cat-select">
              <option value="">（无分类）</option>
              <option v-for="c in categories" :key="c.slug" :value="c.slug">{{ c.name }}</option>
            </select>
            <button class="btn-primary" :disabled="busy" @click="savePost">
              {{ busy ? '提交中…' : (mode === 'edit' ? '保存修改' : '发布文章') }}
            </button>
          </div>
          <div ref="editorEl" class="toast-editor"></div>
          <p class="status">{{ status }}</p>
        </main>
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin-wrap { max-width: 1200px; margin: 0 auto; padding: 24px; }
.admin-login {
  max-width: 360px; margin: 80px auto; text-align: center;
  background: rgba(255,255,255,0.8); border: 1px solid var(--vp-c-divider);
  border-radius: 16px; padding: 32px; backdrop-filter: blur(8px);
}
.admin-login input { width: 100%; padding: 10px 12px; margin: 12px 0; border-radius: 10px; border: 1px solid var(--vp-c-divider); }
.muted { color: var(--vp-c-text-2); }
.small { font-size: 0.85em; }
.btn-primary {
  background: var(--vp-c-brand-1); color: #fff; border: none; padding: 10px 22px;
  border-radius: 20px; cursor: pointer; font-weight: 500;
}
.btn-primary:disabled { opacity: 0.6; cursor: default; }
.btn-small { border: 1px solid var(--vp-c-divider); background: #fff; border-radius: 8px; padding: 4px 10px; cursor: pointer; font-size: 0.85em; }
.btn-small.ghost { background: transparent; }
.status { color: var(--vp-c-brand-1); min-height: 1.2em; font-size: 0.9em; margin-top: 8px; }
.admin-top { display: flex; justify-content: space-between; align-items: center; gap: 16px; flex-wrap: wrap; margin-bottom: 16px; }
.brand { font-size: 1.3rem; font-weight: 700; color: var(--vp-c-brand-1); }
.pat-box { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.pat-box input { padding: 6px 10px; border-radius: 8px; border: 1px solid var(--vp-c-divider); width: 240px; }
.saved { color: #2c9e6b; font-size: 0.85em; }
.admin-body { display: grid; grid-template-columns: 300px 1fr; gap: 16px; align-items: start; }
.side { display: flex; flex-direction: column; gap: 16px; }
.panel { background: rgba(255,255,255,0.75); border: 1px solid var(--vp-c-divider); border-radius: 14px; padding: 12px; backdrop-filter: blur(8px); }
.panel-head { display: flex; justify-content: space-between; align-items: center; font-weight: 600; margin-bottom: 8px; }
.list { list-style: none; margin: 0; padding: 0; }
.item { display: flex; align-items: center; justify-content: space-between; padding: 8px; border-radius: 8px; }
.item:hover { background: rgba(92,106,196,0.08); }
.item-main { cursor: pointer; flex: 1; min-width: 0; }
.item-title { font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.item-meta { font-size: 0.8em; color: var(--vp-c-text-2); }
.del { border: none; background: transparent; color: #c0392b; font-size: 1.2em; cursor: pointer; line-height: 1; padding: 0 6px; }
.editor-pane { background: rgba(255,255,255,0.75); border: 1px solid var(--vp-c-divider); border-radius: 14px; padding: 12px; backdrop-filter: blur(8px); }
.editor-bar { display: flex; gap: 8px; margin-bottom: 10px; flex-wrap: wrap; }
.title-input { flex: 1; min-width: 160px; padding: 8px 12px; border-radius: 10px; border: 1px solid var(--vp-c-divider); }
.cat-select { padding: 8px 10px; border-radius: 10px; border: 1px solid var(--vp-c-divider); }
.toast-editor { border-radius: 10px; overflow: hidden; }
@media (max-width: 860px) { .admin-body { grid-template-columns: 1fr; } }
</style>
