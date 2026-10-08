import {
  clampPageSize,
  listPostIndex,
  paginate,
  type Paginated,
  type PostSummary,
} from './posts';

let tagsCache: { counts: Record<string, number>; at: number } | null = null;
const TAGS_TTL_MS = 30_000;

export async function listTags(): Promise<Record<string, number>> {
  if (tagsCache && Date.now() - tagsCache.at < TAGS_TTL_MS) {
    return tagsCache.counts;
  }
  const counts: Record<string, number> = {};
  for (const post of await listPostIndex()) {
    for (const tag of post.tags) {
      counts[tag] = (counts[tag] ?? 0) + 1;
    }
  }
  tagsCache = { counts, at: Date.now() };
  return counts;
}

export async function getPostsByTag(
  tagName: string,
  options: { page?: number; pageSize?: number } = {}
): Promise<Paginated<PostSummary>> {
  const page = options.page ?? 1;
  const pageSize = clampPageSize(options.pageSize, 10);
  const decoded = safeDecode(tagName);
  if (!decoded) return { page, pageSize, totalPages: 0, totalItems: 0, data: [] };

  const matches = (await listPostIndex()).filter((post) => post.tags.includes(decoded));
  return paginate(matches, page, pageSize);
}

// 路由参数可能来自未经转义的地址（例如 /tags/50%），decodeURIComponent 会抛
// URIError；这里退化为原值，交给标签匹配自然得到空结果。
export function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}
