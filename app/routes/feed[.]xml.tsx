// /feed.xml — RSS feed with ETag/Last-Modified/304 conditional GET.
import type { Route } from './+types/feed[.]xml';
import RSS from 'rss';
import dayjs from 'dayjs';
import fg from 'fast-glob';
import fs from 'node:fs/promises';
import matter from 'gray-matter';
import { parseAsset } from '~/lib/content/assets';
import { siteConfig } from '~/lib/site-config';

function normalizeTags(tags: unknown): string[] {
  if (typeof tags === 'string') return [tags];
  if (Array.isArray(tags)) return tags.filter((t): t is string => typeof t === 'string');
  return [];
}

export async function loader({ request }: Route.LoaderArgs) {
  const baseUrl = siteConfig.url.replace(/\/$/, '');
  const files = await fg('content/posts/*/*.md', { caseSensitiveMatch: false });
  if (files.length === 0) {
    throw new Response('No posts found', { status: 404 });
  }

  const summaries = await Promise.all(
    files.map(async (file) => {
      const raw = await fs.readFile(file, 'utf-8');
      const { data } = matter(raw);
      const stats = await fs.stat(file);
      const slugMatch = file.match(/content\/posts\/([^/]+)\//);
      const slug = slugMatch?.[1] ?? '';
      return {
        path: slug,
        title: data.title,
        date: data.date,
        mtime: stats.mtime,
        cover: data.cover,
        abstract: data.abstract,
        tags: normalizeTags(data.tags),
      };
    })
  );

  const posts = summaries
    .filter((p) => p.title && p.date)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10);

  const latest = posts[0];
  if (!latest) throw new Response('No posts available', { status: 500 });

  const lastModified = latest.mtime.toUTCString();
  const etag = `"feed-${latest.mtime.getTime()}"`;
  const ifModifiedSince = request.headers.get('if-modified-since');
  const ifNoneMatch = request.headers.get('if-none-match');
  const isNotModified =
    ifNoneMatch === etag || (ifModifiedSince && new Date(ifModifiedSince) >= new Date(lastModified));

  if (isNotModified) {
    return new Response(null, {
      status: 304,
      headers: { 'Last-Modified': lastModified, ETag: etag },
    });
  }

  const feed = new RSS({
    title: siteConfig.title,
    description: siteConfig.description,
    feed_url: `${baseUrl}/feed.xml`,
    site_url: baseUrl,
    language: siteConfig.lang || 'zh-CN',
    copyright: `© ${new Date().getFullYear()} ${siteConfig.author}`,
    managingEditor: siteConfig.email,
    webMaster: siteConfig.email,
    pubDate: latest.date,
    ttl: 60,
  });

  posts.forEach((p) => {
    feed.item({
      title: p.title,
      description: p.abstract ?? '',
      url: `${baseUrl}/posts/${p.path}`,
      date: dayjs(p.date).toISOString(),
      guid: `post-${p.path}`,
      categories: p.tags,
      author: siteConfig.author,
      enclosure: p.cover
        ? { url: `${baseUrl}${parseAsset(p.path, p.cover, 'posts')}` }
        : undefined,
    });
  });

  return new Response(feed.xml({ indent: true }), {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Last-Modified': lastModified,
      ETag: etag,
    },
  });
}
