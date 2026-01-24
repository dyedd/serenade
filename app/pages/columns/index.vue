<template>
  <div class="columns-page">
    <header>
      <h1
        class="mt-0 text-4xl md:text-4xl text-3xl font-extrabold text-neutral-900 dark:text-neutral"
      >
        专栏 📚
      </h1>
    </header>

    <section
      class="mt-0 md:mt-4 prose flex max-w-full flex-col dark:prose-invert lg:flex-row mb-8"
    >
      <div class="min-h-0 min-w-0 max-w-prose grow">
        <blockquote class="text-sm md:text-base mb-6">
          <p>
            系统化的学习笔记，沉淀我的技术积累。目前已收录
            <span
              class="font-semibold text-primary-600 dark:text-primary-400 mx-1"
              >{{ totalItems }}</span
            >
            个专栏，共
            <span
              class="font-semibold text-primary-600 dark:text-primary-400 mx-1"
              >{{ totalDocs }}</span
            >
            篇文档。
          </p>
        </blockquote>
      </div>
    </section>

    <!-- 加载状态 -->
    <section v-if="isLoading" class="flex justify-center items-center py-20">
      <div class="loading-dots">
        <span class="dot"></span>
        <span class="dot"></span>
        <span class="dot"></span>
      </div>
    </section>

    <!-- 专栏列表 -->
    <section
      v-else-if="hasError"
      class="flex flex-col justify-center items-center py-20 text-neutral-500 dark:text-neutral-400"
    >
      <div class="text-4xl mb-4">😕</div>
      <p>加载失败，请稍后重试</p>
    </section>

    <section
      v-else-if="columns.length > 0"
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8"
    >
      <ColumnsFolderCard
        v-for="item in columns"
        :key="item.path"
        :id="item.path"
        :title="item.title"
        :type="item.type"
        :image="item.image"
        :description="item.description"
      />
    </section>

    <!-- 空状态 -->
    <section
      v-else
      class="flex flex-col justify-center items-center py-20 text-neutral-500 dark:text-neutral-400"
    >
      <div class="text-4xl mb-4">📭</div>
      <p>暂无专栏内容</p>
    </section>

    <!-- 分页 -->
    <div class="mt-16">
      <Pagination
        v-if="!isLoading && totalPages > 1"
        :currentPage="currentPage"
        :totalPages="totalPages"
        @pageChange="goToPage"
      />
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  layout: "default",
});

const router = useRouter();
const route = useRoute();

const parsePageQuery = (value) => {
  if (typeof value === "string") {
    const parsed = Number.parseInt(value, 10);

    if (Number.isNaN(parsed)) {
      return 1;
    } else {
      return parsed;
    }
  } else {
    return 1;
  }
};

const pageQuery = computed(() => {
  return parsePageQuery(route.query.page);
});

const pageSize = 12;
const queryParams = computed(() => ({
  page: pageQuery.value,
  pageSize,
}));

const {
  data: result,
  status,
  error,
} = await useFetch("/api/columns", {
  query: queryParams,
  watch: [queryParams],
  default: () => ({
    page: 1,
    pageSize,
    totalPages: 0,
    totalItems: 0,
    totalDocs: 0,
    data: [],
  }),
});

const columns = computed(() => {
  return result.value.data;
});

const currentPage = computed(() => {
  return result.value.page;
});

const totalPages = computed(() => {
  return result.value.totalPages;
});

const totalItems = computed(() => {
  return result.value.totalItems;
});

const totalDocs = computed(() => {
  return result.value.totalDocs;
});

const isLoading = computed(() => {
  return status.value === "pending";
});

const hasError = computed(() => {
  return Boolean(error.value);
});

const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    router.push({ query: { ...route.query, page } });
  } else {
    return;
  }
};
</script>

<style lang="scss" scoped>
.loading-dots {
  display: flex;
  gap: 0.5rem;

  .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: rgb(var(--color-primary-500));
    animation: bounce 1.4s infinite ease-in-out both;

    &:nth-child(1) {
      animation-delay: -0.32s;
    }

    &:nth-child(2) {
      animation-delay: -0.16s;
    }
  }
}

@keyframes bounce {
  0%,
  80%,
  100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}
</style>
