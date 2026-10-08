import path from 'node:path';
import fs from 'node:fs/promises';
import type { Route } from './+types/assets.$type.$slug.$file';
import { toPosixPath } from '~/lib/content/posts';

const CONTENT_ROOT = path.join(process.cwd(), 'content');

// 只允许图片扩展名：这个路由是公开可预测地址，不加白名单就等于把 content/ 下
// 任何可预测路径（friends.json 等）变成可下载文件。
const MIME: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.avif': 'image/avif',
};

const ASSET_TYPES = new Set(['posts', 'columns']);

export async function loader({ params }: Route.LoaderArgs) {
  const { type, slug, file } = params;

  // react-router 会把 %2F 还原成分隔符，所以这里必须挡掉路径片段。
  const hasTraversal =
    [type, slug, file].some(
      (segment) =>
        !segment ||
        segment !== path.basename(segment) ||
        segment.includes('/') ||
        segment.includes('\\')
    );
  if (hasTraversal || !ASSET_TYPES.has(type)) {
    throw new Response('Forbidden', { status: 403 });
  }

  const ext = path.extname(file).toLowerCase();
  if (!MIME[ext]) {
    throw new Response('Forbidden', { status: 403 });
  }

  const filePath = path.join(CONTENT_ROOT, type, slug, file);

  // 路径穿越兜底：解析后的路径必须仍在 CONTENT_ROOT 之内。
  const resolved = path.resolve(filePath);
  if (!toPosixPath(resolved).startsWith(`${toPosixPath(path.resolve(CONTENT_ROOT))}/`)) {
    throw new Response('Forbidden', { status: 403 });
  }

  try {
    const buffer = await fs.readFile(resolved);
    return new Response(buffer, {
      headers: {
        'Content-Type': MIME[ext],
        'Content-Length': String(buffer.byteLength),
        // 地址由 type/slug/file 唯一确定，内容变更会改变文件名之外的引用关系。
        'Cache-Control': 'public, max-age=31536000, immutable',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error) {
    const code = (error as NodeJS.ErrnoException)?.code;
    if (code === 'ENOENT' || code === 'EISDIR') {
      throw new Response('Not Found', { status: 404 });
    }
    throw error;
  }
}
