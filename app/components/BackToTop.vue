<template>
  <Transition name="back-to-top">
    <button
      v-if="isVisible"
      @click="scrollToTop"
      class="fixed bottom-6 right-6 z-50 p-3 rounded-full bg-white dark:bg-neutral-800 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 border border-neutral-200 dark:border-neutral-700"
      aria-label="返回顶部"
    >
      <svg
        class="w-6 h-6 text-neutral-700 dark:text-neutral-300"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        stroke-width="2"
      >
        <path
          d="M5 15l7-7 7 7M5 19h14"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </button>
  </Transition>
</template>

<script setup>
const isVisible = ref(false)
const isClient = import.meta.client
const scrollThreshold = 300

const scrollToTop = () => {
  if (isClient) {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  } else {
    return
  }
}

const updateVisibility = () => {
  if (isClient) {
    isVisible.value = window.pageYOffset > scrollThreshold
  } else {
    return
  }
}

onMounted(() => {
  if (isClient) {
    window.addEventListener('scroll', updateVisibility)
    updateVisibility()
  } else {
    return
  }
})

onUnmounted(() => {
  if (isClient) {
    window.removeEventListener('scroll', updateVisibility)
  } else {
    return
  }
})
</script>

<style scoped>
.back-to-top-enter-active,
.back-to-top-leave-active {
  transition: all 0.3s ease;
}

.back-to-top-enter-from,
.back-to-top-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

.back-to-top-enter-to,
.back-to-top-leave-from {
  opacity: 1;
  transform: translateY(0);
}
</style>
