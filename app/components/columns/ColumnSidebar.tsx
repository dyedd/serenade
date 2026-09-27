// 章节页左侧导航：返回专栏链接、专栏标题 + 类型徽章、专栏概览入口、
// 编号章节列表。activeFile 为 null 表示当前在概览页。
// 宽度约 17rem，由路由的 grid 模板控制；这里只负责内容与高亮。
import { Link } from 'react-router';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { Badge } from '~/components/ui/badge';

export interface SidebarChapter {
  fileName: string;
  title: string;
}

export function ColumnSidebar({
  path,
  title,
  type,
  chapters,
  activeFile,
}: {
  path: string;
  title: string;
  type: string;
  chapters: SidebarChapter[];
  activeFile: string | null;
}) {
  return (
    <div className="max-h-[calc(100vh-7rem)] overflow-y-auto paper-card p-6 shadow-none">
      <Link
        to="/columns"
        className="mono-meta group inline-flex items-center gap-1.5 transition-colors duration-200 ease hover:text-(--brand)"
      >
        <ArrowLeft
          className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5"
          aria-hidden
        />
        返回专栏
      </Link>

      <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1.5">
        <h2 className="text-base font-bold leading-snug">{title}</h2>
        {type ? <Badge variant="brand">{type}</Badge> : null}
      </div>

      <nav className="mt-5 border-t border-border pt-4" aria-label="章节导航">
        <Link
          to={`/columns/${path}`}
          className={[
            'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors duration-200 ease',
            activeFile === null
              ? 'bg-(--brand-soft) font-semibold text-(--brand)'
              : 'text-muted-foreground hover:bg-(--brand-soft) hover:text-(--brand)',
          ].join(' ')}
        >
          <BookOpen className="h-4 w-4 shrink-0" aria-hidden />
          专栏概览
        </Link>

        <p className="mt-5 mb-2 px-3 text-sm text-black/60">目录</p>
        <ol className="space-y-0.5">
          {chapters.map((ch, i) => {
            const active = ch.fileName === activeFile;
            return (
              <li key={ch.fileName}>
                <Link
                  to={`/columns/${path}/${ch.fileName}`}
                  aria-current={active ? 'page' : undefined}
                  className={[
                    'flex items-start gap-2.5 rounded-lg px-3 py-2 text-sm leading-snug transition-colors duration-200 ease',
                    active
                      ? 'bg-(--brand-soft) font-semibold text-(--brand)'
                      : 'text-muted-foreground hover:bg-(--brand-soft) hover:text-(--brand)',
                  ].join(' ')}
                >
                  <span
                    className={[
                      'mt-px shrink-0 font-mono text-xs tabular-nums',
                      active ? 'text-(--brand)' : 'text-black/40',
                    ].join(' ')}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="line-clamp-2">{ch.title}</span>
                </Link>
              </li>
            );
          })}
        </ol>
      </nav>
    </div>
  );
}
