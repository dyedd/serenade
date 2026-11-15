import { useEffect, useState } from 'react';
import { useRouteLoaderData } from 'react-router';
import type { loader } from '~/root';
import { formatUptime } from '~/lib/content/reading-time';

function Uptime({ startTime }: { startTime: string }) {
  const [uptime, setUptime] = useState(() => formatUptime(startTime));

  useEffect(() => {
    const update = () => setUptime(formatUptime(startTime));
    update();
    const timer = window.setInterval(update, 60 * 60 * 1000);
    return () => window.clearInterval(timer);
  }, [startTime]);

  return (
    <p>
      已运行 <span title={`${uptime.days} 天`}>{uptime.text}</span>
    </p>
  );
}

export function Footer() {
  const year = new Date().getFullYear();
  const site = useRouteLoaderData<typeof loader>('root')!;

  return (
    <footer className="relative z-10 border-t border-border">
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-3 px-6 py-10 text-center text-sm text-muted-foreground">
        {site.startTime ? <Uptime startTime={site.startTime} /> : null}
        <p>
          © {year} {site.author}
        </p>
        <p className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
          <a
            href="https://github.com/dyedd/serenade"
            target="_blank"
            rel="noreferrer"
            className="transition-colors duration-200 ease hover:text-foreground"
          >
            Powered by serenade
          </a>
          {site.icpLabel ? (
            <a
              href="https://beian.miit.gov.cn/"
              target="_blank"
              rel="noreferrer"
              className="transition-colors duration-200 ease hover:text-foreground"
            >
              {site.icpLabel}
            </a>
          ) : null}
        </p>
      </div>
    </footer>
  );
}
