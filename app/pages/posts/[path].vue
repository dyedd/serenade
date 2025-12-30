<template>
  <div v-if="isLoading">正在加载文章...</div>
  <div v-else-if="hasError">文章加载失败。</div>
  <div v-else-if="post">
    <PostContent :post="post"></PostContent>
    <PostNavigation :prevPost="post.prevPost" :nextPost="post.nextPost" />
  </div>
  <div v-else>暂无内容。</div>
</template>

<script setup>
const route = useRoute()

const resolvePath = (value) => {
  if (typeof value === 'string') {
    return value
  } else {
    return ''
  }
}

const postPath = computed(() => {
  return resolvePath(route.params.path)
})

const { data: post, status, error } = await useFetch(
  () => `/api/posts/${postPath.value}`,
  {
    default: () => null
  }
)

const isLoading = computed(() => {
  return status.value === 'pending'
})

const hasError = computed(() => {
  return Boolean(error.value)
})

watchEffect(() => {
  const title = post.value?.metaData?.title
  const description = post.value?.metaData?.description

  if (title) {
    useHead({
      title,
      meta: [
        {
          name: 'description',
          content: description || title
        }
      ]
    })
  } else {
    useHead({
      title: '文章详情',
      meta: [
        {
          name: 'description',
          content: '文章详情'
        }
      ]
    })
  }
})
</script>
