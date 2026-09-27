// Catch-all splat route: handles `<id>.html` redirects and falls
// through to the root error boundary for genuine 404s.
import { Link } from 'react-router';
import type { Route } from './+types/$';
import { resolveRedirect } from '~/lib/redirects';

export function meta() {
  return [{ name: 'robots', content: 'noindex, follow' }];
}

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const pathname = url.pathname.replace(/\/$/, '') || '/';
  if (pathname === '/feed') {
    throw new Response(null, { status: 301, headers: { Location: '/feed.xml' } });
  }
  const target = resolveRedirect(url.pathname.slice(1));
  if (target) {
    throw new Response(null, { status: 301, headers: { Location: target } });
  }
  throw new Response('Not Found', { status: 404 });
}

export default function CatchAll() {
  return null;
}

export function ErrorBoundary() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center gap-20 py-24 text-center">
      <div className="paper-card card-lift p-6 text-center shadow-none">
        <h1 className="font-heading mb-3 text-5xl font-semibold tracking-tight">404</h1>
        <p className="page-lead">页面不存在或已被移除。</p>
      </div>
      <Link
        to="/"
        className="inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity duration-200 ease hover:opacity-90"
      >
        回到首页
      </Link>
    </div>
  );
}
