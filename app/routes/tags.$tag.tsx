// Posts filtered by tag. URL-decodes the tag name from the slug.
// Rows mirror posts._index.tsx: cover thumbnail + mono meta + #tags.
import { Link } from 'react-router';
import type { Route } from './+types/tags.$tag';
import { getPostsByTag } from '~/lib/content/tags';
import { openingExcerpts } from '~/lib/content/posts';
import { Pagination } from '~/components/Pagination';
import { pageMeta } from '~/lib/meta';
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '~/components/ui/empty';
import { FileText } from 'lucide-react';
import { PageHeader } from '~/components/PageHeader';

export function meta({ params, loaderData }: Route.MetaArgs) {
  const tag = decodeURIComponent(params.tag);
  const posts = loaderData?.posts;
  return pageMeta({
    title: `#${tag}`,
    path: `/tags/${encodeURIComponent(tag)}`,
    description: `浏览 ${tag} 标签下的文章${posts ? `，共 ${posts.totalItems} 篇` : ''}`,
  });
}

export async function loader({ params, request }: Route.LoaderArgs) {
  const tag = decodeURIComponent(params.tag);
  const url = new URL(request.url);
  const page = Number.parseInt(url.searchParams.get('page') ?? '1', 10) || 1;
  const posts = await getPostsByTag(tag, { page, pageSize: 10 });
  const excerpts = await openingExcerpts(posts.data.map((post) => post.path));
  return {
    tag,
    posts: {
      ...posts,
      data: posts.data.map((post) => ({
        ...post,
        abstract: post.abstract || excerpts[post.path] || '',
      })),
    },
  };
}

export default function TagPosts({ loaderData }: Route.ComponentProps) {
  const { tag, posts } = loaderData;
  return (
    <section className="py-8">
      <PageHeader
        eyebrow={
          <Link to="/tags" className="transition-colors duration-200 ease hover:text-black">
            标签
          </Link>
        }
        title={tag}
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
        <ul className="flex flex-col gap-4">
          {posts.data.map((post) => (
            <li key={post.path} className="card-lift group paper-card p-6 shadow-none">
              <article className="flex gap-4">
                <div className="min-w-0 flex-1">
                  <h2 className="font-heading text-lg font-semibold leading-snug">
                    <Link
                      to={`/posts/${post.path}`}
                      className="text-foreground transition-colors duration-200 ease group-hover:text-(--brand)"
                    >
                      {post.title}
                    </Link>
                  </h2>
                  {post.abstract ? (
                    <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-black/60">{post.abstract}</p>
                  ) : null}
                  <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-black/60">
                    <time>{post.date}</time>
                    <span>{post.readingTime}</span>
                    {post.tags.map((t) => (
                      <Link
                        key={t}
                        to={`/tags/${encodeURIComponent(t)}`}
                        className={t === tag ? 'text-(--brand)' : 'transition-colors duration-200 ease hover:text-black'}
                      >
                        {t}
                      </Link>
                    ))}
                  </div>
                </div>
                {post.cover ? (
                  <Link
                    to={`/posts/${post.path}`}
                    className="h-20 w-28 shrink-0 overflow-hidden rounded-lg"
                  >
                    <img
                      src={post.cover}
                      alt=""
                      width={112}
                      height={80}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover"
                    />
                  </Link>
                ) : null}
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
