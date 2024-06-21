<template>
    <footer>
        <div>
            <p class="text-sm text-neutral-500 dark:text-neutral-400">@2024 染念🤔</p>
            <p class="text-sm text-neutral-500 dark:text-neutral-400">Powered by serenade</p>
            <a class="text-sm text-neutral-500 dark:text-neutral-400" href="https://beian.miit.gov.cn/"
                target="_blank">备案号:浙ICP备19020194号-1</a>
        </div>
        <div class="flex flex-wrap items-center justify-center gap-x-4 sm:items-center">
            <p class="text-sm text-neutral-500 dark:text-neutral-400">找到我</p>
            <a class="inline-block p-2 sm:hover:text-link" href="https://github.com/dyedd" target="_blank">
                <svg class="icon" aria-hidden="true" width="2.2rem" height="2.2rem">
                    <use xlink:href="#icon-github"></use>
                </svg>
            </a>
            <a class="inline-block p-2 sm:hover:text-link" href="mailto:1176996982@qq.com" target="_blank">
                <svg class="icon" aria-hidden="true" width="2.2rem" height="2.2rem">
                    <use xlink:href="#icon-email"></use>
                </svg>
            </a>
        </div>
    </footer>
</template>
<style scoped>
footer {
    padding-top: 2.5rem;
    padding-bottom: 2.5rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    max-width: 60rem;
    margin: auto;
    font-size: 1rem;
    line-height: .75rem
}
</style>