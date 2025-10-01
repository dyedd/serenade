<template>
  <header>
    <h1
      class="mt-0 text-4xl md:text-4xl text-3xl font-extrabold text-neutral-900 dark:text-neutral"
    >
      文章 🎉
    </h1>
  </header>
  <section
    class="mt-0 md:mt-4 prose flex max-w-full flex-col dark:prose-invert lg:flex-row"
  >
    <div class="min-h-0 min-w-0 max-w-prose grow">
      <blockquote class="text-sm md:text-base">
        <p>
          你可以通过 <a href="/feed">RSS</a> 订阅所有文章，还可以
          <button @click="showSearch" class="search-link">搜索</button> 部分文章
        </p>
      </blockquote>
    </div>
  </section>

  <!-- 搜索弹窗 -->
  <Transition name="search-modal">
    <div v-if="isSearchVisible" class="search-overlay" @click.self="hideSearch">
      <div class="search-modal" @click.stop>
        <div class="search-modal-header">
          <h3 class="search-modal-title">搜索文章</h3>
          <button class="close-btn-modal" @click="hideSearch" title="关闭">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div class="search-modal-content">
          <div class="search-input-wrapper">
            <svg class="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
            <input
              ref="searchInput"
              v-model="searchKeyword"
              type="text"
              placeholder="输入关键词搜索文章..."
              class="search-input-modal"
              @keyup.enter="performSearch"
              @keyup.esc="hideSearch"
            />
            <button
              v-if="searchKeyword"
              class="clear-input-btn"
              @click="clearInput"
              title="清除输入"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>
        <div class="search-modal-footer">
          <p class="search-hint">💡 按下回车键搜索，可以搜索文章标题、摘要、内容和标签</p>
        </div>
      </div>
    </div>
  </Transition>

  <section v-if="!loading && searchMode && postsData.length === 0">
    <div class="text-center py-8 text-neutral-500 dark:text-neutral-400">
      <p class="text-lg">未找到相关文章 😔</p>
      <p class="text-sm mt-2">请尝试其他关键词</p>
    </div>
  </section>
  <section v-else-if="!loading && groupedpostsData.length > 0">
    <div v-if="searchMode" class="mb-4">
      <p class="text-sm text-neutral-600 dark:text-neutral-400">
        找到
        <span class="font-semibold text-primary-500">{{ totalItems }}</span>
        篇相关文章
      </p>
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
  </section>
  <section v-else class="flex justify-center items-center p-4">
    <div>
      <span class="w-2 h-2 ml-2 rounded-full bg-gray-200 inline-block"></span>
      <span class="w-2 h-2 ml-2 rounded-full bg-gray-200 inline-block"></span>
      <span class="w-2 h-2 ml-2 rounded-full bg-gray-200 inline-block"></span>
    </div>
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
const isSearchVisible = ref(false);
const searchInput = ref(null);

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
    const { data } = await useFetch(
      `/api/posts/search?keyword=${encodeURIComponent(
        keyword
      )}&page=${page}&pageSize=${size}`
    );
    if (data.value) {
      postsData.value = data.value.data;
      currentPage.value = data.value.page;
      pageSize.value = data.value.pageSize;
      totalPages.value = data.value.totalPages;
      totalItems.value = data.value.totalItems;
      grouppostsByYear();
    }
  } catch (error) {
    console.error("Failed to search posts:", error);
  } finally {
    loading.value = false;
  }
}

function handleSearch(keyword) {
  router.push({ query: { search: keyword, page: 1 } });
}

function handleClear() {
  searchMode.value = false;
  searchKeyword.value = "";
  router.push({ query: { page: 1 } });
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
    handleSearch(searchKeyword.value.trim());
    hideSearch();
  }
}

function clearInput() {
  searchKeyword.value = '';
  nextTick(() => {
    searchInput.value?.focus();
  });
}

