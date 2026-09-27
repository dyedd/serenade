// Single chapter within a column. Reader layout: sticky left chapter
// sidebar (lg+), breadcrumb with last-modified date, right sticky TOC, and
// prev/next chapter navigation cards.
import { Link } from 'react-router';
import { ArrowLeft, ArrowRight, Clock } from 'lucide-react';
import type { Route } from './+types/columns.$path.$chapter';
import { getChapter, getColumn } from '~/lib/content/columns';
import { extractHeadings } from '~/lib/content/extract-headings';
import { pageMeta } from '~/lib/meta';
import { useCodeCopy } from '~/hooks/useCodeCopy';
import { TableOfContents } from '~/components/TableOfContents';
import { ColumnSidebar } from '~/components/columns/ColumnSidebar';
import { MobileDocNav } from '~/components/MobileDocNav';

export function meta({ loaderData }: Route.MetaArgs) {
  if (!loaderData) return pageMeta({ title: '专栏' });
  return pageMeta({
    title: loaderData.chapter.meta.title,
    path: `/columns/${loaderData.path}/${loaderData.chapter.fileName}`,
  });
}

export async function loader({ params }: Route.LoaderArgs) {
  const [column, chapter] = await Promise.all([
    getColumn(params.path),
    getChapter(params.path, params.chapter),
  ]);
  if (!column || !chapter) throw new Response('Not Found', { status: 404 });

  // 上一篇/下一篇由章节在（已排序的）章节列表中的位置决定。
  const index = column.chapters.findIndex((ch) => ch.fileName === chapter.fileName);
  const readmeMeta = column.meta as { title?: string; type?: string; date?: string };

  return {
    path: params.path,
    columnTitle: readmeMeta.title ?? params.path,
    columnType: readmeMeta.type ?? '',
    // 章节正文没有独立日期字段，面包屑显示专栏（README）日期。
    columnDate: readmeMeta.date ?? '',
    chapters: column.chapters,
    chapter,
    prev: index > 0 ? column.chapters[index - 1] : null,
    next: index >= 0 && index < column.chapters.length - 1 ? column.chapters[index + 1] : null,
    headings: extractHeadings(chapter.html),
  };
}

export default function ChapterDetail({ loaderData }: Route.ComponentProps) {
  const { path, columnTitle, columnType, columnDate, chapters, chapter, prev, next, headings } =
    loaderData;
  useCodeCopy();

  const sidebar = (
    <ColumnSidebar
      path={path}
      title={columnTitle}
      type={columnType}
      chapters={chapters.map((ch) => ({ fileName: ch.fileName, title: ch.meta.title }))}
      activeFile={chapter.fileName}
    />
  );

  return (
    <div className="doc-rail grid grid-cols-1 py-2 lg:grid-cols-[17rem_1fr_14rem] lg:gap-10">
      <aside className="hidden lg:sticky lg:top-24 lg:block lg:self-start">{sidebar}</aside>
      <article className="min-w-0">
      <MobileDocNav toc={headings} sidebar={sidebar} />

      <div className="mb-8 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-border pb-4">
        <nav className="text-sm text-black/60" aria-label="breadcrumb">
          <Link to="/columns" className="transition-colors duration-200 ease hover:text-black">
            专栏
          </Link>
          <span className="mx-1.5" aria-hidden>
            /
          </span>
          <Link to={`/columns/${path}`} className="transition-colors duration-200 ease hover:text-black">
            {columnTitle}
          </Link>
          <span className="mx-1.5" aria-hidden>
            /
          </span>
          <span className="text-foreground">{chapter.meta.title}</span>
        </nav>
        {columnDate ? (
          <span className="inline-flex items-center gap-1.5 text-sm text-black/60">
            <Clock className="h-3.5 w-3.5" aria-hidden />
            更新于 <time dateTime={columnDate}>{columnDate}</time>
          </span>
        ) : null}
      </div>

      <h1 className="font-heading mb-8 text-[2rem] font-semibold leading-tight tracking-[-0.02em]">
        {chapter.meta.title}
      </h1>

      <div
        className="prose-blog prose prose-neutral max-w-none prose-headings:scroll-mt-24 prose-headings:font-heading prose-headings:font-semibold prose-pre:bg-transparent prose-pre:p-0 prose-code:before:content-none prose-code:after:content-none"
        dangerouslySetInnerHTML={{ __html: chapter.html }}
      />

      <nav className="mt-20 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {prev ? (
          <Link
            to={`/columns/${path}/${prev.fileName}`}
            className="card-lift group flex flex-col gap-1.5 paper-card p-6 shadow-none"
          >
            <span className="flex items-center gap-1.5 text-sm text-black/60">
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden /> 上一篇
            </span>
            <span className="line-clamp-2 font-semibold text-foreground transition-colors duration-200 ease group-hover:text-(--brand)">
              {prev.meta.title}
            </span>
          </Link>
        ) : (
          <div />
        )}
        {next ? (
          <Link
            to={`/columns/${path}/${next.fileName}`}
            className="card-lift group flex flex-col gap-1.5 paper-card p-6 text-right shadow-none"
          >
            <span className="flex items-center justify-end gap-1.5 text-sm text-black/60">
              下一篇 <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </span>
            <span className="line-clamp-2 font-semibold text-foreground transition-colors duration-200 ease group-hover:text-(--brand)">
              {next.meta.title}
            </span>
          </Link>
        ) : (
          <div />
        )}
      </nav>
      </article>
      <aside className="hidden lg:sticky lg:top-24 lg:block lg:self-start">
        <TableOfContents entries={headings} />
      </aside>
    </div>
  );
}
