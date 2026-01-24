<template>
  <div class="main-container">
    <main class="content-main">
      <!-- 面包屑 -->
      <ColumnsBreadcrumb
        :columnTitle="columnMeta.title"
        :currentChapter="currentChapter"
        :readmeDate="columnMeta.date"
      />

      <!-- 主内容 -->
      <article class="markdown-body">
        <div
          v-html="!currentChapter ? readmeHtml : currentChapter.htmlContent"
        ></div>
      </article>

      <!-- 上一篇/下一篇导航 -->
      <nav v-if="prevChapter || nextChapter" class="page-nav">
        <div class="nav-item prev-item" v-if="prevChapter" @click="$emit('selectChapter', prevChapter.index)">
          <div class="nav-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </div>
          <div class="nav-text">
            <span class="nav-label">上一篇</span>
            <span class="nav-title">{{ prevChapter.title }}</span>
          </div>
        </div>
        <div v-else class="nav-spacer"></div>

        <div class="nav-item next-item" v-if="nextChapter" @click="$emit('selectChapter', nextChapter.index)">
          <div class="nav-text">
            <span class="nav-label">下一篇</span>
            <span class="nav-title">{{ nextChapter.title }}</span>
          </div>
          <div class="nav-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
          </div>
        </div>
      </nav>
    </main>

    <!-- 右侧 TOC -->
    <ColumnsTableOfContents
      v-if="currentChapter"
      :content="currentChapter.htmlContent"
    />
  </div>
</template>

<script setup>
defineProps({
  columnMeta: {
    type: Object,
    required: true
  },
  readmeHtml: {
    type: String,
    default: ''
  },
  currentChapter: {
    type: Object,
    default: null
  },
  prevChapter: {
    type: Object,
    default: null
  },
  nextChapter: {
    type: Object,
    default: null
  }
})

defineEmits(['selectChapter'])
</script>

<style lang="scss" scoped>
.main-container {
  flex: 1;
  display: flex;
  overflow-y: auto;
  padding-right: 240px; /* Space for TOC */
}

.content-main {
  flex: 1;
  padding: 3rem 4rem;
  max-width: 960px;
  margin: 0 auto;
}

// 面包屑
:deep(.breadcrumb) {
  margin-bottom: 2rem;
}

// Markdown 内容
.markdown-body {
  color: var(--text-color);
  line-height: 1.8;
  font-size: 1rem;

  :deep(h1) {
    font-size: 2.25rem;
    font-weight: 800;
    margin-top: 0;
    margin-bottom: 2rem;
    line-height: 1.2;
    color: var(--text-color);
    letter-spacing: -0.02em;
  }

  :deep(h2) {
    font-size: 1.75rem;
    font-weight: 700;
    margin-top: 3rem;
    margin-bottom: 1.5rem;
    color: var(--text-color);
    line-height: 1.3;
  }

  :deep(h3) {
    font-size: 1.35rem;
    font-weight: 600;
    margin-top: 2rem;
    margin-bottom: 1rem;
    color: var(--text-color);
  }

  :deep(p) {
    margin: 1.25rem 0;
    color: var(--fg-deep);
  }

  :deep(a) {
    color: var(--color);
    text-decoration: none;
    border-bottom: 1px solid rgba(var(--color-rgb), 0.3);
    transition: border-color 0.2s;

    &:hover {
      border-bottom-color: var(--color);
    }
  }

  :deep(code) {
    background: rgba(var(--color-neutral-100), 1);
    padding: 0.2em 0.4em;
    border-radius: 4px;
    font-size: 0.875em;
    color: rgb(var(--color-secondary-700));
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  }

  :deep(pre) {
    background: #282c34;
    padding: 1.25rem;
    border-radius: 8px;
    overflow-x: auto;
    margin: 1.5rem 0;
    color: #abb2bf;

    code {
      background: none;
      padding: 0;
      color: inherit;
      font-size: 0.875rem;
      line-height: 1.6;
    }
  }

  :deep(blockquote) {
    margin: 2rem 0;
    padding: 1rem 1.5rem;
    border-left: 4px solid var(--color);
    background: rgba(var(--color-primary-50), 0.3);
    border-radius: 0 8px 8px 0;
    font-style: italic;

    p {
      margin: 0;
    }
  }

  :deep(ul),
  :deep(ol) {
    padding-left: 1.5rem;
    margin: 1.25rem 0;

    li {
      margin: 0.5rem 0;
      color: var(--fg-deep);
    }
  }
  
  :deep(img) {
    max-width: 100%;
    height: auto;
    border-radius: 8px;
    margin: 2rem 0;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }
}

// 页面导航
.page-nav {
  display: flex;
  justify-content: space-between;
  gap: 2rem;
  margin-top: 4rem;
  padding-top: 2rem;
  border-top: 1px solid rgba(var(--color-neutral-200), 0.6);
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  flex: 1;
  max-width: 48%;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(var(--color-neutral-100), 0.5);
    
    .nav-title {
        color: var(--color);
    }
  }
}

.prev-item {
  justify-content: flex-start;
  text-align: left;
}

.next-item {
  justify-content: flex-end;
  text-align: right;
}

.nav-text {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.nav-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--fg);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.nav-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-color);
  line-height: 1.4;
  transition: color 0.2s ease;
}

.nav-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--fg);
  transition: transform 0.2s ease;
}

.prev-item:hover .nav-icon { transform: translateX(-3px); color: var(--color); }
.next-item:hover .nav-icon { transform: translateX(3px); color: var(--color); }

.nav-spacer { flex: 1; }

// 深色模式
:global(.dark) {
  .markdown-body {
    :deep(code) {
      background: rgba(var(--color-neutral-800), 0.6);
      color: rgb(var(--color-secondary-400));
    }

    :deep(blockquote) {
      background: rgba(var(--color-primary-900), 0.2);
    }
  }

  .page-nav {
    border-top-color: rgba(var(--color-neutral-700), 0.6);
  }
  
  .nav-item:hover {
      background: rgba(var(--color-neutral-800), 0.5);
  }
}

// 响应式
@media (max-width: 1024px) {
  .main-container {
    padding-right: 0; 
  }

  .content-main {
    padding: 2rem;
  }
}

@media (max-width: 768px) {
  .content-main {
    padding: 1.5rem;
  }

  .markdown-body {
    font-size: 0.95rem;

    :deep(h1) {
      font-size: 1.875rem;
    }
  }

  .page-nav {
    flex-direction: column;
    gap: 1rem;
  }
  
  .nav-item {
      max-width: 100%;
  }
}
</style>
