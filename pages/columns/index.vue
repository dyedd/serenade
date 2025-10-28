<template>
  <header>
    <h1 class="mt-0 text-4xl md:text-4xl text-3xl font-extrabold text-neutral-900 dark:text-neutral">
      专栏 📚
    </h1>
  </header>

  <section class="mt-0 md:mt-4 prose flex max-w-full flex-col dark:prose-invert lg:flex-row">
    <div class="min-h-0 min-w-0 max-w-prose grow">
      <blockquote>
        <p>系统化的学习笔记，沉淀我的技术积累</p>
      </blockquote>
    </div>
  </section>

  <!-- 统计信息 -->
  <section class="stats-section">
    <div class="stat-card">
      <div class="stat-label">专栏数量</div>
      <div class="stat-value">{{ totalItems }}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">知识文档</div>
      <div class="stat-value">{{ totalDocs }}</div>
    </div>
  </section>

  <!-- 加载状态 -->
  <section v-if="loading" class="flex justify-center items-center p-4">
    <div>
      <span class="w-2 h-2 ml-2 rounded-full bg-gray-200 inline-block"></span>
      <span class="w-2 h-2 ml-2 rounded-full bg-gray-200 inline-block"></span>
      <span class="w-2 h-2 ml-2 rounded-full bg-gray-200 inline-block"></span>
    </div>
  </section>

  <!-- 专栏列表 -->
  <section v-else-if="columns?.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
    <ColumnsFolderCard
      v-for="item in columns"
      :key="item.path"
      :id="item.path"
      :title="item.title"
      :type="item.type"
      :image="item.image"
      :description="item.description"
    />
  </section>

  <!-- 空状态 -->
  <section v-else class="flex justify-center items-center p-8 text-neutral-600 dark:text-neutral-400">
    <p>暂无专栏内容</p>
  </section>

  <!-- 分页 -->
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
const columns = ref([]);
const currentPage = ref(1);
const pageSize = ref(10);
const totalPages = ref(0);
const totalItems = ref(0);
const totalDocs = ref(0);

const router = useRouter();
const route = useRoute();

async function fetchColumns(page = 1, size = pageSize.value) {
  loading.value = true;
  try {
    const { data } = await useFetch(`/api/columns?page=${page}&pageSize=${size}`);
    if (data.value) {
      columns.value = data.value.data;
      currentPage.value = data.value.page;
      pageSize.value = data.value.pageSize;
      totalPages.value = data.value.totalPages;
      totalItems.value = data.value.totalItems;
      totalDocs.value = data.value.totalDocs;
    }
  } catch (error) {
    console.error('Failed to fetch columns:', error);
  } finally {
    loading.value = false;
  }
}

function goToPage(page) {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
    router.push({ query: { ...route.query, page } });
  }
}

// 监听路由变化
watch(
  () => route.query,
  (newQuery) => {
    const page = parseInt(newQuery.page) || 1;
    const size = parseInt(newQuery.pageSize) || pageSize.value;
    fetchColumns(page, size);
  },
  { immediate: true }
);
</script>

<style lang="scss" scoped>
.stats-section {
  display: flex;
  gap: 1rem;
  margin: 1.5rem 0;
}

.stat-card {
  flex: 1;
  padding: 1.25rem 1.5rem;
  background: rgba(var(--color-primary-50), 0.4);
  border-radius: 12px;
  border: 1px solid rgba(var(--color-primary-200), 0.4);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(var(--color-primary-500), 0.15);
  }
}

:global(.dark) .stat-card {
  background: rgba(var(--color-primary-900), 0.25);
  border-color: rgba(var(--color-primary-700), 0.4);

  &:hover {
    background: rgba(var(--color-primary-900), 0.35);
  }
}

.stat-label {
  font-size: 0.875rem;
  color: var(--fg);
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: var(--color);
  line-height: 1;
}

@media (max-width: 640px) {
  .stats-section {
    flex-direction: column;
  }

  .stat-value {
    font-size: 1.75rem;
  }
}
</style>