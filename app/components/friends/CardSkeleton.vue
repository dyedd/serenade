<template>
  <div class="card-skeleton">
    <div class="skeleton-glow"></div>
    <div class="skeleton-content">
      <div class="skeleton-avatar-section">
        <div class="skeleton-avatar"></div>
      </div>
      <div class="skeleton-info">
        <div class="skeleton-name"></div>
        <div class="skeleton-desc"></div>
        <div class="skeleton-desc-short"></div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.card-skeleton {
  @apply relative rounded-2xl overflow-hidden;
  background: rgba(var(--color-neutral-50), 1);
  border: 1px solid rgba(var(--color-neutral-200), 0.6);
}

.skeleton-glow {
  @apply absolute inset-0;
  background: linear-gradient(135deg,
    rgba(var(--color-primary-100), 0.3) 0%,
    rgba(var(--color-secondary-100), 0.2) 100%);
}

.skeleton-content {
  @apply relative p-5;
}

.skeleton-avatar-section {
  @apply flex justify-center mb-4;
}

.skeleton-avatar {
  @apply w-16 h-16 rounded-2xl;
  background: linear-gradient(90deg,
    rgba(var(--color-neutral-200), 1) 25%,
    rgba(var(--color-neutral-100), 1) 50%,
    rgba(var(--color-neutral-200), 1) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-info {
  @apply space-y-3 flex flex-col items-center;
}

.skeleton-name {
  @apply h-4 w-24 rounded;
  background: linear-gradient(90deg,
    rgba(var(--color-neutral-200), 1) 25%,
    rgba(var(--color-neutral-100), 1) 50%,
    rgba(var(--color-neutral-200), 1) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  animation-delay: 0.1s;
}

.skeleton-desc {
  @apply h-3 w-full rounded;
  background: linear-gradient(90deg,
    rgba(var(--color-neutral-200), 1) 25%,
    rgba(var(--color-neutral-100), 1) 50%,
    rgba(var(--color-neutral-200), 1) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  animation-delay: 0.2s;
}

.skeleton-desc-short {
  @apply h-3 w-3/4 rounded;
  background: linear-gradient(90deg,
    rgba(var(--color-neutral-200), 1) 25%,
    rgba(var(--color-neutral-100), 1) 50%,
    rgba(var(--color-neutral-200), 1) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  animation-delay: 0.3s;
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

// 深色模式
:global(.dark) {
  .card-skeleton {
    background: rgba(var(--color-neutral-900), 0.6);
    border-color: rgba(var(--color-neutral-700), 0.5);
  }

  .skeleton-glow {
    background: linear-gradient(135deg,
      rgba(var(--color-primary-900), 0.2) 0%,
      rgba(var(--color-secondary-900), 0.1) 100%);
  }

  .skeleton-avatar {
    background: linear-gradient(90deg,
      rgba(var(--color-neutral-800), 1) 25%,
      rgba(var(--color-neutral-700), 1) 50%,
      rgba(var(--color-neutral-800), 1) 75%);
    background-size: 200% 100%;
  }

  .skeleton-name,
  .skeleton-desc,
  .skeleton-desc-short {
    background: linear-gradient(90deg,
      rgba(var(--color-neutral-800), 1) 25%,
      rgba(var(--color-neutral-700), 1) 50%,
      rgba(var(--color-neutral-800), 1) 75%);
    background-size: 200% 100%;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .skeleton-content {
    @apply p-4;
  }

  .skeleton-avatar {
    @apply w-14 h-14;
  }
}

@media (max-width: 480px) {
  .skeleton-content {
    @apply p-3;
  }

  .skeleton-avatar {
    @apply w-12 h-12;
  }
}
</style>