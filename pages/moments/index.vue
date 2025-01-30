<template>
  <header>
    <h1 class="mt-0 text-4xl font-extrabold text-neutral-900 dark:text-neutral">
      有朋自远方来 🫡
    </h1>
  </header>
  <section
    class="mt-0 prose flex max-w-full flex-col dark:prose-invert lg:flex-row"
  >
    <div class="min-h-0 min-w-0 max-w-prose grow">
      <blockquote>
        <p><strong>申请友链前必读</strong></p>
        <ul>
          <li>
            <p>
              申请友链时请确保您的站点同时也有我们的站点的友链，若审批通过后移除本站链接，本站也将移除友链，并加入黑名单。
            </p>
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
      <div class="mt-4">
        <p><strong>友链申请方式</strong></p>
        <p>
          请将你的友链信息按照以下格式发送至<a href="mailto:1176996982@qq.com"
            >邮箱</a
          >
        </p>
      </div>

      <div class="mt-4">
        <p><strong>我的友链信息</strong></p>
        <pre class="language-json">
          <code>
          {
            "name": "染念",
            "url": "https://dyedd.cn",
            "logo": "https://dyedd.cn/logo.jpg",
            "description": "Writing code, painful and happy",
            "rss": "https://dyedd.cn/rss"
          }
          </code>
        </pre>
      </div>
    </div>
  </section>
  <section
    class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-6"
  >
    <template v-if="!loading">
      <div v-for="site in sites" :key="site.siteUrl" class="mb-12">
        <div
          @mouseover="
            loadArticles(site);
            hoveredSite = site.siteUrl;
          "
          @mouseleave="hoveredSite = null"
          class="relative flex flex-col items-center justify-center p-4 rounded transition-transform duration-300 hover:bg-neutral-50 min-h-[200px]"
        >
          <a
            :href="site.siteUrl"
            target="_blank"
            role="link"
            :aria-label="`Go to ${site.siteName}`"
            class="flex flex-col items-center w-full"
            rel="noreferrer"
          >
            <div
              v-if="hoveredSite !== site.siteUrl"
              class="flex flex-col items-center"
            >
              <div class="box-border mb-2">
                <div class="relative inline-block h-full w-full">
                  <div
                    class="size-full bg-cover bg-center bg-no-repeat transition-opacity duration-300"
                  >
                    <img
                      :src="site.siteLogo"
                      height="64"
                      width="64"
                      loading="lazy"
                      :alt="`Avatar of ${site.siteName}`"
                      class="aspect-square shadow-lg"
                      style="border-radius: 1.5rem"
                    />
                  </div>
                </div>
              </div>
              <span class="text-lg font-medium text-center">{{
                site.siteName
              }}</span>
              <span
                class="line-clamp-2 text-balance break-all text-center text-sm text-gray-700"
              >
                {{ site.description || "这个人很懒，没有留下简介" }}
              </span>
            </div>
            <div v-else class="w-full">
              <div v-if="site.articlesLoading" class="text-center py-4">
                <span>加载文章中...</span>
              </div>
              <ul v-else-if="site.articles?.length">
                <li
                  v-for="article in site.articles"
                  :key="article.link"
                  class="mb-2 flex justify-between items-center"
                >
                  <a
                    :href="article.link"
                    target="_blank"
                    class="text-blue-600 hover:underline truncate w-3/4"
                  >
                    {{ article.title }}
                  </a>
                  <p class="text-sm text-gray-500 flex-shrink-0 ml-2">
                    {{ new Date(article.pubDate).toLocaleDateString() }}
                  </p>
                </li>
              </ul>
              <div v-else class="text-center py-4">
                <span>RSS获取失败</span>
              </div>
            </div>
          </a>
        </div>
      </div>
    </template>
    <template v-else>
      <SkeletonCard v-for="n in 6" :key="n" />
    </template>
  </section>
</template>

<script setup>
const hoveredSite = ref(null);
const sites = ref([]);
const loading = ref(true);

// 首次加载：不带 url 参数获取基础信息
try {
  const { data } = await useFetch("/api/moments");
  if (data.value) {
    sites.value = data.value.results.map((site) => ({
      ...site,
      articles: null,
      articlesLoading: false,
    }));
    loading.value = false;
  }
} catch (error) {
  console.error("Failed to load base info:", error);
}
// 加载当前站点文章
const loadArticles = async (site) => {
  // 如果已经有文章数据或正在加载,直接返回
  if (site.articles?.length || site.articlesLoading) return;

  site.articlesLoading = true;
  try {
    const { data } = await useFetch(`/api/moments?url=${site.siteUrl}`);
    const siteResult = data.value?.results?.[0];
    if (siteResult?.articles) {
      site.articles = siteResult.articles;
    }
  } catch (error) {
    console.error("Failed to load articles:", error);
  }
  site.articlesLoading = false;
};
</script>

<style scoped></style>
