// Tag cloud — all tags with post counts, pill size scales with usage.
import { Link } from 'react-router';
import type { Route } from './+types/tags._index';
import { listTags } from '~/lib/content/tags';
import { pageMeta } from '~/lib/meta';
import { Badge } from '~/components/ui/badge';
import { PageHeader } from '~/components/PageHeader';

export function meta(_: Route.MetaArgs) {
  return pageMeta({ title: '标签', path: '/tags', description: '按标签浏览文章' });
}

export async function loader() {
  return listTags();
}

export default function TagsIndex({ loaderData }: Route.ComponentProps) {
  const tags = Object.entries(loaderData).sort((a, b) => b[1] - a[1]);

  return (
    <section className="py-8">
      <PageHeader title="标签" meta={`共 ${tags.length} 个标签`}>
        你可以通过标签快速查找你需要的文章。
      </PageHeader>

      {tags.length === 0 ? (
        <p className="paper-card p-6 text-sm text-black/60 shadow-none">暂无标签。</p>
      ) : (
        <ul className="paper-card card-lift flex flex-wrap gap-2 p-6 shadow-none">
          {tags.map(([tag, count]) => (
            <li key={tag}>
              <Badge variant="outline" asChild className="h-auto px-3 py-1.5">
                <Link to={`/tags/${encodeURIComponent(tag)}`}>
                  <span className="font-medium">{tag}</span>
                  <span className="text-[0.7em] text-black/40 tabular-nums">{count}</span>
                </Link>
              </Badge>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
