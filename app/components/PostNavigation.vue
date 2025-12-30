<template>
  <nav class="post-navigation max-w-prose">
    <div class="nav-divider">
      <span class="nav-divider-text">继续阅读</span>
    </div>

    <div class="nav-container">
      <NuxtLink
        v-if="prevPost"
        :to="`/posts/${prevPost.path}`"
        class="nav-card prev-card"
      >
        <div class="nav-icon-wrapper">
          <svg class="nav-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </div>
        <div class="nav-content">
          <span class="nav-label">上一篇</span>
          <h3 class="nav-title">{{ prevPost.title }}</h3>
        </div>
      </NuxtLink>
      <div v-else class="nav-card prev-card disabled">
        <div class="nav-placeholder">没有更多了</div>
      </div>

      <NuxtLink
        v-if="nextPost"
        :to="`/posts/${nextPost.path}`"
        class="nav-card next-card"
      >
        <div class="nav-content">
          <span class="nav-label">下一篇</span>
          <h3 class="nav-title">{{ nextPost.title }}</h3>
        </div>
        <div class="nav-icon-wrapper">
          <svg class="nav-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </NuxtLink>
      <div v-else class="nav-card next-card disabled">
        <div class="nav-placeholder">没有更多了</div>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
type PostLink = {
  path: string
  title: string
}

withDefaults(defineProps<{
  prevPost?: PostLink | null
  nextPost?: PostLink | null
}>(), {
  prevPost: null,
  nextPost: null
})
</script>

<style lang="scss" scoped>
.post-navigation {
  margin-top: 4rem;
  margin-bottom: 2rem;
}

.nav-divider {
  position: relative;
  text-align: center;
  margin-bottom: 2rem;

  &::before {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    top: 50%;
    height: 1px;
    background: linear-gradient(
      to right,
      transparent,
      rgba(0, 0, 0, 0.1) 20%,
      rgba(0, 0, 0, 0.1) 80%,
      transparent
    );
  }
}

:global(.dark) .nav-divider::before {
  background: linear-gradient(
    to right,
    transparent,
    rgba(255, 255, 255, 0.1) 20%,
    rgba(255, 255, 255, 0.1) 80%,
    transparent
  );
}

.nav-divider-text {
  position: relative;
  display: inline-block;
  padding: 0 1.5rem;
  background: var(--bg);
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-color-2);
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.nav-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.nav-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  border-radius: 0.75rem;
  background: rgba(249, 250, 251, 0.5);
  border: 1px solid rgba(0, 0, 0, 0.06);
  text-decoration: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, var(--color) 0%, transparent 100%);
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:not(.disabled):hover {
    background: rgba(249, 250, 251, 0.8);
    border-color: var(--color);
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);

    &::before {
      opacity: 0.03;
    }

    .nav-arrow {
      transform: translateX(0);
    }

    .nav-title {
      color: var(--color);
    }
  }

  &.disabled {
    opacity: 0.4;
    pointer-events: none;
    cursor: not-allowed;
  }
}

:global(.dark) .nav-card {
  background: rgba(51, 65, 85, 0.4);
  border-color: rgba(255, 255, 255, 0.06);

  &:not(.disabled):hover {
    background: rgba(51, 65, 85, 0.6);
    border-color: var(--color);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);

    &::before {
      opacity: 0.05;
    }
  }
}

.prev-card {
  justify-content: flex-start;
}

.next-card {
  justify-content: flex-end;
  text-align: right;
}

.nav-icon-wrapper {
  flex-shrink: 0;
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.5rem;
  background: rgba(var(--color-primary-500), 0.1);
  transition: all 0.3s ease;
}

.nav-card:not(.disabled):hover .nav-icon-wrapper {
  background: rgba(var(--color-primary-500), 0.15);
}

.nav-arrow {
  width: 1.25rem;
  height: 1.25rem;
  color: var(--color);
  transition: transform 0.3s ease;
}

.prev-card .nav-arrow {
  transform: translateX(2px);
}

.next-card .nav-arrow {
  transform: translateX(-2px);
}

.prev-card:not(.disabled):hover .nav-arrow {
  transform: translateX(-2px);
}

.next-card:not(.disabled):hover .nav-arrow {
  transform: translateX(2px);
}

.nav-content {
  flex: 1;
  min-width: 0;
}

.nav-label {
  display: block;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-color-2);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.5rem;
}

.nav-title {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--text-color);
  line-height: 1.4;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  transition: color 0.3s ease;
}

.nav-placeholder {
  font-size: 0.875rem;
  color: var(--text-color-2);
  text-align: center;
  width: 100%;
}

@media screen and (max-width: 768px) {
  .post-navigation {
    margin-top: 3rem;
  }

  .nav-container {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }

  .nav-card {
    padding: 1.25rem;
  }

  .next-card {
    justify-content: flex-start;
    text-align: left;
  }

  .nav-icon-wrapper {
    width: 2rem;
    height: 2rem;
  }

  .nav-arrow {
    width: 1rem;
    height: 1rem;
  }

  .nav-title {
    font-size: 0.875rem;
  }
}
</style>
