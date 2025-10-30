<template>
  <ul class="toc-list">
    <template v-for="item in headings" :key="item.id">
      <li :class="{ active: item.id === activeId }">
        <a :href="`#${item.id}`" @click.prevent="scrollToHeading(item.id)">
          {{ item.text }}
        </a>
        <PostCatalog
          v-if="item.children.length > 0"
          :headings="item.children"
          :active-id="activeId"
          @click="scrollToHeading"
        />
      </li>
    </template>
  </ul>
</template>

<script setup>
const props = defineProps({
  headings: {
    type: Array,
    required: true,
  },
  activeId: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['click'])

const scrollToHeading = (id) => {
  emit('click', id)
}
</script>

<style lang="scss" scoped>
.toc-list {
  ul,
  li {
    list-style: none;
    padding: 0;
    margin: 0;
    line-height: 1.6;
  }

  li {
    &.active > a {
      color: rgb(var(--color-primary-600));
      font-weight: 600;
    }

    a {
      display: block;
      padding: 0.25rem 0;
      color: rgb(var(--color-neutral-600));
      text-decoration: none;
      transition: color 0.2s;

      &:hover {
        color: rgb(var(--color-primary-500));
      }
    }

    // 子目录缩进
    :deep(ul) {
      padding-left: 1rem;
      border-left: 1px solid rgb(var(--color-neutral-200));
      margin-left: 0.5rem;
    }
  }
}

:global(.dark) .toc-list {
  li {
    &.active > a {
      color: rgb(var(--color-primary-400));
    }

    a {
      color: rgb(var(--color-neutral-400));

      &:hover {
        color: rgb(var(--color-primary-300));
      }
    }

    :deep(ul) {
      border-left-color: rgb(var(--color-neutral-700));
    }
  }
}
</style>
