<template>
  <NuxtLink :to="`/columns/${id}`" class="column-card group">
    <!-- 背景图片 -->
    <div class="image-wrapper">
      <img :src="image" :alt="title" class="card-bg-image group-hover:scale-105" loading="lazy" @error="handleImageError" />
    </div>

    <!-- 渐变叠加层 -->
    <div class="card-overlay"></div>

    <!-- 标签 -->
    <span class="card-badge" :class="badgeClass">{{ type }}</span>

    <!-- 内容区域 -->
    <div class="card-content">
      <h3 class="card-title group-hover:text-primary-300 transition-colors">{{ title }}</h3>
      <p class="card-description">{{ description }}</p>
    </div>
  </NuxtLink>
</template>

<script setup>
const props = defineProps({
  id: {
    type: [String, Number],
    default: ''
  },
  title: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    default: ''
  },
  image: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  }
})

const badgeClass = computed(() => {
  if (props.type === '公开') {
    return {
      'badge-public': true,
      'badge-private': false
    }
  } else if (props.type === '私有') {
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

const defaultImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMDAgODBIMjAwVjkwSDEwMFY4MFpNMTAwIDExMEgyMDBWMTIwSDEwMFYxMTBaTTEwMCAxNDBIMTcwVjE1MEgxMDBWMTQwWiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4='

const handleImageError = (event) => {
  const target = event.target

  if (target instanceof HTMLImageElement) {
    target.src = defaultImage
  } else {
    return
  }
}
</script>

<style lang="scss" scoped>
.column-card {
  position: relative;
  display: block;
  text-decoration: none;
  border-radius: 1.25rem;
  overflow: hidden;
  height: 18rem; /* Reduced height */
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  background-color: rgb(var(--color-neutral-900));
  border: 1px solid rgba(255, 255, 255, 0.1);

  &:hover {
    transform: translateY(-6px);
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1);
    border-color: rgba(255, 255, 255, 0.2);
  }
}

.image-wrapper {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

// 背景图片
.card-bg-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center top; /* Prioritize top of image */
  transition: transform 0.7s cubic-bezier(0.4, 0, 0.2, 1);
}

// 渐变叠加层
.card-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.1) 0%,
    rgba(0, 0, 0, 0.2) 50%,
    rgba(0, 0, 0, 0.8) 85%,
    rgba(0, 0, 0, 0.95) 100%
  );
  z-index: 10;
  pointer-events: none;
}

// 标签
.card-badge {
  position: absolute;
  top: 1rem;
  right: 1rem;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  z-index: 20;
  backdrop-filter: blur(12px);
  background: rgba(0, 0, 0, 0.3);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
  letter-spacing: 0.05em;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);

  &.badge-public {
    /* Kept neutral for cleaner look */
  }

  &.badge-private {
    background: rgba(249, 115, 22, 0.3);
    border-color: rgba(249, 115, 22, 0.4);
  }
}

// 内容区域
.card-content {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 1.5rem;
  z-index: 20;
  transform: translateY(0);
}

.card-title {
  font-size: 1.35rem; /* Slightly adjusted for shorter card */
  font-weight: 800;
  color: white;
  margin: 0 0 0.5rem 0;
  line-height: 1.2;
  letter-spacing: -0.02em;
  text-shadow: 0 2px 4px rgba(0,0,0,0.5);
}

.card-description {
  font-size: 0.875rem;
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.75);
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 400;
}

// 响应式
@media (max-width: 768px) {
  .column-card {
    height: 16rem; /* Reduced mobile height */
  }

  .card-content {
    padding: 1.25rem;
  }

  .card-title {
    font-size: 1.25rem;
  }
}
</style>
