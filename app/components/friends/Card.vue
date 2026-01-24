<template>
  <a
    :href="site.siteUrl"
    target="_blank"
    rel="noopener noreferrer"
    class="friend-card group"
    :title="site.description || '点击访问友链'"
  >
    <div class="card-content">
      <div class="avatar-wrapper">
        <img
          :src="site.siteLogo"
          :alt="site.siteName"
          class="avatar group-hover:scale-110"
          loading="lazy"
          @error="handleImageError"
          @load="handleImageLoad"
        />
      </div>

      <div class="info-section">
        <h3 class="site-name group-hover:text-primary-500">{{ site.siteName }}</h3>
        <p class="site-desc">
          {{ site.description || "暂无简介" }}
        </p>
      </div>
    </div>
  </a>
</template>

<script setup>
defineProps({
  site: {
    type: Object,
    required: true
  }
})

const defaultAvatar = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMzIiIGN5PSIyMCIgcj0iMTAiIGZpbGw9IiM5Q0EzQUYiLz4KPHBhdGggZD0iTTE4IDQ0QzE4IDM2IDI1IDMwIDMyIDMwQzM5IDMwIDQ2IDM2IDQ2IDQ0SDE4WiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4='

const handleImageError = (event) => {
  const target = event.target

  if (target instanceof HTMLImageElement) {
    target.src = defaultAvatar
  } else {
    return
  }
}

const handleImageLoad = (event) => {
  const target = event.target

  if (target instanceof HTMLImageElement) {
    target.onerror = null
  } else {
    return
  }
}
</script>

<style lang="scss" scoped>
.friend-card {
  display: block;
  text-decoration: none;
  background: var(--bg);
  border: 1px solid rgba(var(--color-neutral-200), 0.6);
  border-radius: 16px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  height: 100%;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 24px -8px rgba(0, 0, 0, 0.1);
    border-color: var(--color-30);
  }
}

.card-content {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  height: 100%;
}

.avatar-wrapper {
  margin-bottom: 1rem;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  overflow: hidden;
  background: rgba(var(--color-neutral-100), 0.5);
  border: 1px solid rgba(var(--color-neutral-200), 0.5);
  flex-shrink: 0;
}

.avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.info-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  width: 100%;
}

.site-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-color);
  margin: 0 0 0.5rem 0;
  transition: color 0.2s ease;
}

.site-desc {
  font-size: 0.85rem;
  color: var(--fg);
  line-height: 1.5;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

:global(.dark) {
  .friend-card {
    background: rgba(var(--color-neutral-900), 0.4);
    border-color: rgba(var(--color-neutral-700), 0.6);

    &:hover {
      background: rgba(var(--color-neutral-800), 0.6);
    }
  }

  .avatar-wrapper {
    background: rgba(var(--color-neutral-800), 0.5);
    border-color: rgba(var(--color-neutral-700), 0.5);
  }
}
</style>
