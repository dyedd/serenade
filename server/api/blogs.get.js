import fs from 'fs-extra'
import fg from 'fast-glob'
import path from 'path';
import matter from 'gray-matter';
import dayjs from 'dayjs'


export default defineEventHandler(async (event) => {
  const files = await fg('content/*/*.md');
  if (files.length === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Article not found' });
  }
  const processedFiles = await Promise.all(files.map(async (i) => {
    const name = path.basename(i);
    const raw = await fs.readFile(i, 'utf-8');
    const { data: metaData } = matter(raw);

    return {
      path: name,
      title: metaData.title,
      date: dayjs(metaData.date).format('MMMM D, YYYY'),
    };
  }));
  // 按年份进行分组
  const groupedByYear = processedFiles.reduce((acc, file) => {
    const year = dayjs(file.date).year();
    if (!acc[year]) {
      acc[year] = [];
    }
    acc[year].push(file);
    return acc;
  }, {});
  // 将分组的对象转换为数组，并按年份递减排序
  const sortedYearsArray = Object.keys(groupedByYear).sort((a, b) => b - a).map(year => ({
    year,
    blogs: groupedByYear[year]
  }));

  return sortedYearsArray;
});
