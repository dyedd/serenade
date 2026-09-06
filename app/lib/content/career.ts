// Career entries: content/career.json. Homepage only reads this list.
import fs from 'node:fs/promises';
import path from 'node:path';

export type CareerType = '实习' | '全职' | '在读' | '业余';

export interface CareerItem {
  period: string;
  org: string;
  role: string;
  type: CareerType | '';
  note: string;
}

const CAREER_FILE = path.join(process.cwd(), 'content', 'career.json');

export async function loadCareer(): Promise<CareerItem[]> {
  const raw = await fs.readFile(CAREER_FILE, 'utf-8');
  try {
    const data = JSON.parse(raw) as CareerItem[];
    if (!Array.isArray(data)) throw new Error('职业轨迹数据必须是数组');
    return data;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error('职业轨迹数据解析失败');
    }
    throw error;
  }
}
