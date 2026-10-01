// 首页读取 content/career.json 中的职业经历。
import fs from 'node:fs/promises';
import path from 'node:path';
import { asOptionalString, asRecord, asString, parseJson } from './validation';

export interface CareerItem {
  period: string;
  org: string;
  role: string;
  note: string;
}

const CAREER_FILE = path.join(process.cwd(), 'content', 'career.json');

export async function loadCareer(): Promise<CareerItem[]> {
  const raw = await fs.readFile(CAREER_FILE, 'utf-8');
  return parseJson(raw, CAREER_FILE, (value, filePath) => {
    if (!Array.isArray(value)) throw new Error(`${filePath}: 职业轨迹数据必须是数组`);
    return value.map((item, index) => {
      const entry = asRecord(item, filePath, `职业轨迹第 ${index + 1} 项`);
      return {
        period: asString(entry.period, filePath, `职业轨迹第 ${index + 1} 项.period`),
        org: asString(entry.org, filePath, `职业轨迹第 ${index + 1} 项.org`),
        role: asString(entry.role, filePath, `职业轨迹第 ${index + 1} 项.role`),
        note: asOptionalString(entry.note, filePath, `职业轨迹第 ${index + 1} 项.note`) ?? '',
      };
    });
  });
}
