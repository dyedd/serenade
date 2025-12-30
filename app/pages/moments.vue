<template>
  <header>
    <div class="flex items-center justify-between">
      <h1
        class="mt-0 text-4xl md:text-4xl text-3xl font-extrabold text-neutral-900 dark:text-neutral"
      >
        朋友圈 🎉
      </h1>
      <button
        class="refresh-button px-4 py-2 text-sm font-medium rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
        @click="refreshFeed"
        :disabled="isLoading"
      >
        <svg
          :class="['inline-block', { 'animate-spin': isLoading }]"
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
        <span class="ml-2">{{ isLoading ? "刷新中..." : "刷新" }}</span>
      </button>
    </div>
  </header>

  <section
    class="mt-0 md:mt-4 prose flex max-w-full flex-col dark:prose-invert lg:flex-row"
  >
    <div class="min-h-0 min-w-0 max-w-prose grow">
      <blockquote class="text-sm md:text-base">
        <p>朋友们的最新创作，实时更新</p>
      </blockquote>
    </div>
  </section>

  <!-- 加载状态 -->
  <section
    v-if="isLoading && articles.length === 0"
    class="flex justify-center items-center p-8"
  >
    <div>
      <span
        class="w-2 h-2 ml-2 rounded-full bg-gray-200 inline-block animate-pulse"
      ></span>
      <span
        class="w-2 h-2 ml-2 rounded-full bg-gray-200 inline-block animate-pulse"
        style="animation-delay: 0.2s"
      ></span>
      <span
        class="w-2 h-2 ml-2 rounded-full bg-gray-200 inline-block animate-pulse"
        style="animation-delay: 0.4s"
      ></span>
    </div>
  </section>

  <!-- 错误状态 -->
  <section
    v-else-if="hasError"
    class="text-center p-8 text-neutral-600 dark:text-neutral-400"
  >
    <p>
      加载失败，请<button
        @click="refreshFeed"
        class="text-blue-500 hover:underline ml-1"
      >
        重试
      </button>
    </p>
  </section>

  <!-- 空状态 -->
  <section
    v-else-if="articles.length === 0"
    class="text-center p-8 text-neutral-600 dark:text-neutral-400"
  >
    <p>暂无动态</p>
  </section>

  <!-- 动态列表 -->
  <section v-else class="mt-8 space-y-6">
    <article
      v-for="article in displayedArticles"
      :key="article.link"
      class="p-6 rounded-lg bg-neutral-50 dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
    >
      <!-- 作者信息 -->
      <div class="flex items-center gap-3 mb-4">
        <img
          :src="article.siteLogo"
          :alt="article.siteName"
          class="w-10 h-10 rounded-full object-cover"
          loading="lazy"
          @error="handleImageError"
        />
        <div class="flex-1">
          <div class="font-semibold text-neutral-900 dark:text-neutral-100">
            {{ article.siteName }}
          </div>
          <time class="text-sm text-neutral-500 dark:text-neutral-400">{{
            formatDate(article.pubDate)
          }}</time>
        </div>
      </div>

      <!-- 文章内容 -->
      <div>
        <h2 class="text-xl font-bold mb-2">
          <a
            :href="article.link"
            target="_blank"
            rel="noopener noreferrer"
            class="text-neutral-900 dark:text-neutral-100 hover:text-blue-500 dark:hover:text-blue-400 no-underline"
          >
            {{ article.title }}
          </a>
        </h2>
        <p
          v-if="article.description"
          class="text-neutral-600 dark:text-neutral-400 text-sm line-clamp-3"
        >
          {{ article.description }}
        </p>
      </div>
    </article>

    <!-- 加载更多 -->
    <div v-if="hasMore" class="text-center pt-4">
      <button
        class="px-6 py-2 text-sm font-medium rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors disabled:opacity-50"
        @click="loadMore"
        :disabled="loadingMore"
      >
        {{ loadingMore ? "加载中..." : "查看更多" }}
      </button>
    </div>
  </section>

  <!-- RSS错误信息 -->
  <section
    v-if="!isLoading && failedFeeds.length > 0"
    class="mt-12 p-6 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
  >
    <h3
      class="text-lg font-bold mb-4 text-red-900 dark:text-red-100 flex items-center gap-2"
    >
      <svg
        class="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      </svg>
      RSS 获取失败 ({{ failedFeeds.length }})
    </h3>
    <div class="space-y-3">
      <div
        v-for="feed in failedFeeds"
        :key="feed.siteUrl"
        class="p-4 rounded bg-white dark:bg-neutral-800 border border-red-100 dark:border-red-900"
      >
        <div class="flex items-start justify-between gap-4">
          <div class="flex-1">
            <div class="font-semibold text-neutral-900 dark:text-neutral-100">
              {{ feed.siteName }}
            </div>
            <a
              :href="feed.siteUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              {{ feed.siteUrl }}
            </a>
          </div>
          <div class="text-sm text-red-600 dark:text-red-400">
            {{ formatErrorMessage(feed.errorMessage) }}
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
definePageMeta({
  layout: 'default'
})

