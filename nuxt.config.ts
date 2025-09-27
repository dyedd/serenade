import { siteConfig } from './site.config'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  experimental: {
    watcher: "parcel",
  },
  app: {
    rootId: 'nuxt-root',
    head: {
      title: siteConfig.title,
      meta: [
        { name: 'description', content: siteConfig.description },
        { name: 'author', content: siteConfig.author },
        { name: 'keywords', content: siteConfig.keywords },
        { name: 'viewport', content: 'width=device-width, initial-scale=1.0' },
        { name: 'revisit-after', content: '7 days' },
        { name: 'msapplication-TileColor', content: '#ffffff' },
        { charset: 'UTF-8' },
        { 'http-equiv': 'X-UA-Compatible', 'content': 'IE=edge' },
      ],
      noscript: [
        { textContent: 'JavaScript is required' },
      ],
      htmlAttrs: {
        lang: siteConfig.lang,
      },
      script: [
        { src: '/iconfont.js', type: "text/javascript" },
        { src: 'https://hm.baidu.com/hm.js?a42bb662e1d8e0210358ee50d5b4f2d1', type: "text/javascript" },
      ]
    }
  },
  css: ['~/assets/css/main.css'],
  modules: ['@nuxtjs/tailwindcss']
})