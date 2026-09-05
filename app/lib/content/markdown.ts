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
      <div class="code-block-wrapper my-6 rounded-lg overflow-hidden bg-[#282c34] shadow-lg border border-neutral-700/50">
        <div class="code-header flex justify-between items-center px-4 py-1.5 bg-[#21252b] border-b border-neutral-700/50 text-xs text-neutral-300 select-none">
          <span class="font-mono font-medium opacity-80">${language}</span>
          <button class="copy-btn hover:text-white text-neutral-400 transition-colors cursor-pointer flex items-center gap-1.5 opacity-80 hover:opacity-100" aria-label="Copy code">
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
            Copy
          </button>
        </div>
        <div class="code-body flex min-w-0 text-sm relative">
          <div class="line-numbers shrink-0 flex flex-col items-end px-3 py-3 text-neutral-500 bg-[#282c34] border-r border-neutral-700/30 select-none font-mono text-right min-w-[2.5rem] leading-relaxed">
            ${lineNumbers}
          </div>
          <pre class="min-w-0 flex-1 !my-0 !p-3 !bg-transparent overflow-x-auto custom-scrollbar"><code class="hljs ${language} !bg-transparent !p-0 font-mono leading-relaxed">${highlighted}</code></pre>
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
  return marked.parse(content) as string;
}
