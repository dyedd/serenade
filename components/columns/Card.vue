<template>
  <NuxtLink :to="`/columns/${id}`" class="column-card">
    <img :src="image" :alt="title" class="card-bg-image" @error="handleImageError" />
    <div class="card-overlay"></div>
    <span class="card-badge" :class="badgeClass">{{ type }}</span>
    <div class="card-content">
      <h3 class="card-title">{{ title }}</h3>
      <p class="card-description">{{ description }}</p>
    </div>
  </NuxtLink>
</template>

<script setup>
const props = defineProps({
  id: [String, Number],
  title: String,
  type: String,
  image: String,
  description: String,
})

const badgeClass = computed(() => ({
  'badge-public': props.type === '公开',
  'badge-private': props.type === '私有',
}))

const defaultImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMDAgODBIMjAwVjkwSDEwMFY4MFpNMTAwIDExMEgyMDBWMTIwSDEwMFYxMTBaTTEwMCAxNDBIMTcwVjE1MEgxMDBWMTQwWiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4='

const handleImageError = (event) => {
  event.target.src = defaultImage
}
</script>

<style lang="scss" scoped>
.column-card {
  position: relative;
  display: block;
  text-decoration: none;
  border-radius: 16px;
  overflow: hidden;
  height: 320px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  &:hover {
    transform: translateY(-6px);
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);

    .card-bg-image {
      transform: scale(1.1);
    }
  }
}

.card-bg-image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.card-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.2) 40%, rgba(0, 0, 0, 0.7) 100%);
  z-index: 1;
}

.card-badge {
  position: absolute;
  top: 16px;
  left: 16px;
  padding: 0.375rem 0.875rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  z-index: 2;
  backdrop-filter: blur(8px);
  transition: all 0.3s ease;

  &.badge-public {
    background: rgba(59, 130, 246, 0.9);
    color: white;
  }

  &.badge-private {
    background: rgba(251, 146, 60, 0.9);
    color: white;
  }
}

.card-content {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 1.5rem;
  z-index: 2;
}

.card-title {
  font-size: 1.375rem;
  font-weight: 700;
  color: white;
  margin: 0 0 0.5rem 0;
  line-height: 1.4;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.card-description {
  font-size: 0.875rem;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
}

@media (max-width: 768px) {
  .column-card {
    height: 280px;
  }

  .card-content {
    padding: 1.25rem;
  }

  .card-title {
    font-size: 1.125rem;
  }

  .card-description {
    font-size: 0.8125rem;
  }
}

@media (max-width: 480px) {
  .column-card {
    height: 240px;
  }

  .card-badge {
    top: 12px;
    left: 12px;
    padding: 0.25rem 0.625rem;
    font-size: 0.6875rem;
  }

  .card-content {
    padding: 1rem;
  }

  .card-title {
    font-size: 1rem;
  }
}
</style>
