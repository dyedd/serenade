// RSS aggregator: client-side fetches every friend's RSS via /api/friends and
// flattens the per-site results into one timeline sorted by pubDate.
// Includes 查看更多 paging, a refresh button and the failed-feeds summary
// panel with friendly error mapping.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AlertTriangle, RefreshCw, Rss } from 'lucide-react';
import { Spinner } from '~/components/ui/spinner';
import { Button } from '~/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
import { Card } from '~/components/ui/card';
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '~/components/ui/empty';
import { Skeleton } from '~/components/ui/skeleton';
import { useRelativeTime } from '~/hooks/useRelativeTime';
import type { Friend } from '~/lib/content/friends';

const PAGE_SIZE = 10;

interface FeedItem {
  title: string;
  link: string;
  pubDate: string;
  description: string;
}

interface SiteResult {
  siteName: string;
  siteUrl: string;
  siteLogo: string;
  hasRSS: boolean;
  isEmpty?: boolean;
  error?: boolean;
  errorMessage?: string;
  articles?: FeedItem[];
}

interface TimelineArticle extends FeedItem {
  siteName: string;
  siteLogo: string;
  siteUrl: string;
}

// Single-site fetch: the API returns { results: [siteResult] }; client-side
// failures (network / HTTP) are converted into the same error shape the API
// uses so the failed-feeds panel can treat them uniformly.
async function fetchSite(friend: Friend): Promise<SiteResult> {
  const base: SiteResult = {
    siteName: friend.name,
    siteUrl: friend.url,
    siteLogo: friend.logo,
    hasRSS: Boolean(friend.rss),
    articles: [],
  };
  if (!friend.rss) return base;
  try {
    const res = await fetch(`/api/friends?url=${encodeURIComponent(friend.url)}`);
    if (!res.ok) throw new Error(`Status code ${res.status}`);
    const data = (await res.json()) as { results: SiteResult[] };
    return data.results[0] ?? base;
  } catch (err) {
    return {
      ...base,
      error: true,
      errorMessage: err instanceof Error ? err.message : '未知错误',
    };
  }
}

// Friendly error mapping for feed fetch failures.
function formatErrorMessage(raw: string | undefined): string {
  const message = (raw ?? '').trim() || '未知错误';
  const status = message.match(/(?:Status code|HTTP)\s+(\d+)/);
  if (status) {
    const codeMessages: Record<string, string> = {
      '404': 'RSS 地址不存在',
      '403': '访问被拒绝',
      '500': '服务器内部错误',
      '502': '网关错误',
      '503': '服务不可用',
      '504': '网关超时',
    };
    return codeMessages[status[1]] ?? `HTTP 错误 (${status[1]})`;
  }
  if (message.includes('ENOTFOUND')) return '域名无法解析';
  if (message.includes('ECONNREFUSED')) return '连接被拒绝';
  if (message.includes('timeout') || message.includes('ETIMEDOUT')) return '请求超时';
  if (message.includes('certificate') || message.includes('CERT')) return 'SSL 证书错误';
  if (message.includes('ENETUNREACH')) return '网络不可达';
  return message;
}

// Site avatar with initial-letter fallback when the logo fails to load.
function SiteAvatar({ src, name }: { src: string; name: string }) {
  return (
    <Avatar className="size-10 shrink-0 border border-border">
      <AvatarImage src={src} alt={name} loading="lazy" referrerPolicy="no-referrer" />
      <AvatarFallback className="rounded-full bg-muted font-mono text-base text-(--brand)">
        {name.charAt(0).toUpperCase()}
      </AvatarFallback>
    </Avatar>
  );
}

// Relative <time> that self-recalibrates every minute. Data here is fetched
// client-side, so there is no SSR/CSR text mismatch to worry about.
function RelativeTime({ date }: { date: string }) {
  const label = useRelativeTime(date);
  return <time dateTime={date}>{label}</time>;
}

