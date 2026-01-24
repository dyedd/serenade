<template>
  <nav class="post-navigation max-w-prose">
    <div class="nav-container">
      <!-- Previous Post (Newer) - Left -->
      <NuxtLink
        v-if="prevPost"
        :to="`/posts/${prevPost.path}`"
        class="nav-item prev-item group"
      >
        <div class="nav-icon">
             <!-- Solid Double Left Arrow -->
             <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" class="w-8 h-8 text-neutral-300 group-hover:text-[var(--color)] transition-colors">
                <path d="M11 19l-7-7 7-7v14zm8 0l-7-7 7-7v14z"/>
             </svg>
        </div>
        <div class="nav-text">
          <h3 class="nav-title group-hover:text-[var(--color)]">{{ prevPost.title }}</h3>
          <div v-if="prevPost.date" class="nav-date">{{ prevPost.date }}</div>
        </div>
      </NuxtLink>
      <div v-else class="nav-item prev-item disabled opacity-0 pointer-events-none"></div>

      <!-- Next Post (Older) - Right -->
      <NuxtLink
        v-if="nextPost"
        :to="`/posts/${nextPost.path}`"
        class="nav-item next-item group"
      >
        <div class="nav-text">
          <h3 class="nav-title group-hover:text-[var(--color)]">{{ nextPost.title }}</h3>
          <div v-if="nextPost.date" class="nav-date">{{ nextPost.date }}</div>
        </div>
        <div class="nav-icon">
            <!-- Solid Double Right Arrow -->
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" class="w-8 h-8 text-neutral-300 group-hover:text-[var(--color)] transition-colors">
                <path d="M5 5l7 7-7 7V5zm8 0l7 7-7 7V5z"/>
            </svg>
        </div>
      </NuxtLink>
       <div v-else class="nav-item next-item disabled opacity-0 pointer-events-none"></div>
    </div>
  </nav>
</template>

<script setup>
defineProps({
  prevPost: {
    type: Object,
    default: null
  },
  nextPost: {
    type: Object,
    default: null
  }
})
</script>

<style lang="scss" scoped>
.post-navigation {
  margin-top: 5rem;
  margin-bottom: 3rem;
  width: 100%;
}

.nav-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  gap: 1.5rem;
  flex-wrap: nowrap; /* Strictly no wrapping */
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-decoration: none;
  flex: 1 1 0; /* Grow and shrink equally, start from 0 width */
  width: 0; /* Necessary for flex item truncation to work */
  min-width: 0;
}

.prev-item {
  justify-content: flex-start;
  text-align: left;
}

.next-item {
  justify-content: flex-end;
  text-align: right;
}

.nav-icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
}

.nav-text {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.nav-title {
  font-size: 1rem;
  font-weight: 500;
  color: var(--text-color);
  line-height: 1.4;
  margin: 0;
  
  /* Multi-line restriction as requested */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  white-space: normal; /* Allow wrapping */
  
  transition: color 0.2s ease;
}

.nav-date {
  font-size: 0.8rem;
  color: var(--text-color-2);
  margin-top: 0.2rem;
  opacity: 0.8;
  white-space: nowrap; /* Date should stay on one line */
}
</style>
