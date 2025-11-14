import { siteConfig } from '../../site.config'
import redirectsData from '../middleware/redirects.json'

export default defineNuxtRouteMiddleware(async (to, from) => {
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

    const redirectMap = redirectsData as Record<string, string>
    const currentPath = to.path.slice(1)

    if (currentPath in redirectMap) {
        const newPath = redirectMap[currentPath]
        return navigateTo(`/posts/${newPath}`, { redirectCode: 301 })
    }
})