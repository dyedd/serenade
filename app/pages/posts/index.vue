<template>
  <header>
    <h1
      class="mt-0 text-4xl md:text-4xl text-3xl font-extrabold text-neutral-900 dark:text-neutral"
    >
      文章
      <span v-if="!searchMode && totalItems > 0" class="total-count">{{
        totalItems
      }}</span>
      🎉
    </h1>
  </header>
  <section
    class="mt-0 md:mt-4 prose flex max-w-full flex-col dark:prose-invert lg:flex-row"
  >
    <div class="min-h-0 min-w-0 max-w-prose grow">
      <blockquote class="text-sm md:text-base">
        <p>
          你可以通过 <a href="/feed">RSS</a> 订阅所有文章，还可以
          <span class="search-shortcut search-link" @click="showSearch"
            >⌘ + K</span
          >
          部分文章
        </p>
      </blockquote>
    </div>
  </section>

  <!-- 搜索覆盖层 -->
  <Transition name="search-overlay">
    <div v-if="isSearchVisible" class="search-overlay" @click.self="hideSearch">
      <div class="search-spotlight">
        <svg
          class="search-icon-spotlight"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <circle cx="11" cy="11" r="8"></circle>
          <path d="m21 21-4.35-4.35"></path>
        </svg>
        <input
          ref="searchInput"
          v-model="searchKeyword"
          type="text"
          placeholder="键入开始搜索"
          class="search-input-spotlight"
          @keyup.enter="performSearch"
          @keyup.esc="hideSearch"
        />
        <button
          v-if="searchKeyword"
          class="clear-btn-spotlight"
          @click="clearInput"
          title="清除"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    </div>
  </Transition>

  <section v-if="!loading && searchMode && postsData.length === 0">
    <div class="empty-state">
      <div class="empty-icon">
        <svg
          width="64"
          height="64"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
        >
          <circle cx="11" cy="11" r="8"></circle>
          <path d="m21 21-4.35-4.35"></path>
          <line x1="11" y1="8" x2="11" y2="14"></line>
          <line x1="11" y1="17" x2="11.01" y2="17"></line>
        </svg>
      </div>
      <h3 class="empty-title">未找到相关文章</h3>
      <p class="empty-description">尝试使用不同的关键词或检查拼写</p>
      <button @click="handleClear" class="back-button">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        返回全部文章
      </button>
    </div>
  </section>
  <section
    v-else-if="!loading && groupedpostsData.length > 0"
    class="flex flex-col lg:flex-row gap-8 lg:gap-12"
  >
    <div class="flex-1 min-w-0">
      <div v-if="searchMode" class="search-results-header">
        <div class="results-badge">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          找到 <strong>{{ totalItems }}</strong> 篇相关文章
        </div>
        <button @click="handleClear" class="clear-search-btn">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
          清除搜索
        </button>
      </div>
      <div v-for="group in groupedpostsData" :key="group.year">
        <h2
          class="mt-8 md:mt-12 text-xl md:text-2xl font-bold text-neutral-700 first:mt-6 md:first:mt-8 dark:text-neutral-300"
        >
          {{ group.year }}
        </h2>
        <hr class="w-24 md:w-36 border-dotted border-neutral-400" />
        <div
          class="space-y-4 md:space-y-6"
          v-for="post in group.posts"
          :key="post.id"
        >
          <PostPreview :post="post" />
        </div>
      </div>
    </div>

    <!-- 右侧标签云 - 只在非搜索模式下显示 -->
    <div v-if="!searchMode" class="w-full lg:w-64 xl:w-72 flex-shrink-0">
      <TagCloud />
    </div>
  </section>
  <section v-else class="loading-container">
    <div class="loading-spinner">
      <div class="spinner-ring"></div>
      <div class="spinner-ring"></div>
      <div class="spinner-ring"></div>
      <svg
        class="spinner-icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      >
        <circle cx="11" cy="11" r="8"></circle>
        <path d="m21 21-4.35-4.35"></path>
      </svg>
    </div>
    <p class="loading-text">{{ searchMode ? "正在搜索..." : "正在加载..." }}</p>
  </section>
  <Pagination
    v-if="!loading && totalPages > 1"
    :currentPage="currentPage"
    :totalPages="totalPages"
    @pageChange="goToPage"
  />
</template>

<script setup>
definePageMeta({
  layout: "default",
});
const loading = ref(true);
const postsData = ref([]);
const groupedpostsData = ref({});
const currentPage = ref(1);
const pageSize = ref(5);
const totalPages = ref(0);
const totalItems = ref(0);
const searchMode = ref(false);
const searchKeyword = ref("");
const searchInput = ref(null);
const isSearchVisible = ref(false);

