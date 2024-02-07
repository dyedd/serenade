import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

export default defineEventHandler(() => {
  const directoryPath = path.join('content');
  const files = fs.readdirSync(directoryPath);

  const categorys = files.map((fileName) => {
    const fullPath = path.join(directoryPath, fileName);
    const fileContents = fs.readFileSync(fullPath, 'utf-8');
    const { data } = matter(fileContents);

    return data.category || null; // 返回 category，如果没有找到 category，则返回 null
  }).filter(category => category !== null); // 过滤掉任何没有 category 的文件

  return categorys;
});