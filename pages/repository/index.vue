<template>
  <header>
    <h1 class="mt-0 text-4xl font-extrabold text-neutral-900 dark:text-neutral">欢迎来到我的博客 🎉</h1>
  </header>
  <section class="mt-0 prose flex max-w-full flex-col dark:prose-invert lg:flex-row">
    <div class="min-h-0 min-w-0 max-w-prose grow">
      <blockquote>
        <p>你可以通过
          <a href="/posts/index.xml">RSS</a> 订阅所有文章
        </p>
      </blockquote>
      <p>「所有文章」加起来有 10 篇，共 12,465 字</p>
    </div>
  </section>
  <section v-if="blogsData?.length > 0">
    <template v-for="blog in blogsData" :key="blog.id">
      <BlogPreview :blog="blog" />
    </template>
  </section>
  <sectio v-else>
    Loading blogs...
  </sectio>

</template>

<script setup>
definePageMeta({
  layout: "default",
});
const blogsData = ref([]);
try {
  const { data } = await useFetch('/api/blogs');
  console.log(data.value)
  blogsData.value = data.value;
} catch (error) {
  console.error('Failed to fetch blogs:', error);
}
</script>

<style lang="scss" scoped>


</style>
