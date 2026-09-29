// Projects page: lists all projects grouped by category, supports pagination
// and category filtering via ?category= key.
import { Link } from 'react-router';
import type { Route } from './+types/projects';
import { Calendar } from 'lucide-react';
import { listProjects, listProjectCategories, type ProjectEntry } from '~/lib/content/projects';
import { siteConfig } from '~/lib/site-config';
import { pageMeta } from '~/lib/meta';
import { Badge } from '~/components/ui/badge';
import { Card } from '~/components/ui/card';
import { Pagination } from '~/components/Pagination';
import { cn } from '~/lib/utils';
import { PageHeader } from '~/components/PageHeader';

export function meta(_: Route.MetaArgs) {
  return pageMeta({ title: '项目', path: '/projects', description: '折腾过的项目' });
}

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const page = Number.parseInt(url.searchParams.get('page') ?? '1', 10) || 1;
  const pageSize = Number.parseInt(url.searchParams.get('pageSize') ?? '6', 10) || 6;
  const category = url.searchParams.get('category') ?? undefined;
  const [data, categories] = await Promise.all([
    listProjects({ page, pageSize, category }),
    listProjectCategories(),
  ]);
  return { data, categories };
}

export default function ProjectsPage({ loaderData }: Route.ComponentProps) {
  const { data, categories } = loaderData;
  const projects = data.data.projects as Array<ProjectEntry & { categoryName?: string }>;
  // "全部"视图下 loader 会给每个项目附带 categoryName，用于卡片分类徽章
  const isAllView = data.category === 'all';

  return (
    <section className="py-8">
      <PageHeader title="项目">
        这里是我的折腾项目。还有些没有整理的项目，可以
        <a
          href={siteConfig.socialLinks.github.url}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-(--brand) hover:underline"
        >
          {' '}访问我的 GitHub{' '}
        </a>
        查看/关注。
      </PageHeader>

      <nav className="mb-8 flex flex-wrap gap-2" aria-label="项目分类">
        <Link
          to="/projects"
          className={cn(
            'rounded-full border px-3 py-1.5 text-sm font-medium transition-colors duration-200 ease',
            isAllView
              ? 'border-transparent bg-secondary text-secondary-foreground'
              : 'border-border bg-card text-black/60 hover:bg-secondary hover:text-primary',
          )}
        >
          全部 <span className="font-mono">({categories.reduce((s, c) => s + c.count, 0)})</span>
        </Link>
        {categories.map((cat) => (
          <Link
            key={cat.key}
            to={`/projects?category=${cat.key}`}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors duration-200 ease',
              data.category === cat.key
                ? 'border-transparent bg-secondary text-secondary-foreground'
                : 'border-border bg-card text-black/60 hover:bg-secondary hover:text-primary',
            )}
          >
            {cat.icon ? <span aria-hidden>{cat.icon}</span> : null}
            {cat.name} <span className="font-mono">({cat.count})</span>
          </Link>
        ))}
      </nav>

      {projects.length === 0 ? (
        <p className="paper-card p-6 text-sm text-black/60 shadow-none">该项目分类下暂无内容。</p>
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {projects.map((p) => {
            const techStack: string[] = Array.isArray(p.techStack)
              ? (p.techStack as unknown[]).filter((t): t is string => typeof t === 'string')
              : [];
            const link: string | undefined = p.link ?? p.url;
            const cover: string | undefined = p.cover;
            const name: string = p.name;
            const description: string = p.description ?? '';
            // projects.json 里 date 是 ISO 日期串，直接取 yyyy-MM-dd
            const dateText = typeof p.date === 'string' ? p.date.slice(0, 10) : '';
            return (
              <li key={name + dateText}>
                <Card className="card-lift group flex h-full flex-col gap-0 overflow-hidden py-0 shadow-none">
                {cover ? (
                  <a
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-discover="false"
                    className="block aspect-video overflow-hidden bg-muted"
                  >
                    <img
                      src={cover}
                      alt={name}
                      width={640}
                      height={360}
                      loading="lazy"
                      decoding="async"
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-cover"
                    />
                  </a>
                ) : null}
                <div className="flex flex-1 flex-col gap-2 p-6">
                  {isAllView && p.categoryName ? (
                    <div>
                      <Badge variant="brand">{p.categoryName}</Badge>
                    </div>
                  ) : null}
                  <h2 className="font-heading text-lg font-bold leading-snug transition-colors duration-200 ease group-hover:text-(--brand)">
                    {link ? (
                      <a
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        data-discover="false"
                        className="text-foreground hover:text-(--brand)"
                      >
                        {name}
                      </a>
                    ) : (
                      name
                    )}
                  </h2>
                  {description ? (
                    <p className="text-sm text-muted-foreground line-clamp-3">{description}</p>
                  ) : null}
                  {techStack.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {techStack.map((t) => (
                        <span
                          key={t}
                          className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  ) : null}
                  {dateText || link ? (
                    <div className="mt-auto flex items-center gap-3 border-t border-border pt-2.5">
                      {dateText ? (
                        <span className="inline-flex items-center gap-1.5 text-sm text-black/60">
                          <Calendar className="h-3 w-3" aria-hidden />
                          <time dateTime={p.date}>{dateText}</time>
                        </span>
                      ) : null}
                      {link ? (
                        <a
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          data-discover="false"
                          className="ml-auto text-xs text-(--brand) hover:underline"
                        >
                          访问 →
                        </a>
                      ) : null}
                    </div>
                  ) : null}
                </div>
                </Card>
              </li>
            );
          })}
        </ul>
      )}

      <Pagination
        page={data.page}
        totalPages={data.totalPages}
        basePath={data.category && data.category !== 'all' ? `/projects?category=${data.category}` : '/projects'}
      />
    </section>
  );
}
