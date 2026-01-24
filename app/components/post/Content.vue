<template>
  <article class="post-container">
    <header class="post-header max-w-prose">
      <nav
        class="breadcrumb mb-8 text-sm text-neutral-500 print:hidden dark:text-neutral-400 font-medium"
      >
        <NuxtLink to="/" class="hover:text-primary-600 transition-colors">首页</NuxtLink>
        <span class="px-2 text-neutral-300 dark:text-neutral-600">/</span>
        <NuxtLink to="/posts" class="hover:text-primary-600 transition-colors">所有文章</NuxtLink>
        <span class="px-2 text-neutral-300 dark:text-neutral-600">/</span>
        <span class="text-neutral-900 dark:text-neutral-200 truncate">{{ post.metaData.title }}</span>
      </nav>

      <h1
        class="mt-0 text-4xl md:text-5xl font-extrabold text-neutral-900 dark:text-neutral-50 leading-tight tracking-tight mb-6"
      >
        {{ post.metaData.title }}
      </h1>

      <div
        class="meta-info mt-6 text-sm text-neutral-500 dark:text-neutral-400 print:hidden flex flex-wrap items-center gap-4 border-b border-neutral-100 dark:border-neutral-800 pb-8"
      >
        <div class="flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
            <time>{{ post.metaData.date }}</time>
        </div>
        
        <div v-if="post.metaData.readingTime" class="flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <span>{{ post.metaData.readingTime }}</span>
        </div>

        <div
          class="flex flex-wrap items-center gap-2"
        >
           <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path></svg>
          <NuxtLink
            v-for="(tag, index) in post.metaData.tags"
            :key="index"
            :to="`/tags/${tag}`"
            class="tag-badge"
          >
            {{ tag }}
          </NuxtLink>
        </div>
      </div>

      <div v-if="post.metaData.cover" class="mt-8 mb-10">
        <img
          class="rounded-xl shadow-lg w-full object-cover max-h-[500px]"
          loading="lazy"
          :src="post.metaData.cover"
          alt="Post cover"
        />
      </div>
    </header>

    <section
      class="flex flex-col lg:flex-row gap-12 mt-8"
    >
      <div
        class="post-content prose prose-lg prose-neutral dark:prose-invert max-w-prose min-w-0 flex-grow"
        ref="contentRef"
        v-html="post.htmlContent"
      ></div>

      <aside class="toc-sidebar hidden lg:block lg:w-64 flex-shrink-0">
        <div class="sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto pr-2 custom-scrollbar">
            <h3 class="text-sm font-bold text-neutral-900 dark:text-neutral-200 uppercase tracking-wider mb-4 pl-4 border-l-2 border-transparent">
                目录
            </h3>
            <PostCatalog :headings="headings" :active-id="activeId" />
        </div>
      </aside>
    </section>
  </article>
</template>

<script setup>
const props = defineProps({
  post: {
    type: Object,
    required: true
  }
})

const contentRef = ref(null)
const { headings, activeId, refreshHeadings, updateActiveHeading } = useHeadingTree(contentRef)

// Handle Copy Button
onMounted(() => {
  if (!contentRef.value) return

  contentRef.value.addEventListener('click', async (e) => {
    const btn = e.target.closest('.copy-btn')
    if (!btn) return

    const wrapper = btn.closest('.code-block-wrapper')
    const code = wrapper.querySelector('code').innerText
    
    try {
      await navigator.clipboard.writeText(code)
      const originalHTML = btn.innerHTML
      btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-green-400"><polyline points="20 6 9 17 4 12"/></svg><span class="text-green-400">Copied!</span>`
      setTimeout(() => {
        btn.innerHTML = originalHTML
      }, 2000)
    } catch (err) {
      console.error('Failed to copy!', err)
      btn.textContent = 'Error'
    }
  })
})

watch(
  () => props.post.htmlContent,
  () => {
    nextTick(() => {
      refreshHeadings()
      updateActiveHeading()
    })
  }
)
</script>

<style scoped>
.post-container {
    animation: fadeIn 0.5s ease-out;
}

.tag-badge {
    @apply px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-600 hover:bg-primary-50 hover:text-primary-600 transition-colors dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-primary-900/30 dark:hover:text-primary-400;
}

/* Custom Scrollbar for TOC */
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
  height: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: var(--color-neutral-600);
  border-radius: 4px;
}
html.dark .custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: var(--color-neutral-600);
}

@keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
}

/* Prose refinements */
:deep(.prose) {
    line-height: 1.8;
}
:deep(.prose a) {
    @apply text-primary-600 no-underline border-b border-primary-300/50 hover:border-primary-500 transition-colors dark:text-primary-400 dark:border-primary-700 dark:hover:border-primary-500;
}
:deep(.prose h2) {
    @apply text-2xl font-bold mt-12 mb-6 scroll-mt-24 text-neutral-800 dark:text-neutral-100;
}
:deep(.prose h3) {
    @apply text-xl font-semibold mt-8 mb-4 scroll-mt-24 text-neutral-800 dark:text-neutral-200;
}
:deep(.prose :where(code):not(:where(pre *))) {
    @apply bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded text-sm text-primary-700 dark:text-primary-300 font-normal;
}
:deep(.prose pre) {
    @apply bg-transparent p-0 m-0 border-none shadow-none rounded-none;
}
:deep(.prose pre code) {
    @apply bg-transparent p-0 text-sm font-normal text-inherit;
}
/* Ensure line height alignment for code blocks */
:deep(.line-numbers > span),
:deep(.hljs) {
    line-height: 1.6 !important;
    font-size: 0.875rem !important; /* text-sm */
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace !important;
}
:deep(.line-numbers > span) {
    display: block;
}
:deep(.prose img) {
    @apply rounded-lg shadow-md my-8;
}
:deep(.prose blockquote) {
    @apply border-l-4 border-primary-400 bg-neutral-50 dark:bg-neutral-800/50 py-2 px-4 rounded-r italic text-neutral-600 dark:text-neutral-300 not-italic;
}
</style>