useHead({
  title: '朋友圈',
  meta: [
    {
      name: 'description',
      content: '查看友链的最新文章和动态'
    }
  ]
})

const { data: sitesData, status: sitesStatus, error: sitesError } = await useFetch('/api/friends', {
  default: () => ({ results: [] })
})

const sites = computed(() => {
  const results = sitesData.value?.results

  if (Array.isArray(results)) {
    return results
  } else {
    return []
  }
})

const {
  status: feedStatus,
  error: feedError,
  articles,
  displayedArticles,
  failedFeeds,
  hasMore,
  loadingMore,
  refreshFeed,
  loadMore
} = useFriendsFeed(sites, { pageSize: 10 })

const isLoading = computed(() => {
  return sitesStatus.value === 'pending' || feedStatus.value === 'pending'
})

const hasError = computed(() => {
  return Boolean(sitesError.value || feedError.value)
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
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    }
  }
}

const handleImageError = (event) => {
  const target = event.target

  if (target instanceof HTMLImageElement) {
    target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiByeD0iMTIiIGZpbGw9IiNGM0Y0RjYiLz4KPGNpcmNsZSBjeD0iMjQiIGN5PSIyMCIgcj0iNiIgZmlsbD0iIzlDQTNBRiIvPgo8cGF0aCBkPSJNMTIgMzZDMTIgMzAgMTggMjQgMjQgMjRDMzAgMjQgMzYgMzAgMzYgMzZIMTJaIiBmaWxsPSIjOUNBM0FGIi8+Cjwvc3ZnPgo='
  } else {
    return
  }
}

const parseStatusMessage = (message) => {
  const match = message.match(/Status code (\d+)/)

  if (match) {
    const code = match[1]
    const statusMessages = {
      '404': 'RSS 地址不存在',
      '403': '访问被拒绝',
      '500': '服务器内部错误',
      '502': '网关错误',
      '503': '服务不可用',
      '504': '网关超时'
    }

    if (statusMessages[code]) {
      return statusMessages[code]
    } else {
      return `HTTP 错误 (${code})`
    }
  } else {
    return ''
  }
}

const formatErrorMessage = (errorMessage) => {
  const normalized = typeof errorMessage === 'string' ? errorMessage.trim() : ''
  const message = normalized.length > 0 ? normalized : '未知错误'
  const statusMessage = parseStatusMessage(message)

  if (statusMessage) {
    return statusMessage
  } else if (message.includes('getaddrinfo ENOTFOUND') || message.includes('ENOTFOUND')) {
    return '域名无法解析'
  } else if (message.includes('ECONNREFUSED')) {
    return '连接被拒绝'
  } else if (message.includes('timeout') || message.includes('ETIMEDOUT')) {
    return '请求超时'
  } else if (message.includes('certificate') || message.includes('CERT')) {
    return 'SSL 证书错误'
  } else if (message.includes('ENETUNREACH')) {
    return '网络不可达'
  } else {
    return message
  }
}
</script>

