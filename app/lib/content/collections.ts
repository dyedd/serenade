import fs from 'node:fs/promises';
import { listPostIndex, type PostSummary } from './posts';
import { asOptionalString, asRecord, asString, parseJson } from './validation';

export interface CollectionItem {
  post?: string;
  link?: string;
  title?: string;
}

export interface Collection {
  title: string;
  description: string;
  cover?: string;
  items: CollectionItem[];
}

export type Collections = Record<string, Collection>;

export async function listCollections(): Promise<Collections> {
  const filePath = 'content/collections.json';
  let raw: string;
  try {
    raw = await fs.readFile(filePath, 'utf8');
  } catch (error) {
    // 没有合集文件时视为「没有合集」：首页和 /posts 不该因为可选文件缺失而整页报错。
    if ((error as NodeJS.ErrnoException)?.code === 'ENOENT') return {};
    throw new Error(`读取 ${filePath} 失败`, { cause: error });
  }
  return parseJson(raw, filePath, (value, pathName) => {
    const root = asRecord(value, pathName, '合集数据');
    return Object.fromEntries(Object.entries(root).map(([slug, rawCollection]) => {
      const collection = asRecord(rawCollection, pathName, `合集 ${slug}`);
      const rawItems = collection.items;
      if (!Array.isArray(rawItems)) throw new Error(`${pathName}: 合集 ${slug}.items 必须是数组`);
      const items = rawItems.map((rawItem, index) => {
        const item = asRecord(rawItem, pathName, `合集 ${slug}.items[${index}]`);
        const post = asOptionalString(item.post, pathName, `合集 ${slug}.items[${index}].post`);
        const link = asOptionalString(item.link, pathName, `合集 ${slug}.items[${index}].link`);
        if (!post && !link) throw new Error(`${pathName}: 合集 ${slug}.items[${index}] 必须包含 post 或 link`);
        return { post, link, title: asOptionalString(item.title, pathName, `合集 ${slug}.items[${index}].title`) };
      });
      return [slug, {
        title: asString(collection.title, pathName, `合集 ${slug}.title`),
        description: asString(collection.description, pathName, `合集 ${slug}.description`),
        cover: asOptionalString(collection.cover, pathName, `合集 ${slug}.cover`),
        items,
      } satisfies Collection];
    })) as Collections;
  });
}

export async function collectionsByPost(): Promise<Map<string, Array<{ slug: string; title: string }>>> {
  const collections = await listCollections();
  const posts = new Map((await listPostIndex()).map((post) => [post.path, post]));
  const result = new Map<string, Array<{ slug: string; title: string }>>();
  for (const [slug, collection] of Object.entries(collections)) {
    for (const item of collection.items) {
      if (!item.post || !posts.has(item.post)) continue;
      const current = result.get(item.post) ?? [];
      current.push({ slug, title: collection.title });
      result.set(item.post, current);
    }
  }
  return result;
}

export function collectionPosts(
  posts: PostSummary[],
  collections: Map<string, Array<{ slug: string; title: string }>>
) {
  return posts.map((post) => ({ ...post, collections: collections.get(post.path) ?? [] }));
}
