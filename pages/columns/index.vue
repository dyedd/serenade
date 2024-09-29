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
  <section class="grid grid-cols-1 sm:grid-cols-4 lg:grid-cols-6 gap-4" v-if="items?.length > 0">
    <ColumnsCard v-for="item in items" :key="item.id" :id="item.id" :title="item.title" :type="item.type" :image="item.image" :description="item.description">
    </ColumnsCard>
  </section>
  <sectio v-else>
    <div><span class="w-2 h-2 ml-2 rounded-full bg-gray-200 inline-block animate-flash"></span><span
        class="w-2 h-2 ml-2 rounded-full bg-gray-200 inline-block animate-flash [animation-delay:0.2s]"></span><span
        class="w-2 h-2 ml-2 rounded-full bg-gray-200 inline-block animate-flash [animation-delay:0.4s]"></span></div>
  </sectio>

</template>

<script setup>
definePageMeta({
  layout: "default",
});
const items = ref([]);
try {
  const { data } = await useFetch('/api/columns');
  items.value = data.value;
} catch (error) {
  console.error('Failed to fetch colums:', error);
}
</script>

<style lang="scss" scoped></style>
