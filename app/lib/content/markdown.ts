// Markdown rendering: marked + KaTeX + highlight.js + custom heading anchors
// and code-block wrapper. The renderer is created fresh per parse call because
// heading IDs and image/asset paths depend on the post slug.
import { Marked, type RendererObject } from 'marked';
import markedKatex from 'marked-katex-extension';
import hljs from 'highlight.js';
import { parseAsset, type AssetType } from './assets';

// Single global Marked instance; renderer is swapped per parse call below.
const marked = new Marked();

function createRenderer(slug: string, assetType: AssetType): Partial<RendererObject> {
  const headingIds = new Map<string, number>();

  return {
    heading({ text, depth }) {
      let id = text.replace(/\s+/g, '-').toLowerCase();
      const seen = headingIds.get(id);
      if (seen !== undefined) {
        const next = seen + 1;
        headingIds.set(id, next);
        id = `${id}-${next}`;
      } else {
        headingIds.set(id, 0);
      }
      return `
      <h${depth} class="relative group" id="${id}">
        ${text}
      </h${depth}>`;
    },
    image({ href, title, text }) {
      const alt = text ?? '';
      const titleAttr = title ? ` title="${title}"` : '';
      if (!href) {
        return `<img alt="${alt}"${titleAttr} loading="lazy">`;
      }
      const imageUrl = parseAsset(slug, href.trim(), assetType);
      return `<img src="${imageUrl}" alt="${alt}"${titleAttr} loading="lazy">`;
    },
    code({ text, lang }) {
      const language = lang ?? 'text';
      const validLang = !!(lang && hljs.getLanguage(lang));
      const highlighted = validLang
        ? hljs.highlight(text, { language: lang! }).value
        : hljs.highlightAuto(text).value;

      const lines = text.trim().split('\n').length;
      const lineNumbers = Array.from(
        { length: lines },
        (_, i) => `<span>${i + 1}</span>`
      ).join('');

      return `
      <div class="code-block-wrapper paper-card my-6 overflow-hidden shadow-none">
        <div class="code-header flex items-center justify-between border-b border-border bg-card px-6 py-3 text-xs text-black/60 select-none">
          <span class="font-mono">${language}</span>
          <button class="copy-btn flex cursor-pointer items-center gap-1.5 text-black/60 transition-colors duration-200 ease hover:text-black" aria-label="Copy code">
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
            Copy
          </button>
        </div>
        <div class="code-body flex min-w-0 text-sm">
          <div class="line-numbers flex min-w-[2.5rem] shrink-0 select-none flex-col items-end border-r border-border bg-card px-3 py-6 text-right font-mono text-black/40 leading-relaxed">
            ${lineNumbers}
          </div>
          <pre class="custom-scrollbar min-w-0 flex-1 overflow-x-auto !my-0 !bg-transparent !p-6"><code class="hljs ${language} !bg-transparent !p-0 font-mono leading-relaxed">${highlighted}</code></pre>
        </div>
      </div>`;
    },
  };
}

export interface MarkdownOptions {
  enableKatex?: boolean;
  assetType?: AssetType;
}

export function parseMarkdown(
  content: string,
  slug: string,
  options: MarkdownOptions = {}
): string {
  const { enableKatex = false, assetType = 'posts' } = options;
  const renderer = createRenderer(slug, assetType);
  const use = (marked as unknown as { use: (opts: Record<string, unknown>) => void }).use.bind(marked);
  use({ renderer });
  if (enableKatex) {
    use(markedKatex({
      throwOnError: false,
      nonStandard: true,
      output: 'mathml',
    }) as unknown as Record<string, unknown>);
  }
  const html = marked.parse(content) as string;
  // 表格盒子会跟着列宽变大，包一层后只有表格自己横滑。
  return html.replace(
    /<table\b[^>]*>[\s\S]*?<\/table>/g,
    (table) => `<div class="prose-scroll">${table}</div>`,
  );
}
