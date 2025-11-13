<template>
  <article>
    <header class="max-w-prose">
      <nav
        class="breadcrumb mb-6 text-sm text-neutral-500 print:hidden dark:text-neutral-400"
      >
        <NuxtLink to="/" class="hover:underline">首页</NuxtLink>
        <span class="px-1 text-primary-500">/</span>
        <NuxtLink to="/posts" class="hover:underline">所有文章</NuxtLink>
        <span class="px-1 text-primary-500">/</span>
      </nav>

      <h1
        class="mt-0 text-4xl font-extrabold text-neutral-900 dark:text-neutral"
      >
        {{ post.metaData.title }}
      </h1>

      <div
        class="mt-8 text-base text-neutral-500 dark:text-neutral-400 print:hidden"
      >
        <div class="flex flex-row flex-wrap items-center gap-x-2">
          <time>{{ post.metaData.date }}</time>
          <span class="px-2 text-primary-500">·</span>
          <span v-if="post.metaData.readingTime">{{ post.metaData.readingTime }}</span>
          <span v-if="post.metaData.readingTime" class="px-2 text-primary-500">·</span>
          <div
            class="my-1 flex flex-wrap text-xs leading-relaxed text-neutral-500 dark:text-neutral-400"
          >
            <NuxtLink
              v-for="(tag, index) in post.metaData.tags"
              :key="index"
              :to="`/tags/${tag}`"
              class="mx-1 my-1 rounded-md border border-neutral-200 px-1 py-[1px] hover:border-primary-300 hover:text-primary-700 dark:border-neutral-600 dark:hover:border-primary-600 dark:hover:text-primary-400"
            >
              {{ tag }}
            </NuxtLink>
          </div>
        </div>
      </div>

      <div v-if="post.metaData.cover" class="mt-12 prose dark:prose-invert">
        <img
          class="mb-6 -mt-4 rounded-md"
          loading="lazy"
          :src="post.metaData.cover"
          alt=""
        />
      </div>
    </header>

    <section
      class="flex flex-col max-w-full mt-0 prose dark:prose-invert lg:flex-row"
    >
      <div class="order-first px-0 lg:order-last lg:max-w-xs lg:ps-8">
        <aside class="toc pe-5 print:hidden lg:sticky lg:top-10">
          <div class="-ms-5 py-2 ps-5">
            <PostCatalog :headings="headings" :active-id="activeId" />
          </div>
        </aside>
      </div>

      <div
        class="post-content min-w-0 min-h-0 max-w-prose grow"
        ref="contentRef"
        v-html="post.htmlContent"
      ></div>
    </section>
  </article>
</template>

<script setup>
const props = defineProps({
  post: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["scroll"]);

// 目录数据
const headings = ref([]);
const activeId = ref("");
const contentRef = ref(null);

// 解析内容中的标题
function parseHeadings() {
  if (!contentRef.value) {
    headings.value = [];
    return;
  }

  // 查找所有标题元素
  const headingElements = Array.from(
    contentRef.value.querySelectorAll("h2, h3, h4")
  );

  const parsedHeadings = headingElements.map((heading) => ({
    id:
      heading.id ||
      heading.textContent?.replace(/\s+/g, "-").toLowerCase() ||
      "",
    text: heading.textContent || "",
    level: parseInt(heading.tagName[1]),
    children: [],
  }));

  // 构建层级结构
  const rootHeadings = [];
  const stack = [];

  for (const heading of parsedHeadings) {
    // 弹出比当前级别更高级别的标题
    while (stack.length > 0 && stack[stack.length - 1].level >= heading.level) {
      stack.pop();
    }

    if (stack.length === 0) {
      // 顶级标题
      rootHeadings.push(heading);
    } else {
      // 作为子标题添加到栈顶标题的children中
      stack[stack.length - 1].children.push(heading);
    }

    // 当前标题入栈
    stack.push(heading);
  }

  headings.value = rootHeadings;
}

// 监听滚动，高亮当前标题
function updateActiveHeading() {
  if (typeof window === "undefined" || !contentRef.value) return;

  const headingElements = headings.value
    .map((h) => document.getElementById(h.id))
    .filter(Boolean);
  if (headingElements.length === 0) return;

  // 获取页面滚动的位置
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  const windowHeight = window.innerHeight;

  // 找到在视窗内的标题
  let currentActiveId = headingElements[0].id;

  for (const element of headingElements) {
    if (element) {
      const rect = element.getBoundingClientRect();
      // 检查标题是否在视窗内（允许一定的偏移）
      if (rect.top <= windowHeight * 0.3) {
        currentActiveId = element.id;
      }
    }
  }

  // 如果滚动到了页面底部，直接选中最后一个标题
  const documentHeight = document.documentElement.scrollHeight;
  const maxScrollTop = documentHeight - windowHeight;

  if (scrollTop >= maxScrollTop - 50) {
    currentActiveId = headingElements[headingElements.length - 1].id;
  }

  activeId.value = currentActiveId;
}

// 监听内容变化，解析标题
watch(
  () => props.post.htmlContent,
  () => {
    nextTick(() => {
      parseHeadings();
      updateActiveHeading();
    });
  }
);

// 组件挂载后解析标题和监听滚动
onMounted(() => {
  nextTick(() => {
    parseHeadings();
    updateActiveHeading();
  });

  if (typeof window !== "undefined") {
    window.addEventListener("scroll", updateActiveHeading);
  }
});

onUnmounted(() => {
  if (typeof window !== "undefined") {
    window.removeEventListener("scroll", updateActiveHeading);
  }
});
</script>

<style>
.prose
  :where(a):not(:where([class~="not-prose"], [class~="not-prose"] *)):hover {
  background-color: transparent !important;
  color: var(--color) !important;
}

html {
  scroll-behavior: smooth;
}
</style>
