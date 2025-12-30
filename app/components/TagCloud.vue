<template>
  <aside class="tag-cloud-card">
    <h3 class="tag-cloud-header">
      <svg class="icon" aria-hidden="true">
        <use xlink:href="#icon-tag"></use>
      </svg>
      标签
    </h3>

    <div v-if="isLoading" class="tag-cloud-loading">
      <div class="loading-spinner"></div>
    </div>

    <div v-else-if="hasTags" class="tag-cloud-tags">
      <NuxtLink
        v-for="tag in sortedTags"
        :key="tag"
        :to="buildTagLink(tag)"
        class="tag-link"
      >
        {{ tag }}
      </NuxtLink>
    </div>

    <div v-else class="tag-cloud-empty">
      <p>暂无标签</p>
    </div>

    <div v-if="sortedTags.length > 0" class="view-all-wrapper">
      <NuxtLink to="/tags" class="view-all-link">
        View all →
      </NuxtLink>
    </div>
  </aside>
</template>

<script setup>
const props = defineProps({
  maxTags: {
    type: Number,
    default: 25
  }
})

const { data: tags, status, error } = await useFetch('/api/tags', {
  default: () => ({})
})

const isLoading = computed(() => {
  return status.value === 'pending'
})

const hasTags = computed(() => {
  if (error.value) {
    return false
  } else {
    return Object.keys(tags.value).length > 0
  }
})

const sortedTags = computed(() => {
  if (hasTags.value) {
    return Object.entries(tags.value)
      .sort((a, b) => b[1] - a[1])
      .map(([tag]) => tag)
      .slice(0, props.maxTags)
  } else {
    return []
  }
})

const buildTagLink = (tag) => {
  return `/tags/${encodeURIComponent(tag)}`
}
</script>

<style lang="scss" scoped>
.tag-cloud-card {
  padding: 0;
}

.tag-cloud-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0 0 1rem 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: rgb(var(--color-neutral-800));
}

.tag-cloud-header .icon {
  color: rgb(var(--color-primary-600));
  width: 1.5rem;
  height: 1.5rem;
}

.tag-cloud-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 0;
}

.loading-spinner {
  width: 24px;
  height: 24px;
  border: 2px solid rgba(var(--color-primary-200), 0.3);
  border-top-color: rgb(var(--color-primary-600));
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.tag-cloud-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding: 0.5rem 0;
}

.tag-link {
  display: inline-block;
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
  color: rgb(var(--color-neutral-700));
  background: rgba(var(--color-neutral-100), 0.8);
  border: 1px solid rgba(var(--color-neutral-200), 0.6);
  border-radius: 4px;
  text-decoration: none;
  transition: all 0.2s ease;

  &:hover {
    color: white;
    background: rgb(var(--color-primary-600));
    border-color: rgb(var(--color-primary-600));
    transform: translateY(-1px);
  }
}

.tag-cloud-empty {
  padding: 2rem 0;
  text-align: center;

  p {
    margin: 0;
    color: rgb(var(--color-neutral-400));
    font-size: 0.9rem;
  }
}

.view-all-wrapper {
  margin-top: 1rem;
  padding-top: 0.75rem;
  border-top: 1px solid rgba(var(--color-neutral-200), 0.6);
  text-align: center;
}

.view-all-link {
  display: inline-block;
  padding: 0.375rem 0.75rem;
  font-size: 0.85rem;
  font-weight: 500;
  color: rgb(var(--color-primary-600));
  text-decoration: none;
  transition: all 0.2s ease;

  &:hover {
    color: rgb(var(--color-primary-700));
    text-decoration: underline;
  }
}

// 深色模式
:global(.dark) {
  .tag-cloud-header {
    color: rgb(var(--color-neutral-200));
  }

  .tag-cloud-header .icon {
    color: rgb(var(--color-primary-400));
  }

  .tag-link {
    color: rgb(var(--color-neutral-300));
    background: rgba(var(--color-neutral-700), 0.8);
    border-color: rgba(var(--color-neutral-600), 0.8);

    &:hover {
      color: white;
    }
  }

  .tag-cloud-empty {
    p {
      color: rgb(var(--color-neutral-500));
    }
  }

  .view-all-wrapper {
    border-top-color: rgba(var(--color-neutral-600), 0.5);
  }

  .view-all-link {
    color: rgb(var(--color-primary-400));

    &:hover {
      color: rgb(var(--color-primary-300));
    }
  }
}

// 响应式设计
@media screen and (max-width: 1024px) {
  .tag-cloud-card {
    margin-top: 2rem;
  }
}

@media screen and (max-width: 768px) {
  .tag-cloud-card {
    padding: 1rem;
  }

  .tag-cloud-header {
    font-size: 0.9rem;
  }

  .tag-link {
    padding: 0.3rem 0.625rem;
    font-size: 0.85rem;
  }

  .tag-cloud-tags {
    gap: 0.375rem;
  }
}
</style>
