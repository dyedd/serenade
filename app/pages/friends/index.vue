<template>
  <header>
    <h1
      class="mt-0 text-4xl md:text-4xl text-3xl font-extrabold text-neutral-900 dark:text-neutral"
    >
      友链
      <span v-if="!isLoading && !hasError && sites.length > 0" class="total-count">{{
        sites.length
      }}</span>
      🤝
    </h1>
  </header>

  <!-- 友链申请说明 -->
  <section
    class="mt-0 md:mt-4 prose flex max-w-full flex-col dark:prose-invert lg:flex-row"
  >
    <div class="min-h-0 min-w-0 max-w-prose grow">
      <blockquote>
        <p><strong>申请友链前必读</strong></p>
        <ul>
          <li>
            <p>
              申请友链时请确保您的站点同时也有我们的站点的友链，若审批通过后移除本站链接，本站也将移除友链，并加入黑名单。
            </p>
          </li>
          <li>
            <p>确保您的网站不存在政治敏感问题及违法内容。</p>
          </li>
          <li>
            <p>确保站点可以以 HTTPS 访问。</p>
          </li>
          <li>
            <p>不同意商业及非个人的网站的友链申请。</p>
          </li>
        </ul>
      </blockquote>
      <div class="mt-4">
        <p><strong>友链申请方式</strong></p>
        <p>
          请将你的友链信息按照以下格式发送至<a href="mailto:1176996982@qq.com"
            >邮箱</a
          >
        </p>
      </div>

      <div class="mt-4">
        <p><strong>我的友链信息</strong></p>
        <pre class="language-json">
<code>{
  "name": "染念",
  "url": "https://dyedd.cn",
  "logo": "https://dyedd.cn/logo.jpg",
  "description": "Writing code, painful and happy",
  "rss": "https://dyedd.cn/feed"
}</code>
          </pre>
      </div>
    </div>
  </section>

  <!-- 友链列表部分 -->
  <section
    v-if="!isLoading && !hasError && sites.length > 0"
    class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-8"
  >
    <FriendsCard v-for="site in sites" :key="site.siteUrl" :site="site" />
  </section>

  <section v-else class="flex justify-center items-center p-4">
    <div v-if="isLoading">
      <span class="w-2 h-2 ml-2 rounded-full bg-gray-200 inline-block"></span>
      <span class="w-2 h-2 ml-2 rounded-full bg-gray-200 inline-block"></span>
      <span class="w-2 h-2 ml-2 rounded-full bg-gray-200 inline-block"></span>
    </div>
    <p v-else class="text-sm text-neutral-500 dark:text-neutral-400">
      {{ fallbackMessage }}
    </p>
  </section>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default'
})

useHead({
  title: '友情链接',
  meta: [
    {
      name: 'description',
      content: '友情链接页面，与优秀的人为邻，与有趣的灵魂相遇'
    }
  ]
})

const { data: sitesData, status, error } = await useFetch('/api/friends', {
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

const isLoading = computed(() => {
  return status.value === 'pending'
})

const hasError = computed(() => {
  return Boolean(error.value)
})

const fallbackMessage = computed(() => {
  if (hasError.value) {
    return '加载失败，请稍后重试。'
  } else if (isLoading.value) {
    return '加载中...'
  } else {
    return '暂无友链'
  }
})
</script>

<style lang="scss" scoped>
// 友链总数样式
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
</style>

