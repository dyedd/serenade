// Posts: list / detail / search.
// All content reads go through fs/promises + fast-glob, scoped to process.cwd().
// fast-glob uses caseSensitiveMatch:false so README.md / readme.md both match
// regardless of host OS.
import fg from 'fast-glob';
import fs from 'node:fs/promises';
import matter from 'gray-matter';
import { parseAsset } from './assets';
import { calculateReadingTime, formatDate, sortByDateDesc } from './reading-time';
import { parseMarkdown } from './markdown';

export interface PostSummary {
  path: string;
  title: string;
  date: string;
  cover: string;
  abstract: string;
  tags: string[];
  readingTime: string;
}

export interface PostDetail extends PostSummary {
  html: string;
  prev: { path: string; title: string; date: string } | null;
  next: { path: string; title: string; date: string } | null;
}

export interface Paginated<T> {
  page: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
  data: T[];
}

const POST_PATTERN = 'content/posts/*/*.md';
const SLUG_RE = /content\/posts\/([^/]+)\//;

function normalizeTags(tags: unknown): string[] {
  if (typeof tags === 'string') return [tags];
  if (Array.isArray(tags)) return tags.filter((t): t is string => typeof t === 'string');
  return [];
}

export function paginate<T>(items: T[], page: number, pageSize: number): Paginated<T> {
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  return {
    page,
    pageSize,
    totalPages: Math.ceil(items.length / pageSize) || 0,
    totalItems: items.length,
    data: items.slice(start, end),
  };
}

async function loadPostFiles(): Promise<string[]> {
  return fg(POST_PATTERN, { caseSensitiveMatch: false });
}

async function buildSummary(file: string): Promise<PostSummary | null> {
  const slugMatch = file.match(SLUG_RE);
  const slug = slugMatch?.[1];
  if (!slug) return null;

  const raw = await fs.readFile(file, 'utf-8');
  const { data: meta, content } = matter(raw);
  const tags = normalizeTags(meta.tags);
  const readingTime = calculateReadingTime(content);

  return {
    path: slug,
    title: meta.title ?? slug,
    date: formatDate(meta.date),
    cover: meta.cover ? parseAsset(slug, meta.cover) : '',
    abstract: meta.abstract ?? '',
    tags,
    readingTime: readingTime.text,
  };
}

let indexCache: { posts: PostSummary[]; at: number } | null = null;
const CACHE_TTL_MS = 30_000;

async function getIndex(): Promise<PostSummary[]> {
  if (indexCache && Date.now() - indexCache.at < CACHE_TTL_MS) {
    return indexCache.posts;
  }
  const files = await loadPostFiles();
  const summaries = (await Promise.all(files.map(buildSummary))).filter(
    (s): s is PostSummary => s !== null
  );
  summaries.sort(sortByDateDesc);
  indexCache = { posts: summaries, at: Date.now() };
  return summaries;
}

export async function listPosts(options: { page?: number; pageSize?: number } = {}): Promise<Paginated<PostSummary>> {
  const page = options.page ?? 1;
  const pageSize = options.pageSize ?? 10;
  const posts = await getIndex();
  return { ...paginate(posts, page, pageSize), data: paginate(posts, page, pageSize).data };
}

export async function listPostDates(): Promise<string[]> {
  const posts = await getIndex();
  return posts.map((p) => p.date);
}

export async function getPost(slug: string): Promise<PostDetail | null> {
  const files = await fg('content/posts/*/{README,readme}.md', { caseSensitiveMatch: false });
  const matches = files.filter((f) => f.includes(slug));
  if (matches.length === 0) return null;

  const target = matches.find((f) => f.endsWith('/README.md')) ?? matches[0];
  const raw = await fs.readFile(target, 'utf-8');
  const { data: meta, content } = matter(raw);
  const tags = normalizeTags(meta.tags);
  const html = parseMarkdown(content, slug, { enableKatex: true, assetType: 'posts' });
  const readingTime = calculateReadingTime(content);

  const all = await getIndex();
  const i = all.findIndex((p) => p.path === slug);
  const prev = i > 0 ? { path: all[i - 1].path, title: all[i - 1].title, date: all[i - 1].date } : null;
  const next = i > -1 && i < all.length - 1 ? { path: all[i + 1].path, title: all[i + 1].title, date: all[i + 1].date } : null;

  return {
    path: slug,
    title: meta.title ?? slug,
    date: formatDate(meta.date),
    cover: meta.cover ? parseAsset(slug, meta.cover) : '',
    abstract: meta.abstract ?? '',
    tags,
    readingTime: readingTime.text,
    html,
    prev,
    next,
  };
}

export async function searchPosts(options: {
  keyword: string;
  page?: number;
  pageSize?: number;
}): Promise<Paginated<PostSummary>> {
  const keyword = (options.keyword ?? '').trim().toLowerCase();
  const page = options.page ?? 1;
  const pageSize = options.pageSize ?? 10;

  if (!keyword) {
    return { page, pageSize, totalPages: 0, totalItems: 0, data: [] };
  }

  const files = await loadPostFiles();
  const matched = (
    await Promise.all(
      files.map(async (file) => {
        const slugMatch = file.match(SLUG_RE);
        const slug = slugMatch?.[1];
        if (!slug) return null;
        const raw = await fs.readFile(file, 'utf-8');
        const { data: meta, content } = matter(raw);
        const tags = normalizeTags(meta.tags);
        const titleMatch = typeof meta.title === 'string' && meta.title.toLowerCase().includes(keyword);
        const abstractMatch =
          typeof meta.abstract === 'string' && meta.abstract.toLowerCase().includes(keyword);
        const tagsMatch = tags.some((t) => t.toLowerCase().includes(keyword));
        const contentMatch = content.toLowerCase().includes(keyword);
        if (!(titleMatch || abstractMatch || tagsMatch || contentMatch)) return null;
        return {
          path: slug,
          title: meta.title ?? slug,
          date: formatDate(meta.date),
          cover: meta.cover ? parseAsset(slug, meta.cover) : '',
          abstract: meta.abstract ?? '',
          tags,
          readingTime: calculateReadingTime(content).text,
        };
      })
    )
  ).filter((s): s is PostSummary => s !== null);

  matched.sort(sortByDateDesc);
  return { ...paginate(matched, page, pageSize), data: paginate(matched, page, pageSize).data };
}
