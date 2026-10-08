export type TechStackItem = { label: string; icon: string };

export interface SiteConfig {
  author: string;
  title: string;
  description: string;
  keywords: string;
  url: string;
  email: string;
  lang: string;
  startTime: string;
  analytics: { script: string; websiteId: string };
  profile: {
    name: string;
    avatar: string;
    introduction: string[];
    motto: string[];
    githubContributionChart: string;
    techStack: TechStackItem[];
  };
  socialLinks: {
    github: { label: string; icon: string; url: string };
    email: { label: string; icon: string; url: string };
    qq: { label: string; icon: string; url: string; title: string };
  };
  footer: {
    copyrightName: string;
    poweredBy: { label: string; url: string };
    icp: { label: string; url: string };
  };
  friends: {
    applicationTemplate: {
      name: string;
      url: string;
      logo: string;
      description: string;
      rss: string;
    };
  };
}

export const SITE_CONFIG_GLOBAL = '__SERENADE_SITE_CONFIG__';

// 浏览器端读取注入的 payload；服务端读 process.env。用 globalThis 取值是为了让
// 这个模块既能进客户端包，又不需要 @types/node 的 process 声明。
type EnvSource = Record<string, string | undefined>;

// docker-compose 会把未设置的变量注入成空字符串，空串必须按「未配置」处理，
// 否则 `${SITE_TITLE:-}` 这类写法会顶掉内置默认值。
function readEnv(env: EnvSource, key: string, fallback: string): string {
  const value = env[key];
  return typeof value === 'string' && value.length > 0 ? value : fallback;
}

function runtimeEnv(): EnvSource {
  const scope = globalThis as { process?: { env?: EnvSource } };
  return scope.process?.env ?? {};
}

function readInjected(): Partial<SiteConfig> | null {
  const scope = globalThis as Record<string, unknown>;
  const injected = scope[SITE_CONFIG_GLOBAL];
  return injected && typeof injected === 'object' ? (injected as Partial<SiteConfig>) : null;
}

const splitEnvList = (value: string | undefined, fallback: string[]): string[] => {
  if (!value) return fallback;
  const items = value
    .split('|')
    .map((item) => item.trim())
    .filter(Boolean);
  return items.length > 0 ? items : fallback;
};

const parseTechStack = (
  value: string | undefined,
  fallback: TechStackItem[]
): TechStackItem[] => {
  if (!value) return fallback;
  const items = value
    .split('|')
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => {
      const [label, icon] = item.split('::').map((part) => part.trim());
      if (!label || !icon) return null;
      return { label, icon };
    })
    .filter((item): item is TechStackItem => item !== null);
  return items.length > 0 ? items : fallback;
};

const defaultProfileTechStack: TechStackItem[] = [
  { label: 'Python', icon: 'https://img.shields.io/badge/-Python-3776AB?logo=python&logoColor=white&style=flat-square' },
  { label: 'CUDA', icon: 'https://img.shields.io/badge/-CUDA-76B900?logo=nvidia&logoColor=white&style=flat-square' },
  { label: 'C++', icon: 'https://img.shields.io/badge/-C++-00599C?logo=cplusplus&logoColor=white&style=flat-square' },
  { label: 'JavaScript', icon: 'https://img.shields.io/badge/-JavaScript-yellow?logo=javascript&logoColor=white&style=flat-square' },
  { label: 'HTML5', icon: 'https://img.shields.io/badge/-HTML5-E34F26?logo=html5&logoColor=white&style=flat-square' },
  { label: 'Vue', icon: 'https://img.shields.io/badge/-Vue-4FC08D?logo=vue.js&logoColor=white&style=flat-square' },
  { label: 'PHP', icon: 'https://img.shields.io/badge/-PHP-777BB4?logo=php&logoColor=white&style=flat-square' },
  { label: 'Docker', icon: 'https://img.shields.io/badge/-Docker-2496ED?logo=docker&logoColor=white&style=flat-square' },
  { label: 'Slurm', icon: 'https://img.shields.io/badge/-Slurm-1F1F1F?logo=linux&logoColor=white&style=flat-square' },
  { label: 'Ubuntu', icon: 'https://img.shields.io/badge/-Ubuntu-E95420?logo=ubuntu&logoColor=white&style=flat-square' },
];

