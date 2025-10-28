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
        <div class="nav-prev" v-if="prevChapter">
          <div class="nav-label">上一篇</div>
          <a
            @click.prevent="$emit('selectChapter', prevChapter.index)"
            class="nav-link"
          >
            {{ prevChapter.title }}
          </a>
        </div>
        <div class="nav-next" v-if="nextChapter">
          <div class="nav-label">下一篇</div>
          <a
            @click.prevent="$emit('selectChapter', nextChapter.index)"
            class="nav-link"
          >
            {{ nextChapter.title }}
          </a>
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
const props = defineProps({
  columnMeta: Object,
  readmeHtml: String,
  currentChapter: Object,
  prevChapter: Object,
  nextChapter: Object,
});

defineEmits(["selectChapter"]);
</script>

<style lang="scss" scoped>
.main-container {
  flex: 1;
  display: flex;
  overflow-y: auto;
  padding-right: 240px;
}

.content-main {
  flex: 1;
  padding: 2rem 3rem;
  max-width: 900px;
}

// 面包屑
:deep(.breadcrumb) {
  margin-bottom: 2rem;
}

// Markdown 内容
.markdown-body {
  color: var(--text-color);
  line-height: 1.7;
  font-size: 16px;

  :deep(h1) {
    font-size: 2.25rem;
    font-weight: 700;
    margin-top: 0;
    margin-bottom: 1.5rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid rgba(var(--color-neutral-200), 0.8);
    color: var(--text-color);
  }

  :deep(h2) {
    font-size: 1.875rem;
    font-weight: 700;
    margin-top: 2.5rem;
    margin-bottom: 1.25rem;
    color: var(--text-color);
    position: relative;

    &::before {
      content: "#";
      position: absolute;
      left: -1.5rem;
      color: var(--color);
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    &:hover::before {
      opacity: 1;
    }
  }

  :deep(h3) {
    font-size: 1.5rem;
    font-weight: 600;
    margin-top: 2rem;
    margin-bottom: 1rem;
    color: var(--text-color);
  }

  :deep(p) {
    margin: 1rem 0;
    color: var(--fg-deep);
  }

  :deep(a) {
    color: var(--color);
    text-decoration: none;
    font-weight: 500;

    &:hover {
      text-decoration: underline;
    }
  }

  :deep(code) {
    background: rgba(var(--color-neutral-100), 1);
    padding: 0.2em 0.4em;
    border-radius: 4px;
    font-size: 0.9em;
    color: rgb(var(--color-secondary-700));
    font-family: "Consolas", "Monaco", monospace;
  }

  :deep(pre) {
    background: rgba(var(--color-neutral-50), 1);
    padding: 1.25rem;
    border-radius: 8px;
    overflow-x: auto;
    margin: 1.5rem 0;
    border: 1px solid rgba(var(--color-neutral-200), 0.6);

    code {
      background: none;
      padding: 0;
      color: var(--fg-deeper);
      font-size: 0.875rem;
      line-height: 1.6;
    }
  }

  :deep(blockquote) {
    margin: 1.5rem 0;
    padding: 1rem 1.5rem;
    border-left: 4px solid var(--color);
    background: rgba(var(--color-primary-50), 0.3);
    border-radius: 0 8px 8px 0;

    p {
      margin: 0.5rem 0;
    }
  }

  :deep(ul),
  :deep(ol) {
    padding-left: 1.5rem;
    margin: 1rem 0;

    li {
      margin: 0.5rem 0;
      color: var(--fg-deep);
    }
  }

  :deep(table) {
    width: 100%;
    border-collapse: collapse;
    margin: 1.5rem 0;
    font-size: 0.9375rem;

    th,
    td {
      border: 1px solid rgba(var(--color-neutral-200), 0.8);
      padding: 0.75rem;
      text-align: left;
    }

    th {
      background: rgba(var(--color-neutral-100), 1);
      font-weight: 600;
      color: var(--text-color);
    }

    tr:hover {
      background: rgba(var(--color-neutral-50), 1);
    }
  }

  :deep(img) {
    max-width: 100%;
    height: auto;
    border-radius: 8px;
    margin: 1.5rem 0;
  }

  // KaTeX 公式样式
  :deep(.katex-display) {
    margin: 1.5rem 0;
    overflow-x: auto;
    overflow-y: hidden;
  }

  :deep(.katex) {
    font-size: 1.1em;
  }
}

// 页面导航
.page-nav {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid rgba(var(--color-neutral-200), 0.6);
}

.nav-prev,
.nav-next {
  padding: 1.25rem;
  border-radius: 12px;
  background: rgba(var(--color-neutral-50), 0.5);
  border: 1px solid rgba(var(--color-neutral-200), 0.6);
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    background: rgba(var(--color-primary-50), 0.4);
    border-color: var(--color);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(var(--color-primary-500), 0.1);
  }
}

.nav-next {
  grid-column: 2;
  text-align: right;
}

.nav-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--fg);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.5rem;
}

.nav-link {
  display: block;
  font-size: 1rem;
  font-weight: 600;
  color: var(--color);
  text-decoration: none;
  line-height: 1.4;

  &:hover {
    text-decoration: underline;
  }
}

// 深色模式
:global(.dark) {
  .markdown-body {
    :deep(h1),
    :deep(h2),
    :deep(h3) {
      border-color: rgba(var(--color-neutral-700), 0.6);
    }

    :deep(code) {
      background: rgba(var(--color-neutral-800), 0.6);
      color: rgb(var(--color-secondary-400));
    }

    :deep(pre) {
      background: rgba(var(--color-neutral-900), 0.6);
      border-color: rgba(var(--color-neutral-700), 0.6);
    }

    :deep(blockquote) {
      background: rgba(var(--color-primary-900), 0.2);
    }

    :deep(table) {
      th,
      td {
        border-color: rgba(var(--color-neutral-700), 0.6);
      }

      th {
        background: rgba(var(--color-neutral-800), 0.6);
      }

      tr:hover {
        background: rgba(var(--color-neutral-800), 0.3);
      }
    }
  }

  .page-nav {
    border-top-color: rgba(var(--color-neutral-700), 0.6);
  }

  .nav-prev,
  .nav-next {
    background: rgba(var(--color-neutral-800), 0.4);
    border-color: rgba(var(--color-neutral-700), 0.6);

    &:hover {
      background: rgba(var(--color-primary-900), 0.3);
    }
  }
}

// 响应式
@media (max-width: 1024px) {
  .main-container {
    padding-right: 0; // 移除 TOC 空间，因为 TOC 在此断点隐藏
  }

  .content-main {
    padding: 1.5rem 2rem;
  }
}

@media (max-width: 768px) {
  .content-main {
    padding: 1.25rem 1.5rem;
  }

  .markdown-body {
    font-size: 15px;

    :deep(h1) {
      font-size: 1.875rem;
    }

    :deep(h2) {
      font-size: 1.5rem;
    }

    :deep(h3) {
      font-size: 1.25rem;
    }
  }

  .page-nav {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .nav-next {
    grid-column: 1;
    text-align: left;
  }
}
</style>
