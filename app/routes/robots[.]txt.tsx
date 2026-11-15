import type { Route } from './+types/robots[.]txt';

export async function loader(_: Route.LoaderArgs) {
  const baseUrl = (process.env.SITE_URL || '').replace(/\/$/, '');
  return new Response(
    [`User-agent: *`, `Allow: /`, `Disallow: /api/`, `Sitemap: ${baseUrl}/sitemap.xml`, ''].join('\n'),
    { headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
  );
}
