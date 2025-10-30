<template>
  <header>
    <ol class="text-sm text-neutral-500 print:hidden dark:text-neutral-400">
      <li class="hidden">
        <NuxtLink to="/" class="hover:underline">首页</NuxtLink>
        <span class="px-1 text-primary-500">/</span>
      </li>
      <li class="inline">
        <NuxtLink to="/tags" class="hover:underline">标签</NuxtLink>
        <span class="px-1 text-primary-500">/</span>
      </li>
    </ol>
    <h1 class="mt-0 text-4xl font-extrabold text-neutral-900 dark:text-neutral">{{ tagName }}</h1>
  </header>

  <section v-if="postsData?.length > 0" class="space-y-4">
    <PostPreview v-for="post in postsData" :key="post.id" :post="post" />
  </section>

  <section v-else class="text-center py-8 text-neutral-600 dark:text-neutral-400">
    正在加载文章...
  </section>

  <Pagination
    :currentPage="currentPage"
    :totalPages="totalPages"
    @pageChange="goToPage"
  />
</template>

<script setup>
definePageMeta({
  layout: 'default',
})

const route = useRoute()
const router = useRouter()
const tagName = ref(route.params.path)

const {
  loading,
  data: postsData,
  currentPage,
  totalPages,
  totalItems,
  fetchData
} = useApiFetch(`/api/tags/${route.params.path}`, {
  pageSize: 5
})

// 监听路由查询参数变化
watch(
  () => route.query.page,
  (newPage) => {
    const page = parseInt(newPage) || 1
    fetchData(page)
  }
)

const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    router.push({ query: { ...route.query, page } })
  }
}
</script>
