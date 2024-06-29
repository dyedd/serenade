import { siteConfig } from '@/site.config'

export default defineNuxtRouteMiddleware((to, _from) => {
    useHead({
        title: siteConfig.title,
        titleTemplate: (titleChunk) => {
            if (titleChunk === siteConfig.title) {
                return titleChunk
            }
            const title = titleChunk + " - " +siteConfig.title
            return title
        },
    })
})