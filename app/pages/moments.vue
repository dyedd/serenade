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
        :disabled="loading"
      >
        <svg
          :class="['inline-block', { 'animate-spin': loading }]"
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
        <span class="ml-2">{{ loading ? "刷新中..." : "刷新" }}</span>
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
    v-if="loading && !articles.length"
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
    v-else-if="error"
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
    v-else-if="!articles.length"
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
    v-if="!loading && failedFeeds.length > 0"
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
  layout: "default",
});

// 页面标题和meta信息
useHead({
  title: "朋友圈",
  meta: [
    {
      name: "description",
      content: "查看友链的最新文章和动态",
    },
  ],
});

// 获取友链列表
const { data: sitesData } = await useFetch("/api/friends");
const sites = computed(() => sitesData.value?.results || []);

const articles = ref([]);
const loading = ref(false);
const loadingMore = ref(false);
const error = ref(false);
const currentPage = ref(0);
const articlesPerPage = 10;
const failedFeeds = ref([]);

const displayedArticles = computed(() => {
  const end = (currentPage.value + 1) * articlesPerPage;
  return articles.value.slice(0, end);
});

const hasMore = computed(() => {
  return displayedArticles.value.length < articles.value.length;
});

const refreshFeed = async () => {
  loading.value = true;
  error.value = false;
  currentPage.value = 0;
  failedFeeds.value = [];

  try {
    const allArticles = [];
    const failed = [];

    // 并行获取所有站点的RSS
    const promises = sites.value.map(async (site) => {
      try {
        const data = await $fetch(
          `/api/friends?url=${encodeURIComponent(site.siteUrl)}`
        );
        const siteResult = data?.results?.[0];

        // 检查是否有错误
        if (siteResult?.error) {
          failed.push({
            siteName: site.siteName,
            siteUrl: site.siteUrl,
            errorMessage: siteResult.errorMessage || '未知错误'
          });
          return [];
        }

        if (siteResult?.articles && siteResult.articles.length > 0) {
          return siteResult.articles.map((article) => ({
            ...article,
            siteName: site.siteName,
            siteLogo: site.siteLogo,
            siteUrl: site.siteUrl,
          }));
        }
      } catch (err) {
        console.warn(`Failed to fetch RSS for ${site.siteName}:`, err);
        failed.push({
          siteName: site.siteName,
          siteUrl: site.siteUrl,
          errorMessage: err.message || '请求失败'
        });
        return [];
      }
      return [];
    });

    const results = await Promise.all(promises);
    results.forEach((siteArticles) => {
      allArticles.push(...siteArticles);
    });

    // 按发布时间排序
    articles.value = allArticles.sort(
      (a, b) => new Date(b.pubDate) - new Date(a.pubDate)
    );

    // 保存失败的RSS
    failedFeeds.value = failed;
  } catch (err) {
    console.error("Failed to refresh feed:", err);
    error.value = true;
  } finally {
    loading.value = false;
  }
};

const loadMore = () => {
  if (!loadingMore.value && hasMore.value) {
    loadingMore.value = true;
    setTimeout(() => {
      currentPage.value++;
      loadingMore.value = false;
    }, 300);
  }
};

const formatDate = (dateString) => {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return "今天";
    } else if (diffDays === 2) {
      return "昨天";
    } else if (diffDays <= 7) {
      return `${diffDays - 1}天前`;
    } else {
      return date.toLocaleDateString("zh-CN", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    }
  } catch {
    return "未知日期";
  }
};

const handleImageError = (event) => {
  event.target.src =
    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiByeD0iMTIiIGZpbGw9IiNGM0Y0RjYiLz4KPGNpcmNsZSBjeD0iMjQiIGN5PSIyMCIgcj0iNiIgZmlsbD0iIzlDQTNBRiIvPgo8cGF0aCBkPSJNMTIgMzZDMTIgMzAgMTggMjQgMjQgMjRDMzAgMjQgMzYgMzAgMzYgMzZIMTJaIiBmaWxsPSIjOUNBM0FGIi8+Cjwvc3ZnPgo=";
};

const formatErrorMessage = (errorMessage) => {
  if (!errorMessage) return "未知错误";

  // 域名解析失败
  if (errorMessage.includes("getaddrinfo ENOTFOUND") || errorMessage.includes("ENOTFOUND")) {
    return "域名无法解析";
  }

  // HTTP 状态码错误
  if (errorMessage.includes("Status code")) {
    const statusMatch = errorMessage.match(/Status code (\d+)/);
    if (statusMatch) {
      const code = statusMatch[1];
      const statusMessages = {
        '404': 'RSS 地址不存在',
        '403': '访问被拒绝',
        '500': '服务器内部错误',
        '502': '网关错误',
        '503': '服务不可用',
        '504': '网关超时'
      };
      return statusMessages[code] || `HTTP 错误 (${code})`;
    }
  }

  // 连接被拒绝
  if (errorMessage.includes("ECONNREFUSED")) {
    return "连接被拒绝";
  }

  // 超时错误
  if (errorMessage.includes("timeout") || errorMessage.includes("ETIMEDOUT")) {
    return "请求超时";
  }

  // 证书错误
  if (errorMessage.includes("certificate") || errorMessage.includes("CERT")) {
    return "SSL 证书错误";
  }

  // 网络不可达
  if (errorMessage.includes("ENETUNREACH")) {
    return "网络不可达";
  }

  // 默认返回原始错误信息
  return errorMessage;
};

// 组件挂载时自动加载
onMounted(() => {
  refreshFeed();
});
</script>
