import { useState } from 'react';
import { Link, useRouteLoaderData } from 'react-router';
import { ChevronDown } from 'lucide-react';
import type { Route } from './+types/home';
import { listPostDates, listPosts, openingExcerpts } from '~/lib/content/posts';
import { buildHeatmap } from '~/lib/content/heatmap';
import { listTags } from '~/lib/content/tags';
import { loadCareer } from '~/lib/content/career';
import { listRandomProjects } from '~/lib/content/projects';
import type { loader as rootLoader } from '~/root';
import { pageMeta } from '~/lib/meta';
import { CareerTrack } from '~/components/CareerTrack';
import { PostsHeatmap } from '~/components/PostsHeatmap';
import { SocialGlyph } from '~/components/SocialIcons';
import { JsonLd } from '~/components/JsonLd';
import { TechChip } from '~/components/TechChip';
import { Badge } from '~/components/ui/badge';

export function meta({ matches }: Route.MetaArgs) {
  return pageMeta(matches[0].loaderData, { path: '/' });
}

export async function loader() {
  const [recent, career, projects, tags, dates] = await Promise.all([
    listPosts({ page: 1, pageSize: 5 }),
    loadCareer(),
    listRandomProjects(),
    listTags(),
    listPostDates(),
  ]);
  const excerpts = await openingExcerpts(recent.data.map((post) => post.path));
  const splitLines = (value = '') => value.split('|').map((line) => line.trim()).filter(Boolean);
  return {
    introduction: splitLines(process.env.SITE_PROFILE_INTRO),
    motto: splitLines(process.env.SITE_PROFILE_MOTTO),
    githubChart: process.env.SITE_PROFILE_GITHUB_CHART || '',
    qq: process.env.SITE_QQ_URL || '',
    techStack: splitLines(process.env.SITE_PROFILE_TECH_STACK).flatMap((item) => {
      const [label, icon] = item.split('::').map((part) => part.trim());
      return label && icon ? [{ label, icon }] : [];
    }),
    posts: recent.data.map((post) => ({
      ...post,
      abstract: post.abstract || excerpts[post.path] || '',
    })),
    career,
    projects,
    tags,
    heatmap: buildHeatmap(dates),
    postCount: dates.length,
  };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const site = useRouteLoaderData<typeof rootLoader>('root')!;
  const { posts, career, projects, tags, heatmap, postCount, introduction, motto, githubChart, qq, techStack } = loaderData;
  const sortedTags = Object.entries(tags).sort((a, b) => b[1] - a[1]).slice(0, 24);
  const [statsOpen, setStatsOpen] = useState(false);
  const chartImage = (
    <img
      src={githubChart}
      alt="GitHub 贡献图"
      width={828}
      height={128}
      loading="lazy"
      decoding="async"
      className="github-chart"
    />
  );

  return (
    <div className="flex flex-col gap-12 py-2">
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: site.title,
          url: site.url,
          description: site.description,
          inLanguage: site.lang,
          author: {
            '@type': 'Person',
            name: site.author,
            url: site.url,
            sameAs: site.github
              ? [site.github]
              : undefined,
          },
        }}
      />
      <section className="flex flex-col-reverse items-start gap-6 sm:flex-row sm:justify-between">
        <div className="min-w-0 flex-1">
          <h1 className="font-heading text-[2rem] font-semibold leading-tight tracking-[-0.02em]">
            你好，我是{site.author}
          </h1>
          {introduction.map((line, i) => (
            <SvgTextLine key={`intro-${i}`} line={line} />
          ))}
          {motto.map((line, i) => (
            <SvgTextLine key={`motto-${i}`} line={line} />
          ))}
          <p className="mt-5 flex items-center gap-1">
            {site.github ? (
              <a
                href={site.github}
                target="_blank"
                rel="noreferrer"
                aria-label="GitHub"
                title="GitHub"
                className="p-2 text-black/60 transition-colors duration-200 ease hover:text-black"
              >
                <SocialGlyph name="github" />
              </a>
            ) : null}
            {site.email ? (
              <a
                href={`mailto:${site.email}`}
                aria-label="Email"
                title="Email"
                className="p-2 text-black/60 transition-colors duration-200 ease hover:text-black"
              >
                <SocialGlyph name="email" />
              </a>
            ) : null}
            {qq ? (
              <a
                href={qq}
                target="_blank"
                rel="noreferrer"
                aria-label="QQ"
                title="QQ"
                className="p-2 text-black/60 transition-colors duration-200 ease hover:text-black"
              >
                <SocialGlyph name="qq" />
              </a>
            ) : null}
            <Link
              to="/feed.xml"
              aria-label="RSS"
              title="RSS"
              className="p-2 text-black/60 transition-colors duration-200 ease hover:text-black"
            >
              <SocialGlyph name="rss" />
            </Link>
          </p>
        </div>
        <img
          src={site.avatar}
          alt={site.author}
          width={112}
          height={112}
          decoding="async"
          className="size-24 shrink-0 rounded-full border border-border object-cover sm:size-28"
        />
      </section>

      <div className="relative flex items-center justify-center">
        <div className="absolute inset-x-0 top-1/2 border-t border-dashed border-black/15" />
        <a
          href="#recent-heading"
          className="relative inline-flex items-center gap-1 rounded-full border border-dashed border-black/15 bg-white px-4 py-1.5 text-sm text-black/60 transition-colors duration-200 ease hover:text-black"
        >
          我写的文章
          <ChevronDown className="size-3.5" aria-hidden />
        </a>
      </div>

      <section id="career" aria-labelledby="career-heading">
        <h2 id="career-heading" className="font-heading mb-6 text-[1.375rem] font-semibold tracking-[-0.01em]">
          职业轨迹
        </h2>
        <CareerTrack items={career} />
      </section>

      {githubChart ? (
        <section aria-labelledby="github-heading">
          <div className="mb-4 flex items-baseline justify-between gap-4">
            <h2 id="github-heading" className="font-heading text-[1.375rem] font-semibold tracking-[-0.01em]">
              GitHub 贡献
            </h2>
            {site.github ? (
              <a
                href={site.github}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-black/60 transition-colors duration-200 ease hover:text-black"
              >
                主页
              </a>
            ) : null}
          </div>
          {site.github ? (
            <a href={site.github} target="_blank" rel="noreferrer" className="block min-w-0 max-w-full">
              {chartImage}
            </a>
          ) : (
            chartImage
          )}
        </section>
      ) : null}

      <section aria-labelledby="stack-heading">
        <h2 id="stack-heading" className="font-heading mb-6 text-[1.375rem] font-semibold tracking-[-0.01em]">
          技术栈
        </h2>
        <ul className="flex flex-wrap gap-2">
          {techStack.map((tech) => (
            <li key={tech.label}>
              <TechChip label={tech.label} icon={tech.icon} />
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="recent-heading">
        <div className="mb-4 flex items-baseline justify-between gap-4">
          <h2 id="recent-heading" className="font-heading text-[1.375rem] font-semibold tracking-[-0.01em]">
            文章
          </h2>
          <div className="flex items-baseline gap-4">
            <button
              type="button"
              aria-expanded={statsOpen}
              aria-controls="post-stats"
              onClick={() => setStatsOpen((open) => !open)}
              className={`cursor-pointer text-sm transition-colors duration-200 ease hover:text-black ${statsOpen ? 'text-black' : 'text-black/60'}`}
            >
              统计
            </button>
            <Link
              to="/posts"
              className="text-sm text-black/60 transition-colors duration-200 ease hover:text-black"
            >
              全部文章
            </Link>
          </div>
        </div>
        <div id="post-stats" hidden={!statsOpen} className="mb-4 paper-card p-6 shadow-none">
          <PostsHeatmap data={heatmap} totalCount={postCount} />
        </div>
        {posts.length === 0 ? (
          <p className="paper-card p-6 text-sm text-black/60 shadow-none">暂无最新文章</p>
        ) : (
          <ol className="flex flex-col gap-4">
            {posts.map((p) => (
              <li key={p.path} className="card-lift group paper-card p-6 shadow-none">
                <Link to={`/posts/${p.path}`} className="flex gap-4">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-heading text-lg font-semibold leading-snug text-foreground transition-colors duration-200 ease group-hover:text-(--brand)">
                      {p.title}
                    </h3>
                    {p.abstract ? (
                      <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-black/60">
                        {p.abstract}
                      </p>
                    ) : null}
                    <p className="mt-3 text-sm text-black/60">
                      <time dateTime={p.date}>{p.date}</time>
                      {p.tags[0] ? <span> · {p.tags[0]}</span> : null}
                    </p>
                  </div>
                  {p.cover ? (
                    <img
                      src={p.cover}
                      alt=""
                      width={112}
                      height={80}
                      loading="lazy"
                      decoding="async"
                      className="h-20 w-28 shrink-0 rounded-lg object-cover"
                    />
                  ) : null}
                </Link>
              </li>
            ))}
          </ol>
        )}

        <div className="mt-8 flex flex-wrap items-center gap-2">
          {sortedTags.map(([tag, count]) => (
            <Badge key={tag} variant="outline" asChild className="h-auto px-3 py-1 font-normal">
              <Link to={`/tags/${encodeURIComponent(tag)}`}>
                {tag}
                <span className="text-[0.7em] text-black/40 tabular-nums">{count}</span>
              </Link>
            </Badge>
          ))}
          <Link
            to="/tags"
            className="px-1 text-sm text-black/60 transition-colors duration-200 ease hover:text-black"
          >
            全部标签
          </Link>
        </div>
      </section>

      <section aria-labelledby="projects-heading">
        <div className="mb-4 flex items-baseline justify-between gap-4">
          <h2 id="projects-heading" className="font-heading text-[1.375rem] font-semibold tracking-[-0.01em]">
            项目
          </h2>
          <Link to="/projects" className="text-sm text-black/60 transition-colors duration-200 ease hover:text-black">
            全部项目
          </Link>
        </div>
        {projects.length === 0 ? (
          <p className="paper-card p-6 text-sm text-black/60 shadow-none">暂无项目</p>
        ) : (
          <ol className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {projects.map((p) => {
              const href = p.link ?? p.url ?? p.github;
              const cover = p.cover;
              const body = (
                <>
                  {cover ? (
                    <img
                      src={cover}
                      alt=""
                      width={640}
                      height={360}
                      loading="lazy"
                      decoding="async"
                      referrerPolicy="no-referrer"
                      className="mb-4 aspect-video w-full rounded-lg object-cover"
                    />
                  ) : null}
                  <h3 className="font-heading text-base font-semibold leading-snug text-foreground transition-colors duration-200 ease group-hover:text-(--brand)">
                    {p.name}
                  </h3>
                  {p.description ? (
                    <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-black/60">
                      {p.description}
                    </p>
                  ) : null}
                </>
              );
              const className = 'card-lift group block paper-card p-6 shadow-none';
              return (
                <li key={`${p.name}-${p.date}`}>
                  {href ? (
                    href.startsWith('/') ? (
                      <Link to={href} className={className}>
                        {body}
                      </Link>
                    ) : (
                      <a href={href} target="_blank" rel="noreferrer" className={className}>
                        {body}
                      </a>
                    )
                  ) : (
                    <div className={className}>{body}</div>
                  )}
                </li>
              );
            })}
          </ol>
        )}
      </section>
    </div>
  );
}

function SvgTextLine({ line }: { line: string }) {
  const width = Array.from(line).reduce(
    (total, char) => total + (char === ' ' ? 35 : char.codePointAt(0)! < 256 ? 50 : 100),
    0,
  );

  return (
    <svg
      role="img"
      aria-label={line}
      viewBox={`0 0 ${width} 150`}
      preserveAspectRatio="xMinYMid meet"
      className="profile-line mt-3 block max-w-full select-none text-foreground"
      style={{ width: `${width / 100}em`, height: '1.5em' }}
    >
      <text x="0" y="115" fontSize="100" fill="currentColor" textLength={width} lengthAdjust="spacingAndGlyphs">
        {line}
      </text>
    </svg>
  );
}
