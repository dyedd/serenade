import { siteConfig } from '../../site.config'
import redirectsData from '../middleware/redirects.json'

export default defineNuxtRouteMiddleware(async (to, from) => {
    const routeTitle = getRouteTitle(to.path)

    useHead({
        title: routeTitle,
        titleTemplate: (titleChunk) => {
            if (to.path === '/') {
                return siteConfig.title
            } else {
                return `${titleChunk} - ${siteConfig.title}`
            }
        },
    })

    const redirectMap = redirectsData as Record<string, string>
    const currentPath = to.path.slice(1)

    if (currentPath in redirectMap) {
        const newPath = redirectMap[currentPath]
        return navigateTo(`/posts/${newPath}`, { redirectCode: 301 })
    } else {
        return
    }
})

// 根据路由路径自动生成页面标题
function getRouteTitle(path: string): string {
    const routeMap: Record<string, string> = {
        '/posts': '所有文章',
        '/columns': '专栏',
        '/tags': '标签',
        '/friends': '友情链接',
        '/moments': '朋友圈',
        '/projects': '项目',
    }

    if (routeMap[path]) {
        return routeMap[path]
    } else if (path.startsWith('/posts/')) {
        return '文章详情'
    } else if (path.startsWith('/columns/')) {
        return '专栏详情'
    } else if (path.startsWith('/tags/')) {
        const tagName = path.split('/')[2]
        return `标签: ${tagName}`
    } else {
        return siteConfig.title
    }
}
