import type { Route } from './+types/robots[.]txt';
import { siteConfig } from '~/lib/site-config';

export async function loader(_: Route.LoaderArgs) {
  const baseUrl = siteConfig.url.replace(/\/$/, '');
  return new Response(
    [`User-agent: *`, `Allow: /`, `Disallow: /api/`, `Sitemap: ${baseUrl}/sitemap.xml`, ''].join('\n'),
    { headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
  );
}
