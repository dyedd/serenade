// Extract h2/h3/h4 headings with id="..." attributes from rendered markdown
// HTML. Used by routes to feed TableOfContents so SSR ships complete TOC.
import type { TocEntry } from '~/components/TableOfContents';

export function extractHeadings(html: string): TocEntry[] {
  const out: TocEntry[] = [];
  const re = /<(h[234])\s+[^>]*\bid="([^"]+)"[^>]*>([\s\S]*?)<\/\1>/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(html)) !== null) {
    const tag = match[1].toLowerCase();
    const id = match[2];
    const inner = match[3].replace(/<[^>]+>/g, '').trim();
    if (inner) {
      out.push({ id, text: inner, level: Number(tag[1]) as 2 | 3 | 4 });
    }
  }
  return out;
}
