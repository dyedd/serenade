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
  const parsedHeadings = Array.from(doc.querySelectorAll('h2, h3, h4')).map((heading) => ({
    id: heading.id || heading.textContent.replace(/\s+/g, '-').toLowerCase(),
    text: heading.textContent,
    level: parseInt(heading.tagName[1]),
  }));

  headings.value = parsedHeadings;

  // 为DOM中的标题添加ID
  nextTick(() => {
    const mainContent = document.querySelector('.main-container .markdown-body');
    if (mainContent) {
      parsedHeadings.forEach((heading) => {
        // 根据文本内容查找对应的标题元素
        const headingElements = mainContent.querySelectorAll(`h${heading.level}`);
        for (const el of headingElements) {
          if (el.textContent.trim() === heading.text.trim()) {
            if (!el.id) {
              el.id = heading.id;
            }
            break;
          }
        }
      });
    }
  });
}

// 监听滚动，高亮当前标题
function updateActiveHeading() {
  if (typeof window === 'undefined') return;

  const headingElements = headings.value.map(h => document.getElementById(h.id)).filter(Boolean);
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

onMounted(() => {
  parseHeadings(props.content);

  // 监听窗口滚动
  nextTick(() => {
    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', updateActiveHeading);
      // 延迟一点时间再更新，确保标题ID已经添加
      setTimeout(updateActiveHeading, 100);
    }
  });
});

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('scroll', updateActiveHeading);
  }
});

watch(() => props.content, (newContent) => {
  parseHeadings(newContent);
  // 内容变化后，重新设置滚动监听
  nextTick(() => {
    // 延迟更新active状态，确保标题ID已经添加
    setTimeout(updateActiveHeading, 100);
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
