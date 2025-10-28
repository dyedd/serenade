import fs from 'fs-extra';
import matter from 'gray-matter';
import { marked } from 'marked';
import fg from 'fast-glob';
import dayjs from 'dayjs';

const renderer = (path) => ({
  heading(token) {
    const text = token.text;
    const level = token.depth;
    const id = text.replace(/\s+/g, '-').toLowerCase();
    return `
      <h${level} class="relative group" id="${id}">
        ${text}
        <span class="absolute top-0 w-6 transition-opacity opacity-0 -start-6 not-prose group-hover:opacity-100">
          <a class="group-hover:text-primary-300 dark:group-hover:text-neutral-700" href="#${id}" aria-label="Anchor">#</a>
        </span>
      </h${level}>`;
  },
  image(href, title, text) {
    let imageUrl = href;
    if (!href.startsWith('http://') && !href.startsWith('https://') && !href.startsWith('/')) {
      imageUrl = `/assets/${path}/${href}`;
    }
    return `<img src="${imageUrl}" alt="${text}"${title ? ` title="${title}"` : ''}>`;
  }
});

export default defineEventHandler(async (event) => {
  const name = event.context.params?.path;
  
  // 获取指定专栏文件夹的路径
  const columnPath = `content/columns/${name}`;
  const readmePath = `${columnPath}/readme.md`;
  
  // 检查 README.md 是否存在，用于专栏介绍
  if (!await fs.pathExists(readmePath)) {
    throw createError({ statusCode: 404, statusMessage: 'Column not found' });
  }
  
  // 读取 README.md 的内容作为专栏的介绍
  const readmeContent = await fs.readFile(readmePath, 'utf-8');
  const { data: readmeMeta, content: readmeMarkdown } = matter(readmeContent);
  marked.use({ renderer: renderer(name) });
  const readmeHtml = marked(readmeMarkdown);
  
  readmeMeta.date = dayjs(readmeMeta.date).format('MMM D, YYYY');
  
  // 遍历文件夹中的章节文件
  const chapters = [];
  const chapterFiles = await fg(`${columnPath}/*.md`);
  
  for (const file of chapterFiles) {
    const fileName = file.split('/').pop();
    if (fileName === 'readme.md') continue;
    
    const chapterContent = await fs.readFile(file, 'utf-8');
    const { data: chapterMeta, content: chapterMarkdown } = matter(chapterContent);
    const chapterHtml = marked(chapterMarkdown);
    
    chapterMeta.date = dayjs(chapterMeta.date).format('MMM D, YYYY');
    chapters.push({ metaData: chapterMeta, htmlContent: chapterHtml, fileName });
  }
  
  // 按文件名顺序排序章节
  chapters.sort((a, b) => parseInt(a.fileName) - parseInt(b.fileName));

  return {
    metaData: readmeMeta,
    readmeHtml,
    chapters
  };
});
