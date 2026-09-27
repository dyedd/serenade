import type { Route } from './+types/sitemap[.]xml';
import { getColumn, listColumns } from '~/lib/content/columns';
import { listPostIndex } from '~/lib/content/posts';
import { listTags } from '~/lib/content/tags';
import { siteConfig } from '~/lib/site-config';

function escapeXml(value: string): string {
  return value.replace(/[<>&'\"]/g, (char) => ({
    '<': '&lt;',
    '>': '&gt;',
    '&': '&amp;',
    "'": '&apos;',
    '"': '&quot;',
  })[char] ?? char);
}

export async function loader(_: Route.LoaderArgs) {
  const baseUrl = siteConfig.url.replace(/\/$/, '');
  const urls = new Set([
    baseUrl,
    `${baseUrl}/posts`,
    `${baseUrl}/columns`,
    `${baseUrl}/tags`,
    `${baseUrl}/projects`,
    `${baseUrl}/friends`,
    `${baseUrl}/moments`,
  ]);

  try {
    for (const post of await listPostIndex()) {
      urls.add(`${baseUrl}/posts/${encodeURIComponent(post.path)}`);
    }
  } catch {
    // 站点级 URL 仍可在没有内容目录时列出。
  }

  try {
    const columns = await listColumns({ page: 1, pageSize: 10000 });
    for (const column of columns.data) {
      const columnUrl = `${baseUrl}/columns/${encodeURIComponent(column.path)}`;
      urls.add(columnUrl);
      const detail = await getColumn(column.path);
      for (const chapter of detail?.chapters ?? []) {
        urls.add(`${columnUrl}/${encodeURIComponent(chapter.fileName)}`);
      }
    }
  } catch {
    // 没有专栏目录时跳过专栏 URL。
  }

  try {
    for (const tag of Object.keys(await listTags())) {
      urls.add(`${baseUrl}/tags/${encodeURIComponent(tag)}`);
    }
  } catch {
    // 没有文章时跳过标签 URL。
  }

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...[...urls].map((url) => `  <url><loc>${escapeXml(url)}</loc></url>`),
    '</urlset>',
    '',
  ].join('\n');

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=300',
    },
  });
}
