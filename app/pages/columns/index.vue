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
    <div class="loading-dots">
      <span class="dot"></span>
      <span class="dot"></span>
      <span class="dot"></span>
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
  layout: 'default',
})

const router = useRouter()
const route = useRoute()

const {
  loading,
  data: columns,
  currentPage,
  totalPages,
  totalItems,
  fetchData,
  response
} = useApiFetch('/api/columns', {
  pageSize: 12,
  immediate: true
})

const totalDocs = ref(0)

// 监听路由变化，重新获取数据
watch(
  () => route.query.page,
  (newPage) => {
    const page = parseInt(newPage) || 1
    fetchData(page)
  }
)

// 从API响应中获取totalDocs
watch(response, (newResponse) => {
  if (newResponse && newResponse.totalDocs !== undefined) {
    totalDocs.value = newResponse.totalDocs
  }
})

const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    router.push({ query: { ...route.query, page } })
  }
}
</script>

<style lang="scss" scoped>
.stats-section {
  display: flex;
  gap: 1.5rem;
  margin: 2rem 0;

  .stat-card {
    padding: 1.5rem 2rem;
    background: rgba(var(--color-primary-50), 0.5);
    border-radius: 12px;
    border: 1px solid rgba(var(--color-primary-200), 0.3);
    text-align: center;

    .stat-label {
      font-size: 0.875rem;
      color: rgb(var(--color-neutral-600));
      margin-bottom: 0.5rem;
    }

    .stat-value {
      font-size: 2rem;
      font-weight: 700;
      color: rgb(var(--color-primary-600));
    }
  }
}

:global(.dark) .stats-section {
  .stat-card {
    background: rgba(var(--color-primary-900), 0.3);
    border-color: rgba(var(--color-primary-700), 0.3);

    .stat-label {
      color: rgb(var(--color-neutral-400));
    }

    .stat-value {
      color: rgb(var(--color-primary-400));
    }
  }
}

.loading-dots {
  display: flex;
  gap: 0.5rem;

  .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: rgb(var(--color-primary-500));
    animation: bounce 1.4s infinite ease-in-out both;

    &:nth-child(1) {
      animation-delay: -0.32s;
    }

    &:nth-child(2) {
      animation-delay: -0.16s;
    }
  }
}

@keyframes bounce {
  0%, 80%, 100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}
</style>
