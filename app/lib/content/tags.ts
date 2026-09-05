// Tags: count tags across all posts, list posts by tag.
import fg from 'fast-glob';
import fs from 'node:fs/promises';
import matter from 'gray-matter';
import { paginate, type Paginated, type PostSummary } from './posts';
import { calculateReadingTime, formatDate, sortByDateDesc } from './reading-time';
import { parseAsset } from './assets';

export async function listTags(): Promise<Record<string, number>> {
  const files = await fg('content/posts/*/*.md', { caseSensitiveMatch: false });
  const counts: Record<string, number> = {};
  for (const file of files) {
    const raw = await fs.readFile(file, 'utf-8');
    const { data } = matter(raw);
    const tags = Array.isArray(data.tags) ? data.tags : typeof data.tags === 'string' ? [data.tags] : [];
    for (const tag of tags) {
      if (typeof tag === 'string' && tag.length > 0) {
        counts[tag] = (counts[tag] ?? 0) + 1;
      }
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
    const slugMatch = file.match(/content\/posts\/([^/]+)\//);
    const slug = slugMatch?.[1];
    if (!slug) continue;
    const raw = await fs.readFile(file, 'utf-8');
    const { data: meta, content } = matter(raw);
    const tags = Array.isArray(meta.tags) ? meta.tags : typeof meta.tags === 'string' ? [meta.tags] : [];
    if (!tags.includes(decoded)) continue;
    matches.push({
      path: slug,
      title: meta.title ?? slug,
      date: formatDate(meta.date),
      cover: meta.cover ? parseAsset(slug, meta.cover) : '',
      abstract: meta.abstract ?? '',
      tags,
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
