import dayjs from 'dayjs';
import fg from 'fast-glob';
import fs from 'fs-extra';
import matter from 'gray-matter';
import { marked } from 'marked';
import { parseAsset } from '../../utils.js';

const renderer = (path) => ({
  heading(token) {
    const { text, depth: level } = token;
    return `
      <h${level} class="relative group" id="${text}">
        ${text}
        <span class="absolute top-0 w-6 transition-opacity opacity-0 -start-6 not-prose group-hover:opacity-100">
          <a class="group-hover:text-primary-300 dark:group-hover:text-neutral-700" href="#${text}" aria-label="Anchor">#</a>
        </span>
      </h${level}>`;
  },
  image(token) {
    const { href, title = '', text = '' } = token;

    if (!href) {
      return `<img alt="${text}"${title ? ` title="${title}"` : ''}>`;
    }

    let imageUrl = parseAsset(path, href.trim());
    return `<img src="${imageUrl}" alt="${text}"${title ? ` title="${title}"` : ''}>`;
  }
});




export default defineEventHandler(async (event) => {
  const name = event.context.params?.path;

  const files = await fg('content/posts/*/README.md');
  const filteredFiles = files.filter(i => i.includes(name));
  if (filteredFiles.length === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Article not found' });
  }

  const raw = await fs.readFile(filteredFiles[0], 'utf-8');
  const { data: metaData, content } = matter(raw);

  marked.use({ renderer: renderer(name) });
  const htmlContent = marked(content);

  if (metaData.cover) {
    metaData.cover = parseAsset(name, metaData.cover);
  }
  metaData.date = dayjs(metaData.date).format('MMM D, YYYY');
  const tags = typeof metaData.tags === 'string' ? [metaData.tags] : metaData.tags;
  metaData.tags = tags;

  return { metaData, htmlContent };
});