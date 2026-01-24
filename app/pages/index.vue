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
        <h3 class="card-title">更新日志</h3>
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
        <p class="intro-emoji">🐎 马到成功，心想事成</p>
        <p class="intro-emoji">🌈🌈🌈</p>
      </div>

      <div class="social-links">
        <a
          href="https://github.com/dyedd"
          target="_blank"
          class="social-link"
          title="GitHub"
        >
          <svg class="icon" aria-hidden="true" width="1.5rem" height="1.5rem">
            <use xlink:href="#icon-github"></use>
          </svg>
          <span class="social-text">GitHub</span>
        </a>
        <a
          href="mailto:1176996982@qq.com"
          target="_blank"
          class="social-link"
          title="Email"
        >
          <svg class="icon" aria-hidden="true" width="1.5rem" height="1.5rem">
            <use xlink:href="#icon-youxiang"></use>
          </svg>
          <span class="social-text">Email</span>
        </a>
        <a
          href="https://qm.qq.com/cgi-bin/qm/qr?k=nLIdzy8UC9VkZ0g2EwnoN1rwnxaYvFx0&jump_from=webapi&authKey=mq2RvfcTQxEgImX+XZv0tBeobeHX+wTaAxOXq7pEKdsUD+a2Hi7mIOBGEj2ZtSDJ"
          target="_blank"
          class="social-link"
          title="QQ"
        >
          <svg class="icon" aria-hidden="true" width="1.5rem" height="1.5rem">
            <use xlink:href="#icon-QQ"></use>
          </svg>
          <span class="social-text">QQ</span>
        </a>
      </div>

      <div class="statement-box">
        我将在这里分享我的<span class="highlight-text">编程</span>和<span
          class="highlight-text"
          >人工智能</span
        >知识。如果你对这些主题感兴趣，那么恭喜你找到宝藏了。接下来你可以查看内容或订阅
        <a class="highlight-text" href="/feed">RSS</a>。
      </div>

      <div class="github-contribution">
        <h3 class="section-title">GitHub Contributions</h3>
        <img
          src="https://ghchart.rshah.org/409ba5/dyedd"
          alt="GitHub Contribution Chart"
          class="contribution-chart"
        />
      </div>

      <div class="tech-section">
        <div class="tech-stack">
          <h3 class="section-title">技术栈</h3>
          <div class="tech-badges">
            <img
              src="https://img.shields.io/badge/-Python-3776AB?logo=python&logoColor=white&style=flat-square"
              alt="Python"
            />
            <img
              src="https://img.shields.io/badge/-CUDA-76B900?logo=nvidia&logoColor=white&style=flat-square"
              alt="CUDA"
            />
            <img
              src="https://img.shields.io/badge/-C++-00599C?logo=cplusplus&logoColor=white&style=flat-square"
              alt="C++"
            />
            <img
              src="https://img.shields.io/badge/-JavaScript-yellow?logo=javascript&logoColor=white&style=flat-square"
              alt="JavaScript"
            />
            <img
              src="https://img.shields.io/badge/-HTML5-E34F26?logo=html5&logoColor=white&style=flat-square"
              alt="HTML5"
            />
            <img
              src="https://img.shields.io/badge/-Vue-4FC08D?logo=vue.js&logoColor=white&style=flat-square"
              alt="Vue"
            />
            <img
              src="https://img.shields.io/badge/-PHP-777BB4?logo=php&logoColor=white&style=flat-square"
              alt="PHP"
            />
            <img
              src="https://img.shields.io/badge/-Docker-2496ED?logo=docker&logoColor=white&style=flat-square"
              alt="Docker"
            />
            <img
              src="https://img.shields.io/badge/-Slurm-1F1F1F?logo=linux&logoColor=white&style=flat-square"
              alt="Slurm"
            />
            <img
              src="https://img.shields.io/badge/-Ubuntu-E95420?logo=ubuntu&logoColor=white&style=flat-square"
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
  layout: "home",
});

const {
  data: postsData,
  status,
  error,
} = await useFetch("/api/posts", {
  query: { page: 1, pageSize: 5 },
  key: "home-latest-posts",
  server: true,
  default: () => ({ data: [] }),
});

const latestPosts = computed(() => {
  if (status.value === "pending") {
    return [];
  } else if (error.value) {
    return [];
  } else if (postsData.value && Array.isArray(postsData.value.data)) {
    return postsData.value.data;
  } else {
    return [];
  }
});
</script>

<style lang="scss" scoped>
.home-container {
  display: flex;
  gap: 3rem;
  margin: 0 auto;
  padding: 0;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.sidebar {
  width: 16rem;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  height: fit-content;
}

.avatar-section {
  display: flex;
  justify-content: center;
  margin-bottom: 0.5rem;
}

.avatar-wrapper {
  position: relative;
  width: 11rem;
  height: 11rem;

  .avatar {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);

    &:hover {
      transform: scale(1.05) rotate(2deg);
    }
  }

  .avatar-badge {
    position: absolute;
    width: 3.2rem;
    height: 3.2rem;
    line-height: 3.2rem;
    border-radius: 50%;
    bottom: 0.5rem;
    right: 0.5rem;
    text-align: center;
    font-size: 1.6rem;
    background-color: var(--bg);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    cursor: default;
    transition: transform 0.3s ease;

    &:hover {
      transform: scale(1.1);
    }
  }
}

