import fs from 'fs-extra';
import matter from 'gray-matter';
import fg from 'fast-glob';
import dayjs from 'dayjs';
import path from 'path';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const page = parseInt(query.page) || 1;
  const pageSize = parseInt(query.pageSize) || 10;

  const tagName = event.context.params?.path;
  const files = await fg('content/blogs/*/*.md');
  if (files.length === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Article not found' });
  }

  const matchedFiles = [];
  for (const file of files) {
    const raw = await fs.readFile(file, 'utf-8');
    const { data: metaData } = matter(raw);
    if (metaData.tags && metaData.tags.includes(tagName)) {
      matchedFiles.push({
        path: path.basename(file),
        title: metaData.title,
        date: dayjs(metaData.date).format('MMMM D, YYYY'),
        cover: metaData.cover,
        abstract: metaData.abstract,
      });
    }
  }

  if (matchedFiles.length === 0) {
    throw createError({ statusCode: 404, statusMessage: 'No articles found for this tag' });
  }
  matchedFiles.sort((a, b) => new Date(b.date) - new Date(a.date));

  const paginatedFiles = matchedFiles.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.ceil(matchedFiles.length / pageSize);

  return {
    page,
    pageSize,
    totalPages,
    totalItems: matchedFiles.length,
    data: paginatedFiles,
  };
});
