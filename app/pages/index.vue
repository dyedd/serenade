<template>
  <div class="home-container">
    <aside class="sidebar">
      <div class="avatar-section">
        <div class="avatar-wrapper">
          <img src="/logo.jpg" alt="avatar" class="avatar" />
          <div class="avatar-badge">🐟</div>
        </div>
      </div>

      <CardContainer class="info-card no-border-card">
        <h3 class="card-title">最新博文</h3>
        <Timeline :items="latestPosts" />
      </CardContainer>
    </aside>

    <main class="main-content">
      <div class="intro-section">
        <h1 class="intro-title">
          Hello, I'm <span class="name-gradient">染念</span>👋
        </h1>
        <p class="intro-text">
          <span class="highlight-text">AI infra</span>研究生，目前研究<span
            class="underline-text"
            >大规模分布式训练</span
          >以及<span class="highlight-text">扩散模型在短临降水领域</span>的应用
        </p>
        <p class="intro-text">
          过去我也学习过<span class="highlight-text">前后端</span
          >，所以现在也是不专业的全栈开发者
        </p>
        <p class="intro-emoji">🐍巳巳如意,生生不息</p>
        <p class="intro-emoji">🌈🌈🌈</p>
      </div>

      <div class="github-contribution">
        <img
          src="https://ghchart.rshah.org/409ba5/dyedd"
          alt="GitHub Contribution Chart"
          class="contribution-chart"
        />
      </div>

      <div class="social-links">
        <a href="https://github.com/dyedd" target="_blank" class="social-link">
          <svg class="icon" aria-hidden="true" width="2rem" height="2rem">
            <use xlink:href="#icon-github"></use>
          </svg>
        </a>
        <a href="mailto:1176996982@qq.com" target="_blank" class="social-link">
          <svg class="icon" aria-hidden="true" width="2rem" height="2rem">
            <use xlink:href="#icon-youxiang"></use>
          </svg>
        </a>
        <a
          href="https://qm.qq.com/cgi-bin/qm/qr?k=nLIdzy8UC9VkZ0g2EwnoN1rwnxaYvFx0&jump_from=webapi&authKey=mq2RvfcTQxEgImX+XZv0tBeobeHX+wTaAxOXq7pEKdsUD+a2Hi7mIOBGEj2ZtSDJ"
          target="_blank"
          class="social-link"
        >
          <svg class="icon" aria-hidden="true" width="2rem" height="2rem">
            <use xlink:href="#icon-QQ"></use>
          </svg>
        </a>
      </div>

      <div class="statement-box">
        我将在这里分享我的<span class="highlight-text">编程</span>和<span
          class="highlight-text"
          >人工智能</span
        >知识。如果你对这些主题感兴趣，那么恭喜你找到宝藏了。接下来你可以查看内容或订阅
        <a class="highlight-text" href="/feed">RSS</a>。
      </div>

      <div class="tech-section">
        <div class="tech-stack">
          <h3 class="section-title">技术栈</h3>
          <div class="tech-badges">
            <img
              src="https://img.shields.io/badge/-Python-3776AB?logo=python&logoColor=white"
              alt="Python"
            />
            <img
              src="https://img.shields.io/badge/-CUDA-76B900?logo=nvidia&logoColor=white"
              alt="CUDA"
            />
            <img
              src="https://img.shields.io/badge/-C++-00599C?logo=cplusplus&logoColor=white"
              alt="C++"
            />
            <img
              src="https://img.shields.io/badge/-JavaScript-yellow?logo=javascript&logoColor=white"
              alt="JavaScript"
            />
            <img
              src="https://img.shields.io/badge/-HTML5-E34F26?logo=html5&logoColor=white"
              alt="HTML5"
            />
            <img
              src="https://img.shields.io/badge/-Vue-4FC08D?logo=vue.js&logoColor=white"
              alt="Vue"
            />
            <img
              src="https://img.shields.io/badge/-PHP-777BB4?logo=php&logoColor=white"
              alt="PHP"
            />
            <img
              src="https://img.shields.io/badge/-Docker-2496ED?logo=docker&logoColor=white"
              alt="Docker"
            />
            <img
              src="https://img.shields.io/badge/-Slurm-1F1F1F?logo=linux&logoColor=white"
              alt="Slurm"
            />
            <img
              src="https://img.shields.io/badge/-Ubuntu-E95420?logo=ubuntu&logoColor=white"
              alt="Ubuntu"
            />
          </div>
        </div>
      </div>
    </main>
  </div>
</template>
<script setup>
definePageMeta({
  layout: 'home'
})

const { data: postsData, status, error } = await useFetch('/api/posts', {
  query: { page: 1, pageSize: 5 },
  key: 'home-latest-posts',
  server: true,
  default: () => ({ data: [] })
})

const latestPosts = computed(() => {
  if (status.value === 'pending') {
    return []
  } else if (error.value) {
    return []
  } else if (postsData.value && Array.isArray(postsData.value.data)) {
    return postsData.value.data
  } else {
    return []
  }
})
</script>

<style lang="scss" scoped>
.home-container {
  display: flex;
  gap: 2rem;
  margin: 0 auto;
  padding: 0;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.sidebar {
  width: 14rem;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  height: fit-content;
}

.avatar-section {
  display: flex;
  justify-content: center;
  margin-bottom: 0.5rem;
}

.avatar-wrapper {
  position: relative;
  width: 10rem;
  height: 10rem;

  .avatar {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
    transition: transform 0.3s ease;

    &:hover {
      transform: scale(1.05);
    }
  }

  .avatar-badge {
    position: absolute;
    width: 3rem;
    height: 3rem;
    line-height: 3rem;
    border-radius: 50%;
    bottom: 0;
    right: 0;
    text-align: center;
    font-size: 1.5rem;
    background-color: var(--bg);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
}

:global(.dark) .avatar-badge {
  box-shadow: 0 2px 8px rgba(255, 255, 255, 0.1);
}

// 信息卡片
.info-card {
  width: 100%;
}

.no-border-card {
  border: none !important;
  box-shadow: none !important;
  background: transparent !important;
  padding: 0 !important;
  backdrop-filter: none !important;
}

.no-border-card .card-title {
  border: none !important;
  padding-bottom: 0.5rem;
}

:global(.dark) .no-border-card {
  border: none !important;
  box-shadow: none !important;
  background: transparent !important;
}

.card-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-color);
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}

