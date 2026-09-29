import { Link } from 'react-router';
import type { ColumnSummary } from '~/lib/content/columns';

export function ColumnCard({ col }: { col: ColumnSummary }) {
  return (
    <Link
      to={`/columns/${col.path}`}
      className="card-lift group flex gap-4 paper-card p-6 shadow-none"
    >
      <div className="min-w-0 flex-1">
        {col.type ? (
          <span className="mb-2 inline-flex rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">
            {col.type}
          </span>
        ) : null}
        <h2 className="font-heading text-lg font-semibold leading-snug text-foreground transition-colors duration-200 ease group-hover:text-(--brand)">
          {col.title}
        </h2>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-black/60">
          {col.description || '暂无描述'}
        </p>
        <p className="mt-3 text-sm text-black/60">
          {col.date ? <time dateTime={col.date}>{col.date}</time> : null}
          {col.date ? <span> · </span> : null}
          <span>{col.chapterCount} 篇</span>
        </p>
      </div>
      {col.image ? (
        <img
          src={col.image}
          alt=""
          width={112}
          height={80}
          loading="lazy"
          decoding="async"
          className="h-20 w-28 shrink-0 rounded-lg object-cover"
        />
      ) : null}
    </Link>
  );
}
