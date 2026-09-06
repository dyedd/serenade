// /posts — two-column archive page:
//   left  : posts grouped by year, paginated (numbered pager)
//   right : 统计 (heatmap) + 标签 cloud + "查看全部 →"
import { Link } from 'react-router';
import { FileText, Tags } from 'lucide-react';
import { PageHeader } from '~/components/PageHeader';
import type { Route } from './+types/posts._index';
import { listPostDates, listPosts, type PostSummary } from '~/lib/content/posts';
import { listTags } from '~/lib/content/tags';
import { PostsHeatmap } from '~/components/PostsHeatmap';
import { Pagination } from '~/components/Pagination';
import { Badge } from '~/components/ui/badge';
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '~/components/ui/empty';
import { pageMeta } from '~/lib/meta';

const PAGE_SIZE = 10;

export function meta(_: Route.MetaArgs) {
  return pageMeta({ title: '文章', path: '/posts', description: '全部文章归档' });
}

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const page = Math.max(1, Number(url.searchParams.get('page')) || 1);
  const [all, tags, heatmapDates] = await Promise.all([
    listPosts({ page, pageSize: PAGE_SIZE }),
    listTags(),
    listPostDates(),
  ]);
  return {
    posts: all.data,
    page: all.page,
    totalPages: all.totalPages,
    totalItems: all.totalItems,
    tags,
    heatmapDates,
  };
}

interface YearGroup {
  year: number;
  posts: PostSummary[];
}

function groupByYear(posts: PostSummary[]): YearGroup[] {
  const map = new Map<number, PostSummary[]>();
  for (const p of posts) {
    const year = new Date(p.date).getFullYear();
    if (Number.isNaN(year)) continue;
    const bucket = map.get(year) ?? [];
    bucket.push(p);
    map.set(year, bucket);
  }
  return Array.from(map.entries())
    .sort((a, b) => b[0] - a[0])
    .map(([year, items]) => ({ year, posts: items }));
}

export default function PostsIndex({ loaderData }: Route.ComponentProps) {
  const { posts, page, totalPages, totalItems, tags, heatmapDates } = loaderData;
  const groups = groupByYear(posts);
  const sortedTags = Object.entries(tags).sort((a, b) => b[1] - a[1]);
  const maxTagCount = Math.max(1, ...sortedTags.map(([, c]) => c));

  return (
    <section className="py-8">
      <PageHeader
        eyebrow="posts"
        title="文章"
        actions={
          <Link to="/feed.xml" className="transition-colors hover:text-(--brand)">
            feed.xml
          </Link>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_18rem] gap-10">
        {/* Left: posts grouped by year */}
        <div>
          {groups.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <FileText />
                </EmptyMedia>
                <EmptyTitle>暂无文章</EmptyTitle>
                <EmptyDescription>发表第一篇文章后就会显示在这里。</EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <div className="flex flex-col gap-10">
              {groups.map((g) => (
                <section key={g.year}>
                  <h2 className="year-mark">
                    <span>
                      <span className="year-mark-dot" aria-hidden>
                        ./
                      </span>
                      <time dateTime={String(g.year)}>{g.year}</time>
                    </span>
                  </h2>
                  <ul className="divide-y divide-border">
                    {g.posts.map((p) => (
                      <li key={p.path} className="py-5">
                        <article className="flex gap-5 group">
                          {p.cover ? (
                            <Link
                              to={`/posts/${p.path}`}
                              className="shrink-0 w-40 aspect-[16/9] overflow-hidden rounded-lg border border-border bg-muted"
                            >
                              <img
                                src={p.cover}
                                alt={p.title}
                                loading="lazy"
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                              />
                            </Link>
                          ) : null}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-heading mb-2 text-lg font-bold leading-snug">
                              <Link
                                to={`/posts/${p.path}`}
                                className="text-foreground hover:text-(--brand) transition-colors"
                              >
                                {p.title}
                              </Link>
                            </h3>
                            <div className="mono-meta flex flex-wrap items-center gap-x-3 gap-y-1 mb-2">
                              <time>{p.date}</time>
                              <span aria-hidden>·</span>
                              <span>{p.readingTime}</span>
                              {p.tags.map((tag) => (
                                <Link
                                  key={tag}
                                  to={`/tags/${encodeURIComponent(tag)}`}
                                  className="hover:text-(--brand) transition-colors"
                                >
                                  #{tag}
                                </Link>
                              ))}
                            </div>
                            {p.abstract ? (
                              <p className="text-sm text-muted-foreground line-clamp-2">{p.abstract}</p>
                            ) : null}
                          </div>
                        </article>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          )}

          <Pagination page={page} totalPages={totalPages} basePath="/posts" />
        </div>

        {/* Right: stats (heatmap) + tag cloud */}
        <aside className="flex flex-col gap-6 lg:sticky lg:top-24 lg:self-start">
          <PostsHeatmap
            posts={heatmapDates.map((date) => ({ date }))}
            totalCount={totalItems}
          />

          <div>
            <h3 className="inline-flex items-center gap-2 text-[1.05rem] font-semibold text-foreground mb-4">
              <Tags className="h-4 w-4 text-(--brand)" aria-hidden />
              标签
            </h3>
            <div className="flex flex-wrap gap-2">
              {sortedTags.map(([tag, count]) => {
                const scale = 0.85 + (count / maxTagCount) * 0.25;
                return (
                  <Badge
                    key={tag}
                    variant="outline"
                    asChild
                    className="h-auto px-2.5 py-1 [a]:hover:border-(--brand-line) [a]:hover:text-(--brand)"
                    style={{ fontSize: `${scale}em` }}
                  >
                    <Link to={`/tags/${encodeURIComponent(tag)}`}>
                      {tag}
                      <span className="ml-1 font-mono text-[0.7em] text-muted-foreground tabular-nums">
                        {count}
                      </span>
                    </Link>
                  </Badge>
                );
              })}
            </div>
            <Link
              to="/tags"
              className="inline-block mt-4 text-sm text-(--brand) hover:underline"
            >
              查看全部 →
            </Link>
          </div>
        </aside>
      </div>
    </section>
  );
}
