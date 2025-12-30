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

  <section v-if="loading" class="text-center py-8 text-neutral-600 dark:text-neutral-400">
    正在加载文章...
  </section>

  <section v-else-if="error" class="text-center py-8 text-neutral-600 dark:text-neutral-400">
    加载失败，请稍后重试。
  </section>

  <section v-else-if="hasPosts" class="space-y-4">
    <PostPreview v-for="post in postsData" :key="post.id" :post="post" />
  </section>

  <section v-else class="text-center py-8 text-neutral-600 dark:text-neutral-400">
    暂无相关文章。
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

const resolveTagName = (value) => {
  if (typeof value === 'string') {
    return value
  } else {
    return ''
  }
}

const tagName = ref(resolveTagName(route.params.path))

const buildHeadConfig = (name) => {
  if (name.length > 0) {
    return {
      title: `标签: ${name}`,
      meta: [
        {
          name: 'description',
          content: `标签 ${name} 下的所有文章`
        }
      ]
    }
  } else {
    return {
      title: '标签',
      meta: [
        {
          name: 'description',
          content: '标签文章列表'
        }
      ]
    }
  }
}

const buildTagApiPath = (name) => {
  if (name.length > 0) {
    return `/api/tags/${encodeURIComponent(name)}`
  } else {
    return '/api/tags/'
  }
}

watchEffect(() => {
  const headConfig = buildHeadConfig(tagName.value)
  useHead(headConfig)
})

const {
  loading,
  data: postsData,
  error,
  currentPage,
  totalPages,
  totalItems,
  fetchData
} = useApiFetch(buildTagApiPath(tagName.value), {
  pageSize: 5
})

const hasPosts = computed(() => {
  const currentPosts = postsData.value

  if (Array.isArray(currentPosts)) {
    return currentPosts.length > 0
  } else {
    return false
  }
})

const parsePageQuery = (value) => {
  if (typeof value === 'string') {
    const parsed = Number.parseInt(value, 10)

    if (Number.isNaN(parsed)) {
      return 1
    } else {
      return parsed
    }
  } else {
    return 1
  }
}

watch(
  () => route.query.page,
  (newPage) => {
    const page = parsePageQuery(newPage)
    fetchData(page)
  }
)

const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    router.push({ query: { ...route.query, page } })
  } else {
    return
  }
}
</script>
