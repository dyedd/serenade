<template>
  <div class="breadcrumb">
    <div class="breadcrumb-nav">
      <span class="breadcrumb-item home-item">{{ columnTitle }}</span>
      <span class="breadcrumb-separator">/</span>
      <span class="breadcrumb-item active">{{ currentChapterTitle }}</span>
    </div>
    <div v-if="lastModified" class="breadcrumb-meta">
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-1"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
      {{ lastModified }}
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  columnTitle: {
    type: String,
    default: ''
  },
  currentChapter: {
    type: Object,
    default: null
  },
  readmeDate: {
    type: String,
    default: ''
  }
})

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
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(var(--color-neutral-200), 0.6);
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.breadcrumb-nav {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
}

.breadcrumb-item {
  color: var(--fg);
  font-weight: 500;
  
  &.home-item {
      color: var(--fg-deep);
  }
}

.breadcrumb-item.active {
  color: var(--color);
  font-weight: 600;
}

.breadcrumb-separator {
  color: rgba(var(--color-neutral-400), 0.8);
  font-size: 0.8rem;
}

.breadcrumb-meta {
  display: flex;
  align-items: center;
  font-size: 0.75rem;
  color: var(--fg);
  background: rgba(var(--color-neutral-100), 0.8);
  padding: 0.2rem 0.6rem;
  border-radius: 4px;
}

:global(.dark) .breadcrumb {
  border-bottom-color: rgba(var(--color-neutral-700), 0.6);
}

:global(.dark) .breadcrumb-meta {
  background: rgba(var(--color-neutral-800), 0.6);
}
</style>
