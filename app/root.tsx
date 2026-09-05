import {
  isRouteErrorResponse,
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";
import type { Route } from "./+types/root";
import { pageMeta } from "~/lib/meta";
import { siteConfig } from "~/lib/site-config";
import "./app.css";

export function meta() {
  return pageMeta({ path: "/" });
}

// Applied before hydration so the correct theme paints on first frame
// (storage -> system preference -> light), preventing a light flash.
const themeScript = `
(function () {
  try {
    var stored = localStorage.getItem('dark-mode') || localStorage.getItem('darkMode');
    var dark = stored === 'true' || stored === 'dark' ||
      ((stored === null || stored === '') &&
        window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.classList.toggle('dark', dark);
  } catch (e) {}
})();
`;

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" type="image/jpeg" href="/logo.jpg" />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
        {siteConfig.analytics.websiteId ? (
          <script
            async
            defer
            src={siteConfig.analytics.script}
            data-website-id={siteConfig.analytics.websiteId}
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
      <p className="eyebrow mb-3">{is404 ? "not found" : "error"}</p>
      <h1 className="font-heading mb-3 text-6xl font-bold tracking-tight">{message}</h1>
      <p className="text-muted-foreground mb-8">{details}</p>
      <Link
        to="/"
        className="bg-primary text-primary-foreground inline-flex items-center rounded-lg px-4 py-2 text-sm font-medium transition-opacity hover:opacity-90"
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
