// Posts filtered by tag. URL-decodes the tag name from the slug.
// Rows mirror posts._index.tsx: cover thumbnail + mono meta + #tags.
import { Link } from 'react-router';
import type { Route } from './+types/tags.$tag';
import { getPostsByTag } from '~/lib/content/tags';
import { Pagination } from '~/components/Pagination';
import { pageMeta } from '~/lib/meta';
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '~/components/ui/empty';
import { FileText } from 'lucide-react';
import { PageHeader } from '~/components/PageHeader';

export function meta({ params }: Route.MetaArgs) {
  const tag = decodeURIComponent(params.tag);
  return pageMeta({ title: `#${tag}`, path: `/tags/${params.tag}` });
}

export async function loader({ params, request }: Route.LoaderArgs) {
  const tag = decodeURIComponent(params.tag);
  const url = new URL(request.url);
  const page = Number.parseInt(url.searchParams.get('page') ?? '1', 10) || 1;
  const posts = await getPostsByTag(tag, { page, pageSize: 10 });
  return { tag, posts };
}

export default function TagPosts({ loaderData }: Route.ComponentProps) {
  const { tag, posts } = loaderData;
  return (
    <section className="py-8">
      <PageHeader
        eyebrow={
          <Link to="/tags" className="transition-colors hover:text-(--brand)">
            tags
          </Link>
        }
        title={`#${tag}`}
        meta={`共 ${posts.totalItems} 篇`}
      />

      {posts.data.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FileText />
            </EmptyMedia>
            <EmptyTitle>暂无文章</EmptyTitle>
            <EmptyDescription>该标签下还没有文章。</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <ul className="divide-y divide-border">
          {posts.data.map((post) => (
            <li key={post.path} className="py-5">
              <article className="group flex gap-5">
                {post.cover ? (
                  <Link
                    to={`/posts/${post.path}`}
                    className="w-40 shrink-0 aspect-[16/9] overflow-hidden rounded-lg border border-border bg-muted"
                  >
                    <img
                      src={post.cover}
                      alt={post.title}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </Link>
                ) : null}
                <div className="flex-1 min-w-0">
                  <h2 className="font-heading mb-2 text-lg font-bold leading-snug">
                    <Link
                      to={`/posts/${post.path}`}
                      className="text-foreground hover:text-(--brand) transition-colors"
                    >
                      {post.title}
                    </Link>
                  </h2>
                  <div className="mono-meta flex flex-wrap items-center gap-x-3 gap-y-1 mb-2">
                    <time>{post.date}</time>
                    <span aria-hidden>·</span>
                    <span>{post.readingTime}</span>
                    {post.tags.map((t) => (
                      <Link
                        key={t}
                        to={`/tags/${encodeURIComponent(t)}`}
                        className={t === tag ? 'text-(--brand)' : 'transition-colors hover:text-(--brand)'}
                      >
                        #{t}
                      </Link>
                    ))}
                  </div>
                  {post.abstract ? (
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{post.abstract}</p>
                  ) : null}
                </div>
              </article>
            </li>
          ))}
        </ul>
      )}

      <Pagination
        page={posts.page}
        totalPages={posts.totalPages}
        basePath={`/tags/${encodeURIComponent(tag)}`}
      />
    </section>
  );
}
