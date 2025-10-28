import dayjs from 'dayjs';
import fg from 'fast-glob';
import fs from 'fs-extra';
import matter from 'gray-matter';
import { marked } from 'marked';
import markedKatex from 'marked-katex-extension';
import { parseAsset } from '../../utils.js';

const renderer = (path) => {
  const headingIds = new Map(); // 用于跟踪已使用的 ID

  return {
    heading(token) {
      const text = token.text;
      const level = token.depth;
      let id = text.replace(/\s+/g, '-').toLowerCase();

      // 处理重复 ID，添加序号
      if (headingIds.has(id)) {
        const count = headingIds.get(id) + 1;
        headingIds.set(id, count);
        id = `${id}-${count}`;
      } else {
        headingIds.set(id, 0);
      }

      return `
      <h${level} class="relative group" id="${id}">
        ${text}
        <span class="absolute top-0 w-6 transition-opacity opacity-0 -start-6 not-prose group-hover:opacity-100">
          <a class="group-hover:text-primary-300 dark:group-hover:text-neutral-700" href="#${id}" aria-label="Anchor">#</a>
        </span>
      </h${level}>`;
    },
    image(token) {
      const { href, title = '', text = '' } = token;

      if (!href) {
        return `<img alt="${text}"${title ? ` title="${title}"` : ''}>`;
      }

      let imageUrl = parseAsset(path, href.trim(), 'columns');
      return `<img src="${imageUrl}" alt="${text}"${title ? ` title="${title}"` : ''}>`;
    }
  };
};

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
  marked.use(markedKatex({
    throwOnError: false
  }));
  const readmeHtml = marked(readmeMarkdown);

  readmeMeta.date = dayjs(readmeMeta.date).format('MMM D, YYYY');

  // 遍历文件夹中的章节文件，只读取标题信息，不解析内容
  const chapters = [];
  const chapterFiles = await fg(`${columnPath}/*.md`);

  for (const file of chapterFiles) {
    const fileName = file.split('/').pop();
    if (fileName.toLowerCase() === 'readme.md') continue;

    // 只读取文件的前几行来提取标题，不读取完整内容
    const chapterContent = await fs.readFile(file, 'utf-8');
    const h1Match = chapterContent.match(/^#\s+(.+)$/m);
    const title = h1Match ? h1Match[1].trim() : fileName;

    chapters.push({
      metaData: { title },
      fileName
    });
  }

  // 按文件名顺序排序章节
  chapters.sort((a, b) => parseInt(a.fileName) - parseInt(b.fileName));

  return {
    metaData: readmeMeta,
    readmeHtml,
    chapters
  };
});
