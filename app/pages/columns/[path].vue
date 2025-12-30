<template>
  <div class="columns-detail">
    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-spinner">
        <div class="spinner"></div>
        <p class="loading-text">加载中...</p>
      </div>
    </div>

    <div v-else-if="hasError" class="loading-overlay">
      <div class="loading-spinner">
        <p class="loading-text">加载失败，请稍后再试。</p>
      </div>
    </div>

    <ColumnsSidebar
      :columnTitle="columnMeta.title"
      :columnType="columnMeta.type"
      :chapters="chapters"
      :currentChapterIndex="currentChapterIndex"
      @selectChapter="setCurrentChapter"
      @selectOverview="setOverview"
    />
    <ColumnsMainContent
      :columnMeta="columnMeta"
      :readmeHtml="readmeHtml"
      :currentChapter="currentChapter"
      :prevChapter="prevChapter"
      :nextChapter="nextChapter"
      @selectChapter="setCurrentChapter"
    />
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'columns'
})

const {
  error,
  isLoading,
  columnMeta,
  readmeHtml,
  chapters,
  currentChapter,
  currentChapterIndex,
  prevChapter,
  nextChapter,
  setCurrentChapter,
  setOverview
} = await useColumnDetail()

const hasError = computed(() => {
  return Boolean(error.value)
})

watchEffect(() => {
  const columnTitle = columnMeta.value?.title || '专栏'
  const chapterTitle = currentChapter.value?.metaData?.title
  const pageTitle = chapterTitle ? `${chapterTitle} - ${columnTitle}` : columnTitle
  const description = columnMeta.value?.description || pageTitle

  useHead({
    title: pageTitle,
    meta: [
      {
        name: 'description',
        content: description
      }
    ]
  })
})
</script>

<style scoped>
.columns-detail {
  display: flex;
  min-height: 100vh;
  background: var(--bg);
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

:global(.dark) .loading-overlay {
  background: rgba(0, 0, 0, 0.6);
}

.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

:global(.dark) .loading-spinner {
  background: rgb(var(--color-neutral-800));
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid rgba(var(--color-primary-200), 0.3);
  border-top-color: rgb(var(--color-primary-600));
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-text {
  font-size: 0.875rem;
  color: rgb(var(--color-neutral-600));
  margin: 0;
}

:global(.dark) .loading-text {
  color: rgb(var(--color-neutral-300));
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
