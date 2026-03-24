<template>
  <div class="friends-page">
    <header>
      <h1
        class="mt-0 text-4xl md:text-4xl text-3xl font-extrabold text-neutral-900 dark:text-neutral"
      >
        友链 🤝
      </h1>
    </header>

    <!-- 友链申请说明 -->
    <section
      class="mt-0 md:mt-4 prose flex max-w-full flex-col dark:prose-invert lg:flex-row mb-8"
    >
      <div class="min-h-0 min-w-0 max-w-prose grow">
        <blockquote class="text-sm md:text-base mb-8">
          <p class="font-bold mb-2">申请友链前必读</p>
          <ul class="list-disc pl-5 space-y-1">
            <li>
              申请友链时请确保您的站点同时也有我们的站点的友链，若审批通过后移除本站链接，本站也将移除友链，并加入黑名单。
            </li>
            <li>确保您的网站不存在政治敏感问题及违法内容。</li>
            <li>确保站点可以以 HTTPS 访问。</li>
            <li>不同意商业及非个人的网站的友链申请。</li>
          </ul>
        </blockquote>

        <div class="mt-8">
          <h3 class="text-lg font-bold mb-3 flex items-center gap-2">
            友链申请方式
          </h3>
          <p class="text-neutral-600 dark:text-neutral-400 mb-4">
            请将你的友链信息按照以下格式发送至
            <a
              :href="siteConfig.socialLinks.email.url"
              class="text-primary-500 hover:underline font-medium"
              >{{ siteConfig.friends.contactLabel }}</a
            >
          </p>

          <div
            class="code-block-wrapper my-6 rounded-lg overflow-hidden bg-[#282c34] shadow-lg border border-neutral-700/50"
          >
            <div
              class="code-header flex justify-between items-center px-4 py-1.5 bg-[#21252b] border-b border-neutral-700/50 text-xs text-neutral-300 select-none"
            >
              <span class="font-mono font-medium opacity-80">json</span>

              <button
                @click="handleCopy"
                class="copy-btn hover:text-white text-neutral-400 transition-colors cursor-pointer flex items-center gap-1.5 opacity-80 hover:opacity-100"
                aria-label="Copy code"
              >
                <svg
                  v-if="!copied"
                  xmlns="http://www.w3.org/2000/svg"
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                  <path
                    d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"
                  />
                </svg>

                <svg
                  v-else
                  xmlns="http://www.w3.org/2000/svg"
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="text-green-400"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>

                <span :class="{ 'text-green-400': copied }">{{
                  copied ? "Copied!" : "Copy"
                }}</span>
              </button>
            </div>

            <div class="code-body flex text-sm relative">
              <div
                class="line-numbers flex flex-col items-end px-3 py-3 text-neutral-500 bg-[#282c34] border-r border-neutral-700/30 select-none font-mono text-right min-w-[2.5rem] leading-relaxed"
              >
                <span v-for="line in friendApplicationLineNumbers" :key="line">{{ line }}</span>
              </div>

              <pre
                ref="codeBlock"
                class="flex-1 !my-0 !p-3 !bg-transparent overflow-x-auto custom-scrollbar"
              ><code class="hljs json !bg-transparent !p-0 font-mono leading-relaxed block">{{ friendApplicationTemplate }}</code></pre>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 友链列表部分 -->
    <section
      v-if="!isLoading && !hasError && sites.length > 0"
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-12"
    >
      <FriendsCard v-for="site in sites" :key="site.siteUrl" :site="site" />
    </section>

    <section v-else class="flex flex-col justify-center items-center py-20">
      <div v-if="isLoading" class="loading-dots">
        <span class="dot"></span>
        <span class="dot"></span>
        <span class="dot"></span>
      </div>
      <p v-else class="text-neutral-500 dark:text-neutral-400 mt-4">
        {{ fallbackMessage }}
      </p>
    </section>
  </div>
</template>

<script setup>
import { siteConfig } from '../../../site.config';

definePageMeta({
  layout: "default",
});

useHead({
  title: "友情链接",
  meta: [
    {
      name: "description",
      content: "友情链接页面，与优秀的人为邻，与有趣的灵魂相遇",
    },
  ],
});

const {
  data: sitesData,
  status,
  error,
} = await useFetch("/api/friends", {
  default: () => ({ results: [] }),
});

const sites = computed(() => {
  const results = sitesData.value?.results;

  if (Array.isArray(results)) {
    return results;
  } else {
    return [];
  }
});

const isLoading = computed(() => {
  return status.value === "pending";
});

const hasError = computed(() => {
  return Boolean(error.value);
});

const copied = ref(false);
const codeBlock = ref(null);
const friendApplicationTemplate = JSON.stringify(siteConfig.friends.applicationTemplate, null, 2);
const friendApplicationLineNumbers = friendApplicationTemplate
  .split(String.fromCharCode(10))
  .map((_, index) => index + 1);

const handleCopy = async () => {
  if (!codeBlock.value) return;

  const code = codeBlock.value.innerText;
  try {
    await navigator.clipboard.writeText(code);
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  } catch (err) {
    console.error("Failed to copy", err);
  }
};

const fallbackMessage = computed(() => {
  if (hasError.value) {
    return "加载失败，请稍后重试。";
  } else if (isLoading.value) {
    return "加载中...";
  } else {
    return "暂无友链";
  }
});
</script>

<style lang="scss" scoped>
// 友链总数样式
.total-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.25rem 0.75rem;
  font-size: 1.25rem;
  font-weight: 600;
  color: rgb(var(--color-primary-600));
  background: rgba(var(--color-primary-500), 0.1);
  border-radius: 8px;
  vertical-align: middle;
}

:global(.dark) .total-count {
  color: rgb(var(--color-primary-400));
  background: rgba(var(--color-primary-500), 0.15);
}

@media screen and (max-width: 768px) {
  .total-count {
    font-size: 1rem;
    padding: 0.2rem 0.6rem;
    margin-left: 0.5rem;
  }
}
</style>
