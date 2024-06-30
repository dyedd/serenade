<template>
    <header>
        <h1 class="mt-0 text-4xl font-extrabold text-neutral-900 dark:text-neutral">有朋自远方来 🫡</h1>
    </header>
    <section class="mt-0 prose flex max-w-full flex-col dark:prose-invert lg:flex-row">
        <div class="min-h-0 min-w-0 max-w-prose grow">
            <blockquote>
                <p><strong>申请友链前必读</strong></p>
                <ul>
                    <li>
                        <p>申请友链时请确保您的站点同时也有我们的站点的友链，若审批通过后移除本站链接，本站也将移除友链，并加入黑名单。</p>
                    </li>
                    <li>
                        <p>确保您的网站不存在政治敏感问题及违法内容。</p>
                    </li>
                    <li>
                        <p>确保站点可以以 HTTPS 访问。</p>
                    </li>
                    <li>
                        <p>不同意商业及非个人的网站的友链申请。</p>
                    </li>
                </ul>
            </blockquote>
        </div>
    </section>
    <section class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-6" v-if="!loading">
        <div v-for="site in post.results" :key="site.siteUrl" class="mb-12">
            <div @mouseover="hoveredSite = site.siteUrl" @mouseleave="hoveredSite = null"
                class="relative flex flex-col items-center justify-center p-4 rounded transition-transform duration-300 hover:bg-neutral-50 min-h-[200px]">
                <a :href="site.siteUrl" target="_blank" role="link" :aria-label="`Go to ${site.siteName}`"
                    class="flex flex-col items-center w-full" rel="noreferrer">
                    <div v-if="hoveredSite !== site.siteUrl" class="flex flex-col items-center">
                        <div class="box-border mb-2">
                            <div class="relative inline-block h-full w-full">
                                <div class="size-full bg-cover bg-center bg-no-repeat transition-opacity duration-300">
                                    <img :src="site.siteLogo" height="64" width="64" loading="lazy"
                                        :alt="`Avatar of ${site.siteName}`" class="aspect-square shadow-lg"
                                        style="border-radius: 1.5rem;" />
                                </div>
                            </div>
                        </div>
                        <span class="text-lg font-medium text-center">{{ site.siteName }}</span>
                        <span class="line-clamp-2 text-balance break-all text-center text-sm text-gray-700">
                            {{ site.description || "这个人很懒，没有留下简介" }}
                        </span>
                    </div>
                    <div v-else class="w-full">
                        <ul>
                            <li v-for="article in site.articles" :key="article.link"
                                class="mb-2 flex justify-between items-center">
                                <a :href="article.link" target="_blank"
                                    class="text-blue-600 hover:underline truncate w-3/4">
                                    {{ article.title }}
                                </a>
                                <p class="text-sm text-gray-500 flex-shrink-0 ml-2">{{ new
                                    Date(article.pubDate).toLocaleDateString() }}</p>
                            </li>
                        </ul>
                    </div>
                </a>
            </div>
        </div>
    </section>
    <section v-else>
        数据加载中...
    </section>
</template>

<script setup>


const hoveredSite = ref(null)
const post = ref(null)
const loading = ref(true)

onMounted(async () => {
    const { data } = await useFetch('/api/moments')
    if (data.value) {
        post.value = data.value
    }
    loading.value = false
})
</script>

<style scoped></style>