:global(.dark) .avatar-badge {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  background-color: #1e293b;
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
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text-color);
  margin-bottom: 1.2rem;
  padding-bottom: 0.5rem;
  position: relative;
  display: inline-block;

  &::after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 0;
    width: 2rem;
    height: 3px;
    background: var(--color);
    border-radius: 2px;
  }
}

.main-content {
  flex: 1 1 0;
  min-width: 0;
  max-width: 100%;
}

.intro-section {
  margin-bottom: 3rem;
}

.intro-title {
  font-size: 3.2rem;
  font-weight: 800;
  color: var(--text-color);
  margin-bottom: 1.5rem;
  line-height: 1.2;
  letter-spacing: -0.02em;
}

.name-gradient {
  background: linear-gradient(135deg, #60a5fa 0%, #a78bfa 50%, #f472b6 100%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-size: 200%;
  animation: gradient-flow 5s ease infinite;
}

@keyframes gradient-flow {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

.intro-text {
  font-size: 1.25rem;
  line-height: 1.8;
  color: var(--text-color);
  margin-bottom: 1rem;
  opacity: 0.9;
}

.intro-emoji {
  font-size: 1.25rem;
  line-height: 1.6;
  margin: 0.8rem 0;
}

.highlight-text {
  color: var(--color);
  font-weight: 600;
  padding: 0 0.2rem;
}

.underline-text {
  text-decoration: underline;
  text-decoration-style: wavy;
  text-decoration-color: var(--color-40);
  text-underline-offset: 4px;
}

.link-text {
  color: var(--color);
  font-weight: 600;
  text-decoration: none;
  border-bottom: 1px solid transparent;
  transition: border-color 0.2s;

  &:hover {
    border-bottom-color: var(--color);
  }
}

// 社交链接
.social-links {
  display: flex;
  gap: 1rem;
  margin-bottom: 3rem;
  flex-wrap: wrap;
}

.social-link {
  padding: 0.6rem 1.2rem;
  text-decoration: none;
  border-radius: 2rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  font-size: 1rem;
  font-weight: 500;
  background: rgba(0, 0, 0, 0.03);
  color: var(--text-color);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(0, 0, 0, 0.05);

  &:hover {
    background: var(--bg-hover);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    border-color: transparent;
    color: var(--color);
  }

  .icon {
    flex-shrink: 0;
    transition: transform 0.3s ease;
  }

  &:hover .icon {
    transform: scale(1.1);
  }
}

:global(.dark) .social-link {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.1);

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: var(--color);
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
  margin-bottom: 3rem;
}

.tech-stack {
  width: 100%;
}

.section-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--text-color);
  margin-bottom: 1.2rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.tech-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
}

.tech-badges img {
  height: 28px;
  border-radius: 4px;
  transition: all 0.2s ease;
  opacity: 0.9;

  &:hover {
    transform: translateY(-2px);
    opacity: 1;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
}

// GitHub 贡献热力图
.github-contribution {
  margin-bottom: 3rem;
  .contribution-chart {
    width: 100%;
    display: block;
    object-fit: contain;
    border-radius: 0.5rem;
    opacity: 0.85;
    transition: opacity 0.3s;

    &:hover {
      opacity: 1;
    }
  }
}
:global(.dark) .contribution-chart {
  filter: invert(1) hue-rotate(180deg);
}

// ========== 响应式设计 ==========
@media screen and (max-width: 1200px) {
  .home-container {
    flex-direction: column;
    padding: 2rem 1.5rem;
    max-width: 60rem;
    gap: 2.5rem;
  }

  .sidebar {
    width: 100%;
    position: static;
    max-width: 40rem;
    margin: 0 auto;
    flex-direction: row;
    align-items: flex-start;
    flex-wrap: wrap;
    gap: 3rem;
  }

  .avatar-section {
    margin-bottom: 0;
  }

  .info-card {
    flex: 1;
    min-width: 300px;
  }

  .main-content {
    min-width: 0;
    width: 100%;
  }

  .intro-title {
    font-size: 2.8rem;
  }
}

@media screen and (max-width: 768px) {
  .home-container {
    padding: 1.5rem 1rem;
    gap: 2rem;
  }

  .sidebar {
    flex-direction: column;
    gap: 1.5rem;
    align-items: center;
  }

  .info-card {
    width: 100%;
  }

  .avatar-wrapper {
    width: 8rem;
    height: 8rem;

    .avatar-badge {
      width: 2.5rem;
      height: 2.5rem;
      line-height: 2.5rem;
      font-size: 1.2rem;
    }
  }

  .intro-title {
    font-size: 2.2rem;
  }

  .intro-text,
  .intro-emoji {
    font-size: 1.1rem;
  }

  .tech-badges img {
    height: 24px;
  }

  .social-links {
    gap: 0.8rem;
  }

  .social-link {
    padding: 0.5rem 1rem;
    font-size: 0.95rem;
  }
}

@media screen and (max-width: 480px) {
  .home-container {
    padding: 1rem;
  }

  .intro-title {
    font-size: 2rem;
  }

  .social-link {
    flex: 1 1 auto;
    justify-content: center;
  }

  .statement-box {
    padding: 1.2rem;
    font-size: 0.95rem;
  }
}
</style>
