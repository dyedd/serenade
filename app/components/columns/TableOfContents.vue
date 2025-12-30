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
  content: {
    type: String,
    default: ''
  }
})

const headings = ref([])
const activeId = ref('')
const isClient = import.meta.client
const scrollOffsetRatio = 0.3
const bottomOffset = 50

const buildHeadingId = (text, fallback) => {
  const normalized = text.trim().replace(/\s+/g, '-').toLowerCase()

  if (normalized.length > 0) {
    return normalized
  } else {
    return fallback
  }
}

const extractHeadingsFromDom = () => {
  if (isClient) {
    const mainContent = document.querySelector('.main-container .markdown-body')

    if (mainContent) {
      const elements = Array.from(mainContent.querySelectorAll('h2, h3, h4'))
      return elements.map((element, index) => {
        const text = element.textContent ? element.textContent.trim() : ''
        const level = Number.parseInt(element.tagName[1], 10)
        const fallbackId = `heading-${level}-${index}`
        const id = element.id || buildHeadingId(text, fallbackId)

        if (!element.id) {
          element.id = id
        } else {
          element.id = element.id
        }

        return {
          id,
          text,
          level
        }
      })
    } else {
      return []
    }
  } else {
    return []
  }
}

const refreshHeadings = () => {
  if (isClient) {
    const parsed = extractHeadingsFromDom()
    headings.value = parsed
  } else {
    headings.value = []
  }
}

const updateActiveHeading = () => {
  if (isClient) {
    const headingElements = headings.value
      .map((heading) => document.getElementById(heading.id))
      .filter((element) => Boolean(element))

    if (headingElements.length > 0) {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      const windowHeight = window.innerHeight
      let currentActiveId = headingElements[0].id

      headingElements.forEach((element) => {
        const rect = element.getBoundingClientRect()

        if (rect.top <= windowHeight * scrollOffsetRatio) {
          currentActiveId = element.id
        } else {
          currentActiveId = currentActiveId
        }
      })

      const documentHeight = document.documentElement.scrollHeight
      const maxScrollTop = documentHeight - windowHeight

      if (scrollTop >= maxScrollTop - bottomOffset) {
        currentActiveId = headingElements[headingElements.length - 1].id
      } else {
        currentActiveId = currentActiveId
      }

      activeId.value = currentActiveId
    } else {
      activeId.value = ''
    }
  } else {
    activeId.value = ''
  }
}

const setupScrollTracking = () => {
  if (isClient) {
    window.addEventListener('scroll', updateActiveHeading)
  } else {
    return
  }
}

const teardownScrollTracking = () => {
  if (isClient) {
    window.removeEventListener('scroll', updateActiveHeading)
  } else {
    return
  }
}

onMounted(() => {
  nextTick(() => {
    refreshHeadings()
    updateActiveHeading()
    setupScrollTracking()
  })
})

onUnmounted(() => {
  teardownScrollTracking()
})

watch(
  () => props.content,
  () => {
    nextTick(() => {
      refreshHeadings()
      updateActiveHeading()
    })
  }
)
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
