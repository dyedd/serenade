import {
  isRouteErrorResponse,
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useRouteLoaderData,
} from "react-router";
import type { Route } from "./+types/root";
import { pageMeta } from "~/lib/meta";
import "./app.css";
import "./hljs-dark.css";

export function loader() {
  return {
    author: process.env.SITE_AUTHOR || '匿名作者',
    title: process.env.SITE_TITLE || '未命名站点',
    description: process.env.SITE_DESCRIPTION || '',
    keywords: process.env.SITE_KEYWORDS || '',
    url: (process.env.SITE_URL || '').replace(/\/$/, ''),
    email: process.env.SITE_EMAIL || '',
    lang: process.env.SITE_LANG || 'zh-CN',
    avatar: process.env.SITE_PROFILE_AVATAR || '/avatar.jpg',
    github: process.env.SITE_GITHUB_URL || '',
    startTime: process.env.SITE_START_TIME || '',
    icpLabel: process.env.SITE_FOOTER_ICP_LABEL || '',
    analyticsScript: process.env.SITE_ANALYTICS_SCRIPT || '',
    analyticsWebsiteId: process.env.SITE_ANALYTICS_WEBSITE_ID || '',
  };
}

export function meta({ loaderData }: Route.MetaArgs) {
  return pageMeta(loaderData, { path: "/" });
}

// Applied before hydration so the correct theme paints on first frame
// (storage -> system preference -> light), preventing a light flash.
const themeScript = `
(function () {
  try {
    var stored = localStorage.getItem('dark-mode') || localStorage.getItem('darkMode');
    var dark = stored === 'true' || stored === 'dark' ||
      ((stored !== 'false' && stored !== 'light') &&
        window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.classList.toggle('dark', dark);
  } catch (e) {}
})();
`;

export function Layout({ children }: { children: React.ReactNode }) {
  const site = useRouteLoaderData<typeof loader>('root');
  return (
    <html lang={site?.lang || 'zh-CN'} suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#f6f5f4" />
        <link rel="icon" type="image/png" sizes="96x96" href="/favicon-96x96.png" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
        {site?.analyticsScript && site.analyticsWebsiteId ? (
          <script
            async
            defer
            src={site.analyticsScript}
            data-website-id={site.analyticsWebsiteId}
          />
        ) : null}
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  const is404 = isRouteErrorResponse(error) && error.status === 404;
  let message = is404 ? "404" : "出错了";
  let details = is404
    ? "页面不存在或已被移除。"
    : isRouteErrorResponse(error)
      ? error.statusText || "请求失败。"
      : "发生了意外错误。";
  let stack: string | undefined;

  if (!isRouteErrorResponse(error) && import.meta.env.DEV && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center px-6 py-24 text-center">
      <h1 className="font-heading mb-3 text-5xl font-semibold tracking-tight">{message}</h1>
      <p className="text-muted-foreground mb-8">{details}</p>
      <Link
        to="/"
        className="inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity duration-200 ease hover:opacity-90"
      >
        回到首页
      </Link>
      {stack ? (
        <pre className="mt-8 w-full overflow-x-auto rounded-lg border border-border bg-muted p-4 text-left text-xs">
          <code>{stack}</code>
        </pre>
      ) : null}
    </main>
  );
}