function MomentCard({ article }: { article: TimelineArticle }) {
  return (
    <li>
      <Card className="card-lift h-full p-5">
      {/* 作者信息 */}
      <div className="mb-3 flex items-center gap-3">
        <SiteAvatar src={article.siteLogo} name={article.siteName} />
        <div className="min-w-0 flex-1">
          <a
            href={article.siteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block truncate text-sm font-semibold text-foreground transition-colors hover:text-(--brand)"
          >
            {article.siteName}
          </a>
          <div className="mono-meta">
            <RelativeTime date={article.pubDate} />
          </div>
        </div>
        <Rss className="h-3.5 w-3.5 shrink-0 text-(--brand-line)" aria-hidden />
      </div>

      {/* 文章内容 */}
      <h3 className="mb-1.5 text-base font-bold leading-snug">
        <a
          href={article.link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-foreground transition-colors hover:text-(--brand)"
        >
          {article.title}
        </a>
      </h3>
      {article.description ? (
        <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
          {article.description}
        </p>
      ) : null}
      </Card>
    </li>
  );
}

// RSS 获取失败汇总面板
function FailedFeedsPanel({ failedFeeds }: { failedFeeds: SiteResult[] }) {
  return (
    <section
      className="mt-10 rounded-lg border border-destructive/30 bg-destructive/5 p-5"
      aria-label="RSS 获取失败列表"
    >
      <h2 className="mb-4 flex items-center gap-2 font-bold text-destructive">
        <AlertTriangle className="h-5 w-5" aria-hidden />
        RSS 获取失败 ({failedFeeds.length})
      </h2>
      <ul className="space-y-3">
        {failedFeeds.map((feed) => (
          <li
            key={feed.siteUrl}
            className="flex items-start justify-between gap-4 rounded-md border border-destructive/20 bg-card p-3"
          >
            <div className="min-w-0">
              <span className="block truncate text-sm font-semibold text-foreground">
                {feed.siteName}
              </span>
              <a
                href={feed.siteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mono-meta hover:text-(--brand)"
              >
                {feed.siteUrl}
              </a>
            </div>
            <span className="shrink-0 text-sm text-destructive">
              {formatErrorMessage(feed.errorMessage)}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function RSSAggregator({ friends }: { friends: Friend[] }) {
  const [results, setResults] = useState<SiteResult[] | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  // load() can be triggered by the refresh button outside any effect, so the
  // unmount flag lives in a ref instead of an effect-local variable.
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const load = useCallback(async () => {
    setIsRefreshing(true);
    const settled = await Promise.all(friends.map(fetchSite));
    if (mountedRef.current) {
      setResults(settled);
      setIsRefreshing(false);
    }
  }, [friends]);

  useEffect(() => {
    load();
  }, [load]);

  // Flatten per-site results into a single pubDate-desc timeline; per-article
  // site meta (avatar/name/url) comes from the API's BaseInfo.
  const { articles, failedFeeds, activeSites } = useMemo(() => {
    const list: TimelineArticle[] = [];
    const failed: SiteResult[] = [];
    let ok = 0;
    for (const r of results ?? []) {
      if (r.error) {
        failed.push(r);
        continue;
      }
      if (r.articles && r.articles.length > 0) ok += 1;
      for (const a of r.articles ?? []) {
        list.push({ ...a, siteName: r.siteName || r.siteUrl, siteLogo: r.siteLogo, siteUrl: r.siteUrl });
      }
    }
    list.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
    return { articles: list, failedFeeds: failed, activeSites: ok };
  }, [results]);

  const displayed = articles.slice(0, visibleCount);
  const hasMore = displayed.length < articles.length;
  const initialLoading = results === null;

  const refresh = () => {
    setVisibleCount(PAGE_SIZE);
    load();
  };

  const loadMore = () => {
    if (loadingMore || !hasMore) return;
    // 300ms 延迟让"加载中"有反馈，而不是瞬间追加重绘
    setLoadingMore(true);
    window.setTimeout(() => {
      setVisibleCount((count) => count + PAGE_SIZE);
      setLoadingMore(false);
    }, 300);
  };

  return (
    <div>
      {/* 工具栏：状态摘要 + 刷新 */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <p className="mono-meta">
          {initialLoading
            ? '正在拉取订阅…'
            : `共 ${articles.length} 篇 · 来自 ${activeSites} 个站点${
                failedFeeds.length > 0 ? ` · ${failedFeeds.length} 个失败` : ''
              }`}
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={refresh}
          disabled={isRefreshing || initialLoading}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4${isRefreshing ? ' animate-spin' : ''}`} aria-hidden />
          {isRefreshing ? '刷新中…' : '刷新'}
        </Button>
      </div>

      {initialLoading ? (
        // 加载状态：骨架卡片
        <div className="space-y-5 py-4" aria-label="加载中" role="status">
          {[0, 1, 2].map((i) => (
            <div key={i} className="rounded-lg border border-border bg-card p-5">
              <div className="mb-3 flex items-center gap-3">
                <Skeleton className="size-10 rounded-full" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3.5 w-28" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
              <Skeleton className="mb-2 h-4 w-3/4" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="mt-1.5 h-3 w-5/6" />
            </div>
          ))}
        </div>
      ) : articles.length === 0 ? (
        <Empty className="py-12">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Rss />
            </EmptyMedia>
            <EmptyTitle>暂无动态</EmptyTitle>
            <EmptyDescription>朋友们最近还没有发布新文章。</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <>
          <ul className="space-y-5">
            {displayed.map((a) => (
              <MomentCard key={a.link} article={a} />
            ))}
          </ul>

          {hasMore ? (
            <div className="mt-8 text-center">
              <Button
                type="button"
                variant="outline"
                onClick={loadMore}
                disabled={loadingMore}
                className="gap-2"
              >
                {loadingMore ? <Spinner data-icon="inline-start" /> : null}
                {loadingMore ? '加载中…' : '查看更多'}
              </Button>
            </div>
          ) : null}
        </>
      )}

      {!initialLoading && failedFeeds.length > 0 ? <FailedFeedsPanel failedFeeds={failedFeeds} /> : null}
    </div>
  );
}
