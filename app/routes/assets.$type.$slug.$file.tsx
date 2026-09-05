// GET /api/assets/:type/:slug/:file
// Streams files from content/<type>/<slug>/<file> with correct Content-Type.
// Used by markdown images whose src was rewritten to /assets/<type>/<slug>/<file>.
import path from 'node:path';
import fs from 'node:fs/promises';
import type { Route } from './+types/assets.$type.$slug.$file';

const CONTENT_ROOT = path.join(process.cwd(), 'content');

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

export async function loader({ params }: Route.LoaderArgs) {
  const filePath = path.join(CONTENT_ROOT, params.type, params.slug, params.file);

  // Path traversal guard: ensure resolved path stays inside CONTENT_ROOT.
  const resolved = path.resolve(filePath);
  if (!resolved.startsWith(path.resolve(CONTENT_ROOT) + path.sep)) {
    throw new Response('Forbidden', { status: 403 });
  }

  try {
    const buffer = await fs.readFile(resolved);
    const ext = path.extname(resolved).toLowerCase();
    const contentType = MIME[ext] ?? 'application/octet-stream';
    return new Response(buffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch {
    throw new Response('Not Found', { status: 404 });
  }
}
