<template>
  <header>
    <h1 class="mt-0 text-4xl font-extrabold text-neutral-900 dark:text-neutral">文章 🎉</h1>
  </header>
  <section class="mt-0 prose flex max-w-full flex-col dark:prose-invert lg:flex-row">
    <div class="min-h-0 min-w-0 max-w-prose grow">
      <blockquote>
        <p>你可以通过
          <a href="/rss">RSS</a> 订阅所有文章
        </p>
      </blockquote>
    </div>
  </section>
  <section v-if="groupedBlogsData.length > 0">
    <div v-for="group in groupedBlogsData" :key="group.year">
      <h2 class="mt-12 text-2xl font-bold text-neutral-700 first:mt-8 dark:text-neutral-300">{{ group.year }}</h2>
      <hr class="w-36 border-dotted border-neutral-400">
      <div v-for="blog in group.blogs" :key="blog.id">
        <BlogPreview :blog="blog" />
      </div>
    </div>
  </section>
  <section v-else>
    Loading blogs...
  </section>
  <Pagination :currentPage="currentPage" :totalPages="totalPages" @pageChange="goToPage" />

</template>

<script setup>
definePageMeta({
  layout: "default",
});
const blogsData = ref([]);
const groupedBlogsData = ref({});
const currentPage = ref(1);
const pageSize = ref(5);
const totalPages = ref(0);
const totalItems = ref(0);


const router = useRouter();
const route = useRoute();

function groupBlogsByYear() {
  const groups = {};
  blogsData.value.forEach(blog => {
    const year = new Date(blog.date).getFullYear();
    if (!groups[year]) {
      groups[year] = [];
    }
    groups[year].push(blog);
  });

  // 将 groupedBlogsData 转换为数组并按年份降序排序
  const sortedGroups = Object.keys(groups).sort((a, b) => b - a).map(year => {
    return {
      year: year,
      blogs: groups[year]
    };
  });

  groupedBlogsData.value = sortedGroups;
}
console.log(groupedBlogsData)

async function fetchBlogs(page, size) {
  try {
    const { data } = await useFetch(`/api/blogs?page=${page}&pageSize=${size}`);
    if (data.value) {
      blogsData.value = data.value.data;
      currentPage.value = data.value.page;
      pageSize.value = data.value.pageSize;
      totalPages.value = data.value.totalPages;
      totalItems.value = data.value.totalItems;
      groupBlogsByYear();
    }
  } catch (error) {
    console.error('Failed to fetch blogs:', error);
  }
}

watch(
  () => route.query,
  (newQuery) => {
    const page = parseInt(newQuery.page) || 1;
    const size = parseInt(newQuery.pageSize) || pageSize.value;
    fetchBlogs(page, size);
  },
  { immediate: true }
);

function goToPage(page) {
  if (page >= 1 && page <= totalPages.value) {
    router.push({ query: { ...route.query, page } });
  } else {
    alert('Invalid page number');
  }
}

</script>

<style lang="scss" scoped></style>
