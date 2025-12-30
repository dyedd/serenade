<template>
  <h1 class="mt-0 text-4xl font-extrabold text-neutral-900 dark:text-neutral">
    标签
  </h1>
  <section
    class="prose mt-0 flex max-w-full flex-col dark:prose-invert lg:flex-row"
  >
    <div class="min-h-0 min-w-0 max-w-prose grow">
      <blockquote>
        <p>你可以通过 <strong>分类</strong> 快速查找你需要的文章</p>
      </blockquote>
    </div>
  </section>
  <section class="-mx-2 flex flex-wrap overflow-hidden">
    <article
      v-for="(count, tag) in safeTags"
      :key="tag"
      class="my-3 w-full overflow-hidden px-2 sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/5"
    >
      <h2 class="flex items-center">
        <NuxtLink
          class="text-xl font-medium decoration-primary-500 hover:underline hover:underline-offset-2"
          :to="buildTagLink(tag)"
        >
          {{ tag }}
        </NuxtLink>
        <span class="px-2 text-base text-primary-500">·</span>
        <span class="text-base text-neutral-400">{{ count }}</span>
      </h2>
    </article>
  </section>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default'
})

const { data: tagsData, status, error } = await useFetch<Record<string, number>>('/api/tags', {
  default: () => ({})
})

const safeTags = computed(() => {
  if (status.value === 'pending' || error.value) {
    return {}
  } else {
    return tagsData.value
  }
})

const buildTagLink = (tag: string) => {
  return `/tags/${encodeURIComponent(tag)}`
}
</script>

<style lang="scss" scoped></style>
