<template>
    <article>
        <header class="blog-header">
            <h1 class="blog-title">{{ blog.metaData.title }}</h1>
            <div class="blog-info">
                <span class="blog-date">{{ blog.metaData.date }}</span>
                <span class="carve">·</span>
                <span class="blog-extra">1000 words</span>
                <span class="carve">·</span>
                <span class="blog-extra">3 mins</span>
            </div>
            <div class="blog-illustration">
                <img src="https://blog.hesiy.cn/posts/summary-posts/cover.svg" alt="">
            </div>
        </header>
        <section class="blog-content">
            <div class="markdown-body"  v-html="blog.htmlContent"></div>
            <TableOfContents />
        </section>
        
    </article>
</template>
  
<script setup>
defineProps({
    blog: {
        type: Object,
        required: true,
    },
});
</script>

<style>
@import url("~/assets/css/markdown.css");
</style>
  
<style scoped>
article {
    font-size: 1.6rem;
}
.blog-title {
    font-size: 2.25em;
    margin-bottom: 0.8rem;
}
.blog-info {
    display: flex;
    align-items: center;
    margin-bottom: 1em;
    margin-top: 2rem;
}
.carve {
    padding: 0 .5rem;
    color: var(--fg);
}

.blog-date, .blog-extra {
    color: var(--fg);
}
.blog-illustration {
    max-width: 65ch;
}
.blog-illustration img {
    border-radius: .375rem;
    width: 100%;
}
.blog-content {
    margin-top: 1.25rem;
    display: flex;
    flex-direction: row;
}
</style>