watch(
  () => route.query,
  (newQuery) => {
    const page = parseInt(newQuery.page) || 1;
    const size = parseInt(newQuery.pageSize) || pageSize.value;

    if (newQuery.search) {
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
    router.push({ query: { ...route.query, page } });
  } else {
    alert("Invalid page number");
  }
}
</script>

<style lang="scss" scoped>
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

// 弹窗动画
.search-modal-enter-active,
.search-modal-leave-active {
  transition: all 0.3s ease;
}

.search-modal-enter-from,
.search-modal-leave-to {
  opacity: 0;

  .search-modal {
    transform: scale(0.9) translateY(-20px);
  }
}

.search-modal-enter-active .search-modal,
.search-modal-leave-active .search-modal {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.search-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.search-modal {
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  max-width: 520px;
  width: 100%;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.search-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem 1.5rem 1rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}

.search-modal-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: rgb(var(--color-neutral-900));
}

.close-btn-modal {
  padding: 0.5rem;
  background: transparent;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  color: rgb(var(--color-neutral-500));
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover {
    background-color: rgb(var(--color-neutral-100));
    color: rgb(var(--color-neutral-700));
  }
}

.search-modal-content {
  padding: 1.5rem;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
}

.search-icon {
  position: absolute;
  left: 1rem;
  color: rgb(var(--color-neutral-400));
  pointer-events: none;
  z-index: 1;
}

.search-input-modal {
  flex: 1;
  padding: 0.875rem 1rem 0.875rem 3rem;
  border: 2px solid rgb(var(--color-neutral-200));
  border-radius: 12px;
  font-size: 1rem;
  outline: none;
  background: rgb(var(--color-neutral-50));
  color: rgb(var(--color-neutral-900));
  transition: all 0.2s ease;

  &:focus {
    border-color: rgb(var(--color-primary-500));
    background: white;
    box-shadow: 0 0 0 3px rgba(var(--color-primary-500), 0.1);
  }

  &::placeholder {
    color: rgb(var(--color-neutral-400));
  }
}

.clear-input-btn {
  position: absolute;
  right: 0.75rem;
  padding: 0.25rem;
  background: transparent;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  color: rgb(var(--color-neutral-400));
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover {
    background-color: rgb(var(--color-neutral-200));
    color: rgb(var(--color-neutral-600));
  }
}


.search-modal-footer {
  padding: 0 1.5rem 1.5rem;
}

.search-hint {
  margin: 0;
  font-size: 0.875rem;
  color: rgb(var(--color-neutral-500));
  text-align: center;
}

// 深色模式
:global(.dark) {
  .search-modal {
    background: rgb(var(--color-neutral-800));
    border-color: rgba(255, 255, 255, 0.1);
  }

  .search-modal-header {
    border-bottom-color: rgba(255, 255, 255, 0.1);
  }

  .search-modal-title {
    color: rgb(var(--color-neutral-100));
  }

  .close-btn-modal {
    color: rgb(var(--color-neutral-400));

    &:hover {
      background-color: rgb(var(--color-neutral-700));
      color: rgb(var(--color-neutral-200));
    }
  }

  .search-input-modal {
    background: rgb(var(--color-neutral-700));
    color: rgb(var(--color-neutral-100));
    border-color: rgb(var(--color-neutral-600));

    &:focus {
      border-color: rgb(var(--color-primary-400));
      background: rgb(var(--color-neutral-600));
      box-shadow: 0 0 0 3px rgba(var(--color-primary-400), 0.1);
    }

    &::placeholder {
      color: rgb(var(--color-neutral-500));
    }
  }

  .clear-input-btn {
    color: rgb(var(--color-neutral-500));

    &:hover {
      background-color: rgb(var(--color-neutral-600));
      color: rgb(var(--color-neutral-300));
    }
  }

  
  .search-hint {
    color: rgb(var(--color-neutral-400));
  }
}

// 响应式设计
@media screen and (max-width: 640px) {
  .search-modal {
    margin: 1rem;
    max-width: none;
  }

  .search-modal-header {
    padding: 1.25rem 1.25rem 0.75rem;
  }

  .search-modal-content {
    padding: 1.25rem;
  }

  .search-modal-footer {
    padding: 0 1.25rem 1.25rem;
  }

  .search-modal-title {
    font-size: 1.125rem;
  }

  .search-input-modal {
    padding: 0.75rem 1rem 0.75rem 2.75rem;
    font-size: 0.95rem;
  }

  .search-icon {
    left: 0.875rem;
    width: 18px;
    height: 18px;
  }
}
</style>
