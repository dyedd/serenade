<template>
    <article>
        <header class="max-w-prose">
            <ol class="mb-6 text-sm text-neutral-500 print:hidden dark:text-neutral-400">
                <li class="inline">
                    <a class="dark:underline-neutral-600 decoration-neutral-300 hover:underline" href="/"></a><span
                        class="px-1 text-primary-500">$</span>
                </li>
                <li class=" inline">
                    <a class="dark:underline-neutral-600 decoration-neutral-300 hover:underline"
                        href="/posts/">所有文章</a><span class="px-1 text-primary-500">/</span>
                </li>
            </ol>
            <h1 class="mt-0 text-4xl font-extrabold text-neutral-900 dark:text-neutral">{{ post.metaData.title }}</h1>
            <div class="mt-8 text-base text-neutral-500 dark:text-neutral-400 print:hidden">
                <div class="flex flex-row flex-wrap items-center">
                    <time>{{ post.metaData.date }}</time>
                    <span class="px-2 text-primary-500">·</span>
                    <div class="my-1 flex flex-wrap text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
                        <a v-for="(tag, index) in post.metaData.tags" :key="index" :href="'/tags/' + tag"
                            class="mx-1 my-1 rounded-md border border-neutral-200 px-1 py-[1px] hover:border-primary-300 hover:text-primary-700 dark:border-neutral-600 dark:hover:border-primary-600 dark:hover:text-primary-400">{{
                tag }}</a>
                    </div>
                </div>

            </div>
            <div class="mt-12 prose" v-if="post.metaData.cover">
                <img class="mb-6 -mt-4 rounded-md" loading="lazy" :src="post.metaData.cover" alt="">
            </div>
        </header>
        <section class="flex flex-col max-w-full mt-0 prose dark:prose-invert lg:flex-row">

            <div class="order-first px-0 lg:order-last lg:max-w-xs lg:ps-8">
                <div class="toc pe-5 print:hidden lg:sticky lg:top-10">
                    <div class="-ms-5 py-2 ps-5 ">
                        <postCatalog. :headings="headings" :active-id="activeId" @click="scrollToHeading($event)" />
                    </div>
                </div>

            </div>
            <div class="post-content min-w-0 min-h-0 max-w-prose grow" v-html="post.htmlContent"></div>
        </section>

    </article>
</template>

<script setup>
const props = defineProps({
  post: {
    type: Object,
    required: true,
  },
})
const headings = ref([]);
const activeId = ref(null);

onMounted(() => {
    const collectedHeadings = [...document.querySelectorAll('.post-content h1, .post-content h2, .post-content h3, .post-content h4, .post-content h5, .post-content h6')];
    const headingHierarchy = [];
    let currentParent = { children: headingHierarchy };

    for (const heading of collectedHeadings) {
        const level = parseInt(heading.tagName.slice(1));
        const item = {
            id: heading.id,
            level: level,
            children: []
        };

        if (level > currentParent.level) {
            currentParent.children.push(item);
        } else {
            while (currentParent.level >= level) {
                currentParent = currentParent.parent;
            }
            currentParent.children.push(item);
        }

        item.parent = currentParent;
        currentParent = item;
    }

    headings.value = headingHierarchy;
});
const scrollToHeading = (id) => {
    activeId.value = id;
    const element = document.getElementById(id);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
    }
};
useHead({
  title: props.post.metaData.title
})
</script>
