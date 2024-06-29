import fs from 'fs-extra'
import fg from 'fast-glob'
import path from 'path';
import matter from 'gray-matter';
import dayjs from 'dayjs'


export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const page = parseInt(query.page) || 1;
  const pageSize = parseInt(query.pageSize) || 10;

  const files = await fg('content/blogs/*/*.md');
  if (files.length === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Article not found' });
  }
  const processedFiles = await Promise.all(files.map(async (i) => {
    const raw = await fs.readFile(i, 'utf-8');
    const { data: metaData} = matter(raw);
    return {
      path: i.match(/content\/blogs\/([^\/]+)\//)?.[1],
      title: metaData.title,
      date: dayjs(metaData.date).format('MMMM D, YYYY'),
      cover: metaData.cover,
      abstract: metaData.abstract,
      tags: metaData.tags,
    };
  }));
  
  processedFiles.sort((a, b) => new Date(b.date) - new Date(a.date));

  const paginatedFiles = processedFiles.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.ceil(processedFiles.length / pageSize);

  return {
    page,
    pageSize,
    totalPages,
    totalItems: processedFiles.length,
    data: paginatedFiles,
  };
});
