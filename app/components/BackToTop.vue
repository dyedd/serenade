<template>
  <Transition name="back-to-top">
    <button
      v-if="isVisible"
      @click="scrollToTop"
      class="fixed bottom-8 right-8 z-50 p-3.5 rounded-full bg-white/80 dark:bg-neutral-800/80 backdrop-blur-md shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.2)] transition-all duration-300 hover:-translate-y-1 border border-white/20 dark:border-white/10 group"
      aria-label="返回顶部"
    >
      <svg
        class="w-5 h-5 text-neutral-600 dark:text-neutral-300 group-hover:text-[var(--color)] transition-colors"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        stroke-width="2.5"
      >
        <path
          d="M5 10l7-7m0 0l7 7m-7-7v18"
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
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.back-to-top-enter-from,
.back-to-top-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.8);
}

.back-to-top-enter-to,
.back-to-top-leave-from {
  opacity: 1;
  transform: translateY(0) scale(1);
}
</style>
