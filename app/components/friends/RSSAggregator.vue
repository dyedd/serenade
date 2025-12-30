<template>
  <div class="rss-aggregator">
    <div class="rss-header">
      <h3 class="rss-title">友链动态</h3>
      <p class="rss-desc">看看朋友们最近在写什么</p>
      <button class="refresh-btn" @click="refreshFeed" :disabled="isLoading">
        <svg
          v-if="!isLoading"
          class="icon"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="M23 4v6h-6M1 20v-6h6" />
          <path
            d="m3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"
          />
        </svg>
        <div v-else class="spinner-small"></div>
        <span>{{ isLoading ? "刷新中..." : "刷新" }}</span>
      </button>
    </div>

    <div class="rss-content">
      <div v-if="isLoading && articles.length === 0" class="loading-state">
        <div class="loading-spinner">
          <div class="spinner"></div>
        </div>
        <p class="loading-text">正在获取友链动态...</p>
      </div>

      <div v-else-if="hasError" class="error-state">
        <div class="error-icon">
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
          </svg>
        </div>
        <p class="error-text">获取动态失败</p>
        <button class="retry-btn" @click="refreshFeed">重试</button>
      </div>

      <div v-else-if="articles.length === 0" class="empty-state">
        <div class="empty-icon">
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"
            />
          </svg>
        </div>
        <p class="empty-text">暂无友链动态</p>
      </div>

      <div v-else class="articles-list">
        <div
          v-for="article in displayedArticles"
          :key="article.link"
          class="article-item"
        >
          <div class="article-source">
            <img
              :src="article.siteLogo"
              :alt="article.siteName"
              class="source-avatar"
              loading="lazy"
              @error="handleImageError"
            />
            <div class="source-info">
              <span class="source-name">{{ article.siteName }}</span>
              <span class="article-date">{{
                formatDate(article.pubDate)
              }}</span>
            </div>
          </div>
          <div class="article-content">
            <h4 class="article-title">
              <a :href="article.link" target="_blank" rel="noopener noreferrer">
                {{ article.title }}
              </a>
            </h4>
            <p v-if="article.description" class="article-desc">
              {{ article.description }}
            </p>
          </div>
        </div>

        <div v-if="hasMore" class="load-more">
          <button
            class="load-more-btn"
            @click="loadMore"
            :disabled="loadingMore"
          >
            <span v-if="!loadingMore">加载更多</span>
            <span v-else>加载中...</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  sites: {
    type: Array,
    required: true
  }
})

const sites = computed(() => {
  return props.sites
})

const {
  status,
  error,
  articles,
  displayedArticles,
  hasMore,
  loadingMore,
  refreshFeed,
  loadMore
} = useFriendsFeed(sites, { pageSize: 10 })

const isLoading = computed(() => {
  return status.value === 'pending'
})

const hasError = computed(() => {
  return Boolean(error.value)
})

const formatDate = (dateString) => {
  const date = new Date(dateString)

  if (Number.isNaN(date.getTime())) {
    return '未知日期'
  } else {
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 1) {
      return '今天'
    } else if (diffDays === 2) {
      return '昨天'
    } else if (diffDays <= 7) {
      return `${diffDays - 1}天前`
    } else {
      return date.toLocaleDateString('zh-CN', {
        month: 'short',
        day: 'numeric'
      })
    }
  }
}

const handleImageError = (event) => {
  const target = event.target

  if (target instanceof HTMLImageElement) {
    target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiByeD0iOCIgZmlsbD0iI0YzRjRGNiIvPgo8c3ZnIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiIgdmlld0JveD0iMCAwIDE2IDE2IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHg9IjgiIHk9IjgiPgo8Y2lyY2xlIGN4PSI4IiBjeT0iNiIgcj0iMiIgZmlsbD0iIzlDQTNBRiIvPgo8cGF0aCBkPSJNNCAxMkM0IDkgNiA3IDggN0MxMCA3IDEyIDkgMTIgMTJINEgiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+Cjwvc3ZnPgo='
  } else {
    return
  }
}
</script>

<style lang="scss" scoped>
.rss-aggregator {
  @apply rounded-2xl p-6 md:p-8;
  background: linear-gradient(
    135deg,
    rgba(var(--color-primary-50), 0.5) 0%,
    rgba(var(--color-secondary-50), 0.3) 100%
  );
  border: 1px solid rgba(var(--color-primary-200), 0.5);
  backdrop-filter: blur(10px);
}

.rss-header {
  @apply flex flex-col md:flex-row md:items-center justify-between mb-8 pb-6;
  border-bottom: 2px solid rgba(var(--color-primary-200), 0.3);
}

.rss-title {
  @apply text-2xl font-bold text-neutral-900 m-0 mb-1;
  letter-spacing: -0.02em;
}

.rss-desc {
  @apply text-sm text-neutral-600 m-0 mb-4 md:mb-0;
}

.refresh-btn {
  @apply flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl transition-all duration-300;
  background: linear-gradient(
    135deg,
    rgb(var(--color-primary-500)),
    rgb(var(--color-primary-600))
  );
  color: white;
  border: none;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(var(--color-primary-500), 0.3);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    @apply opacity-60 cursor-not-allowed;
  }
}

.icon {
  @apply flex-shrink-0;
}

.spinner-small {
  @apply w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin;
}

.rss-content {
  @apply min-h-[200px];
}

.loading-state,
.error-state,
.empty-state {
  @apply flex flex-col items-center justify-center py-16 text-center;
}

