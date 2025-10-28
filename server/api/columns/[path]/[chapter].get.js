import fs from 'fs-extra';
import { marked } from 'marked';
import markedKatex from 'marked-katex-extension';
import { parseAsset } from '../../../utils.js';

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
  const { path, chapter } = event.context.params;

  const chapterPath = `content/columns/${path}/${chapter}`;

  // 检查章节文件是否存在
  if (!await fs.pathExists(chapterPath)) {
    throw createError({ statusCode: 404, statusMessage: 'Chapter not found' });
  }

  // 读取并解析章节内容
  const chapterContent = await fs.readFile(chapterPath, 'utf-8');

  marked.use({ renderer: renderer(path) });
  marked.use(markedKatex({
    throwOnError: false,
    nonStandard: true,
    output: 'mathml'
  }));
  const htmlContent = marked(chapterContent);

  // 提取标题
  const h1Match = chapterContent.match(/^#\s+(.+)$/m);
  const title = h1Match ? h1Match[1].trim() : chapter;

  return {
    metaData: { title },
    htmlContent,
    fileName: chapter
  };
});
