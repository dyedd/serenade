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

// 滚动到指定标题
function scrollToHeading(id) {
  const element = document.getElementById(id);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    activeId.value = id;
  }
}

// 监听滚动，高亮当前标题
function updateActiveHeading() {
  if (typeof window === 'undefined') return;

  const headingElements = headings.value.map(h => document.getElementById(h.id)).filter(Boolean);
  const scrollTop = window.scrollY || document.documentElement.scrollTop;

  for (let i = headingElements.length - 1; i >= 0; i--) {
    const element = headingElements[i];
    if (element && element.offsetTop - 100 <= scrollTop) {
      activeId.value = element.id;
      return;
    }
  }

  if (headingElements.length > 0) {
    activeId.value = headingElements[0].id;
  }
}

onMounted(() => {
  parseHeadings(props.content);
  window.addEventListener('scroll', updateActiveHeading);
  updateActiveHeading();
});

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('scroll', updateActiveHeading);
  }
});

watch(() => props.content, (newContent) => {
  parseHeadings(newContent);
  nextTick(() => {
    updateActiveHeading();
  });
});
</script>

<style lang="scss" scoped>
.toc-container {
  width: 240px;
  padding: 2rem 1.5rem;
  position: sticky;
  top: 0;
  height: 100vh;
  overflow-y: auto;
  border-left: 1px solid rgba(var(--color-neutral-200), 0.6);
  flex-shrink: 0;
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
