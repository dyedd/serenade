import { useEffect, useState } from 'react';

export interface TocEntry {
  id: string;
  text: string;
  level: 2 | 3 | 4;
}

export function TableOfContents({
  entries,
  onNavigate,
  labels = 'hover',
}: {
  entries: TocEntry[];
  onNavigate?: () => void;
  /** hover：平时只显示短线，移上去再展开标题。always：抽屉里直接显示文字。 */
  labels?: 'hover' | 'always';
}) {
  const [active, setActive] = useState<string | null>(entries[0]?.id ?? null);

  useEffect(() => {
    if (entries.length === 0) return;
    const observer = new IntersectionObserver(
      (records) => {
        const visible = records.filter((r) => r.isIntersecting);
        if (visible.length > 0) {
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

  const showLabels = labels === 'always';

  return (
    <nav className="group/toc text-sm" aria-label="目录">
      <ul className="flex flex-col gap-2.5">
        {entries.map((e) => (
          <li key={e.id}>
            <a
              href={`#${e.id}`}
              // 键盘聚焦时也要展开文字：只绑 hover 的话 Tab 过去什么都看不到。
              className="group/item flex items-center rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--brand)"
              aria-current={active === e.id ? 'true' : undefined}
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
              {showLabels ? null : (
                <span
                  aria-hidden
                  className={[
                    'w-12 shrink-0 rounded-sm transition-all duration-200 ease group-hover/toc:w-0 group-hover/toc:opacity-0 group-focus-within/toc:w-0 group-focus-within/toc:opacity-0',
                    active === e.id ? 'h-[3px] bg-black' : 'h-px bg-black/20',
                  ].join(' ')}
                />
              )}
              <span
                className={[
                  'overflow-hidden whitespace-nowrap font-heading text-sm leading-snug transition-all duration-200 ease',
                  showLabels
                    ? 'max-w-56 opacity-100'
                    : 'max-w-0 opacity-0 group-hover/toc:max-w-56 group-hover/toc:opacity-100 group-focus-within/toc:max-w-56 group-focus-within/toc:opacity-100',
                  e.level === 3
                    ? 'group-hover/toc:pl-3 group-focus-within/toc:pl-3'
                    : e.level === 4
                      ? 'group-hover/toc:pl-6 group-focus-within/toc:pl-6'
                      : '',
                  showLabels && e.level === 3 ? 'pl-3' : '',
                  showLabels && e.level === 4 ? 'pl-6' : '',
                  active === e.id
                    ? 'font-semibold text-black'
                    : 'text-black/70 group-hover/item:font-semibold group-hover/item:text-black',
                ].join(' ')}
              >
                {e.text}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
