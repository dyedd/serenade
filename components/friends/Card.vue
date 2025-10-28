<template>
  <a
    :href="site.siteUrl"
    target="_blank"
    rel="noopener noreferrer"
    class="friend-link"
    :title="site.description || '点击访问友链'"
  >
    <article class="friend-card">
      <div class="card-glow"></div>
      <div class="card-content">
        <div class="avatar-section">
          <div class="avatar-wrapper">
            <img
              :src="site.siteLogo"
              :alt="site.siteName"
              class="avatar"
              @error="handleImageError"
              @load="handleImageLoad"
            />
            <div class="avatar-ring"></div>
          </div>
        </div>

        <div class="info-section">
          <h3 class="site-name">{{ site.siteName }}</h3>
          <p class="site-desc">
            {{ site.description || "暂无简介" }}
          </p>
        </div>
      </div>
    </article>
  </a>
</template>

<script setup>
defineProps({
  site: {
    type: Object,
    required: true,
  },
});

const defaultAvatar = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMzIiIGN5PSIyMCIgcj0iMTAiIGZpbGw9IiM5Q0EzQUYiLz4KPHBhdGggZD0iTTE4IDQ0QzE4IDM2IDI1IDMwIDMyIDMwQzM5IDMwIDQ2IDM2IDQ2IDQ0SDE4WiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4=";

const handleImageError = (event) => {
  // 设置默认头像 - 无背景版本，适配圆角边框
  event.target.src = defaultAvatar;
};

const handleImageLoad = (event) => {
  // 图片加载成功，移除error监听
  event.target.onerror = null;
};

const getDomain = (url) => {
  if (!url) return "";
  try {
    const domain = new URL(url).hostname;
    return domain.startsWith("www.") ? domain.slice(4) : domain;
  } catch (e) {
    return url;
  }
};
</script>

<style lang="scss" scoped>
.friend-link {
  @apply no-underline block;
}

.friend-card {
  @apply relative rounded-2xl transition-all duration-500 overflow-hidden;
  background: rgba(var(--color-neutral-50), 1);
  border: 1px solid rgba(var(--color-neutral-200), 0.6);
  backdrop-filter: blur(10px);

  &:hover {
    transform: translateY(-6px);
    box-shadow: 0 16px 40px rgba(var(--color-primary-500), 0.15);
    border-color: rgba(var(--color-primary-300), 0.4);

    .card-glow {
      opacity: 1;
    }

    .avatar {
      transform: scale(1.05);
    }

    .avatar-ring {
      transform: scale(1.15);
      opacity: 1;
    }
  }
}

.card-glow {
  @apply absolute inset-0 opacity-0 transition-opacity duration-500;
  background: linear-gradient(135deg,
    rgba(var(--color-primary-400), 0.08) 0%,
    rgba(var(--color-secondary-400), 0.08) 100%);
  pointer-events: none;
}

.card-content {
  @apply relative p-5;
}

// 头像部分
.avatar-section {
  @apply relative flex justify-center mb-4;
}

.avatar-wrapper {
  @apply relative;
}

.avatar {
  @apply w-16 h-16 rounded-2xl object-cover transition-all duration-500;
  box-shadow: 0 4px 12px rgba(var(--color-neutral-900), 0.1);
  border: 2px solid rgba(255, 255, 255, 0.8);
}

.avatar-ring {
  @apply absolute inset-0 rounded-2xl transition-all duration-500 opacity-0;
  background: linear-gradient(135deg,
    rgba(var(--color-primary-500), 0.3),
    rgba(var(--color-secondary-500), 0.3));
  transform: scale(1);
  pointer-events: none;
  filter: blur(8px);
}

// 信息部分
.info-section {
  @apply text-center;
}

.site-name {
  @apply text-base font-semibold text-neutral-900 mb-2 truncate;
  margin: 0;
  letter-spacing: -0.01em;
  transition: color 0.3s ease;
}

.site-desc {
  @apply text-xs text-neutral-600 leading-relaxed m-0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.5;
}

// 深色模式
:global(.dark) {
  .friend-card {
    background: rgba(var(--color-neutral-900), 0.6);
    border-color: rgba(var(--color-neutral-700), 0.5);

    &:hover {
      background: rgba(var(--color-neutral-900), 0.8);
      border-color: rgba(var(--color-primary-500), 0.3);
      box-shadow: 0 16px 40px rgba(var(--color-primary-500), 0.25);
    }
  }

  .card-glow {
    background: linear-gradient(135deg,
      rgba(var(--color-primary-600), 0.12) 0%,
      rgba(var(--color-secondary-600), 0.12) 100%);
  }

  .avatar {
    border-color: rgba(var(--color-neutral-700), 0.8);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }

  .site-name {
    @apply text-neutral-100;
  }

  .site-desc {
    @apply text-neutral-400;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .card-content {
    @apply p-4;
  }

  .avatar {
    @apply w-14 h-14;
  }

  .site-name {
    @apply text-sm;
  }

  .friend-card:hover {
    transform: translateY(-4px);
  }
}

@media (max-width: 480px) {
  .card-content {
    @apply p-3;
  }

  .avatar {
    @apply w-12 h-12;
  }
}
</style>
