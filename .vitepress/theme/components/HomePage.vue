<template>
  <div class="home-page">
    <!-- Hero -->
    <div class="hero">
      <h1 class="hero-name">QJ</h1>
      <p class="hero-tagline">认真记录，自由分享</p>
      <div class="hero-actions">
        <a href="/qj-blog/posts/" class="btn-brand">全部文章</a>
        <a href="/qj-blog/about" class="btn-alt">关于我</a>
      </div>
    </div>

    <!-- 底部 -->
    <div class="home-footer">
      <p>种一棵树最好的时间是十年前，其次是现在。</p>
      <div class="dots">
        <span></span><span></span><span></span>
      </div>
    </div>
  </div>
</template>

<style>
.home-page {
  min-height: calc(100vh - 64px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

/* Hero */
.hero {
  text-align: center;
  padding: 96px 24px 48px;
}

.hero-name {
  font-size: 5rem;
  font-weight: 800;
  line-height: 1.3;
  letter-spacing: 0.06em;
  background: linear-gradient(135deg, #5c6ac4 20%, #e8917a 80%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0;
  /* 防止渐变色裁切 */
  display: inline-block;
  padding: 8px 0;
}

.hero-tagline {
  font-size: 1.25rem;
  color: var(--vp-c-text-1);
  letter-spacing: 0.06em;
  margin: 16px 0 40px;
  text-shadow: 0 1px 8px rgba(255,255,255,0.6);
}

.hero-tagline::after {
  content: '';
  display: block;
  width: 40px;
  height: 2px;
  background: var(--vp-c-brand-1);
  margin: 16px auto 0;
  opacity: 0.6;
  border-radius: 1px;
}

.hero-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
}

.btn-brand, .btn-alt {
  display: inline-block;
  padding: 10px 28px;
  border-radius: 20px;
  font-size: 0.95rem;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-brand {
  background: var(--vp-c-brand-1);
  color: #fff;
}
.btn-brand:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(92, 106, 196, 0.35);
}

.btn-alt {
  background: rgba(255,255,255,0.6);
  color: var(--vp-c-text-1);
  border: 1px solid var(--vp-c-divider);
}
.btn-alt:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.08);
}

/* 底部 */
.home-footer {
  text-align: center;
  padding: 32px 24px 64px;
  color: var(--vp-c-text-3);
  font-size: 0.9rem;
}
.home-footer .dots {
  display: flex;
  justify-content: center;
  gap: 6px;
  margin-top: 16px;
}
.home-footer .dots span {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--vp-c-brand-2);
  opacity: 0.4;
}

/* 暗色模式 */
html.dark .btn-alt {
  background: rgba(40,40,40,0.6);
  border-color: rgba(60,60,60,0.6);
}

@media (max-width: 640px) {
  .hero-name { font-size: 3.2rem; }
}
</style>