function fromEnv(env: EnvSource): SiteConfig {
  const author = readEnv(env, 'SITE_AUTHOR', '染念');
  const url = readEnv(env, 'SITE_URL', 'https://dyedd.cn');
  const email = readEnv(env, 'SITE_EMAIL', '1176996982@qq.com');
  const description = readEnv(env, 'SITE_DESCRIPTION', 'Writing code, painful and happy');
  const normalizedSiteUrl = url.replace(/\/$/, '');

  return {
    author,
    title: readEnv(env, 'SITE_TITLE', '染念的笔记'),
    description,
    keywords: readEnv(env, 'SITE_KEYWORDS', '染念,染念的笔记,染念の笔记,染念的博客,博客,blog'),
    url,
    email,
    lang: readEnv(env, 'SITE_LANG', 'zh-CN'),
    startTime: readEnv(env, 'SITE_START_TIME', '2017-02-11'),
    analytics: {
      script: readEnv(env, 'SITE_ANALYTICS_SCRIPT', 'https://statistics.dyedd.cn/script.js'),
      websiteId: env.SITE_ANALYTICS_WEBSITE_ID ?? '',
    },
    profile: {
      name: author,
      avatar: readEnv(env, 'SITE_PROFILE_AVATAR', '/avatar.jpg'),
      introduction: splitEnvList(env.SITE_PROFILE_INTRO, [
        'XDU 研究生，研究大规模分布式训练',
        'TUST 四非本科，前后端都写过，现在也是不专业的全栈开发者',
      ]),
      motto: splitEnvList(env.SITE_PROFILE_MOTTO, ['祝你马到成功，心想事成。', '🌈🌈🌈']),
      githubContributionChart: readEnv(
        env,
        'SITE_PROFILE_GITHUB_CHART',
        'https://ghchart.rshah.org/0075de/dyedd',
      ),
      techStack: parseTechStack(env.SITE_PROFILE_TECH_STACK, defaultProfileTechStack),
    },
    socialLinks: {
      github: {
        label: 'GitHub',
        icon: 'github',
        url: readEnv(env, 'SITE_GITHUB_URL', 'https://github.com/dyedd'),
      },
      email: {
        label: 'Email',
        icon: 'youxiang',
        url: `mailto:${email}`,
      },
      qq: {
        label: 'QQ',
        icon: 'QQ',
        url: readEnv(
          env,
          'SITE_QQ_URL',
          'https://qm.qq.com/cgi-bin/qm/qr?k=nLIdzy8UC9VkZ0g2EwnoN1rwnxaYvFx0&jump_from=webapi&authKey=mq2RvfcTQxEgImX+XZv0tBeobeHX+wTaAxOXq7pEKdsUD+a2Hi7mIOBGEj2ZtSDJ',
        ),
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
        label: readEnv(env, 'SITE_FOOTER_ICP_LABEL', '备案号:浙ICP备19020194号-1'),
        url: 'https://beian.miit.gov.cn/',
      },
    },
    friends: {
      applicationTemplate: {
        name: author,
        url,
        logo: `${normalizedSiteUrl}/favicon.ico`,
        description,
        rss: `${normalizedSiteUrl}/feed.xml`,
      },
    },
  };
}

let serverCache: SiteConfig | null = null;

export function getSiteConfig(): SiteConfig {
  const injected = readInjected();
  if (injected) {
    serverCache = injected as SiteConfig;
    return serverCache;
  }
  if (!serverCache) {
    serverCache = fromEnv(runtimeEnv());
  }
  return serverCache;
}

export const siteConfig: SiteConfig = new Proxy({} as SiteConfig, {
  get: (_target, property) => getSiteConfig()[property as keyof SiteConfig],
  has: (_target, property) => property in getSiteConfig(),
  ownKeys: () => Reflect.ownKeys(getSiteConfig()),
  getOwnPropertyDescriptor: (_target, property) => ({
    value: getSiteConfig()[property as keyof SiteConfig],
    enumerable: true,
    configurable: true,
    writable: false,
  }),
});

// 注入到 HTML 的 JSON：转义 < 与行分隔符，避免在 <script> 里提前闭合。
export function serializeSiteConfig(): string {
  return JSON.stringify(getSiteConfig())
    .replace(/</g, '\\u003c')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}

export function resetSiteConfigCache(): void {
  serverCache = null;
}
