<template>
  <div class="card-container">
    <slot />
  </div>
</template>

<script setup></script>

<style lang="scss" scoped>
.card-container {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(8px);
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }
}

:global(.dark) .card-container {
  background: rgba(30, 41, 59, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);

  &:hover {
    border-color: rgba(var(--color, #6366f1), 0.5);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
  }
}
</style>
