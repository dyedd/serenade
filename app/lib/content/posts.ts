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
import { parsePostFrontMatter } from './validation';

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
const SLUG_RE = /content[\\/]posts[\\/]([^\\/]+)[\\/]/;

function getSlug(file: string): string | null {
  return file.match(SLUG_RE)?.[1] ?? null;
}

function readFrontMatter(raw: string, file: string, fallbackTitle?: string) {
  const parsed = matter(raw);
  return { meta: parsePostFrontMatter(parsed.data, file, fallbackTitle), content: parsed.content };
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

function openingExcerpt(content: string): string {
  const chunks: string[] = [];
  let buf: string[] = [];
  const flush = () => {
    const text = buf.join(' ').replace(/\s+/g, ' ').trim();
    buf = [];
    if (text) chunks.push(text);
  };
  for (const line of content.replace(/\r\n/g, '\n').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('```') || trimmed.startsWith('!')) {
      flush();
      continue;
    }
    buf.push(trimmed);
  }
  flush();
  const first = chunks.find((chunk) => chunk.length >= 12);
  if (!first) return '';
  const plain = first
    .replace(/!\[[^\]]*]\([^)]*\)/g, '')
    .replace(/\[([^\]]+)]\([^)]*\)/g, '$1')
    .replace(/[*_`]/g, '')
    .trim();
  return plain.length > 160 ? `${plain.slice(0, 160)}…` : plain;
}

export async function openingExcerpts(slugs: string[]): Promise<Record<string, string>> {
  const wanted = new Set(slugs);
  const files = await loadPostFiles();
  const chosen = new Map<string, string>();
  for (const file of files) {
    const slug = getSlug(file);
    if (!slug || !wanted.has(slug)) continue;
    if (!/[/\\](README|readme)\.md$/i.test(file)) continue;
    const current = chosen.get(slug);
    if (!current || file.replaceAll('\\', '/').endsWith('/README.md')) chosen.set(slug, file);
  }
  const out: Record<string, string> = {};
  await Promise.all([...chosen.entries()].map(async ([slug, file]) => {
    const raw = await fs.readFile(file, 'utf-8');
    const { content } = readFrontMatter(raw, file, slug);
    out[slug] = openingExcerpt(content);
  }));
  return out;
}

async function buildSummary(file: string): Promise<PostSummary | null> {
  const slug = getSlug(file);
  if (!slug) return null;

  const raw = await fs.readFile(file, 'utf-8');
  const { meta, content } = readFrontMatter(raw, file, slug);
  const readingTime = calculateReadingTime(content);

  return {
    path: slug,
    title: meta.title ?? slug,
    date: formatDate(meta.date),
    cover: meta.cover ? parseAsset(slug, meta.cover) : '',
    abstract: meta.abstract ?? '',
    tags: meta.tags,
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

export async function listPostIndex(): Promise<PostSummary[]> {
  return getIndex();
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
  const matches = files.filter((file) => getSlug(file) === slug);
  if (matches.length === 0) return null;

  const target = matches.find((f) => f.replaceAll('\\', '/').endsWith('/README.md')) ?? matches[0];
  const raw = await fs.readFile(target, 'utf-8');
  const { meta, content } = readFrontMatter(raw, target, slug);
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
    tags: meta.tags,
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
        const slug = getSlug(file);
        if (!slug) return null;
        const raw = await fs.readFile(file, 'utf-8');
        const { meta, content } = readFrontMatter(raw, file, slug);
        const titleMatch = typeof meta.title === 'string' && meta.title.toLowerCase().includes(keyword);
        const abstractMatch =
          typeof meta.abstract === 'string' && meta.abstract.toLowerCase().includes(keyword);
        const tagsMatch = meta.tags.some((t) => t.toLowerCase().includes(keyword));
        const contentMatch = content.toLowerCase().includes(keyword);
        if (!(titleMatch || abstractMatch || tagsMatch || contentMatch)) return null;
        return {
          path: slug,
          title: meta.title ?? slug,
          date: formatDate(meta.date),
          cover: meta.cover ? parseAsset(slug, meta.cover) : '',
          abstract: meta.abstract ?? '',
          tags: meta.tags,
          readingTime: calculateReadingTime(content).text,
        };
      })
    )
  ).filter((s): s is PostSummary => s !== null);

  matched.sort(sortByDateDesc);
  return { ...paginate(matched, page, pageSize), data: paginate(matched, page, pageSize).data };
}
