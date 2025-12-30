<template>
  <div class="timeline">
    <div v-for="(item, index) in items" :key="index" class="timeline-item">
      <div class="timeline-content" @click="navigateToPost(item.path)">
        <div class="timeline-date">{{ formatDate(item.date) }}</div>
        <div class="timeline-title">{{ item.title }}</div>
        <div class="timeline-abstract" v-if="item.abstract">{{ item.abstract }}</div>
        <div class="timeline-tags" v-if="item.tags && item.tags.length > 0">
          <span v-for="tag in item.tags" :key="tag" class="tag">{{ tag }}</span>
        </div>
      </div>
    </div>
    <div v-if="!items || items.length === 0" class="timeline-empty">
      <p>暂无最新文章</p>
    </div>
  </div>
</template>

<script setup lang="ts">
type TimelineItem = {
  path: string
  title: string
  date: string
  abstract?: string
  tags?: string[]
}

withDefaults(defineProps<{
  items?: TimelineItem[]
}>(), {
  items: () => []
})

const formatDate = (value: string) => {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return ''
  } else {
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }
}

const navigateToPost = (path: string) => {
  return navigateTo(`/posts/${path}`)
}
</script>

<style lang="scss" scoped>
.timeline {
  position: relative;
  padding-left: 1.25rem;

  &::before {
    content: '';
    position: absolute;
    left: 0.3125rem;
    top: 0.75rem;
    bottom: 0;
    width: 2px;
    background: linear-gradient(to bottom,
      var(--color, #6366f1),
      transparent
    );
    opacity: 0.3;
  }
}

.timeline-item {
  position: relative;
  margin-bottom: 1.5rem;

  &:last-child {
    margin-bottom: 0;
  }

  &::before {
    content: '';
    position: absolute;
    left: -0.9375rem;
    top: 0.5rem;
    width: 0.625rem;
    height: 0.625rem;
    background: var(--color, #6366f1);
    border-radius: 50%;
    border: 2px solid var(--bg);
    box-shadow: 0 0 0 2px rgba(var(--color-primary-rgb, 99, 102, 241), 0.2);
    z-index: 1;
  }
}

.timeline-content {
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    .timeline-title {
      color: var(--color);
    }
  }
}

.timeline-date {
  font-size: 0.75rem;
  color: var(--text-color-2);
  margin-bottom: 0.375rem;
  font-family: 'Courier New', monospace;
}

.timeline-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-color);
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  transition: color 0.2s ease;
}

.timeline-abstract {
  display: none;
}

.timeline-tags {
  display: none;
}

.timeline-empty {
  text-align: center;
  padding: 1.5rem;
  color: var(--text-color-2);
  font-size: 0.85rem;
}
</style>
