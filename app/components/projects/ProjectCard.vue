<template>
  <component :is="linkComponent" v-bind="linkProps" class="project-card">
    <div class="project-header">
      <div class="project-icon">
        <svg v-if="type === 'github'" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
        </svg>
        <svg v-else-if="type === 'custom'" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
          <line x1="12" y1="11" x2="12" y2="17"/>
          <line x1="9" y1="14" x2="15" y2="14"/>
        </svg>
      </div>
      <div class="project-badges">
        <span v-if="type === 'github'" class="badge badge-github">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 .587l3.668 7.431 8.2 1.193-5.934 5.787 1.402 8.168L12 18.896l-7.336 3.87 1.402-8.168L.132 9.211l8.2-1.193z"/>
          </svg>
          {{ data.stars }}
        </span>
        <span v-if="data.language" class="badge badge-language" :style="{ backgroundColor: data.languageColor || '#ccc' }">
          {{ data.language }}
        </span>
        <span v-if="type === 'custom' && data.isPrivate" class="badge badge-private">
          私有
        </span>
        <span v-if="type === 'custom'" class="badge" :class="`badge-${data.status}`">
          {{ statusText }}
        </span>
      </div>
    </div>

    <h3 class="project-title">{{ data.name }}</h3>
    <p class="project-description">{{ data.description || '暂无描述' }}</p>

    <div v-if="type === 'custom' && data.techStack" class="project-tech-stack">
      <span v-for="tech in data.techStack" :key="tech" class="tech-tag">{{ tech }}</span>
    </div>

    <div v-if="type === 'github' && data.updatedAt" class="project-meta">
      <span class="meta-item">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12 6 12 12 16 14"/>
        </svg>
        {{ formatDate(data.updatedAt) }} 更新
      </span>
    </div>
  </component>
</template>

<script setup>
const props = defineProps({
  type: {
    type: String,
    required: true
  },
  data: {
    type: Object,
    required: true
  }
})

const hasLink = computed(() => {
  const url = props.data.url

  if (typeof url === 'string' && url.length > 0 && url !== '#') {
    return true
  } else {
    return false
  }
})

const linkComponent = computed(() => {
  if (hasLink.value) {
    return 'a'
  } else {
    return 'div'
  }
})

const linkProps = computed(() => {
  if (hasLink.value) {
    return {
      href: props.data.url,
      target: '_blank',
      rel: 'noopener noreferrer'
    }
  } else {
    return {}
  }
})

const statusText = computed(() => {
  const statusMap = {
    active: '进行中',
    planning: '规划中',
    completed: '已完成',
    paused: '已暂停'
  }
  const status = props.data.status

  if (status && status in statusMap) {
    return statusMap[status]
  } else if (status) {
    return status
  } else {
    return ''
  }
})

const formatDate = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - date.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (Number.isNaN(date.getTime())) {
    return ''
  } else if (diffDays === 0) {
    return '今天'
  } else if (diffDays === 1) {
    return '昨天'
  } else if (diffDays < 7) {
    return `${diffDays} 天前`
  } else if (diffDays < 30) {
    return `${Math.floor(diffDays / 7)} 周前`
  } else if (diffDays < 365) {
    return `${Math.floor(diffDays / 30)} 个月前`
  } else {
    return `${Math.floor(diffDays / 365)} 年前`
  }
}
</script>

<style lang="scss" scoped>
.project-card {
  display: flex;
  flex-direction: column;
  padding: 1.5rem;
  background: var(--bg);
  border: 1px solid rgba(var(--color-neutral-200), 0.6);
  border-radius: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  text-decoration: none;
  color: inherit;
  height: 100%;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 24px -8px rgba(0, 0, 0, 0.1);
    border-color: var(--color-30);
  }
}

.project-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 1rem;
  gap: 1rem;
}

.project-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: rgba(var(--color-primary-50), 0.5);
  border-radius: 10px;
  color: var(--color);
  flex-shrink: 0;
  border: 1px solid rgba(var(--color-primary-100), 0.5);
}

.project-badges {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.2rem 0.6rem;
  border-radius: 99px;
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;

  &.badge-github {
    background: rgba(var(--color-neutral-100), 0.8);
    color: var(--fg-deep);
  }

  &.badge-language {
    color: white;
    text-shadow: 0 1px 2px rgba(0,0,0,0.1);
  }

  &.badge-private {
    background: rgba(239, 68, 68, 0.1);
    color: rgb(239, 68, 68);
  }

  &.badge-active {
    background: rgba(34, 197, 94, 0.1);
    color: rgb(34, 197, 94);
  }
  
  /* Add other statuses as needed */
}

.project-title {
  font-size: 1.125rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  color: var(--text-color);
  line-height: 1.4;
}

.project-description {
  font-size: 0.9rem;
  line-height: 1.6;
  color: var(--fg);
  margin: 0 0 auto 0; /* Push tech stack down */
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.project-tech-stack {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1.5rem;
  margin-bottom: 1rem;
}

.tech-tag {
  padding: 0.15rem 0.5rem;
  background: rgba(var(--color-neutral-100), 0.5);
  color: var(--fg);
  border-radius: 6px;
  font-size: 0.75rem;
  border: 1px solid rgba(var(--color-neutral-200), 0.5);
}

.project-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(var(--color-neutral-200), 0.5);
  margin-top: 1rem;
}

.meta-item {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.75rem;
  color: var(--fg);
}

:global(.dark) {
  .project-card {
    background: rgba(var(--color-neutral-900), 0.3);
    border-color: rgba(var(--color-neutral-700), 0.5);

    &:hover {
      background: rgba(var(--color-neutral-800), 0.5);
      border-color: var(--color-30);
    }
  }

  .project-icon {
    background: rgba(var(--color-primary-900), 0.2);
    border-color: rgba(var(--color-primary-800), 0.3);
  }

  .badge-github {
    background: rgba(var(--color-neutral-800), 0.8);
  }

  .tech-tag {
    background: rgba(var(--color-neutral-800), 0.5);
    border-color: rgba(var(--color-neutral-700), 0.5);
  }

  .project-meta {
    border-color: rgba(var(--color-neutral-700), 0.5);
  }
}

@media (max-width: 768px) {
  .project-card {
    padding: 1.25rem;
  }
}
</style>