.loading-spinner {
  @apply mb-4;
}

.spinner {
  @apply w-10 h-10 border-4 rounded-full animate-spin;
  border-color: rgba(var(--color-primary-200), 1);
  border-top-color: rgb(var(--color-primary-500));
}

.loading-text {
  @apply text-neutral-600 m-0 text-sm;
}

.error-icon,
.empty-icon {
  @apply mb-4 text-neutral-400;
}

.error-text,
.empty-text {
  @apply text-neutral-600 m-0 mb-4;
}

.retry-btn {
  @apply px-5 py-2.5 rounded-xl font-medium transition-all duration-300;
  background: linear-gradient(
    135deg,
    rgb(var(--color-primary-500)),
    rgb(var(--color-primary-600))
  );
  color: white;
  border: none;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(var(--color-primary-500), 0.3);
  }
}

.articles-list {
  @apply space-y-3;
}

.article-item {
  @apply p-5 rounded-xl transition-all duration-300;
  background: white;
  border: 1px solid rgba(var(--color-neutral-200), 0.6);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(var(--color-primary-500), 0.1);
    border-color: rgba(var(--color-primary-300), 0.5);
  }
}

.article-source {
  @apply flex items-center gap-3 mb-3;
}

.source-avatar {
  @apply w-10 h-10 rounded-xl object-cover flex-shrink-0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.source-info {
  @apply flex-1 min-w-0 flex items-center gap-2;
}

.source-name {
  @apply text-sm font-semibold text-neutral-900;
}

.article-date {
  @apply text-xs px-2 py-0.5 rounded-full;
  background: rgba(var(--color-primary-100), 0.6);
  color: rgb(var(--color-primary-700));
}

.article-content {
  @apply space-y-2;
}

.article-title {
  @apply m-0;
}

.article-title a {
  @apply text-base font-semibold text-neutral-900 no-underline transition-colors duration-200;

  &:hover {
    color: rgb(var(--color-primary-600));
  }
}

.article-desc {
  @apply text-sm text-neutral-600 leading-relaxed m-0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.load-more {
  @apply text-center mt-6 pt-6;
  border-top: 2px solid rgba(var(--color-primary-200), 0.3);
}

.load-more-btn {
  @apply px-6 py-2.5 text-sm font-medium rounded-xl transition-all duration-300;
  background: linear-gradient(
    135deg,
    rgba(var(--color-primary-500), 0.1),
    rgba(var(--color-secondary-500), 0.1)
  );
  color: rgb(var(--color-primary-700));
  border: 1px solid rgba(var(--color-primary-300), 0.5);

  &:hover:not(:disabled) {
    background: linear-gradient(
      135deg,
      rgb(var(--color-primary-500)),
      rgb(var(--color-primary-600))
    );
    color: white;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(var(--color-primary-500), 0.3);
  }

  &:disabled {
    @apply opacity-50 cursor-not-allowed;
  }
}

// 深色模式
:global(.dark) {
  .rss-aggregator {
    background: linear-gradient(
      135deg,
      rgba(var(--color-primary-900), 0.3) 0%,
      rgba(var(--color-secondary-900), 0.2) 100%
    );
    border-color: rgba(var(--color-primary-700), 0.3);
  }

  .rss-header {
    border-bottom-color: rgba(var(--color-primary-700), 0.2);
  }

  .rss-title {
    @apply text-neutral-100;
  }

  .rss-desc {
    @apply text-neutral-400;
  }

  .refresh-btn {
    background: linear-gradient(
      135deg,
      rgb(var(--color-primary-600)),
      rgb(var(--color-primary-700))
    );

    &:hover:not(:disabled) {
      box-shadow: 0 4px 12px rgba(var(--color-primary-600), 0.4);
    }
  }

  .spinner {
    border-color: rgba(var(--color-primary-400), 0.3);
    border-top-color: rgb(var(--color-primary-400));
  }

  .loading-text {
    @apply text-neutral-400;
  }

  .error-text,
  .empty-text {
    @apply text-neutral-400;
  }

  .retry-btn {
    background: linear-gradient(
      135deg,
      rgb(var(--color-primary-600)),
      rgb(var(--color-primary-700))
    );
  }

  .article-item {
    background: rgba(var(--color-neutral-900), 0.5);
    border-color: rgba(var(--color-neutral-700), 0.5);

    &:hover {
      background: rgba(var(--color-neutral-900), 0.7);
      border-color: rgba(var(--color-primary-500), 0.4);
      box-shadow: 0 8px 20px rgba(var(--color-primary-600), 0.15);
    }
  }

  .source-name {
    @apply text-neutral-100;
  }

  .article-date {
    background: rgba(var(--color-primary-900), 0.5);
    color: rgb(var(--color-primary-300));
  }

  .article-title a {
    @apply text-neutral-100;

    &:hover {
      color: rgb(var(--color-primary-400));
    }
  }

  .article-desc {
    @apply text-neutral-400;
  }

  .load-more {
    border-top-color: rgba(var(--color-primary-700), 0.2);
  }

  .load-more-btn {
    background: linear-gradient(
      135deg,
      rgba(var(--color-primary-600), 0.15),
      rgba(var(--color-secondary-600), 0.15)
    );
    color: rgb(var(--color-primary-300));
    border-color: rgba(var(--color-primary-500), 0.4);

    &:hover:not(:disabled) {
      background: linear-gradient(
        135deg,
        rgb(var(--color-primary-600)),
        rgb(var(--color-primary-700))
      );
      color: white;
    }
  }
}
</style>