:global(.dark) .card-title {
  border-bottom-color: rgba(255, 255, 255, 0.08);
}

.main-content {
  flex: 1 1 0;
  min-width: 0;
  max-width: 100%;
}

.intro-section {
  margin-bottom: 2rem;
}

.intro-title {
  font-size: 3rem;
  font-weight: 800;
  color: var(--text-color);
  margin-bottom: 1rem;
  line-height: 1.2;
}

.name-gradient {
  background: linear-gradient(
    45deg,
    rgb(118, 170, 227),
    #826ac9 30%,
    white 60%
  );
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-size: 400%;
  background-position: 0%;
}

.intro-text {
  font-size: 1.4rem;
  line-height: 1.6;
  color: var(--text-color);
  margin-bottom: 1rem;
}

.intro-emoji {
  font-size: 1.4rem;
  line-height: 1.6;
  margin: 1rem 0;
}

.highlight-text {
  color: var(--color);
  font-weight: 500;
}

.underline-text {
  text-decoration: wavy underline;
}

// 社交链接
.social-links {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

.social-link {
  padding: 0.5rem 0.75rem;
  text-decoration: none;
  border-radius: 0.5rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 1.3rem;
  background: rgba(249, 250, 251, 0.6);
  color: #000;
  transition: all 0.3s ease;
  border: 1px solid transparent;
  min-height: 3rem;

  &:hover {
    background: rgba(249, 250, 251, 0.9);
    border-color: var(--color-30);
    transform: translateY(-1px);
  }

  .icon {
    flex-shrink: 0;
  }
}

:global(.dark) .social-link {
  background: rgba(51, 65, 85, 0.5);
  color: var(--text-color);

  &:hover {
    background: rgba(51, 65, 85, 0.7);
    border-color: var(--color-30);
  }
}

// 个人宣言
.statement-box {
  margin-bottom: 2rem;
  padding: 1.25rem 1.5rem;
  background: #f9f0d4;
  border-radius: 0.5rem;
  color: #644006;
  line-height: 1.6;
  position: relative;
  font-size: 1rem;

  &::before {
    content: "✍";
    font-size: 2rem;
    position: absolute;
    top: -2rem;
    left: 0;
  }
}

:global(.dark) .statement-box {
  background: rgba(251, 191, 36, 0.15);
  color: #fbbf24;
}

// 技术栈
.tech-section {
  margin-bottom: 2rem;
}

.tech-stack {
  width: 100%;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-color);
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid var(--color);
  display: inline-block;
}

.tech-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tech-badges img {
  height: 30px;
  border-radius: 4px;
  transition: transform 0.2s ease;
}

.tech-badges img:hover {
  transform: translateY(-2px);
}

// GitHub 贡献热力图
.github-contribution {
  margin-bottom: 2rem;
  .contribution-chart {
    width: 100%;
    display: block;
    object-fit: contain;
  }
}

// ========== 响应式设计 ==========
@media screen and (max-width: 1200px) {
  .home-container {
    flex-direction: column;
    padding: 2rem 1.5rem;
    max-width: 60rem;
  }

  .sidebar {
    width: 100%;
    position: static;
    max-width: 40rem;
    margin: 0 auto;
  }

  .main-content {
    min-width: 0;
    width: 100%;
  }

  .intro-title {
    font-size: 2.5rem;
  }

  .intro-text {
    font-size: 1.3rem;
  }
}

@media screen and (max-width: 1024px) {
  .intro-title {
    font-size: 2.25rem;
  }
}

@media screen and (max-width: 768px) {
  .home-container {
    padding: 1.5rem 1rem;
    gap: 1.5rem;
  }

  .avatar-wrapper {
    width: 6.5rem;
    height: 6.5rem;

    .avatar-badge {
      width: 2.5rem;
      height: 2.5rem;
      line-height: 2.5rem;
      font-size: 1.25rem;
    }
  }

  .intro-title {
    font-size: 2rem;
  }

  .intro-text,
  .intro-emoji {
    font-size: 1.2rem;
  }

  .github-contribution {
    padding: 0.75rem;
  }

  .tech-section {
    flex-direction: column;
    gap: 1.5rem;
  }

  .tech-badges img {
    height: 28px;
  }
}

@media screen and (max-width: 480px) {
  .home-container {
    padding: 1rem;
  }

  .avatar-wrapper {
    width: 6rem;
    height: 6rem;

    .avatar-badge {
      width: 2.25rem;
      height: 2.25rem;
      line-height: 2.25rem;
      font-size: 1.1rem;
    }
  }

  .intro-title {
    font-size: 1.75rem;
  }

  .intro-text,
  .intro-emoji {
    font-size: 1.1rem;
  }

  .social-links {
    flex-wrap: wrap;
  }

  .social-link {
    flex: 1 1 45%;
    min-width: 120px;
    justify-content: center;
  }

  .statement-box {
    font-size: 0.9rem;
    padding: 1rem 1.25rem;
  }

  .github-contribution {
    padding: 0.5rem;
  }

  .tech-badges img {
    height: 26px;
  }
}
</style>
