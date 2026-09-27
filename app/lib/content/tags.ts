// Tags: count tags across all posts, list posts by tag.
import fg from 'fast-glob';
import fs from 'node:fs/promises';
import matter from 'gray-matter';
import { paginate, type Paginated, type PostSummary } from './posts';
import { calculateReadingTime, formatDate, sortByDateDesc } from './reading-time';
import { parseAsset } from './assets';
import { parsePostFrontMatter } from './validation';

const SLUG_RE = /content[\\/]posts[\\/]([^\\/]+)[\\/]/;

export async function listTags(): Promise<Record<string, number>> {
  const files = await fg('content/posts/*/*.md', { caseSensitiveMatch: false });
  const counts: Record<string, number> = {};
  for (const file of files) {
    const raw = await fs.readFile(file, 'utf-8');
    const meta = parsePostFrontMatter(matter(raw).data, file, file.match(SLUG_RE)?.[1]);
    for (const tag of meta.tags) {
      counts[tag] = (counts[tag] ?? 0) + 1;
    }
  }
  return counts;
}

export async function getPostsByTag(
  tagName: string,
  options: { page?: number; pageSize?: number } = {}
): Promise<Paginated<PostSummary>> {
  const page = options.page ?? 1;
  const pageSize = options.pageSize ?? 10;
  const decoded = tagName.includes('%') ? safeDecode(tagName) : tagName;
  if (!decoded) return { page, pageSize, totalPages: 0, totalItems: 0, data: [] };

  const files = await fg('content/posts/*/*.md', { caseSensitiveMatch: false });
  const matches: PostSummary[] = [];
  for (const file of files) {
    const slugMatch = file.match(SLUG_RE);
    const slug = slugMatch?.[1];
    if (!slug) continue;
    const raw = await fs.readFile(file, 'utf-8');
    const parsed = matter(raw);
    const meta = parsePostFrontMatter(parsed.data, file, slug);
    const content = parsed.content;
    if (!meta.tags.includes(decoded)) continue;
    matches.push({
      path: slug,
      title: meta.title ?? slug,
      date: formatDate(meta.date),
      cover: meta.cover ? parseAsset(slug, meta.cover) : '',
      abstract: meta.abstract ?? '',
      tags: meta.tags,
      readingTime: calculateReadingTime(content).text,
    });
  }

  matches.sort(sortByDateDesc);
  const paged = paginate(matches, page, pageSize);
  return { ...paged, data: paged.data };
}

function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}
