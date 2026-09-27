// Single post detail. Server-side loader fetches the post + parses markdown
// to HTML + resolves prev/next. Renders the article body as HTML (markdown
// output is trusted: written by the author via git, not user input).
// A delegated click handler powers the renderer's .copy-btn buttons.
import { Link } from 'react-router';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import type { Route } from './+types/posts.$slug';
import { getPost } from '~/lib/content/posts';
import { collectionsByPost } from '~/lib/content/collections';
import { extractHeadings } from '~/lib/content/extract-headings';
import { pageMeta } from '~/lib/meta';
import { useCodeCopy } from '~/hooks/useCodeCopy';
import { TableOfContents } from '~/components/TableOfContents';
import { MobileDocNav } from '~/components/MobileDocNav';
import { JsonLd } from '~/components/JsonLd';
import { siteConfig } from '~/lib/site-config';

export function meta({ loaderData }: Route.MetaArgs) {
  const post = loaderData?.post;
  if (!post) return pageMeta({ title: '文章' });
  return pageMeta({
    title: post.title,
    description: post.abstract,
    path: `/posts/${post.path}`,
    image: post.cover || undefined,
    type: 'article',
    publishedTime: post.date,
    tags: post.tags,
  });
}

export async function loader({ params }: Route.LoaderArgs) {
  const [post, byPost] = await Promise.all([
    getPost(params.slug),
    collectionsByPost(),
  ]);
  if (!post) {
    throw new Response('Not Found', { status: 404 });
  }
  const headings = extractHeadings(post.html);
  return { post, headings, collectedIn: byPost.get(params.slug) ?? [] };
}

export default function PostDetail({ loaderData }: Route.ComponentProps) {
  const { post, headings, collectedIn } = loaderData;
  const bodyHtml = post.abstract ? post.html : post.html.replace(/<p>/, '<p class="page-lead">');
  useCodeCopy();

  return (
    <article className="py-8">
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          headline: post.title,
          description: post.abstract || undefined,
          datePublished: post.date,
          inLanguage: siteConfig.lang,
          mainEntityOfPage: `${siteConfig.url.replace(/\/$/, '')}/posts/${post.path}`,
          url: `${siteConfig.url.replace(/\/$/, '')}/posts/${post.path}`,
          image: post.cover
            ? /^https?:\/\//.test(post.cover)
              ? post.cover
              : `${siteConfig.url.replace(/\/$/, '')}${post.cover.startsWith('/') ? post.cover : `/${post.cover}`}`
            : undefined,
          author: {
            '@type': 'Person',
            name: siteConfig.author,
            url: siteConfig.url,
          },
          publisher: {
            '@type': 'Person',
            name: siteConfig.author,
          },
          keywords: post.tags,
        }}
      />
      <MobileDocNav toc={headings} />

      <div className="doc-rail grid grid-cols-1 gap-10 lg:grid-cols-[1fr_14rem]">
        <div className="min-w-0">
      <nav className="mb-6 text-sm text-black/60" aria-label="breadcrumb">
        <Link to="/posts" className="transition-colors duration-200 ease hover:text-black">
          文章
        </Link>
        <span className="mx-1.5" aria-hidden>
          /
        </span>
        <span className="text-foreground">{post.title}</span>
      </nav>

      <header className="mb-8">
        <h1 className="font-heading text-3xl font-bold leading-tight tracking-tight md:text-4xl">
          {post.title}
        </h1>
        {post.abstract ? <p className="page-lead mt-4">{post.abstract}</p> : null}
        <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-black/60">
          <time dateTime={post.date}>{post.date}</time>
          <span>{post.readingTime}</span>
          {post.tags.map((tag) => (
            <Link
              key={tag}
              to={`/tags/${encodeURIComponent(tag)}`}
              className="rounded-full bg-secondary px-2.5 py-0.5 text-secondary-foreground transition-colors duration-200 ease hover:text-(--brand)"
            >
              {tag}
            </Link>
          ))}
        </div>
        {collectedIn.length > 0 ? (
          <p className="mono-meta mt-3">
            收录于合集{' '}
            {collectedIn.map((col, index) => (
              <span key={col.slug}>
                {index > 0 ? <span aria-hidden> · </span> : null}
                <Link
                  to={`/posts?collection=${col.slug}`}
                  className="transition-colors duration-200 ease hover:text-black"
                >
                  {col.title}
                </Link>
              </span>
            ))}
          </p>
        ) : null}
      </header>

      {post.cover ? (
        <figure className="mb-8">
          <img
            src={post.cover}
            alt={post.title}
            className="block h-auto w-full rounded-xl border border-border bg-white"
          />
        </figure>
      ) : null}

        <div
          className="prose-blog prose prose-neutral max-w-none prose-headings:scroll-mt-24 prose-headings:font-heading prose-headings:font-semibold prose-pre:bg-transparent prose-pre:p-0 prose-code:before:content-none prose-code:after:content-none"
          dangerouslySetInnerHTML={{ __html: bodyHtml }}
        />

        <nav className="mt-20 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {post.prev ? (
            <Link
              to={`/posts/${post.prev.path}`}
              className="card-lift group flex flex-col gap-1.5 paper-card p-6 shadow-none"
            >
              <span className="flex items-center gap-1.5 text-sm text-black/60">
                <ArrowLeft className="h-3.5 w-3.5" aria-hidden /> 上一篇
              </span>
              <span className="line-clamp-2 font-heading font-semibold text-foreground transition-colors duration-200 ease group-hover:text-(--brand)">
                {post.prev.title}
              </span>
              {post.prev.date ? <span className="text-sm text-black/60">{post.prev.date}</span> : null}
            </Link>
          ) : (
            <div />
          )}
          {post.next ? (
            <Link
              to={`/posts/${post.next.path}`}
              className="card-lift group flex flex-col gap-1.5 paper-card p-6 text-right shadow-none"
            >
              <span className="flex items-center justify-end gap-1.5 text-sm text-black/60">
                下一篇 <ArrowRight className="h-3.5 w-3.5" aria-hidden />
              </span>
              <span className="line-clamp-2 font-heading font-semibold text-foreground transition-colors duration-200 ease group-hover:text-(--brand)">
                {post.next.title}
              </span>
              {post.next.date ? <span className="text-sm text-black/60">{post.next.date}</span> : null}
            </Link>
          ) : (
            <div />
          )}
        </nav>
        </div>
        <aside className="hidden lg:sticky lg:top-24 lg:block lg:self-start">
          <TableOfContents entries={headings} />
        </aside>
      </div>
    </article>
  );
}
