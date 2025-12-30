<template>
  <ul class="mt-8 flex flex-row items-center">
    <li v-if="currentPage > 1" class="mx-1 min-w-[1.8rem] text-center">
      <a
        @click="goToPage(currentPage - 1)"
        class="block rounded hover:bg-primary-600 hover:text-neutral"
        aria-label="Previous page"
        rel="prev"
      >
        ←
      </a>
    </li>
    <li v-for="page in visiblePages" :key="page" class="mx-1 min-w-[1.8rem] text-center">
      <span
        v-if="page === currentPage"
        aria-current="page"
        :aria-label="`Page ${page}`"
        class="block rounded bg-primary-200 font-semibold text-primary-700 dark:bg-primary-400 dark:text-neutral-800"
      >
        {{ page }}
      </span>
      <a
        v-else
        @click="goToPage(page)"
        class="block rounded hover:bg-primary-600 hover:text-neutral"
        :aria-label="`Page ${page}`"
      >
        {{ page }}
      </a>
    </li>
    <li v-if="currentPage < totalPages">
      <a
        @click="goToPage(currentPage + 1)"
        class="mx-1 block min-w-[1.8rem] rounded text-center hover:bg-primary-600 hover:text-neutral"
        aria-label="Next page"
        rel="next"
      >
        →
      </a>
    </li>
  </ul>
</template>

<script setup>
const props = defineProps({
  currentPage: {
    type: Number,
    required: true
  },
  totalPages: {
    type: Number,
    required: true
  }
})

const emit = defineEmits(['pageChange'])

const goToPage = (page) => {
  if (page >= 1 && page <= props.totalPages) {
    emit('pageChange', page)
  } else {
    return
  }
}

const buildVisiblePages = (total, current) => {
  const ellipsis = '...'

  if (total <= 10) {
    return Array.from({ length: total }, (_, i) => i + 1)
  } else if (current <= 6) {
    return [1, 2, 3, 4, 5, 6, 7, ellipsis, total]
  } else if (current >= total - 5) {
    return [1, ellipsis, total - 6, total - 5, total - 4, total - 3, total - 2, total - 1, total]
  } else {
    return [1, ellipsis, current - 2, current - 1, current, current + 1, current + 2, ellipsis, total]
  }
}

const visiblePages = computed(() => {
  return buildVisiblePages(props.totalPages, props.currentPage)
})
</script>

<style scoped></style>
