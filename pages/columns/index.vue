<template>
  <header>
    <h1 class="mt-0 text-4xl font-extrabold text-neutral-900 dark:text-neutral">欢迎来到我的知识库 🎉</h1>
  </header>

  <section class="mt-0 prose flex max-w-full flex-col dark:prose-invert lg:flex-row">
    <div class="min-h-0 min-w-0 max-w-prose grow">
      <blockquote>
        <p>死记不如烂笔头</p>
      </blockquote>
    </div>
  </section>

  <section v-if="!loading && columns?.length > 0" class="grid grid-cols-1 sm:grid-cols-4 lg:grid-cols-6 gap-4">
    <ColumnsCard v-for="item in columns" :key="item.path" :id="item.path" :title="item.title" :type="item.type"
      :image="item.image" :description="item.description" />
  </section>

  <section v-else class="flex justify-center items-center p-4">
    <div>
      <span class="w-2 h-2 ml-2 rounded-full bg-gray-200 inline-block"></span>
      <span class="w-2 h-2 ml-2 rounded-full bg-gray-200 inline-block"></span>
      <span class="w-2 h-2 ml-2 rounded-full bg-gray-200 inline-block"></span>
    </div>
  </section>
  <Pagination v-if="!loading && totalPages > 1" :currentPage="currentPage" :totalPages="totalPages"
    @pageChange="goToPage" />
</template>

<script setup>
definePageMeta({
  layout: "default",
});

const loading = ref(true);
const columns = ref([]);
const currentPage = ref(1);
const pageSize = ref(10);
const totalPages = ref(0);
const totalItems = ref(0);

const router = useRouter();
const route = useRoute();

async function fetchColumns(page = 1, size = pageSize.value) {
  loading.value = true;
  try {
    const { data } = await useFetch(`/api/columns?page=${page}&pageSize=${size}`);
    if (data.value) {
      columns.value = data.value.data;
      currentPage.value = data.value.page;
      pageSize.value = data.value.pageSize;
      totalPages.value = data.value.totalPages;
      totalItems.value = data.value.totalItems;
    }
  } catch (error) {
    console.error('Failed to fetch columns:', error);
  } finally {
    loading.value = false;
  }
}

function goToPage(page) {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
    router.push({ query: { ...route.query, page } });
  }
}

// 监听路由变化
watch(
  () => route.query,
  (newQuery) => {
    const page = parseInt(newQuery.page) || 1;
    const size = parseInt(newQuery.pageSize) || pageSize.value;
    fetchColumns(page, size);
  },
  { immediate: true }
);
</script>

<style lang="scss" scoped></style>