const router = useRouter();
const route = useRoute();

function grouppostsByYear() {
  const groups = {};
  postsData.value.forEach((post) => {
    const year = new Date(post.date).getFullYear();
    if (!groups[year]) {
      groups[year] = [];
    }
    groups[year].push(post);
  });

  // 将 groupedpostsData 转换为数组并按年份降序排序
  const sortedGroups = Object.keys(groups)
    .sort((a, b) => b - a)
    .map((year) => {
      return {
        year: year,
        posts: groups[year],
      };
    });

  groupedpostsData.value = sortedGroups;
}

async function fetchposts(page, size) {
  loading.value = true;
  try {
    const { data } = await useFetch(`/api/posts?page=${page}&pageSize=${size}`);
    if (data.value) {
      postsData.value = data.value.data;
      currentPage.value = data.value.page;
      pageSize.value = data.value.pageSize;
      totalPages.value = data.value.totalPages;
      totalItems.value = data.value.totalItems;
      grouppostsByYear();
    }
  } catch (error) {
    console.error("Failed to fetch posts:", error);
  } finally {
    loading.value = false;
  }
}

async function searchPosts(keyword, page = 1, size = 10) {
  loading.value = true;
  searchMode.value = true;
  searchKeyword.value = keyword;

  try {
    const url = `/api/posts/search?keyword=${encodeURIComponent(
      keyword
    )}&page=${page}&pageSize=${size}`;

    const data = await $fetch(url);

    if (data) {
      postsData.value = data.data;
      currentPage.value = data.page;
      pageSize.value = data.pageSize;
      totalPages.value = data.totalPages;
      totalItems.value = data.totalItems;

      grouppostsByYear();
    }
  } catch (error) {
    console.error("❌ 搜索失败:", error);
    console.error("错误详情:", error.message);
  } finally {
    loading.value = false;
  }
}

function showSearch() {
  isSearchVisible.value = true;
  nextTick(() => {
    searchInput.value?.focus();
  });
}

function hideSearch() {
  isSearchVisible.value = false;
}

function performSearch() {
  if (searchKeyword.value.trim()) {
    router.push({ query: { search: searchKeyword.value.trim(), page: 1 } });
    hideSearch();
  }
}

function clearInput() {
  searchKeyword.value = "";
  nextTick(() => {
    searchInput.value?.focus();
  });
}

function handleClear() {
  searchKeyword.value = "";
  searchMode.value = false;
  router.push({ query: { page: 1 } });
}

// 键盘快捷键支持
onMounted(() => {
  const handleKeydown = (e) => {
    // Ctrl+K 或 Cmd+K 打开搜索
    if ((e.ctrlKey || e.metaKey) && e.key === "k") {
      e.preventDefault();
      showSearch();
    }
    // ESC 关闭搜索
    if (e.key === "Escape" && isSearchVisible.value) {
      hideSearch();
    }
  };

  window.addEventListener("keydown", handleKeydown);

  onUnmounted(() => {
    window.removeEventListener("keydown", handleKeydown);
  });
});

watch(
  () => route.query,
  (newQuery) => {
    const page = parseInt(newQuery.page) || 1;
    const size = parseInt(newQuery.pageSize) || pageSize.value;

    if (newQuery.search) {
      searchKeyword.value = newQuery.search;
      searchPosts(newQuery.search, page, size);
    } else {
      searchMode.value = false;
      searchKeyword.value = "";
      fetchposts(page, size);
    }
  },
  { immediate: true }
);

function goToPage(page) {
  if (page >= 1 && page <= totalPages.value) {
    router.push({ query: { ...route.query, page } })
  }
}
</script>

<style lang="scss" scoped>
// 文章总数样式
.total-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.25rem 0.75rem;
  font-size: 1.25rem;
  font-weight: 600;
  color: rgb(var(--color-primary-600));
  background: rgba(var(--color-primary-500), 0.1);
  border-radius: 8px;
  vertical-align: middle;
}

:global(.dark) .total-count {
  color: rgb(var(--color-primary-400));
  background: rgba(var(--color-primary-500), 0.15);
}

@media screen and (max-width: 768px) {
  .total-count {
    font-size: 1rem;
    padding: 0.2rem 0.6rem;
    margin-left: 0.5rem;
  }
}

// 搜索链接样式
.search-link {
  background: none;
  border: none;
  color: rgb(var(--color-primary-600));
  text-decoration: underline;
  cursor: pointer;
  font-size: inherit;
  font-family: inherit;
  font-style: italic;
  padding: 0;

  &:hover {
    text-decoration: none;
    color: rgb(var(--color-primary-700));
  }
}

