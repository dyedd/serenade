// Friends: load content/friends.json. RSS fetching lives in the friends API
// route (server-side only) since it requires network at request time.
import fs from 'node:fs/promises';
import path from 'node:path';
import { asOptionalString, asRecord, asString, asUrl, parseJson } from './validation';

export interface Friend {
  name: string;
  url: string;
  logo: string;
  description: string;
  rss?: string;
}

const FRIENDS_FILE = path.join(process.cwd(), 'content', 'friends.json');

export async function loadFriends(): Promise<Friend[]> {
  const raw = await fs.readFile(FRIENDS_FILE, 'utf-8');
  return parseJson(raw, FRIENDS_FILE, (value, filePath) => {
    if (!Array.isArray(value)) throw new Error(`${filePath}: 友链数据必须是数组`);
    const urls = new Set<string>();
    return value.map((item, index) => {
      const entry = asRecord(item, filePath, `友链第 ${index + 1} 项`);
      const url = asUrl(entry.url, filePath, `友链第 ${index + 1} 项.url`);
      if (urls.has(url)) throw new Error(`${filePath}: 友链第 ${index + 1} 项.url 重复`);
      urls.add(url);
      return {
        name: asString(entry.name, filePath, `友链第 ${index + 1} 项.name`),
        url,
        logo: asUrl(entry.logo, filePath, `友链第 ${index + 1} 项.logo`),
        description: asOptionalString(entry.description, filePath, `友链第 ${index + 1} 项.description`) ?? '',
        rss: asOptionalString(entry.rss, filePath, `友链第 ${index + 1} 项.rss`),
      };
    });
  });
}
