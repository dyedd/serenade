<template>
  <div class="columns-detail">
    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-spinner">
        <div class="spinner"></div>
        <p class="loading-text">加载中...</p>
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

<script setup>
definePageMeta({
  layout: "columns",
});

const columnMeta = ref({});
const readmeHtml = ref("");
const chapters = ref([]);
const currentChapter = ref(null);
const currentChapterIndex = ref(null);
const route = useRoute();
const router = useRouter();
const isLoading = ref(true);

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
    return chapters.value.length > 0
      ? {
          title: chapters.value[0]?.metaData?.title,
          index: 0,
        }
      : null;
  }
  if (currentChapterIndex.value >= chapters.value.length - 1) return null;
  return {
    title: chapters.value[currentChapterIndex.value + 1]?.metaData?.title,
    index: currentChapterIndex.value + 1,
  };
});

watchEffect(() => {
  const columnTitle = columnMeta.value?.title || "专栏";
  const chapterTitle = currentChapter.value?.metaData?.title;

  const pageTitle = chapterTitle ? `${chapterTitle} - ${columnTitle}` : columnTitle;

  useHead({
    title: pageTitle,
    meta: [
      {
        name: "description",
        content: columnMeta.value?.description || pageTitle,
      },
    ],
  });
});

onMounted(async () => {
  const response = await fetch(`/api/columns/${route.params.path}`);
  const data = await response.json();
  columnMeta.value = data.metaData;
  readmeHtml.value = data.readmeHtml;
  chapters.value = data.chapters;

  const chapterSlug = route.query.slug;
  if (chapterSlug !== undefined) {
    const index = findChapterIndexBySlug(chapterSlug);
    if (index !== -1) {
      await setCurrentChapterBySlug(chapterSlug, false);
      return;
    }
  } else if (route.hash) {
    nextTick(() => {
      scrollToHash(route.hash);
    });
  }

  isLoading.value = false;
});

async function loadChapterContent(index) {
  if (index < 0 || index >= chapters.value.length) return;

  if (chapters.value[index]?.htmlContent) {
    currentChapter.value = chapters.value[index];
    return;
  }

  const fileName = chapters.value[index].fileName;
  const response = await fetch(`/api/columns/${route.params.path}/${fileName}`);
  const chapterData = await response.json();

  chapters.value[index] = { ...chapters.value[index], ...chapterData };
  currentChapter.value = chapters.value[index];
}

function findChapterIndexBySlug(slug) {
  let index = chapters.value.findIndex((ch) => ch.fileName === slug);
  if (index !== -1) return index;

  const slugWithoutExt = slug.replace(/\.md$/, '');
  index = chapters.value.findIndex((ch) => ch.fileName.replace(/\.md$/, '') === slugWithoutExt);
  if (index !== -1) return index;

  return -1;
}

async function setCurrentChapter(index) {
  if (index < 0 || index >= chapters.value.length) return;
  const fileName = chapters.value[index].fileName;
  await setCurrentChapterBySlug(fileName, true);
}

async function setCurrentChapterBySlug(slug, shouldUpdateUrl = true) {
  const index = findChapterIndexBySlug(slug);
  if (index === -1) {
    isLoading.value = false;
    return;
  }

  currentChapterIndex.value = index;

  const slugWithoutExt = slug.replace(/\.md$/, "");

  if (shouldUpdateUrl && route.query.slug !== slugWithoutExt) {
    await router.push({
      query: { ...route.query, slug: slugWithoutExt },
    });
  }

  await loadChapterContent(index);

  isLoading.value = false;

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function scrollToHash(hash) {
  nextTick(() => {
    const element = document.querySelector(hash);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  });
}

function setOverview() {
  currentChapterIndex.value = null;
  currentChapter.value = null;
  const newHash = route.hash;
  router.push({
    query: {},
    hash: newHash
  });
  if (newHash) {
    scrollToHash(newHash);
  } else {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

watch(
  () => route.query.slug,
  async (newSlug) => {
    if (newSlug !== undefined) {
      await setCurrentChapterBySlug(String(newSlug), false);
    } else {
      setOverview();
    }
  }
);

watch(
  () => route.hash,
  (newHash) => {
    if (newHash) {
      scrollToHash(newHash);
    }
  }
);
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
