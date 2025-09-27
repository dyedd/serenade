export const parseAsset = (slug, href) => {
    if (!href || typeof href !== 'string') return href;
    if (/^https?:\/\//.test(href) || href.startsWith('/')) return href;
    return `/assets/${slug}/${href.replace(/^\.\//, '')}`;
};