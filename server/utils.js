export const parseAsset = (slug, href, type = 'posts') => {
    if (!href || typeof href !== 'string') return href;
    if (/^https?:\/\//.test(href) || href.startsWith('/')) return href;
    return `/assets/${type}/${slug}/${href.replace(/^\.\//, '')}`;
};