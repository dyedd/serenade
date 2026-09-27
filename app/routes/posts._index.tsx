// /posts — 单栏归档：篇数和文章卡片。搜索用顶栏，统计与标签在首页。
import { Link } from 'react-router';
import { FileText } from 'lucide-react';
import { PageHeader } from '~/components/PageHeader';
import type { Route } from './+types/posts._index';
import { listPostIndex, listPosts, openingExcerpts, paginate, type PostSummary } from '~/lib/content/posts';
import { Pagination } from '~/components/Pagination';
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '~/components/ui/empty';
import { pageMeta } from '~/lib/meta';
import { collectionsByPost, collectionPosts, listCollections } from '~/lib/content/collections';

const PAGE_SIZE = 10;

export function meta({ loaderData }: Route.MetaArgs) {
  const collection = loaderData?.collection;
  return pageMeta({
    title: collection?.title || '文章',
    path: collection ? `/posts?collection=${encodeURIComponent(collection.slug)}` : '/posts',
    description: collection ? `${collection.title}：精选文章合集` : '全部文章归档',
  });
}

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const page = Math.max(1, Number(url.searchParams.get('page')) || 1);
  const collectionSlug = url.searchParams.get('collection') || '';
  const [byPost, collections, index] = await Promise.all([
    collectionsByPost(),
    listCollections(),
    collectionSlug ? listPostIndex() : Promise.resolve(null),
  ]);
  const active = collectionSlug ? collections[collectionSlug] : undefined;
  const inCollection = (post: PostSummary) =>
    (byPost.get(post.path) ?? []).some((item) => item.slug === collectionSlug);
  const pageResult = collectionSlug
    ? paginate((index ?? []).filter((post) => active && inCollection(post)), page, PAGE_SIZE)
    : await listPosts({ page, pageSize: PAGE_SIZE });
  const listed = collectionPosts(pageResult.data, byPost);
  const excerpts = await openingExcerpts(listed.map((post) => post.path));
  return {
    posts: listed.map((post) => ({
      ...post,
      abstract: post.abstract || excerpts[post.path] || '',
    })),
    page: pageResult.page,
    totalPages: pageResult.totalPages,
    totalItems: pageResult.totalItems,
    collection: collectionSlug
      ? { slug: collectionSlug, title: active?.title ?? '', missing: !active }
      : null,
  };
}

type ListedPost = PostSummary & { collections: Array<{ slug: string; title: string }> };

interface YearGroup {
  year: number;
  posts: ListedPost[];
}

function groupByYear(posts: ListedPost[]): YearGroup[] {
  const map = new Map<number, ListedPost[]>();
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
  const { posts, page, totalPages, collection } = loaderData;
  const listBase = collection
    ? `/posts?collection=${encodeURIComponent(collection.slug)}`
    : '/posts';
  const groups = groupByYear(posts);

  return (
    <section className="py-8">
      <PageHeader
        eyebrow={
          collection ? (
            <Link to="/posts" className="transition-colors duration-200 ease hover:text-black">
              文章
            </Link>
          ) : undefined
        }
        title={collection?.title || (collection ? '未找到合集' : '文章')}
        meta={collection && !collection.missing ? '合集' : undefined}
      >
        {collection ? null : '记录我这些年的吐槽。'}
      </PageHeader>

      <div>
          {groups.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <FileText />
                </EmptyMedia>
                <EmptyTitle>{collection ? '这个合集里还没有文章' : '暂无文章'}</EmptyTitle>
                <EmptyDescription>
                  {collection ? '换一个合集，或回到全部文章。' : '发表第一篇文章后就会显示在这里。'}
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <div className="flex flex-col gap-20">
              {groups.map((g) => (
                <section key={g.year}>
                  <h2 className="mb-4 text-sm font-medium text-black/60">
                    <time dateTime={String(g.year)}>{g.year}</time>
                  </h2>
                  <ul className="flex flex-col gap-4">
                    {g.posts.map((p) => (
                      <li key={p.path} className="card-echo group relative">
                        <span
                          aria-hidden
                          className="card-echo-shadow pointer-events-none absolute inset-0 rounded-xl border border-dashed border-black/20 opacity-0"
                        />
                        <article className="card-echo-face card-lift relative flex gap-4 card-dashed paper-card p-6 shadow-none">
                          <div className="min-w-0 flex-1">
                            <h3 className="font-heading text-lg font-semibold leading-snug">
                              <Link
                                to={`/posts/${p.path}`}
                                className="text-foreground transition-colors duration-200 ease group-hover:text-(--brand)"
                              >
                                {p.title}
                              </Link>
                            </h3>
                            {p.abstract ? (
                              <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-black/60">
                                {p.abstract}
                              </p>
                            ) : null}
                            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-black/60">
                              <time>{p.date}</time>
                              <span>{p.readingTime}</span>
                              {p.tags.map((tag) => (
                                <Link
                                  key={tag}
                                  to={`/tags/${encodeURIComponent(tag)}`}
                                  className="transition-colors duration-200 ease hover:text-black"
                                >
                                  {tag}
                                </Link>
                              ))}
                            </div>
                            {p.collections.length > 0 ? (
                              <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-sm text-black/40">
                                {p.collections.map((item) => (
                                  <Link
                                    key={item.slug}
                                    to={`/posts?collection=${encodeURIComponent(item.slug)}`}
                                    className="transition-colors duration-200 ease hover:text-black"
                                  >
                                    合集：{item.title}
                                  </Link>
                                ))}
                              </div>
                            ) : null}
                          </div>
                          {p.cover ? (
                            <Link
                              to={`/posts/${p.path}`}
                              className="h-20 w-28 shrink-0 overflow-hidden rounded-lg"
                            >
                              <img
                                src={p.cover}
                                alt=""
                                loading="lazy"
                                className="h-full w-full object-cover"
                              />
                            </Link>
                          ) : null}
                        </article>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          )}

          <Pagination page={page} totalPages={totalPages} basePath={listBase} />
      </div>
    </section>
  );
}
