<template>
  <div class="blog-preview">
    <div>
      <img src="https://blog.hesiy.cn/posts/summary-posts/cover.svg" alt="">
    </div>
    <div>
      <NuxtLink :to="`/blogs/${blog.path}`"><h3 class="title">{{ blog.title }}</h3></NuxtLink>
      <div class="metadata">{{ blog.date }}<span class="carve">·</span>1000 words<span class="carve">·</span>5 mins</div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  blog: {
    type: Object,
    required: true,
  },
});
</script>

<style scoped>
.blog-preview {
  max-width: 72rem;
  display: flex;
  padding: 1rem;
  margin-bottom: 1rem;
  transition: transform 0.2s ease-in-out;
}
.blog-preview img {
  width: 16rem;
  border-radius: .6rem;
}
.blog-preview a {
  text-decoration: none;
}

.blog-preview:hover {
  transform: translateY(-5px);
}

.title {
  margin-left: 2rem;
  font-size: 2rem;
  color: #333;
}

.metadata {
  display: flex;
  align-items: center;
  margin: 1rem 0 0 2rem;
  font-size: 1.4rem;
  color: var(--fg);
}

.carve {
    padding: 0 .5rem;
    color: var(--fg);
}

</style>