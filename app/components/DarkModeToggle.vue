<template>
  <button
    @click="toggle"
    class="dark-mode-toggle"
    :title="isDark ? '切换到浅色模式' : '切换到深色模式'"
    aria-label="切换深色/浅色模式"
  >
    <!-- 太阳图标 (浅色模式) -->
    <svg
      v-if="!isDark"
      class="icon sun-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>

    <!-- 月亮图标 (深色模式) -->
    <svg
      v-else
      class="icon moon-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  </button>
</template>

<script setup>
const { isDark, toggle } = useDarkMode()
</script>

<style scoped>
.dark-mode-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.5rem;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #64748b;
}

.dark-mode-toggle:hover {
  background: rgba(100, 116, 139, 0.1);
  color: #475569;
}

.dark-mode-toggle:active {
  transform: scale(0.95);
}

.icon {
  width: 1.25rem;
  height: 1.25rem;
  transition: transform 0.3s ease;
}

.sun-icon {
  animation: rotate 20s linear infinite;
}

.moon-icon {
  animation: fadeIn 0.3s ease;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* 深色模式样式 */
:global(.dark) .dark-mode-toggle {
  color: #94a3b8;
}

:global(.dark) .dark-mode-toggle:hover {
  background: rgba(148, 163, 184, 0.1);
  color: #cbd5e1;
}

@media (max-width: 768px) {
  .dark-mode-toggle {
    width: 2rem;
    height: 2rem;
  }

  .icon {
    width: 1rem;
    height: 1rem;
  }
}
</style>
