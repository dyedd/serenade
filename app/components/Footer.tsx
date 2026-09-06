// Site footer: copyright, uptime counter, powered-by, ICP + "找到我" social
// icon row (iconfont), styled as a quiet terminal status line.
import { siteConfig } from '~/lib/site-config';
import { formatUptime } from '~/lib/content/reading-time';

const uptime = formatUptime(siteConfig.startTime);

export function Footer() {
  const year = new Date().getFullYear();
  const { footer, socialLinks } = siteConfig;

  return (
    <footer>
      <div className="mx-auto max-w-5xl px-6 py-8 flex flex-col items-center gap-4">
        <div className="mono-meta flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-center">
          <span>
            <span className="text-(--brand)">$</span> uptime{' '}
            <span title={`${uptime.days} 天`}>{uptime.text}</span>
          </span>
          <span aria-hidden className="text-border">|</span>
          <span>@{year} {footer.copyrightName}</span>
          <span aria-hidden className="text-border">|</span>
          <a
            href={footer.poweredBy.url}
            target="_blank"
            rel="noreferrer"
            className="hover:text-(--brand) transition-colors"
          >
            {footer.poweredBy.label}
          </a>
          <span aria-hidden className="text-border">|</span>
          <a
            href={footer.icp.url}
            target="_blank"
            rel="noreferrer"
            className="hover:text-(--brand) transition-colors"
          >
            {footer.icp.label}
          </a>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-x-2">
          <span className="tty-prompt mr-1">contact</span>
          {Object.values(socialLinks).map((link) => (
            <a
              key={link.label}
              href={link.url}
              target="_blank"
              rel="noreferrer"
              title={'title' in link ? link.title : link.label}
              aria-label={link.label}
              className="p-2 text-muted-foreground transition-colors hover:text-(--brand)"
            >
              <svg className="icon" aria-hidden="true" width="1.6rem" height="1.6rem">
                <use href={`#icon-${link.icon}`} />
              </svg>
            </a>
          ))}
        </div>
      </div>

    </footer>
  );
}
