import { useEffect, useState } from 'react';
import { siteConfig } from '~/lib/site-config';
import { formatUptime } from '~/lib/content/reading-time';

function Uptime() {
  const [uptime, setUptime] = useState(() => formatUptime(siteConfig.startTime));

  useEffect(() => {
    const update = () => setUptime(formatUptime(siteConfig.startTime));
    update();
    const timer = window.setInterval(update, 60 * 60 * 1000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <p>
      已运行 <span title={`${uptime.days} 天`}>{uptime.text}</span>
    </p>
  );
}

export function Footer() {
  const year = new Date().getFullYear();
  const { footer } = siteConfig;

  return (
    <footer className="relative z-10 border-t border-border">
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-3 px-6 py-10 text-center text-sm text-muted-foreground">
        <Uptime />
        <p>
          © {year} {footer.copyrightName}
        </p>
        <p className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
          <a
            href={footer.poweredBy.url}
            target="_blank"
            rel="noreferrer"
            className="transition-colors duration-200 ease hover:text-foreground"
          >
            {footer.poweredBy.label}
          </a>
          <a
            href={footer.icp.url}
            target="_blank"
            rel="noreferrer"
            className="transition-colors duration-200 ease hover:text-foreground"
          >
            {footer.icp.label}
          </a>
        </p>
      </div>
    </footer>
  );
}