// 快捷键样式
.search-shortcut {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.5rem;
  height: 1.5rem;
  padding: 0 0.375rem;
  margin-left: 0.375rem;
  font-size: 0.7rem;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-weight: 600;
  color: rgb(var(--color-neutral-600));
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 1) 0%,
    rgba(243, 244, 246, 1) 100%
  );
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 4px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  line-height: 1;
  vertical-align: middle;

  // 当同时应用 search-link 时，使用链接样式
  &.search-link {
    display: inline;
    min-width: auto;
    height: auto;
    padding: 0;
    margin-left: 0;
    font-size: inherit;
    font-family: inherit;
    font-weight: inherit;
    color: rgb(var(--color-primary-600));
    background: none;
    border: none;
    box-shadow: none;
    border-radius: 0;
    line-height: inherit;
    vertical-align: baseline;

    &:hover {
      color: rgb(var(--color-primary-700));
    }
  }
}

:global(.dark) .search-shortcut {
  color: rgb(var(--color-neutral-300));
  background: linear-gradient(
    180deg,
    rgba(55, 65, 81, 1) 0%,
    rgba(31, 41, 55, 1) 100%
  );
  border-color: rgba(255, 255, 255, 0.12);

  &.search-link {
    color: rgb(var(--color-primary-400));
    background: none;
    border: none;

    &:hover {
      color: rgb(var(--color-primary-300));
    }
  }
}

// 搜索覆盖层动画
.search-overlay-enter-active,
.search-overlay-leave-active {
  transition: all 0.2s ease;
}

.search-overlay-enter-from,
.search-overlay-leave-to {
  opacity: 0;

  .search-spotlight {
    transform: scale(0.95);
    opacity: 0;
  }
}

.search-overlay-enter-active .search-spotlight,
.search-overlay-leave-active .search-spotlight {
  transition: all 0.2s ease;
}

// 全屏毛玻璃覆盖层
.search-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(24px) saturate(150%);
  -webkit-backdrop-filter: blur(24px) saturate(150%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 2rem;
}

// 居中的搜索框
.search-spotlight {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  max-width: 600px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 24px;
  padding: 0.875rem 1.25rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.15),
    0 10px 10px -5px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.search-icon-spotlight {
  color: rgb(var(--color-neutral-400));
  margin-right: 0.875rem;
  flex-shrink: 0;
}

.search-input-spotlight {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: 1.125rem;
  color: rgb(var(--color-neutral-900));
  padding: 0;

  &::placeholder {
    color: rgb(var(--color-neutral-400));
  }
}

.clear-btn-spotlight {
  padding: 0.375rem;
  background: transparent;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  color: rgb(var(--color-neutral-400));
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  flex-shrink: 0;
  margin-left: 0.5rem;

  &:hover {
    background: rgba(0, 0, 0, 0.08);
    color: rgb(var(--color-neutral-600));
  }

  &:active {
    transform: scale(0.9);
  }
}

// 深色模式
:global(.dark) {
  .search-overlay {
    background: rgba(0, 0, 0, 0.3);
  }

  .search-spotlight {
    background: rgba(30, 30, 30, 0.95);
    border-color: rgba(255, 255, 255, 0.1);
  }

  .search-icon-spotlight {
    color: rgb(var(--color-neutral-500));
  }

  .search-input-spotlight {
    color: rgb(var(--color-neutral-100));

    &::placeholder {
      color: rgb(var(--color-neutral-500));
    }
  }

  .clear-btn-spotlight {
    color: rgb(var(--color-neutral-500));

    &:hover {
      background: rgba(255, 255, 255, 0.08);
      color: rgb(var(--color-neutral-300));
    }
  }
}

// 空状态样式
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  margin: 2rem 0;
  text-align: center;
  background: rgba(0, 0, 0, 0.02);
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.06);
}

.empty-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  margin-bottom: 1.5rem;
  color: rgb(var(--color-neutral-400));
  background: white;
  border-radius: 50%;
  border: 1px solid rgba(0, 0, 0, 0.06);
}

.empty-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: rgb(var(--color-neutral-800));
  margin-bottom: 0.5rem;
}

.empty-description {
  font-size: 0.95rem;
  color: rgb(var(--color-neutral-500));
  margin-bottom: 2rem;
  max-width: 400px;
}

.back-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  font-size: 0.9rem;
  font-weight: 500;
  color: white;
  background: #3b82f6;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #2563eb;
  }

  &:active {
    transform: scale(0.98);
  }
}

// 搜索结果头部样式
.search-results-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.875rem 1.25rem;
  margin-bottom: 1.5rem;
  background: rgba(59, 130, 246, 0.06);
  border-radius: 8px;
  border: 1px solid rgba(59, 130, 246, 0.15);
}

