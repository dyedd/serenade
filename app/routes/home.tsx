import { Link } from 'react-router';
import type { Route } from './+types/home';
import { listPosts } from '~/lib/content/posts';
import { loadCareer } from '~/lib/content/career';
import { listFeaturedProjects, type ProjectEntry } from '~/lib/content/projects';
import { siteConfig } from '~/lib/site-config';
import { pageMeta } from '~/lib/meta';
import { CareerTrack } from '~/components/CareerTrack';
import { TechChip } from '~/components/TechChip';

export function meta(_: Route.MetaArgs) {
  return pageMeta({ path: '/', description: siteConfig.description });
}

export async function loader() {
  const [recent, career, projects] = await Promise.all([
    listPosts({ page: 1, pageSize: 5 }),
    loadCareer(),
    listFeaturedProjects(),
  ]);
  return {
    posts: recent.data,
    career,
    projects,
  };
}

function projectHref(p: ProjectEntry): string | undefined {
  const raw = p.link ?? p.url ?? p.github;
  return typeof raw === 'string' && raw.length > 0 ? raw : undefined;
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const { profile, socialLinks } = siteConfig;
  const { posts, career, projects } = loaderData;
  const [role, ...restIntro] = profile.introduction;

  return (
    <div className="py-8">
      <section className="mb-14">
        <p className="eyebrow mb-6">home</p>
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:gap-10">
          <img
            src={profile.avatar}
            alt={profile.name}
            className="aspect-[4/5] w-32 shrink-0 rounded-lg object-cover ring-1 ring-border sm:w-40"
          />
          <div className="min-w-0 flex-1">
            <h1 className="font-heading text-4xl font-bold tracking-tight sm:text-5xl">
              {profile.name}
            </h1>
            {role ? (
              <p className="mt-2 font-heading text-lg text-foreground/80">{role}</p>
            ) : null}
            {restIntro.map((line, i) => (
              <p key={`intro-${i}`} className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
                {line}
              </p>
            ))}
            <p className="mt-4 text-sm leading-relaxed text-foreground/85 sm:text-[0.95rem]">
              {profile.statement}
            </p>
            <p className="mono-meta mt-5 flex flex-wrap items-center gap-x-2 gap-y-1">
              <a
                href={socialLinks.github.url}
                target="_blank"
                rel="noreferrer"
                className="transition-colors hover:text-(--brand)"
              >
                GitHub
              </a>
              <span aria-hidden>·</span>
              <a href={socialLinks.email.url} className="transition-colors hover:text-(--brand)">
                Email
              </a>
              <span aria-hidden>·</span>
              <Link to="/feed.xml" className="transition-colors hover:text-(--brand)">
                RSS
              </Link>
            </p>
          </div>
        </div>
      </section>

      <section id="career" className="mb-14" aria-labelledby="career-heading">
        <p className="eyebrow mb-2">career</p>
        <h2 id="career-heading" className="font-heading mb-6 text-2xl font-bold tracking-tight">
          职业轨迹
        </h2>
        <CareerTrack items={career} />
      </section>

      <section className="mb-14" aria-labelledby="projects-heading">
        <p className="eyebrow mb-2">projects</p>
        <div className="mb-6 flex items-baseline justify-between gap-4">
          <h2 id="projects-heading" className="font-heading text-2xl font-bold tracking-tight">
            项目
          </h2>
          <Link to="/projects" className="mono-meta transition-colors hover:text-(--brand)">
            全部项目 →
          </Link>
        </div>
        {projects.length === 0 ? (
          <p className="text-sm text-muted-foreground">暂无项目</p>
        ) : (
          <ol>
            {projects.map((p) => {
              const href = projectHref(p);
              const year = typeof p.date === 'string' ? p.date.slice(0, 4) : '';
              const tech = Array.isArray(p.techStack)
                ? p.techStack.filter((t): t is string => typeof t === 'string').slice(0, 4)
                : [];
              const name = (
                <span className="font-heading text-base font-semibold transition-colors group-hover:text-(--brand)">
                  {p.name}
                </span>
              );
              const cover = typeof p.cover === 'string' ? p.cover : '';
              return (
                <li key={`${p.name}-${p.date}`} className="border-b border-border py-4 first:border-t">
                  <div className="group flex gap-4">
                    {cover ? (
                      <img
                        src={cover}
                        alt=""
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        className="h-16 w-28 shrink-0 rounded-md object-cover ring-1 ring-border sm:h-[4.5rem] sm:w-32"
                      />
                    ) : null}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-4">
                        {href ? (
                          href.startsWith('/') ? (
                            <Link to={href} className="min-w-0">
                              {name}
                            </Link>
                          ) : (
                            <a href={href} target="_blank" rel="noreferrer" className="min-w-0">
                              {name}
                            </a>
                          )
                        ) : (
                          name
                        )}
                        {year ? <span className="mono-meta shrink-0">{year}</span> : null}
                      </div>
                      {p.description ? (
                        <p className="mt-1 text-sm leading-relaxed text-muted-foreground line-clamp-2">
                          {p.description}
                        </p>
                      ) : null}
                      <div className="mt-2 flex flex-wrap items-center gap-1.5">
                        {p.categoryName ? (
                          <span className="mono-meta mr-1">{p.categoryName}</span>
                        ) : null}
                        {tech.map((t) => (
                          <TechChip key={t} label={t} />
                        ))}
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </section>

      <section className="mb-14" aria-labelledby="stack-heading">
        <p className="eyebrow mb-2">stack</p>
        <h2 id="stack-heading" className="font-heading mb-6 text-2xl font-bold tracking-tight">
          技术栈
        </h2>
        <ul className="flex flex-wrap gap-2">
          {profile.techStack.map((tech) => (
            <li key={tech.label}>
              <TechChip label={tech.label} />
            </li>
          ))}
        </ul>
      </section>

      <section className="mb-14" aria-labelledby="recent-heading">
        <p className="eyebrow mb-2">writing</p>
        <div className="mb-6 flex items-baseline justify-between gap-4">
          <h2 id="recent-heading" className="font-heading text-2xl font-bold tracking-tight">
            最近写作
          </h2>
          <Link to="/posts" className="mono-meta transition-colors hover:text-(--brand)">
            全部文章 →
          </Link>
        </div>
        {posts.length === 0 ? (
          <p className="text-sm text-muted-foreground">暂无最新文章</p>
        ) : (
          <ol>
            {posts.map((p) => (
              <li key={p.path} className="border-b border-border first:border-t">
                <Link
                  to={`/posts/${p.path}`}
                  className="group flex flex-col gap-1 py-3 sm:flex-row sm:items-baseline sm:gap-6"
                >
                  <time className="mono-meta shrink-0 sm:w-28" dateTime={p.date}>
                    {p.date}
                  </time>
                  <span className="font-heading font-semibold leading-snug text-foreground transition-colors group-hover:text-(--brand)">
                    {p.title}
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        )}
      </section>

      <section aria-labelledby="github-heading">
        <p className="eyebrow mb-2">github</p>
        <div className="mb-6 flex items-baseline justify-between gap-4">
          <h2 id="github-heading" className="font-heading text-2xl font-bold tracking-tight">
            GitHub 贡献
          </h2>
          <a
            href={socialLinks.github.url}
            target="_blank"
            rel="noreferrer"
            className="mono-meta transition-colors hover:text-(--brand)"
          >
            主页 →
          </a>
        </div>
        <a href={socialLinks.github.url} target="_blank" rel="noreferrer" className="block">
          <img
            src={profile.githubContributionChart}
            alt="GitHub 贡献图"
            className="block min-h-20 w-full rounded-lg object-contain opacity-90 dark:invert dark:[filter:invert(1)_hue-rotate(180deg)]"
          />
        </a>
      </section>
    </div>
  );
}
