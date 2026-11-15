import type { loader } from '~/root';

interface PageMeta {
  title?: string;
  description?: string;
  path?: string;
  image?: string;
  type?: 'website' | 'article';
  publishedTime?: string;
  tags?: string[];
}

export function pageMeta(site: ReturnType<typeof loader> | undefined, {
  title,
  description,
  path = '/',
  image,
  type = 'website',
  publishedTime,
  tags = [],
}: PageMeta = {}) {
  if (!site) return [{ title: title || '未命名站点' }];
  const absoluteUrl = (path: string) => /^https?:\/\//.test(path)
    ? path
    : `${site.url}${path.startsWith('/') ? path : `/${path}`}`;
  const fullTitle = title ? `${title} - ${site.title}` : site.title;
  const desc = description || site.description;
  const url = absoluteUrl(path);
  const ogImage = absoluteUrl(image || site.avatar);

  return [
    { title: fullTitle },
    { name: 'description', content: desc },
    { name: 'keywords', content: site.keywords },
    { name: 'author', content: site.author },
    { property: 'og:site_name', content: site.title },
    { property: 'og:title', content: fullTitle },
    { property: 'og:description', content: desc },
    { property: 'og:type', content: type },
    { property: 'og:url', content: url },
    { property: 'og:image', content: ogImage },
    { property: 'og:image:alt', content: title ? `${title} 封面` : site.title },
    { property: 'og:locale', content: site.lang === 'zh-CN' ? 'zh_CN' : site.lang },
    ...(type === 'article' && publishedTime
      ? [{ property: 'article:published_time', content: publishedTime }]
      : []),
    ...tags.map((tag) => ({ property: 'article:tag', content: tag })),
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: fullTitle },
    { name: 'twitter:description', content: desc },
    { name: 'twitter:image', content: ogImage },
    { name: 'twitter:url', content: url },
    { tagName: 'link', rel: 'canonical', href: url },
    { tagName: 'link', rel: 'alternate', type: 'application/rss+xml', title: site.title, href: absoluteUrl('/feed.xml') },
  ];
}
