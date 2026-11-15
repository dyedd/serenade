// /feed.xml — RSS feed with ETag/Last-Modified/304 conditional GET.
// 复用内容层索引，保证 feed 里的条目与站点文章一一对应（不重复、不缺项），
// 且与 sitemap 使用同一套读取规则。
import type { Route } from './+types/feed[.]xml';
import RSS from 'rss';
import dayjs from 'dayjs';
import { listPostIndex } from '~/lib/content/posts';

const FEED_SIZE = 10;

export async function loader({ request }: Route.LoaderArgs) {
  const baseUrl = (process.env.SITE_URL || '').replace(/\/$/, '');
  const author = process.env.SITE_AUTHOR || '匿名作者';
  const email = process.env.SITE_EMAIL || '';
  const posts = (await listPostIndex()).slice(0, FEED_SIZE);
  if (posts.length === 0) {
    throw new Response('No posts found', { status: 404 });
  }

  // 弱校验器：内容由文章 front matter 决定，没有比「最新一篇 + 条目数」更省的变更信号。
  const latest = posts[0];
  const etag = `W/"feed-${posts.length}-${latest.path}-${latest.date}"`;
  const lastModified = new Date(latest.date || Date.now()).toUTCString();
  const ifNoneMatch = request.headers.get('if-none-match');
  const ifModifiedSince = request.headers.get('if-modified-since');
  const isNotModified =
    ifNoneMatch === etag ||
    (ifModifiedSince && new Date(ifModifiedSince).getTime() >= new Date(lastModified).getTime());

  if (isNotModified) {
    return new Response(null, {
      status: 304,
      headers: { 'Last-Modified': lastModified, ETag: etag },
    });
  }

  const feed = new RSS({
    title: process.env.SITE_TITLE || '未命名站点',
    description: process.env.SITE_DESCRIPTION || '',
    feed_url: `${baseUrl}/feed.xml`,
    site_url: baseUrl,
    language: process.env.SITE_LANG || 'zh-CN',
    copyright: `© ${new Date().getFullYear()} ${author}`,
    managingEditor: email,
    webMaster: email,
    pubDate: latest.date || undefined,
    ttl: 60,
  });

  for (const post of posts) {
    feed.item({
      title: post.title,
      description: post.abstract ?? '',
      url: `${baseUrl}/posts/${encodeURIComponent(post.path)}`,
      date: post.date ? dayjs(post.date).toISOString() : new Date(),
      guid: `post-${post.path}`,
      categories: post.tags,
      author,
      // 封面为绝对地址时直接使用，站内相对路径才加上站点前缀。
      enclosure: post.cover
        ? { url: /^https?:\/\//.test(post.cover) ? post.cover : `${baseUrl}${post.cover}` }
        : undefined,
    });
  }

  return new Response(feed.xml({ indent: true }), {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Last-Modified': lastModified,
      ETag: etag,
    },
  });
}
