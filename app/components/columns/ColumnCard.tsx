// 专栏卡片：整卡封面背景 + 底部渐变叠加 + 白字标题；悬浮上浮 +
// 蓝色描边走全站 card-lift。无封面时用品牌色渐变占位。
import { Link } from 'react-router';
import { BookOpen } from 'lucide-react';
import type { ColumnSummary } from '~/lib/content/columns';
import { Badge } from '~/components/ui/badge';

export function ColumnCard({ col }: { col: ColumnSummary }) {
  return (
    <Link
      to={`/columns/${col.path}`}
      className="card-lift group relative block h-56 overflow-hidden rounded-xl border border-border bg-card"
    >
      {col.image ? (
        <img
          src={col.image}
          alt={col.title}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
        />
      ) : (
        <div
          className="absolute inset-0 bg-gradient-to-br from-(--brand-soft) via-background to-(--brand-soft)"
          aria-hidden
        />
      )}

      {/* 渐变叠加层：压暗封面，保证底部白色文字可读 */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/20 to-black/90"
        aria-hidden
      />

      {col.type ? <Badge variant="brand" className="absolute top-3 right-3">{col.type}</Badge> : null}

      <div className="absolute inset-x-0 bottom-0 p-5">
        <h2 className="mb-1.5 text-xl font-extrabold tracking-tight text-white drop-shadow-sm">
          {col.title}
        </h2>
        <p className="mb-3 line-clamp-2 text-sm leading-relaxed text-white/75">
          {col.description || '暂无描述'}
        </p>
        <div className="flex items-center gap-3 font-mono text-xs text-white/70">
          <time>{col.date}</time>
          <span className="inline-flex items-center gap-1">
            <BookOpen className="h-3 w-3" aria-hidden />
            {col.chapterCount} 篇
          </span>
        </div>
      </div>
    </Link>
  );
}
