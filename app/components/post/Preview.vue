<template>
  <article class="mt-6 flex max-w-prose flex-row transition-transform duration-300 hover:scale-[1.02]">
    <div class="flex-none pe-4 sm:pe-6" v-if="post.cover">
      <img
        class="w-24 max-w-[6rem] max-h-[4.5rem] rounded-md sm:max-h-[7.5rem] sm:w-40 sm:max-w-[10rem]"
        loading="lazy"
        :src="post.cover"
        alt=""
      />
    </div>
    <div>
      <h3 class="flex items-center text-xl font-semibold">
        <NuxtLink
          class="text-neutral-800 decoration-primary-500 hover:underline hover:underline-offset-2 dark:text-neutral"
          :to="`/posts/${post.path}`"
        >
          {{ post.title }}
        </NuxtLink>
      </h3>
      <div class="text-sm text-neutral-500 dark:text-neutral-400">
        <div class="flex flex-row flex-wrap items-center gap-x-2">
          <time>{{ post.date }}</time>
          <span class="px-2 text-primary-500">·</span>
          <span v-if="post.readingTime">{{ post.readingTime }}</span>
          <span v-if="post.readingTime" class="px-2 text-primary-500">·</span>
          <ul class="ml-1 flex items-center gap-x-2">
            <li v-for="(tag, index) in post.tags" :key="index">
              <NuxtLink
                class="cactus-link inline-block"
                :to="`/tags/${tag}`"
                :aria-label="`查看更多带有标签 ${tag} 的文章`"
              >
                #{{ tag }}
              </NuxtLink>
            </li>
          </ul>
        </div>
      </div>
      <div class="prose py-1 dark:prose-invert">
        {{ post.abstract }}
      </div>
    </div>
  </article>
</template>

<script setup>
defineProps({
  post: {
    type: Object,
    required: true,
  },
})
</script>
