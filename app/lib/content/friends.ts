// Friends: load content/friends.json. RSS fetching lives in the friends API
// route (server-side only) since it requires network at request time.
import fs from 'node:fs/promises';
import path from 'node:path';

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
  try {
    return JSON.parse(raw) as Friend[];
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error('友链数据解析失败');
    }
    throw error;
  }
}
