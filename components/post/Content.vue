<template>
  <article>
    <header class="max-w-prose">
      <nav class="breadcrumb mb-6 text-sm text-neutral-500 print:hidden dark:text-neutral-400">
        <NuxtLink to="/" class="hover:underline">首页</NuxtLink>
        <span class="px-1 text-primary-500">/</span>
        <NuxtLink to="/posts" class="hover:underline">所有文章</NuxtLink>
        <span class="px-1 text-primary-500">/</span>
      </nav>

      <h1 class="mt-0 text-4xl font-extrabold text-neutral-900 dark:text-neutral">
        {{ post.metaData.title }}
      </h1>

      <div class="mt-8 text-base text-neutral-500 dark:text-neutral-400 print:hidden">
        <div class="flex flex-row flex-wrap items-center">
          <time>{{ post.metaData.date }}</time>
          <span class="px-2 text-primary-500">·</span>
          <div class="my-1 flex flex-wrap text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
            <NuxtLink
              v-for="(tag, index) in post.metaData.tags"
              :key="index"
              :to="`/tags/${tag}`"
              class="mx-1 my-1 rounded-md border border-neutral-200 px-1 py-[1px] hover:border-primary-300 hover:text-primary-700 dark:border-neutral-600 dark:hover:border-primary-600 dark:hover:text-primary-400"
            >
              {{ tag }}
            </NuxtLink>
          </div>
        </div>
      </div>

      <div v-if="post.metaData.cover" class="mt-12 prose dark:prose-invert">
        <img class="mb-6 -mt-4 rounded-md" loading="lazy" :src="post.metaData.cover" alt="" />
      </div>
    </header>

    <section class="flex flex-col max-w-full mt-0 prose dark:prose-invert lg:flex-row">
      <div class="order-first px-0 lg:order-last lg:max-w-xs lg:ps-8">
        <aside class="toc pe-5 print:hidden lg:sticky lg:top-10">
          <div class="-ms-5 py-2 ps-5">
            <PostCatalog :headings="headings" :active-id="activeId" @click="scrollToHeading" />
          </div>
        </aside>
      </div>

      <div class="post-content min-w-0 min-h-0 max-w-prose grow" v-html="post.htmlContent"></div>
    </section>
  </article>
</template>

<script setup>
defineProps({
  post: {
    type: Object,
    required: true,
  },
  headings: {
    type: Array,
    default: () => [],
  },
  activeId: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['scroll'])

const scrollToHeading = (id) => {
  emit('scroll', id)
}
</script>
