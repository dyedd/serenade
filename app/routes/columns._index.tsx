// Column list with chapter counts.
import type { Route } from './+types/columns._index';
import { BookOpen } from 'lucide-react';
import { listColumns } from '~/lib/content/columns';
import { Pagination } from '~/components/Pagination';
import { ColumnCard } from '~/components/columns/ColumnCard';
import { pageMeta } from '~/lib/meta';
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '~/components/ui/empty';
import { PageHeader } from '~/components/PageHeader';

export function meta(_: Route.MetaArgs) {
  return pageMeta({ title: '专栏', path: '/columns', description: '系统化的学习笔记' });
}

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const page = Number.parseInt(url.searchParams.get('page') ?? '1', 10) || 1;
  return listColumns({ page, pageSize: 12 });
}

export default function ColumnsIndex({ loaderData }: Route.ComponentProps) {
  const { data: cols, totalDocs, page, totalPages } = loaderData;
  return (
    <section className="py-8">
      <PageHeader
        eyebrow="columns"
        title="专栏"
        meta={`${cols.length} 个专栏 · ${totalDocs} 篇文档`}
      />
      {cols.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <BookOpen />
            </EmptyMedia>
            <EmptyTitle>暂无专栏</EmptyTitle>
            <EmptyDescription>创建第一个专栏后就会显示在这里。</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <ul className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {cols.map((col) => (
            <li key={col.path}>
              <ColumnCard col={col} />
            </li>
          ))}
        </ul>
      )}
      <Pagination page={page} totalPages={totalPages} basePath="/columns" />
    </section>
  );
}
