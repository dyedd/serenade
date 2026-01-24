<template>
  <aside class="sidebar">
    <!-- 专栏头部 -->
    <div class="sidebar-header">
      <NuxtLink to="/columns" class="back-link">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
        返回专栏
      </NuxtLink>

      <div class="column-info">
        <h2 class="column-title">{{ columnTitle }}</h2>
        <span class="column-badge" :class="badgeClass">{{ columnType }}</span>
      </div>
    </div>

    <!-- 专栏概览 -->
    <div class="sidebar-nav">
      <div
        class="nav-item overview-item"
        :class="{ active: !currentChapterIndex }"
        @click="selectOverview"
      >
        <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
        </svg>
        <span>专栏概览</span>
      </div>

      <!-- 章节列表 -->
      <div class="chapters-section">
        <div class="section-title">章节目录</div>
        <div
          v-for="(chapter, index) in chapters"
          :key="index"
          class="nav-item chapter-item"
          :class="{ active: currentChapterIndex === index }"
          @click="selectChapter(index)"
        >
          <span class="chapter-number">{{ index + 1 }}</span>
          <span class="chapter-title">{{ chapter.metaData.title || `章节 ${index + 1}` }}</span>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup>
const props = defineProps({
  columnType: {
    type: String,
    default: ''
  },
  columnTitle: {
    type: String,
    default: ''
  },
  chapters: {
    type: Array,
    default: () => []
  },
  currentChapterIndex: {
    type: Number,
    default: null
  }
})

const emit = defineEmits(['selectChapter', 'selectOverview'])

const badgeClass = computed(() => {
  if (props.columnType === '公开') {
    return {
      'badge-public': true,
      'badge-private': false
    }
  } else if (props.columnType === '私有') {
    return {
      'badge-public': false,
      'badge-private': true
    }
  } else {
    return {
      'badge-public': false,
      'badge-private': false
    }
  }
})

const selectChapter = (index) => {
  emit('selectChapter', index)
}

const selectOverview = () => {
  emit('selectOverview')
}
</script>

<style lang="scss" scoped>
.sidebar {
  width: 280px;
  height: 100vh;
  background: var(--bg);
  border-right: 1px solid rgba(var(--color-neutral-200), 0.5);
  display: flex;
  flex-direction: column;
  position: sticky;
  top: 0;
  overflow-y: auto;
}

// 侧边栏头部
.sidebar-header {
  padding: 1.5rem;
  padding-bottom: 1rem;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: var(--fg);
  text-decoration: none;
  margin-bottom: 1.25rem;
  transition: all 0.2s ease;
  font-weight: 500;

  svg {
    width: 16px;
    height: 16px;
    transition: transform 0.2s ease;
  }

  &:hover {
    color: var(--color);
    
    svg {
      transform: translateX(-3px);
    }
  }
}

.column-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.column-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--text-color);
  margin: 0;
  line-height: 1.4;
}

.column-badge {
  display: inline-block;
  padding: 0.15rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.7rem;
  font-weight: 600;
  white-space: nowrap;
  flex-shrink: 0;

  &.badge-public {
    background: rgba(59, 130, 246, 0.1);
    color: rgb(37, 99, 235);
  }

  &.badge-private {
    background: rgba(251, 146, 60, 0.1);
    color: rgb(234, 88, 12);
  }
}

:global(.dark) .column-badge {
  &.badge-public {
    background: rgba(59, 130, 246, 0.15);
    color: rgb(96, 165, 250);
  }

  &.badge-private {
    background: rgba(251, 146, 60, 0.15);
    color: rgb(251, 146, 60);
  }
}

// 导航区域
.sidebar-nav {
  flex: 1;
  overflow-y: auto;
  padding: 0.5rem 1rem 2rem 1rem;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.625rem 0.875rem;
  margin-bottom: 0.25rem;
  cursor: pointer;
  transition: all 0.2s ease;
  color: var(--fg-deep);
  font-size: 0.9rem;
  border-radius: 8px;

  &:hover {
    background: rgba(var(--color-neutral-100), 0.8);
    color: var(--color);
  }

  &.active {
    background: rgba(var(--color-primary-50), 0.6);
    color: var(--color);
    font-weight: 600;
  }
}

.overview-item {
  margin-bottom: 1.5rem;
  
  .nav-icon {
    width: 18px;
    height: 18px;
    opacity: 0.8;
  }
  
  &.active .nav-icon {
    opacity: 1;
  }
}

.chapters-section {
  margin-top: 0.5rem;
}

.section-title {
  padding: 0 0.875rem;
  margin-bottom: 0.75rem;
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--fg);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  opacity: 0.7;
}

.chapter-item {
  .chapter-number {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: rgba(var(--color-neutral-200), 0.5);
    font-size: 0.7rem;
    font-weight: 600;
    color: var(--fg);
    flex-shrink: 0;
    transition: all 0.2s ease;
  }

  &.active .chapter-number {
    background: var(--color);
    color: white;
  }
  
  &:hover:not(.active) .chapter-number {
    background: rgba(var(--color-neutral-300), 0.5);
  }

  .chapter-title {
    flex: 1;
    line-height: 1.4;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }
}

// 深色模式
:global(.dark) .sidebar {
  background: var(--bg);
  border-right-color: rgba(255, 255, 255, 0.05);
}

:global(.dark) .nav-item {
  &:hover {
    background: rgba(255, 255, 255, 0.05);
  }

  &.active {
    background: rgba(var(--color-primary-900), 0.2);
  }
}

:global(.dark) .chapter-number {
  background: rgba(255, 255, 255, 0.1);
  color: var(--fg-deep);
}

// 响应式
@media (max-width: 1024px) {
  .sidebar {
    width: 240px;
  }
}

@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    left: -280px;
    z-index: 100;
    transition: left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 4px 0 16px rgba(0,0,0,0.1);

    &.mobile-open {
      left: 0;
    }
  }
}
</style>
