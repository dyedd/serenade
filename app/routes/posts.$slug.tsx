// Single post detail. Server-side loader fetches the post + parses markdown
// to HTML + resolves prev/next. Renders the article body as HTML (markdown
// output is trusted: written by the author via git, not user input).
// A delegated click handler powers the renderer's .copy-btn buttons.
import { Link } from 'react-router';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import type { Route } from './+types/posts.$slug';
import { getPost } from '~/lib/content/posts';
import { extractHeadings } from '~/lib/content/extract-headings';
import { pageMeta } from '~/lib/meta';
import { useCodeCopy } from '~/hooks/useCodeCopy';
import { TableOfContents } from '~/components/TableOfContents';
import { MobileDocNav } from '~/components/MobileDocNav';

export function meta({ loaderData }: Route.MetaArgs) {
  const post = loaderData?.post;
  if (!post) return pageMeta({ title: '文章' });
  return pageMeta({
    title: post.title,
    description: post.abstract,
    path: `/posts/${post.path}`,
    image: post.cover || undefined,
    type: 'article',
  });
}

export async function loader({ params }: Route.LoaderArgs) {
  const post = await getPost(params.slug);
  if (!post) {
    throw new Response('Not Found', { status: 404 });
  }
  const headings = extractHeadings(post.html);
  return { post, headings };
}

export default function PostDetail({ loaderData }: Route.ComponentProps) {
  const { post, headings } = loaderData;
  useCodeCopy();

  return (
    <article className="py-8">
      <nav className="eyebrow mb-8" aria-label="breadcrumb">
        <Link to="/posts" className="transition-colors hover:text-foreground">
          posts
        </Link>
        /<span className="text-foreground">{post.path}</span>
      </nav>

      <header className="mb-8">
        <h1 className="font-heading text-3xl font-bold leading-tight tracking-tight md:text-4xl">
          {post.title}
        </h1>
        {post.abstract ? <p className="page-lead mt-4">{post.abstract}</p> : null}
        <div className="mono-meta mt-5 flex flex-wrap items-center gap-x-3 gap-y-1">
          <time dateTime={post.date}>{post.date}</time>
          <span aria-hidden>·</span>
          <span>{post.readingTime}</span>
          {post.tags.map((tag) => (
            <Link
              key={tag}
              to={`/tags/${encodeURIComponent(tag)}`}
              className="transition-colors hover:text-(--brand)"
            >
              #{tag}
            </Link>
          ))}
        </div>
      </header>

      {post.cover ? (
        <figure className="mb-10">
          <img
            src={post.cover}
            alt=""
            className="mx-auto max-h-[32rem] w-full object-contain"
          />
        </figure>
      ) : null}

      <MobileDocNav toc={headings} />

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_14rem]">
        <div className="min-w-0">
          <div
            className="prose-blog prose prose-neutral dark:prose-invert max-w-none prose-headings:scroll-mt-24 prose-headings:font-heading prose-headings:font-bold prose-pre:bg-transparent prose-pre:p-0 prose-code:before:content-none prose-code:after:content-none"
            dangerouslySetInnerHTML={{ __html: post.html }}
          />

          <nav className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-4">
            {post.prev ? (
              <Link
                to={`/posts/${post.prev.path}`}
                className="card-lift group flex flex-col gap-1.5 p-4 rounded-lg border border-border"
              >
                <span className="mono-meta flex items-center gap-1.5">
                  <ArrowLeft className="h-3.5 w-3.5" aria-hidden /> 上一篇
                </span>
                <span className="font-heading font-semibold text-foreground transition-colors group-hover:text-(--brand) line-clamp-2">
                  {post.prev.title}
                </span>
                {post.prev.date ? <span className="mono-meta">{post.prev.date}</span> : null}
              </Link>
            ) : (
              <div />
            )}
            {post.next ? (
              <Link
                to={`/posts/${post.next.path}`}
                className="card-lift group flex flex-col gap-1.5 p-4 rounded-lg border border-border text-right"
              >
                <span className="mono-meta flex items-center justify-end gap-1.5">
                  下一篇 <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                </span>
                <span className="font-heading font-semibold text-foreground transition-colors group-hover:text-(--brand) line-clamp-2">
                  {post.next.title}
                </span>
                {post.next.date ? <span className="mono-meta">{post.next.date}</span> : null}
              </Link>
            ) : (
              <div />
            )}
          </nav>
        </div>

        <aside className="hidden lg:block lg:sticky lg:top-24 lg:self-start">
          <TableOfContents entries={headings} />
        </aside>
      </div>
    </article>
  );
}
