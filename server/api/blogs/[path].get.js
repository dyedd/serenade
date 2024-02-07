import fs from 'fs-extra'
import matter from 'gray-matter';
import { marked } from 'marked';
import fg from 'fast-glob'
import dayjs from 'dayjs'

const renderer = {
  heading(text, level) {
    return `
      <h${level} id="${text}">
        ${text}
        <a class="header-anchor" href="#${text}">#</a>
      </h${level}>`;
  }
};
export default defineEventHandler(async (event) => {
  const name = event.context.params?.path;
  const files = await fg('content/*/*.md');
  const filteredFiles = files.filter(i => i.includes(name));
  if (filteredFiles.length === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Article not found' });
  }

  const raw = await fs.readFile(filteredFiles[0], 'utf-8');
  const { data: metaData, content } = matter(raw);
  marked.use({ renderer });
  const htmlContent = marked(content);
  metaData.date = dayjs(metaData.date).format('MMM D, YYYY')
  return {
    metaData,
    htmlContent
  };
});
