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
  const max = Math.max(1, ...tags.map(([, c]) => c));

  return (
    <section className="py-8">
      <PageHeader eyebrow="tags" title="标签" meta={`共 ${tags.length} 个标签`}>
        你可以通过标签快速查找你需要的文章。
      </PageHeader>

      {tags.length === 0 ? (
        <p className="text-muted-foreground">暂无标签。</p>
      ) : (
        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {tags.map(([tag, count]) => {
            const scale = 0.85 + (count / max) * 0.4;
            return (
              <li key={tag}>
                <Badge
                  variant="outline"
                  asChild
                  className="h-auto w-full justify-between px-3 py-2 [a]:hover:border-(--brand-line) [a]:hover:text-(--brand)"
                  style={{ fontSize: `${scale}em` }}
                >
                  <Link to={`/tags/${encodeURIComponent(tag)}`}>
                    <span className="font-medium">#{tag}</span>
                    <span className="font-mono text-[0.7em] text-muted-foreground tabular-nums">
                      {count}
                    </span>
                  </Link>
                </Badge>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
