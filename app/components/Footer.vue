<template>
  <footer>
    <div>
      <p class="text-sm text-neutral-500 dark:text-neutral-400">
        @{{ currentYear }} 染念🤔
      </p>
      <a
        class="text-sm text-neutral-500 dark:text-neutral-400"
        href="https://github.com/dyedd/serenade"
        target="_blank"
        >Powered by serenade</a
      >
      <p class="text-sm text-neutral-500 dark:text-neutral-400">
        本站已运行 {{ runningDays }} 天
      </p>
      <a
        class="text-sm text-neutral-500 dark:text-neutral-400"
        href="https://beian.miit.gov.cn/"
        target="_blank"
        >备案号:浙ICP备19020194号-1</a
      >
    </div>
    <div
      class="flex flex-wrap items-center justify-center gap-x-4 sm:items-center"
    >
      <p class="text-sm text-neutral-500 dark:text-neutral-400">找到我</p>
      <a
        class="inline-block p-2 sm:hover:text-link"
        href="https://github.com/dyedd"
        target="_blank"
      >
        <svg class="icon" aria-hidden="true" width="2.2rem" height="2.2rem">
          <use xlink:href="#icon-github"></use>
        </svg>
      </a>
      <a
        class="inline-block p-2 sm:hover:text-link"
        href="mailto:1176996982@qq.com"
        target="_blank"
      >
        <svg class="icon" aria-hidden="true" width="2.2rem" height="2.2rem">
          <use xlink:href="#icon-email"></use>
        </svg>
      </a>
    </div>
  </footer>
</template>

<script setup>
import { siteConfig } from "../../site.config";

const runningDays = ref(0);
const currentYear = ref(new Date().getFullYear());

onMounted(() => {
  const start = new Date(siteConfig.startTime);
  const now = new Date();
  const days = Math.floor((now - start) / (1000 * 60 * 60 * 24));
  runningDays.value = days;
});
</script>

<style lang="scss" scoped>
footer {
  padding: 2.5rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 60rem;
  margin: auto;
  font-size: 1rem;
  line-height: 0.75rem;

  div {
    display: flex;
    flex-direction: column;
    gap: 0.8rem;

    &.flex {
      flex-direction: row;
      align-items: center;
    }
  }

  a {
    transition: color 0.3s ease;
    &:hover {
      color: var(--color);
    }
  }
}

@media screen and (max-width: 768px) {
  footer {
    flex-direction: column;
    gap: 1.5rem;
    text-align: center;
    padding: 2rem 1rem;

    div {
      gap: 0.6rem;

      &.flex {
        gap: 1rem;
      }
    }
  }
}

@media screen and (max-width: 480px) {
  footer {
    font-size: 0.9rem;
    padding: 1.5rem 0.8rem;

    div.flex {
      flex-wrap: wrap;
      justify-content: center;
    }
  }
}
</style>
