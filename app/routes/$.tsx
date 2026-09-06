// Catch-all splat route: handles `<id>.html` redirects and falls
// through to the root error boundary for genuine 404s.
import { Link } from 'react-router';
import type { Route } from './+types/$';
import { resolveRedirect } from '~/lib/redirects';

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
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center py-24 text-center">
      <p className="eyebrow mb-3">lost</p>
      <h1 className="font-heading mb-3 text-6xl font-bold tracking-tight">404</h1>
      <p className="tty-prompt mb-2">exit 1</p>
      <p className="mb-8 text-muted-foreground">页面不存在或已被移除。</p>
      <Link
        to="/"
        className="bg-primary text-primary-foreground inline-flex items-center rounded-lg px-4 py-2 text-sm font-medium transition-opacity hover:opacity-90"
      >
        回到首页
      </Link>
    </div>
  );
}
