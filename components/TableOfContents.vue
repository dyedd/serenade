<template>
    <div class="blog-toc">
        <ul>
            <li v-for="item in headings" :key="item.id" :class="{ active: item.id === activeId }">
                <a :href="`#${item.id}`" @click.prevent="scrollToHeading(item.id)">{{ item.id }}</a>
            </li>
        </ul>
    </div>
</template>
  
<script setup>
const headings = ref([]);

onMounted(() => {
    const collectedHeadings = [...document.querySelectorAll('.blog-content h1, .blog-content h2, .blog-content h3, .blog-content h4, .blog-content h5, .blog-content h6')].map((heading) => {
        return {
            id: heading.id,
            level: heading.tagName.toLowerCase(),
        };
    });
    headings.value = collectedHeadings;
});

function scrollToHeading(id) {
    const headingElement = document.getElementById(id);
    if (headingElement) {
        headingElement.scrollIntoView({ behavior: 'smooth' });
    }
}
const activeId = ref('');

// watch(() => {
//     window.addEventListener('scroll', () => {
//         const fromTop = window.scrollY;
//         headings.value.forEach((heading) => {
//             const section = document.getElementById(heading.id);
//             if (
//                 section.offsetTop <= fromTop &&
//                 section.offsetTop + section.offsetHeight > fromTop
//             ) {
//                 activeId.value = heading.id;
//             }
//         });
//     });
// });
</script>
  
<style scoped>
.blog-toc {
    padding-inline-start: 2rem;
    position: sticky;
    max-height: 100vh;
    overflow-y: auto;
    padding-bottom: 5rem;
    top: 2rem;
}
.blog-toc ul, .blog-toc li {
    list-style-type: none;
    line-height: 1.375;
}
.blog-toc li {
    margin-top: .5em;
    margin-bottom: .5em;
}
.blog-toc a {
    font-weight: 400;
    color: var(--fg);
    text-decoration-color: var(--color);
}
.blog-toc a:hover {
    background-color: var(--color);
    text-decoration: none;
    color: #fff;
    border-radius: .09rem;
}
</style>
  