<template>
  <aside class="toc-container">
    <div class="toc-header">
      <svg class="toc-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="8" y1="6" x2="21" y2="6"/>
        <line x1="8" y1="12" x2="21" y2="12"/>
        <line x1="8" y1="18" x2="21" y2="18"/>
        <line x1="3" y1="6" x2="3.01" y2="6"/>
        <line x1="3" y1="12" x2="3.01" y2="12"/>
        <line x1="3" y1="18" x2="3.01" y2="18"/>
      </svg>
      <span>本页目录</span>
    </div>

    <nav class="toc-nav" v-if="headings.length > 0">
      <a
        v-for="(heading, index) in headings"
        :key="index"
        :href="`#${heading.id}`"
        :class="['toc-link', `toc-level-${heading.level}`, { active: activeId === heading.id }]"
        @click.prevent="scrollToHeading(heading.id)"
      >
        {{ heading.text }}
      </a>
    </nav>

    <div v-else class="toc-empty">
      <p>暂无目录</p>
    </div>
  </aside>
</template>

<script setup>
const props = defineProps({
  content: String,
});

const headings = ref([]);
const activeId = ref('');

// 解析内容中的标题
function parseHeadings(content) {
  if (!content) {
    headings.value = [];
    return;
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(content, 'text/html');
  headings.value = Array.from(doc.querySelectorAll('h2, h3, h4')).map((heading) => ({
    id: heading.id || heading.textContent.replace(/\s+/g, '-').toLowerCase(),
    text: heading.textContent,
    level: parseInt(heading.tagName[1]),
  }));
}

let scrollContainer = null;

// 滚动到指定标题
function scrollToHeading(id) {
  activeId.value = id;
  const element = document.getElementById(id);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

// 监听滚动，高亮当前标题
function updateActiveHeading() {
  if (typeof window === 'undefined' || !scrollContainer) return;

  const headingElements = headings.value.map(h => document.getElementById(h.id)).filter(Boolean);
  if (headingElements.length === 0) return;

  const scrollTop = scrollContainer.scrollTop;

  // 从后向前遍历，找到第一个在滚动位置以上的标题
  for (let i = headingElements.length - 1; i >= 0; i--) {
    const element = headingElements[i];
    if (element) {
      // 获取元素相对于文档的位置
      const rect = element.getBoundingClientRect();
      const containerRect = scrollContainer.getBoundingClientRect();

      // 元素顶部相对于容器顶部的位置
      if (rect.top - containerRect.top <= 120) {
        activeId.value = element.id;
        return;
      }
    }
  }

  // 如果没有找到，默认高亮第一个
  if (headingElements.length > 0) {
    activeId.value = headingElements[0].id;
  }
}

onMounted(() => {
  parseHeadings(props.content);

  // 查找滚动容器（.main-container）
  nextTick(() => {
    scrollContainer = document.querySelector('.main-container');

    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', updateActiveHeading);
      updateActiveHeading();
    }
  });
});

onUnmounted(() => {
  if (scrollContainer) {
    scrollContainer.removeEventListener('scroll', updateActiveHeading);
  }
});

watch(() => props.content, (newContent) => {
  parseHeadings(newContent);
  nextTick(() => {
    // 确保滚动容器已找到
    if (!scrollContainer) {
      scrollContainer = document.querySelector('.main-container');
      if (scrollContainer) {
        scrollContainer.addEventListener('scroll', updateActiveHeading);
      }
    }
    updateActiveHeading();
  });
});
</script>

<style lang="scss" scoped>
.toc-container {
  width: 240px;
  padding: 2rem 1.5rem;
  position: fixed;
  right: 0;
  top: 80px;
  bottom: 0;
  overflow-y: auto;
  border-left: 1px solid rgba(var(--color-neutral-200), 0.6);
  background: var(--bg);
  z-index: 10;
}

.toc-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid rgba(var(--color-neutral-200), 0.4);
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-color);

  .toc-icon {
    width: 16px;
    height: 16px;
    color: var(--color);
  }
}

.toc-nav {
  display: flex;
  flex-direction: column;
}

.toc-link {
  display: block;
  padding: 0.5rem 0;
  font-size: 0.875rem;
  color: var(--fg-deep);
  text-decoration: none;
  line-height: 1.4;
  transition: all 0.2s ease;
  border-left: 2px solid transparent;
  padding-left: 0.75rem;
  margin-left: -0.75rem;

  &:hover {
    color: var(--color);
  }

  &.active {
    color: var(--color);
    font-weight: 600;
    border-left-color: var(--color);
  }

  &.toc-level-2 {
    padding-left: 0.75rem;
  }

  &.toc-level-3 {
    padding-left: 1.5rem;
    font-size: 0.8125rem;
  }

  &.toc-level-4 {
    padding-left: 2.25rem;
    font-size: 0.75rem;
  }
}

.toc-empty {
  text-align: center;
  padding: 2rem 0;
  color: var(--fg);
  font-size: 0.875rem;

  p {
    margin: 0;
  }
}

// 深色模式
:global(.dark) {
  .toc-container {
    border-left-color: rgba(var(--color-neutral-700), 0.6);
  }

  .toc-header {
    border-bottom-color: rgba(var(--color-neutral-700), 0.4);
  }
}

// 响应式
@media (max-width: 1280px) {
  .toc-container {
    width: 200px;
    padding: 1.5rem 1rem;
  }

  .toc-link {
    font-size: 0.8125rem;

    &.toc-level-3 {
      font-size: 0.75rem;
    }

    &.toc-level-4 {
      font-size: 0.6875rem;
    }
  }
}

@media (max-width: 1024px) {
  .toc-container {
    display: none;
  }
}
</style>
