<template>
    <header>
        <ol class="text-sm text-neutral-500 print:hidden dark:text-neutral-400">
            <li class="hidden inline">
                <a class="dark:underline-neutral-600 decoration-neutral-300 hover:underline" href="/"></a><span
                    class="px-1 text-primary-500">/</span>
            </li>
            <li class=" inline">
                <a class="dark:underline-neutral-600 decoration-neutral-300 hover:underline" href="/tags">标签</a><span
                    class="px-1 text-primary-500">/</span>
            </li>
        </ol>
        <h1 class="mt-0 text-4xl font-extrabold text-neutral-900 dark:text-neutral">{{ tagName }}</h1>
    </header>
    <section v-if="blogsData?.length > 0">
        <template v-for="blog in blogsData" :key="blog.id">
            <BlogPreview :blog="blog" />
        </template>
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
const currentPage = ref(1);
const pageSize = ref(5);
const totalPages = ref(0);
const totalItems = ref(0);

const router = useRouter();
const route = useRoute();
const tagName = ref(route.params.path);

async function fetchBlogs(page, size) {
    try {
        const { data } = await useFetch(`/api/tags/${route.params.path}?page=${page}&pageSize=${size}`);
        if (data.value) {
            blogsData.value = data.value.data;
            currentPage.value = data.value.page;
            pageSize.value = data.value.pageSize;
            totalPages.value = data.value.totalPages;
            totalItems.value = data.value.totalItems;
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
// fetchBlogs(currentPage.value, pageSize.value);
</script>