.results-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: rgb(var(--color-neutral-700));
  font-weight: 500;

  svg {
    color: #3b82f6;
  }

  strong {
    color: #3b82f6;
    font-weight: 600;
  }
}

.clear-search-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.875rem;
  font-size: 0.85rem;
  font-weight: 500;
  color: rgb(var(--color-neutral-600));
  background: white;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    color: #3b82f6;
    border-color: #3b82f6;
  }

  &:active {
    transform: scale(0.98);
  }
}

:global(.dark) {
  .empty-state {
    background: rgba(255, 255, 255, 0.03);
    border-color: rgba(255, 255, 255, 0.08);
  }

  .empty-icon {
    color: rgb(var(--color-neutral-500));
    background: rgb(var(--color-neutral-700));
    border-color: rgba(255, 255, 255, 0.08);
  }

  .empty-title {
    color: rgb(var(--color-neutral-200));
  }

  .empty-description {
    color: rgb(var(--color-neutral-400));
  }

  .back-button {
    background: #60a5fa;

    &:hover {
      background: #3b82f6;
    }
  }

  .search-results-header {
    background: rgba(96, 165, 250, 0.1);
    border-color: rgba(96, 165, 250, 0.2);
  }

  .results-badge {
    color: rgb(var(--color-neutral-300));

    svg {
      color: #60a5fa;
    }

    strong {
      color: #60a5fa;
    }
  }

  .clear-search-btn {
    color: rgb(var(--color-neutral-400));
    background: rgb(var(--color-neutral-700));
    border-color: rgba(255, 255, 255, 0.1);

    &:hover {
      color: #60a5fa;
      border-color: #60a5fa;
    }
  }
}

// 加载动画样式
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 5rem 2rem;
  margin: 2rem 0;
}

.loading-spinner {
  position: relative;
  width: 48px;
  height: 48px;
  margin-bottom: 1.25rem;
}

.spinner-ring {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: 3px solid rgba(59, 130, 246, 0.2);
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  &:nth-child(2),
  &:nth-child(3) {
    display: none;
  }
}

.spinner-icon {
  display: none;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.loading-text {
  font-size: 0.95rem;
  font-weight: 500;
  color: rgb(var(--color-neutral-600));
}

:global(.dark) {
  .loading-text {
    color: rgb(var(--color-neutral-400));
  }

  .spinner-ring {
    border-color: rgba(96, 165, 250, 0.2);
    border-top-color: #60a5fa;
  }
}

// 响应式设计
@media screen and (max-width: 768px) {
  .search-shortcut {
    display: none;
  }

  .search-overlay {
    padding: 1.5rem;
  }

  .search-spotlight {
    padding: 0.75rem 1rem;
    border-radius: 20px;
  }

  .search-input-spotlight {
    font-size: 1rem;
  }

  .search-icon-spotlight {
    width: 18px;
    height: 18px;
    margin-right: 0.75rem;
  }

  .clear-btn-spotlight {
    width: 26px;
    height: 26px;
  }

  .search-results-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
    padding: 1rem;
  }

  .results-badge {
    justify-content: center;
  }

  .clear-search-btn {
    justify-content: center;
  }

  .empty-state {
    padding: 3rem 1.5rem;
  }

  .empty-icon {
    width: 80px;
    height: 80px;
    margin-bottom: 1.25rem;

    svg {
      width: 48px;
      height: 48px;
    }
  }

  .empty-title {
    font-size: 1.25rem;
  }

  .empty-description {
    font-size: 0.9rem;
    margin-bottom: 1.5rem;
  }

  .back-button {
    padding: 0.625rem 1.25rem;
    font-size: 0.875rem;
  }

  .loading-container {
    padding: 4rem 1.5rem;
  }
}

@media screen and (max-width: 480px) {
  .search-overlay {
    padding: 1rem;
  }

  .search-spotlight {
    padding: 0.625rem 0.875rem;
    border-radius: 18px;
  }

  .search-input-spotlight {
    font-size: 0.95rem;
  }

  .search-icon-spotlight {
    width: 16px;
    height: 16px;
    margin-right: 0.625rem;
  }

  .clear-btn-spotlight {
    width: 24px;
    height: 24px;
  }

  .search-results-header {
    padding: 0.875rem;
  }

  .results-badge {
    font-size: 0.875rem;

    strong {
      font-size: 1rem;
    }
  }

  .clear-search-btn {
    padding: 0.5rem 0.875rem;
    font-size: 0.8rem;
  }

  .loading-spinner {
    width: 40px;
    height: 40px;
  }

  .spinner-ring {
    border-width: 2.5px;
  }
}
</style>
