import dayjs from 'dayjs';
import fg from 'fast-glob';
import fs from 'fs-extra';
import matter from 'gray-matter';
import { parseAsset } from '../../utils.js';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const keyword = query.keyword?.toLowerCase() || '';
  const page = parseInt(query.page) || 1;
  const pageSize = parseInt(query.pageSize) || 10;

  if (!keyword) {
    return {
      page,
      pageSize,
      totalPages: 0,
      totalItems: 0,
      data: [],
    };
  }

  const files = await fg('content/posts/*/*.md');
  if (files.length === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Article not found' });
  }

  const processedFiles = await Promise.all(files.map(async (i) => {
    const raw = await fs.readFile(i, 'utf-8');
    const { data: metaData, content } = matter(raw);
    const tags = typeof metaData.tags === 'string' ? [metaData.tags] : metaData.tags;
    const path = i.match(/content\/posts\/([^\/]+)\//)?.[1];

    // 搜索标题、摘要、标签和内容
    const titleMatch = metaData.title?.toLowerCase().includes(keyword);
    const abstractMatch = metaData.abstract?.toLowerCase().includes(keyword);
    const tagsMatch = tags?.some(tag => tag.toLowerCase().includes(keyword));
    const contentMatch = content.toLowerCase().includes(keyword);

    if (titleMatch || abstractMatch || tagsMatch || contentMatch) {
      return {
        path: path,
        title: metaData.title,
        date: dayjs(metaData.date).format('MMMM D, YYYY'),
        cover: metaData.cover ? parseAsset(path, metaData.cover) : '',
        abstract: metaData.abstract,
        tags: tags,
      };
    }
    return null;
  }));

  // 过滤掉 null 值
  const filteredFiles = processedFiles.filter(file => file !== null);
  filteredFiles.sort((a, b) => new Date(b.date) - new Date(a.date));

  const paginatedFiles = filteredFiles.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.ceil(filteredFiles.length / pageSize);

  return {
    page,
    pageSize,
    totalPages,
    totalItems: filteredFiles.length,
    data: paginatedFiles,
  };
});
