// Asset path resolution for content images.
// `parseAsset(slug, href, type)` → returns either the original href (for
// absolute/rooted URLs) or a /assets/<type>/<slug>/<file> URL that the
// assets route handler will serve from disk.

export type AssetType = 'posts' | 'columns';

export function parseAsset(
  slug: string,
  href: string | null | undefined,
  type: AssetType = 'posts'
): string {
  if (!href || typeof href !== 'string') return href ?? '';
  if (/^https?:\/\//.test(href) || href.startsWith('/')) return href;
  return `/assets/${type}/${slug}/${href.replace(/^\.\//, '')}`;
}
