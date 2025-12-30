<template>
  <div class="breadcrumb text-sm mb-4">
    <span class="breadcrumb-item">{{ columnTitle }}</span>
    <span class="breadcrumb-separator">/</span>
    <span class="breadcrumb-item active">{{ currentChapterTitle }}</span>
    <span v-if="lastModified" class="breadcrumb-meta">最近修改：{{ lastModified }}</span>
  </div>
</template>

<script setup lang="ts">
type ChapterMeta = {
  metaData?: {
    title?: string
    date?: string
  }
}

const props = defineProps<{
  columnTitle?: string
  currentChapter?: ChapterMeta | null
  readmeDate?: string
}>()

const currentChapterTitle = computed(() => {
  const title = props.currentChapter?.metaData?.title

  if (title) {
    return title
  } else {
    return '专栏概览'
  }
})

const lastModified = computed(() => {
  const chapterDate = props.currentChapter?.metaData?.date

  if (chapterDate) {
    return chapterDate
  } else if (props.readmeDate) {
    return props.readmeDate
  } else {
    return ''
  }
})
</script>

<style scoped>
.breadcrumb {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: rgb(var(--color-neutral-600));
}

.breadcrumb-item {
  color: rgb(var(--color-neutral-600));
}

.breadcrumb-item.active {
  color: rgb(var(--color-neutral-900));
  font-weight: 600;
}

.breadcrumb-separator {
  color: rgb(var(--color-primary-500));
}

.breadcrumb-meta {
  margin-left: 1rem;
  font-size: 0.75rem;
  color: rgb(var(--color-neutral-400));
}

:global(.dark) .breadcrumb {
  color: rgb(var(--color-neutral-400));
}

:global(.dark) .breadcrumb-item.active {
  color: rgb(var(--color-neutral-100));
}

:global(.dark) .breadcrumb-meta {
  color: rgb(var(--color-neutral-500));
}
</style>
