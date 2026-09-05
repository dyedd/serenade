import { siteConfig } from '~/lib/site-config';

interface PageMeta {
  title?: string;
  description?: string;
  path?: string;
  image?: string;
  type?: 'website' | 'article';
}

function absoluteUrl(path = ''): string {
  const base = siteConfig.url.replace(/\/$/, '');
  if (!path) return base;
  if (/^https?:\/\//.test(path)) return path;
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}

export function pageMeta({
  title,
  description,
  path = '/',
  image,
  type = 'website',
}: PageMeta = {}) {
  const fullTitle = title ? `${title} - ${siteConfig.title}` : siteConfig.title;
  const desc = description || siteConfig.description;
  const url = absoluteUrl(path);
  const ogImage = image ? absoluteUrl(image) : absoluteUrl(siteConfig.profile.avatar);

  return [
    { title: fullTitle },
    { name: 'description', content: desc },
    { name: 'keywords', content: siteConfig.keywords },
    { name: 'author', content: siteConfig.author },
    { property: 'og:site_name', content: siteConfig.title },
    { property: 'og:title', content: fullTitle },
    { property: 'og:description', content: desc },
    { property: 'og:type', content: type },
    { property: 'og:url', content: url },
    { property: 'og:image', content: ogImage },
    { property: 'og:locale', content: siteConfig.lang === 'zh-CN' ? 'zh_CN' : siteConfig.lang },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: fullTitle },
    { name: 'twitter:description', content: desc },
    { name: 'twitter:image', content: ogImage },
    { tagName: 'link', rel: 'canonical', href: url },
    { tagName: 'link', rel: 'alternate', type: 'application/rss+xml', title: siteConfig.title, href: absoluteUrl('/feed.xml') },
  ];
}
