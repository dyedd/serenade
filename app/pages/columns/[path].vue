<template>
  <div class="columns-detail">
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

<script setup>
definePageMeta({
  layout: "columns",
});

const columnMeta = ref({});
const readmeHtml = ref('');
const chapters = ref([]);
const currentChapter = ref(null);
const currentChapterIndex = ref(null);
const route = useRoute();

const prevChapter = computed(() => {
  if (currentChapterIndex.value === null) return null;
  if (currentChapterIndex.value === 0) return null;
  return {
    title: chapters.value[currentChapterIndex.value - 1]?.metaData?.title,
    index: currentChapterIndex.value - 1,
  };
});

const nextChapter = computed(() => {
  if (currentChapterIndex.value === null) {
    return chapters.value.length > 0 ? {
      title: chapters.value[0]?.metaData?.title,
      index: 0,
    } : null;
  }
  if (currentChapterIndex.value >= chapters.value.length - 1) return null;
  return {
    title: chapters.value[currentChapterIndex.value + 1]?.metaData?.title,
    index: currentChapterIndex.value + 1,
  };
});

onMounted(async () => {
  const response = await fetch(`/api/columns/${route.params.path}`);
  const data = await response.json();
  columnMeta.value = data.metaData;
  readmeHtml.value = data.readmeHtml;
  chapters.value = data.chapters;
});

async function setCurrentChapter(index) {
  currentChapterIndex.value = index;

  // 如果章节已经有内容，直接使用缓存
  if (chapters.value[index].htmlContent) {
    currentChapter.value = chapters.value[index];
    return;
  }

  // 否则按需加载章节内容
  const fileName = chapters.value[index].fileName;
  const response = await fetch(`/api/columns/${route.params.path}/${fileName}`);
  const chapterData = await response.json();

  // 缓存章节内容
  chapters.value[index] = { ...chapters.value[index], ...chapterData };
  currentChapter.value = chapters.value[index];
}

function setOverview() {
  currentChapterIndex.value = null;
  currentChapter.value = null;
}
</script>

<style scoped>
.columns-detail {
  display: flex;
  min-height: 100vh;
  background: var(--bg);
}
</style>