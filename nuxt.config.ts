import { siteConfig } from "./site.config";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-12-17",
  devtools: {
    enabled: true,
  },
  experimental: {
    asyncContext: true,
    payloadExtraction: true,
  },
  routeRules: {
    "/": { prerender: true },
    "/feed": {
      swr: 600,
    },
    "/api/friends": {
      swr: 60,
    },
    "/_nuxt/**": {
      headers: {
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    },
  },
  app: {
    rootId: "nuxt-root",
    head: {
      title: siteConfig.title,
      meta: [
        { name: "description", content: siteConfig.description },
        { name: "author", content: siteConfig.author },
        { name: "keywords", content: siteConfig.keywords },
        { name: "viewport", content: "width=device-width, initial-scale=1.0" },
        { charset: "UTF-8" },
      ],
      noscript: [{ textContent: "JavaScript is required" }],
      htmlAttrs: { lang: siteConfig.lang },
      script: [
        { src: "/iconfont.js", defer: true },
        {
          src: "https://hm.baidu.com/hm.js?a42bb662e1d8e0210358ee50d5b4f2d1",
          async: true,
        },
      ],
    },
  },
  css: ["~/assets/css/main.css"],
  modules: ["@nuxtjs/tailwindcss"],
  vite: {
    build: {
      cssMinify: true,
    },
  },
  nitro: {
    preset: "node-server",
    compressPublicAssets: { gzip: true, brotli: true },
    minify: true,
  },
});
