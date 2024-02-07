<template>
  <header>
    <h1>欢迎来到我的博客 🎉</h1>
  </header>
  <section>
    <blockquote>
      <p>你可以通过
        <a href="/posts/index.xml">RSS</a> 订阅所有文章
      </p>
    </blockquote>
  </section>
  <div v-if="blogsData?.length > 0">
    <div v-for="single in blogsData" :key="single.year">
      <h2>{{ single.year }}</h2>
      <hr>
      <BlogPreview v-for="blog in single.blogs" :key="blog.path" :blog="blog" />
    </div>
  </div>
  <div v-else>
    Loading blogs...
  </div>
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
h1 {
  font-size: 2.25rem;
  line-height: 2.5rem;
}

h2 {
  font-size: 2.5rem;
  line-height: 4rem;
  font-weight: 700;
}
hr {
  width: 18rem;
  margin-bottom: 2rem;
}
blockquote {
  font-size: 1.6rem;
  font-weight: 500;
  font-style: italic;
  color: var(--fg);
  border-left: solid 0.5rem var(--color-50);
  margin-top: 1.6em;
  margin-bottom: 1.6em;

  p::before {
    content: open-quote;
  }

  p::after {
    content: close-quote;
  }
}</style>
