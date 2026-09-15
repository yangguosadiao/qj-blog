import DefaultTheme from 'vitepress/theme'
import HomePage from './components/HomePage.vue'
import AdminPanel from './components/AdminPanel.vue'
import PostList from './components/PostList.vue'
import Categories from './components/Categories.vue'
import LatestPosts from './components/LatestPosts.vue'
import './custom.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('HomePage', HomePage)
    app.component('AdminPanel', AdminPanel)
    app.component('PostList', PostList)
    app.component('Categories', Categories)
    app.component('LatestPosts', LatestPosts)
  },
}
