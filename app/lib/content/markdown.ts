// 每次 parse 都新建 Marked 实例：marked 的扩展是实例级状态，共用一个全局实例
// 会让「这篇文章开了 KaTeX」泄漏到之后所有渲染（例如专栏页面里 $100 被当公式）。
import { Marked, type RendererObject, type Token, type Tokens } from 'marked';
import markedKatex from 'marked-katex-extension';
import hljs from 'highlight.js';
import { parseAsset, type AssetType } from './assets';

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeAttr(value: string): string {
  return escapeHtml(value);
}

// 渲染回调拿到的是 inline token，不是原始 Markdown 文本：标题里带 **强调**、
// 行内代码或图片时 text 会变成 [object Object] 或丢掉标记。这里还原纯文本。
function plainText(tokens: Token[] | undefined): string {
  if (!tokens) return '';
  let out = '';
  for (const token of tokens) {
    switch (token.type) {
      case 'text':
      case 'codespan':
      case 'escape':
        out += (token as Tokens.Text | Tokens.Codespan | Tokens.Escape).text;
        break;
      case 'image':
        out += (token as Tokens.Image).text ?? '';
        break;
      case 'br':
        out += ' ';
        break;
      default: {
        const children = (token as { tokens?: Token[] }).tokens;
        if (children) out += plainText(children);
        else if (typeof (token as { text?: string }).text === 'string') {
          out += (token as { text: string }).text;
        }
      }
    }
  }
  return out;
}

function headingId(text: string, taken: Map<string, number>): string {
  const base = text
    .trim()
    .toLowerCase()
    .replace(/[\s\u3000]+/g, '-')
    .replace(/["'<>`&=]/g, '')
    .replace(/^-+|-+$/g, '') || 'section';
  const seen = taken.get(base);
  if (seen === undefined) {
    taken.set(base, 1);
    return base;
  }
  let next = seen;
  let candidate = `${base}-${next}`;
  while (taken.has(candidate)) {
    next += 1;
    candidate = `${base}-${next}`;
  }
  taken.set(base, next + 1);
  taken.set(candidate, 1);
  return candidate;
}

function createRenderer(slug: string, assetType: AssetType): Partial<RendererObject> {
  const takenIds = new Map<string, number>();

  return {
    heading({ tokens, depth }) {
      const text = plainText(tokens);
      const id = headingId(text, takenIds);
      return `<h${depth} class="relative group" id="${escapeAttr(id)}">${this.parser.parseInline(tokens)}</h${depth}>`;
    },
    image({ href, title, text }) {
      const alt = escapeAttr(text ?? '');
      const titleAttr = title ? ` title="${escapeAttr(title)}"` : '';
      const src = href ? escapeAttr(parseAsset(slug, href.trim(), assetType)) : '';
      const srcAttr = src ? ` src="${src}"` : '';
      return `<img class="post-image"${srcAttr} alt="${alt}"${titleAttr} loading="lazy" decoding="async">`;
    },
    code({ text, lang }) {
      const language = lang ?? 'text';
      const validLang = !!(lang && hljs.getLanguage(lang));
      const highlighted = validLang
        ? hljs.highlight(text, { language: lang!, ignoreIllegals: true }).value
        : hljs.highlightAuto(text).value;

      const lines = text.replace(/\n$/, '').split('\n').length;
      const lineNumbers = Array.from({ length: lines }, (_, i) => `<span>${i + 1}</span>`).join('');
      // 语言名来自正文，可能带引号/空格等会闭合属性的字符：只保留开头的一段
      // 标识符作为样式类，显示文本仍按 HTML 转义。
      const languageClass = `language-${language.match(/^[A-Za-z0-9_+#-]+/)?.[0] ?? 'text'}`;

      return `
      <div class="code-block-wrapper paper-card my-6 overflow-hidden shadow-none">
        <div class="code-header flex items-center justify-between border-b border-border bg-card px-6 py-3 text-xs text-black/60 select-none">
          <span class="font-mono">${escapeHtml(language)}</span>
          <button class="copy-btn flex cursor-pointer items-center gap-1.5 text-black/60 transition-colors duration-200 ease hover:text-black" aria-label="复制代码">
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
            复制
          </button>
        </div>
        <div class="code-body flex min-w-0 text-sm">
          <div class="line-numbers flex min-w-[2.5rem] shrink-0 select-none flex-col items-end border-r border-border bg-card px-3 py-6 text-right font-mono text-black/40 leading-relaxed" aria-hidden="true">
            ${lineNumbers}
          </div>
          <pre class="custom-scrollbar min-w-0 flex-1 overflow-x-auto !my-0 !bg-transparent !p-6"><code class="hljs ${languageClass} !bg-transparent !p-0 font-mono leading-relaxed">${highlighted}</code></pre>
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
  const marked = new Marked();
  marked.use({ renderer: createRenderer(slug, assetType) });
  if (enableKatex) {
    marked.use(markedKatex({ throwOnError: false, nonStandard: true, output: 'mathml' }));
  }
  const html = marked.parse(content, { async: false });
  // 表格盒子会跟着列宽变大，包一层后只有表格自己横滑。
  // 只包顶层 <table>：代码高亮产出的表格在 <pre> 内，缩进形式不会命中这个锚定写法。
  return html.replace(
    /^<table\b[^>]*>[\s\S]*?<\/table>$/gm,
    (table) => `<div class="prose-scroll">${table}</div>`,
  );
}
