// Table of Contents: receives pre-parsed entries (computed server-side in
// the route loader so SSR HTML is complete and SEO-friendly). Highlights the
// active section via IntersectionObserver on the client.
import { useEffect, useState } from 'react';

export interface TocEntry {
  id: string;
  text: string;
  level: 2 | 3 | 4;
}

export function TableOfContents({
  entries,
  onNavigate,
}: {
  entries: TocEntry[];
  onNavigate?: () => void;
}) {
  const [active, setActive] = useState<string | null>(entries[0]?.id ?? null);

  useEffect(() => {
    if (entries.length === 0) return;
    const observer = new IntersectionObserver(
      (records) => {
        const visible = records.filter((r) => r.isIntersecting);
        if (visible.length > 0) {
          // Pick the topmost visible heading.
          const top = visible.reduce((a, b) =>
            a.boundingClientRect.top < b.boundingClientRect.top ? a : b
          );
          setActive(top.target.id);
        }
      },
      { rootMargin: '-80px 0px -70% 0px', threshold: 0 }
    );
    entries.forEach((e) => {
      const el = document.getElementById(e.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [entries]);

  if (entries.length === 0) return null;

  return (
    <nav className="text-sm" aria-label="目录">
      <p className="eyebrow mb-3">本页目录</p>
      <ul className="flex flex-col gap-1.5 border-l border-border">
        {entries.map((e) => (
          <li
            key={e.id}
            className={[
              e.level === 3 ? 'pl-5' : e.level === 4 ? 'pl-8' : 'pl-3',
              'border-l-2 -ml-px transition-colors font-mono text-[13px] leading-snug',
              active === e.id
                ? 'border-(--brand) text-(--brand)'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border',
            ].join(' ')}
          >
            <a
              href={`#${e.id}`}
              className="block py-0.5"
              onClick={(ev) => {
                ev.preventDefault();
                const el = document.getElementById(e.id);
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  history.replaceState(null, '', `#${e.id}`);
                }
                onNavigate?.();
              }}
            >
              {e.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
