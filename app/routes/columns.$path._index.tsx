// Column detail: README content + chapter list (sidebar-style navigation).
import { Link } from 'react-router';
import { ArrowRight, BookOpen, Calendar } from 'lucide-react';
import type { Route } from './+types/columns.$path._index';
import { getColumn } from '~/lib/content/columns';
import { pageMeta } from '~/lib/meta';
import { Badge } from '~/components/ui/badge';
import { ColumnSidebar } from '~/components/columns/ColumnSidebar';
import { MobileDocNav } from '~/components/MobileDocNav';
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '~/components/ui/empty';

export function meta({ loaderData }: Route.MetaArgs) {
  if (!loaderData) return pageMeta({ title: '专栏' });
  const title =
    (loaderData.column.meta as { title?: string })?.title ?? loaderData.path;
  return pageMeta({ title, path: `/columns/${loaderData.path}` });
}

export async function loader({ params, request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const slug = url.searchParams.get('slug');
  if (slug) {
    throw new Response(null, {
      status: 301,
      headers: { Location: `/columns/${params.path}/${slug}` },
    });
  }
  const column = await getColumn(params.path);
  if (!column) throw new Response('Not Found', { status: 404 });
  return { path: params.path, column };
}

export default function ColumnDetail({ loaderData }: Route.ComponentProps) {
  const { path, column } = loaderData;
  const meta = column.meta as { title?: string; type?: string; date?: string };
  const title = meta.title ?? path;

  const sidebar = (
    <ColumnSidebar
      path={path}
      title={title}
      type={meta.type ?? ''}
      chapters={column.chapters.map((ch) => ({ fileName: ch.fileName, title: ch.meta.title }))}
      activeFile={null}
    />
  );

  return (
    <div className="doc-rail py-2 lg:grid lg:grid-cols-[17rem_1fr] lg:gap-10">
      <aside className="hidden lg:sticky lg:top-24 lg:block lg:self-start">{sidebar}</aside>
      <div className="min-w-0">
        <nav className="mb-6 text-sm text-black/60" aria-label="breadcrumb">
          <Link to="/columns" className="transition-colors duration-200 ease hover:text-black">
            专栏
          </Link>
          <span className="mx-1.5" aria-hidden>
            /
          </span>
          <span className="text-foreground">{title}</span>
        </nav>

        <MobileDocNav toc={[]} sidebar={sidebar} />

        <header className="mb-20 border-b border-border pb-6">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <h1 className="font-heading text-[2rem] font-semibold leading-tight tracking-[-0.02em]">{title}</h1>
            {meta.type ? <Badge variant="brand">{meta.type}</Badge> : null}
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-black/60">
            {meta.date ? (
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" aria-hidden />
                <time dateTime={meta.date}>{meta.date}</time>
              </span>
            ) : null}
            <span className="inline-flex items-center gap-1.5">
              <BookOpen className="h-3.5 w-3.5" aria-hidden />
              {column.chapters.length} 章
            </span>
          </div>
        </header>

        <article className="min-w-0">
          {column.html.length > 0 ? (
            <div
              className="prose-blog prose prose-neutral max-w-none prose-headings:scroll-mt-24 prose-headings:font-heading prose-headings:font-semibold prose-pre:bg-transparent prose-pre:p-0 prose-code:before:content-none prose-code:after:content-none"
              dangerouslySetInnerHTML={{ __html: column.html }}
            />
          ) : column.chapters.length > 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <BookOpen />
                </EmptyMedia>
                <EmptyTitle>本专栏暂未填写简介</EmptyTitle>
                <EmptyDescription>共 {column.chapters.length} 章，从第一章开始阅读。</EmptyDescription>
              </EmptyHeader>
              <Link
                to={`/columns/${path}/${column.chapters[0].fileName}`}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity duration-200 ease hover:opacity-90"
              >
                从第一章开始 <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </Empty>
          ) : (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <BookOpen />
                </EmptyMedia>
                <EmptyTitle>暂无章节</EmptyTitle>
                <EmptyDescription>这个专栏还没有内容。</EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}
        </article>
      </div>
    </div>
  );
}
