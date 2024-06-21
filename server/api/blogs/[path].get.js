import fs from 'fs-extra'
import matter from 'gray-matter';
import { marked } from 'marked';
import fg from 'fast-glob'
import dayjs from 'dayjs'
// todo： 现在是根据文件名而不是文件夹匹配
// 图片资源呢？
const renderer = {
  heading(text, level) {
    return `
      <h${level} class="relative group" id="${text}">
        ${text}
        <span class="absolute top-0 w-6 transition-opacity opacity-0 -start-6 not-prose group-hover:opacity-100">
          <a class="group-hover:text-primary-300 dark:group-hover:text-neutral-700" href="#${text}" aria-label="Anchor">#</a>
        </span>
      </h${level}>`;
  }
};
export default defineEventHandler(async (event) => {
  const name = event.context.params?.path;
  const files = await fg('content/blogs/*/*.md');
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
