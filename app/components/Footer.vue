<template>
  <footer>
    <div>
      <p class="text-sm text-neutral-500 dark:text-neutral-400">
        @{{ currentYear }} {{ siteConfig.footer.copyrightName }}
      </p>
      <a
        class="text-sm text-neutral-500 dark:text-neutral-400"
        :href="siteConfig.footer.poweredBy.url"
        target="_blank"
        >{{ siteConfig.footer.poweredBy.label }}</a
      >
      <p class="text-sm text-neutral-500 dark:text-neutral-400">
        本站已运行 {{ runningDays }} 天
      </p>
      <a
        class="text-sm text-neutral-500 dark:text-neutral-400"
        :href="siteConfig.footer.icp.url"
        target="_blank"
        >{{ siteConfig.footer.icp.label }}</a
      >
    </div>
    <div
      class="flex flex-wrap items-center justify-center gap-x-4 sm:items-center"
    >
      <p class="text-sm text-neutral-500 dark:text-neutral-400">找到我</p>
      <a
        class="inline-block p-2 sm:hover:text-link"
        :href="siteConfig.socialLinks.github.url"
        target="_blank"
      >
        <svg class="icon" aria-hidden="true" width="2.2rem" height="2.2rem">
          <use xlink:href="#icon-github"></use>
        </svg>
      </a>
      <a
        class="inline-block p-2 sm:hover:text-link"
        :href="siteConfig.socialLinks.email.url"
        target="_blank"
      >
        <svg class="icon" aria-hidden="true" width="2.2rem" height="2.2rem">
          <use xlink:href="#icon-youxiang"></use>
        </svg>
      </a>
      <a
        class="inline-block p-2 sm:hover:text-link"
        :href="siteConfig.socialLinks.qq.url"
        target="_blank"
        :title="siteConfig.socialLinks.qq.title"
      >
        <svg class="icon" aria-hidden="true" width="2.2rem" height="2.2rem">
          <use xlink:href="#icon-QQ"></use>
        </svg>
      </a>
    </div>
  </footer>
</template>

<script setup>
import { siteConfig } from '../../site.config'

const currentYear = new Date().getFullYear()

const calculateRunningDays = (startTime) => {
  const start = new Date(startTime)

  if (Number.isNaN(start.getTime())) {
    return 0
  } else {
    const now = new Date()
    const diffTime = now.getTime() - start.getTime()
    const days = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    return days
  }
}

const runningDays = calculateRunningDays(siteConfig.startTime)
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
