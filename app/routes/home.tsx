import { Link } from 'react-router';
import type { Route } from './+types/home';
import { listPosts } from '~/lib/content/posts';
import { siteConfig } from '~/lib/site-config';
import { pageMeta } from '~/lib/meta';
import { Button } from '~/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';

export function meta(_: Route.MetaArgs) {
  return pageMeta({ path: '/', description: siteConfig.description });
}

export async function loader() {
  const recent = await listPosts({ page: 1, pageSize: 5 });
  return { posts: recent.data };
}

const formatZhDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
};

export default function Home({ loaderData }: Route.ComponentProps) {
  const { profile, socialLinks } = siteConfig;
  const posts = loaderData.posts;

  return (
    <div className="flex w-full max-w-full flex-col gap-10 box-border lg:flex-row lg:gap-12">
      <aside className="flex h-fit w-full shrink-0 flex-col items-center gap-8 lg:w-64 lg:items-stretch">
        <div className="flex justify-center">
          <div className="relative size-36 sm:size-44">
            <Avatar className="size-full shadow-lg ring-2 ring-background">
              <AvatarImage
                src={profile.avatar}
                alt={profile.name}
                className="object-cover transition-transform duration-400 hover:scale-105 hover:rotate-2"
                style={{ transitionTimingFunction: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}
              />
              <AvatarFallback className="text-3xl">{profile.name.slice(0, 1)}</AvatarFallback>
            </Avatar>
            <div className="absolute bottom-2 right-2 flex size-12 cursor-default items-center justify-center rounded-full border-2 border-background bg-card text-2xl shadow-md transition-transform duration-300 hover:scale-110">
              {profile.badge}
            </div>
          </div>
        </div>

        <div className="w-full max-w-md">
          <p className="eyebrow mb-4">更新日志</p>
          {posts.length === 0 ? (
            <p className="text-sm text-muted-foreground">暂无最新文章</p>
          ) : (
            <ol className="relative pl-5 before:absolute before:top-3 before:bottom-0 before:left-[5px] before:w-0.5 before:bg-gradient-to-b before:from-(--brand) before:to-transparent before:opacity-30">
              {posts.map((p) => (
                <li key={p.path} className="relative mb-6 last:mb-0">
                  <span
                    aria-hidden
                    className="absolute top-2 -left-[15px] size-2.5 rounded-full border-2 border-background bg-(--brand) shadow-[0_0_0_2px_rgba(30,144,255,0.2)]"
                  />
                  <Link to={`/posts/${p.path}`} className="group block">
                    <div className="mb-1.5 text-xs text-muted-foreground tabular-nums">
                      {formatZhDate(p.date)}
                    </div>
                    <div className="text-sm font-semibold leading-[1.4] text-foreground line-clamp-2 transition-colors group-hover:text-(--brand)">
                      {p.title}
                    </div>
                  </Link>
                </li>
              ))}
            </ol>
          )}
        </div>
      </aside>

      <div className="min-w-0 flex-1 max-w-full">
        <section className="mb-10">
          <h1 className="font-heading mb-6 text-4xl font-extrabold leading-tight tracking-tight text-foreground sm:text-5xl">
            Hello, I&apos;m <span className="name-gradient">{profile.name}</span>
          </h1>
          {profile.introduction.map((line, i) => (
            <p key={`intro-${i}`} className="mb-4 text-lg leading-relaxed text-foreground/90 sm:text-xl">
              {line}
            </p>
          ))}
          {profile.motto.map((line, i) => (
            <p key={`motto-${i}`} className="my-3 text-lg leading-relaxed sm:text-xl">
              {line}
            </p>
          ))}
        </section>

        <section className="mb-10 flex flex-wrap gap-3">
          {Object.values(socialLinks).map((link) => (
            <Button
              key={link.label}
              variant="outline"
              size="lg"
              asChild
              title={link.label}
              className="rounded-full"
            >
              <a href={link.url} target="_blank" rel="noreferrer">
                <svg className="size-5 shrink-0" aria-hidden="true">
                  <use href={`#icon-${link.icon}`} />
                </svg>
                <span>{link.label}</span>
              </a>
            </Button>
          ))}
        </section>

        <section className="note-card relative mb-10 rounded-lg px-6 py-5 text-base leading-relaxed">
          <span
            aria-hidden
            className="pointer-events-none absolute -top-8 left-0 select-none text-[2rem]"
            style={{ fontFamily: 'var(--font-emoji)' }}
          >
            ✍
          </span>
          {profile.statement}
          <Link to="/feed.xml" className="px-1 font-semibold text-(--brand)">
            RSS
          </Link>
          。
        </section>

        <section className="mb-10">
          <h3 className="font-heading mb-5 text-lg font-bold text-foreground">GitHub Contributions</h3>
          <img
            src={profile.githubContributionChart}
            alt="GitHub Contribution Chart"
            className="block w-full rounded-lg object-contain opacity-85 transition-opacity duration-300 hover:opacity-100 dark:invert dark:[filter:invert(1)_hue-rotate(180deg)]"
          />
        </section>

        <section className="mb-10">
          <h3 className="font-heading mb-5 text-lg font-bold text-foreground">技术栈</h3>
          <div className="flex flex-wrap gap-2">
            {profile.techStack.map((tech) => (
              <img
                key={tech.label}
                src={tech.icon}
                alt={tech.label}
                className="h-7 rounded opacity-90 transition-all duration-200 hover:-translate-y-0.5 hover:opacity-100 hover:shadow-md"
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
