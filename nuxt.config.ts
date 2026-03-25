const splitEnvList = (value, fallback) => {
  if (!value) {
    return fallback;
  }

  const items = value
    .split('|')
    .map((item) => item.trim())
    .filter(Boolean);

  return items.length > 0 ? items : fallback;
};

const defaultProfileTechStack = [
  {
    label: 'Python',
    icon: 'https://img.shields.io/badge/-Python-3776AB?logo=python&logoColor=white&style=flat-square',
  },
  {
    label: 'CUDA',
    icon: 'https://img.shields.io/badge/-CUDA-76B900?logo=nvidia&logoColor=white&style=flat-square',
  },
  {
    label: 'C++',
    icon: 'https://img.shields.io/badge/-C++-00599C?logo=cplusplus&logoColor=white&style=flat-square',
  },
  {
    label: 'JavaScript',
    icon: 'https://img.shields.io/badge/-JavaScript-yellow?logo=javascript&logoColor=white&style=flat-square',
  },
  {
    label: 'HTML5',
    icon: 'https://img.shields.io/badge/-HTML5-E34F26?logo=html5&logoColor=white&style=flat-square',
  },
  {
    label: 'Vue',
    icon: 'https://img.shields.io/badge/-Vue-4FC08D?logo=vue.js&logoColor=white&style=flat-square',
  },
  {
    label: 'PHP',
    icon: 'https://img.shields.io/badge/-PHP-777BB4?logo=php&logoColor=white&style=flat-square',
  },
  {
    label: 'Docker',
    icon: 'https://img.shields.io/badge/-Docker-2496ED?logo=docker&logoColor=white&style=flat-square',
  },
  {
    label: 'Slurm',
    icon: 'https://img.shields.io/badge/-Slurm-1F1F1F?logo=linux&logoColor=white&style=flat-square',
  },
  {
    label: 'Ubuntu',
    icon: 'https://img.shields.io/badge/-Ubuntu-E95420?logo=ubuntu&logoColor=white&style=flat-square',
  },
];

const parseTechStack = (value, fallback) => {
  if (!value) {
    return fallback;
  }

  const items = value
    .split('|')
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => {
      const [label, icon] = item.split('::').map((part) => part.trim());

      if (!label || !icon) {
        return null;
      }

      return { label, icon };
    })
    .filter(Boolean);

  return items.length > 0 ? items : fallback;
};

const author = process.env.SITE_AUTHOR || '染念';
const title = process.env.SITE_TITLE || '染念的笔记';
const description = process.env.SITE_DESCRIPTION || 'Writing code, painful and happy';
const keywords =
  process.env.SITE_KEYWORDS || '染念,染念的笔记,染念の笔记,染念的博客,博客,blog';
const url = process.env.SITE_URL || 'https://dyedd.cn';
const email = process.env.SITE_EMAIL || '1176996982@qq.com';
const lang = process.env.SITE_LANG || 'zh-CN';
const startTime = process.env.SITE_START_TIME || '2017-02-11';
const profileAvatar = process.env.SITE_PROFILE_AVATAR || '/logo.jpg';
const normalizedSiteUrl = url.replace(/\/$/, '');
const profileAvatarUrl = /^https?:\/\//.test(profileAvatar)
  ? profileAvatar
  : `${normalizedSiteUrl}/${profileAvatar.replace(/^\//, '')}`;

const defaultSiteConfig = {
  author,
  title,
  description,
  keywords,
  url,
  email,
  lang,
  startTime,
  analytics: {
    script: process.env.SITE_ANALYTICS_SCRIPT || 'https://statistics.dyedd.cn/script.js',
    websiteId:
      process.env.SITE_ANALYTICS_WEBSITE_ID || '11a02a3f-0cdd-452a-bbb8-37f195db86fd',
  },
  profile: {
    name: author,
    avatar: profileAvatar,
    badge: process.env.SITE_PROFILE_BADGE || '🐟',
    introduction: splitEnvList(process.env.SITE_PROFILE_INTRO, [
      'AI infra研究生，目前研究大规模分布式训练以及扩散模型在短临降水领域的应用',
      '过去我也学习过前后端，所以现在也是不专业的全栈开发者',
    ]),
    motto: splitEnvList(process.env.SITE_PROFILE_MOTTO, ['🐎 马到成功，心想事成', '🌈🌈🌈']),
    statement:
      process.env.SITE_PROFILE_STATEMENT ||
      '我将在这里分享我的编程和人工智能知识。如果你对这些主题感兴趣，那么恭喜你找到宝藏了。接下来你可以查看内容或订阅',
    githubContributionChart:
      process.env.SITE_PROFILE_GITHUB_CHART || 'https://ghchart.rshah.org/409ba5/dyedd',
    techStack: parseTechStack(process.env.SITE_PROFILE_TECH_STACK, defaultProfileTechStack),
  },
  socialLinks: {
    github: {
      label: 'GitHub',
      icon: 'github',
      url: process.env.SITE_GITHUB_URL || 'https://github.com/dyedd',
    },
    email: {
      label: 'Email',
      icon: 'youxiang',
      url: `mailto:${email}`,
    },
    qq: {
      label: 'QQ',
      icon: 'QQ',
      url:
        process.env.SITE_QQ_URL ||
        'https://qm.qq.com/cgi-bin/qm/qr?k=nLIdzy8UC9VkZ0g2EwnoN1rwnxaYvFx0&jump_from=webapi&authKey=mq2RvfcTQxEgImX+XZv0tBeobeHX+wTaAxOXq7pEKdsUD+a2Hi7mIOBGEj2ZtSDJ',
      title: 'QQ',
    },
  },
  footer: {
    copyrightName: author,
    poweredBy: {
      label: 'Powered by serenade',
      url: 'https://github.com/dyedd/serenade',
    },
    icp: {
      label: process.env.SITE_FOOTER_ICP_LABEL || '备案号:浙ICP备19020194号-1',
      url: 'https://beian.miit.gov.cn/',
    },
  },
  friends: {
    applicationTemplate: {
      name: author,
      url,
      logo: profileAvatarUrl,
      description,
      rss: `${normalizedSiteUrl}/feed`,
    },
  },
};

export default defineNuxtConfig({
  compatibilityDate: "2025-12-17",
  devtools: {
    enabled: true,
  },
  telemetry: false,
  experimental: {
    asyncContext: true,
    viewTransition: true,
  },
  routeRules: {
    "/_nuxt/**": {
      headers: { "Cache-Control": "public, max-age=31536000, immutable" },
    },
    "/feed": { swr: 600 },
    "/api/friends": { swr: 60, cors: true },
  },

  app: {
    rootId: "nuxt-root",
    head: {
      script: [
        { src: "/iconfont.js", defer: true },
      ],
      noscript: [{ textContent: "JavaScript is required" }],
    },
  },
  runtimeConfig: {
    public: {
      siteConfig: defaultSiteConfig,
    },
  },
  css: ["~/assets/css/main.css", "highlight.js/styles/atom-one-dark.css"],
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
