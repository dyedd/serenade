// GET /api/friends?url=<friend-url>
// Without ?url: returns list of friends with empty articles (for SSR shell).
// With ?url: fetches the friend's RSS and returns up to 5 articles.
import Parser from 'rss-parser';
import type { Route } from './+types/api.friends';
import { loadFriends, type Friend } from '~/lib/content/friends';

interface FeedItem {
  title: string;
  link: string;
  pubDate: string;
  description: string;
}

interface BaseInfo {
  siteName: string;
  siteUrl: string;
  siteLogo: string;
  description: string;
  articles: FeedItem[];
  hasRSS: boolean;
}

function buildBase(friend: Friend): BaseInfo {
  return {
    siteName: friend.name,
    siteUrl: friend.url,
    siteLogo: friend.logo,
    description: friend.description,
    articles: [],
    hasRSS: Boolean(friend.rss),
  };
}

function normalizeItems(items: Parser.Item[]): FeedItem[] {
  return items.slice(0, 5).filter((i) => i.title && i.link).map((i) => ({
    title: i.title ?? '未知标题',
    link: i.link ?? '#',
    pubDate: i.pubDate ?? new Date().toISOString(),
    description: i.contentSnippet ?? i.content ?? '',
  }));
}

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const urlQuery = url.searchParams.get('url');

  const friends = await loadFriends();

  if (!urlQuery) {
    return { results: friends.map(buildBase) };
  }

  const target = friends.find((f) => f.url === urlQuery);
  if (!target) return { results: [] };
  if (!target.rss) return { results: [{ ...buildBase(target) }] };

  const parser = new Parser({
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
    timeout: 10000,
  });

  try {
    const feed = await parser.parseURL(target.rss);
    const items = Array.isArray(feed.items) ? feed.items : [];
    if (items.length === 0) {
      return { results: [{ ...buildBase(target), isEmpty: true }] };
    }
    return { results: [{ ...buildBase(target), articles: normalizeItems(items) }] };
  } catch (error) {
    return {
      results: [{
        ...buildBase(target),
        error: true,
        errorMessage: error instanceof Error ? error.message : '未知错误',
      }],
    };
  }
}
