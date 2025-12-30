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

  <section v-if="isLoading" class="text-center py-8 text-neutral-600 dark:text-neutral-400">
    正在加载文章...
  </section>

  <section v-else-if="hasError" class="text-center py-8 text-neutral-600 dark:text-neutral-400">
    加载失败，请稍后重试。
  </section>

  <section v-else-if="hasPosts" class="space-y-4">
    <PostPreview v-for="post in postsData" :key="post.path" :post="post" />
  </section>

  <section v-else class="text-center py-8 text-neutral-600 dark:text-neutral-400">
    暂无相关文章。
  </section>

  <Pagination
    v-if="!isLoading && totalPages > 1"
    :currentPage="currentPage"
    :totalPages="totalPages"
    @pageChange="goToPage"
  />
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default',
})

const route = useRoute()
const router = useRouter()

const decodeTagName = (value: string) => {
  try {
    return decodeURIComponent(value)
  } catch (error) {
    if (error instanceof URIError) {
      return value
    } else {
      throw error
    }
  }
}

const resolveTagName = (value: unknown) => {
  if (typeof value === 'string') {
    const trimmed = value.trim()

    if (trimmed.length > 0) {
      return decodeTagName(trimmed)
    } else {
      return ''
    }
  } else {
    return ''
  }
}

const tagName = computed(() => {
  return resolveTagName(route.params.path)
})

const buildHeadConfig = (name: string) => {
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

const buildTagApiPath = (name: string) => {
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

const parsePageQuery = (value: unknown) => {
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

const pageQuery = computed(() => {
  return parsePageQuery(route.query.page)
})

const pageSize = 5
const queryParams = computed(() => ({
  page: pageQuery.value,
  pageSize
}))

const { data: result, status, error } = await useFetch(() => buildTagApiPath(tagName.value), {
  query: queryParams,
  watch: [queryParams, tagName],
  default: () => ({
    page: 1,
    pageSize,
    totalPages: 0,
    totalItems: 0,
    data: []
  })
})

const postsData = computed(() => {
  return result.value.data
})

const currentPage = computed(() => {
  return result.value.page
})

const totalPages = computed(() => {
  return result.value.totalPages
})

const isLoading = computed(() => {
  return status.value === 'pending'
})

const hasError = computed(() => {
  return Boolean(error.value)
})

const hasPosts = computed(() => {
  const currentPosts = postsData.value

  if (Array.isArray(currentPosts)) {
    return currentPosts.length > 0
  } else {
    return false
  }
})

const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    router.push({ query: { ...route.query, page } })
  } else {
    return
  }
}
</script>
