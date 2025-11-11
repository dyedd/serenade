<template>
  <ul class="toc-list">
    <template v-for="item in headings" :key="item.id">
      <li :class="{ active: item.id === activeId }">
        <a :href="`#${item.id}`">
          {{ item.text }}
        </a>
        <PostCatalog
          v-if="item.children.length > 0"
          :headings="item.children"
          :active-id="activeId"
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
    default: "",
  },
});
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
    position: relative;

    &.active > a {
      color: rgb(var(--color-primary-600));
      font-weight: 600;
      padding-left: 0.625rem;

      &::before {
        content: "";
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 2px;
        height: 1.25rem;
        background: rgb(var(--color-primary-500));
        border-radius: 1px;
      }
    }

    a {
      display: block;
      padding: 0.25rem 0;
      color: rgb(var(--color-neutral-600));
      text-decoration: none;
      transition: all 0.15s ease;

      &:hover {
        color: rgb(var(--color-primary-500));
      }
    }

    // 子目录缩进
    :deep(ul) {
      padding-left: 1rem;
      border-left: 1px solid rgb(var(--color-neutral-200));
      margin-left: 0.5rem;

      li {
        &.active > a {
          &::before {
            width: 1.5px;
          }
        }
      }
    }
  }
}

:global(.dark) .toc-list {
  li {
    &.active > a {
      color: rgb(var(--color-primary-400));

      &::before {
        background: rgb(var(--color-primary-400));
      }
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
