<template>
  <div class="search-container">
    <div class="search-box" :class="{ 'expanded': isExpanded }">
      <input
        ref="searchInput"
        v-model="searchKeyword"
        type="text"
        placeholder="搜索文章..."
        class="search-input"
        @keyup.enter="handleSearch"
        @keyup.esc="handleEscape"
        @blur="handleBlur"
      />
      <button
        v-if="!searchKeyword"
        class="search-icon-btn"
        @click="toggleSearch"
        title="搜索文章"
      >
        <span class="icon">🔍</span>
      </button>
      <button
        v-else
        class="clear-btn"
        @click="handleClear"
        title="清除"
      >
        ✕
      </button>
    </div>
  </div>
</template>

<script setup>
const emit = defineEmits(["search", "clear"]);

const isExpanded = ref(false);
const searchKeyword = ref("");
const searchInput = ref(null);

function toggleSearch() {
  console.log('toggleSearch called');
  isExpanded.value = true;
  console.log('isExpanded:', isExpanded.value);
  nextTick(() => {
    searchInput.value?.focus();
  });
}

function handleSearch() {
  if (searchKeyword.value.trim()) {
    emit("search", searchKeyword.value.trim());
  }
}

function handleClear() {
  searchKeyword.value = "";
  emit("clear");
  nextTick(() => {
    searchInput.value?.focus();
  });
}

function handleEscape() {
  if (!searchKeyword.value) {
    isExpanded.value = false;
  }
}

function handleBlur() {
  // 延迟关闭，让其他按钮点击有时间处理
  setTimeout(() => {
    if (!searchKeyword.value) {
      isExpanded.value = false;
    }
  }, 200);
}
</script>

<style lang="scss" scoped>
.search-container {
  position: relative;
  display: inline-block;
}

.search-box {
  position: relative;
  display: inline-flex;
  align-items: center;
  background-color: rgb(var(--color-neutral-100));
  border: 2px solid rgb(var(--color-neutral-300));
  border-radius: 2rem;
  transition: all 0.3s ease;
  overflow: hidden;

  &.expanded {
    width: 300px;
    background-color: rgb(var(--color-neutral-50));
    border-color: var(--color);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  &:not(.expanded) {
    width: 40px;
    height: 40px;
  }
}

.search-input {
  width: 0;
  padding: 0;
  border: none;
  background: transparent;
  color: rgb(var(--color-neutral-900));
  font-size: 0.9rem;
  outline: none;
  transition: all 0.3s ease;

  .expanded & {
    width: 220px;
    padding: 0.5rem 1rem;
  }

  &::placeholder {
    color: rgb(var(--color-neutral-400));
  }
}

.search-icon-btn,
.clear-btn {
  position: absolute;
  right: 8px;
  width: 24px;
  height: 24px;
  padding: 0;
  background: transparent;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  color: rgb(var(--color-neutral-600));

  &:hover {
    background-color: rgb(var(--color-neutral-200));
    color: rgb(var(--color-neutral-900));
  }
}

.clear-btn {
  color: rgb(var(--color-neutral-500));

  &:hover {
    background-color: rgb(var(--color-neutral-300));
    color: rgb(var(--color-neutral-700));
  }
}

.icon {
  font-size: 14px;
}

:global(.dark) {
  .search-box {
    background-color: rgb(var(--color-neutral-800));
    border-color: rgb(var(--color-neutral-600));

    &.expanded {
      background-color: rgb(var(--color-neutral-700));
      border-color: var(--color);
    }
  }

  .search-input {
    color: rgb(var(--color-neutral-100));

    &::placeholder {
      color: rgb(var(--color-neutral-500));
    }
  }

  .search-icon-btn,
  .clear-btn {
    color: rgb(var(--color-neutral-400));

    &:hover {
      background-color: rgb(var(--color-neutral-600));
      color: rgb(var(--color-neutral-200));
    }
  }

  .clear-btn {
    &:hover {
      background-color: rgb(var(--color-neutral-600));
      color: rgb(var(--color-neutral-300));
    }
  }
}

@media screen and (max-width: 768px) {
  .search-box.expanded {
    width: 250px;
  }

  .expanded .search-input {
    width: 180px;
    font-size: 0.85rem;
  }
}

@media screen and (max-width: 480px) {
  .search-box.expanded {
    width: 200px;
  }

  .expanded .search-input {
    width: 140px;
    font-size: 0.8rem;
  }
}
</style>