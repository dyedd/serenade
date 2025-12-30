import { siteConfig } from "./site.config";

export default defineNuxtConfig({
  compatibilityDate: "2025-12-17",
  devtools: {
    enabled: true,
  },
  experimental: {
    asyncContext: true,
    payloadExtraction: true,
    inlineRouteRules: true,
    viewTransition: true,
  },
  routeRules: {
    "/_nuxt/**": {
      headers: { "Cache-Control": "public, max-age=31536000, immutable" },
    },
    "/": { prerender: true },
    "/feed": { prerender: true, swr: 600 },
    "/api/friends": { swr: 60, cors: true },
  },

  app: {
    rootId: "nuxt-root",
    head: {
      title: siteConfig.title,
      htmlAttrs: { lang: siteConfig.lang },
      meta: [
        { name: "description", content: siteConfig.description },
        { name: "author", content: siteConfig.author },
        { name: "keywords", content: siteConfig.keywords },
      ],
      script: [
        { src: "/iconfont.js", defer: true },
        {
          src: "https://hm.baidu.com/hm.js?a42bb662e1d8e0210358ee50d5b4f2d1",
          async: true,
        },
      ],
      noscript: [{ textContent: "JavaScript is required" }],
    },
  },
  css: ["~/assets/css/main.css"],
  modules: ["@nuxtjs/tailwindcss"],
  vite: {
    esbuild: {
      drop: ["console", "debugger"],
    },
    build: {
      chunkSizeWarningLimit: 500,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes("node_modules")) {
              if (id.includes("katex")) return "math";
              if (id.includes("marked") || id.includes("gray-matter"))
                return "markdown";
              return "vendor";
            }
          },
        },
      },
    },
  },
  nitro: {
    compressPublicAssets: { gzip: true, brotli: true },
    minify: true,
  },
});
