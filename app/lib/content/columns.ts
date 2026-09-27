// Columns: list / detail (README + chapters) / single chapter.
import fg from 'fast-glob';
import fs from 'node:fs/promises';
import matter from 'gray-matter';
import { paginate, type Paginated } from './posts';
import { formatDate } from './reading-time';
import { parseMarkdown } from './markdown';

export interface ColumnSummary {
  path: string;
  title: string;
  date: string;
  image: string | null;
  description: string;
  type: string;
  chapterCount: number;
}

export interface ColumnDetail {
  meta: Record<string, unknown>;
  html: string;
  chapters: Array<{ meta: { title: string }; fileName: string }>;
}

export interface ChapterDetail {
  meta: { title: string };
  html: string;
  fileName: string;
}

const COLUMN_PATTERN = 'content/columns/*/{README,readme}.md';
const SLUG_RE = /content[\\/]columns[\\/]([^\\/]+)[\\/]/;

export async function listColumns(
  options: { page?: number; pageSize?: number } = {}
): Promise<Paginated<ColumnSummary> & { totalDocs: number }> {
  const page = options.page ?? 1;
  const pageSize = options.pageSize ?? 10;
  const files = await fg(COLUMN_PATTERN, { caseSensitiveMatch: false });
  if (files.length === 0) {
    return { page, pageSize, totalPages: 0, totalItems: 0, totalDocs: 0, data: [] };
  }

  const summaries = await Promise.all(
    files.map(async (file): Promise<ColumnSummary | null> => {
      const slugMatch = file.match(SLUG_RE);
      const slug = slugMatch?.[1];
      if (!slug) return null;
      const raw = await fs.readFile(file, 'utf-8');
      const { data: meta } = matter(raw);
      const chapterFiles = await fg(`content/columns/${slug}/*.md`, { caseSensitiveMatch: false });
      return {
        path: slug,
        title: meta.title ?? slug,
        date: formatDate(meta.date),
        image: meta.image ? `/assets/columns/${slug}/${String(meta.image).replace(/^\.\//, '')}` : null,
        description: meta.description ?? '',
        type: meta.type ?? '',
        chapterCount: chapterFiles.length - 1,
      };
    })
  );

  const filtered = summaries.filter((s): s is ColumnSummary => s !== null);
  filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const totalDocs = filtered.reduce((sum, c) => sum + c.chapterCount, 0);
  const paged = paginate(filtered, page, pageSize);
  return { ...paged, totalDocs };
}

export async function getColumn(slug: string): Promise<ColumnDetail | null> {
  const columnPath = `content/columns/${slug}`;
  const readmes = await fg(`${columnPath}/{README,readme}.md`, { caseSensitiveMatch: false });
  if (readmes.length === 0) return null;

  const target = readmes.find((f) => f.endsWith('/README.md')) ?? readmes[0];
  const raw = await fs.readFile(target, 'utf-8');
  const { data: readmeMeta, content: readmeMarkdown } = matter(raw);
  const html = parseMarkdown(readmeMarkdown, slug, { enableKatex: true, assetType: 'columns' });

  const chapterFiles = await fg(`${columnPath}/*.md`, { caseSensitiveMatch: false });
  const chapters = (
    await Promise.all(
      chapterFiles.map(async (file) => {
        const fileName = file.split('/').pop() ?? '';
        if (fileName.toLowerCase() === 'readme.md') return null;
        const chapterRaw = await fs.readFile(file, 'utf-8');
        const h1 = chapterRaw.match(/^#\s+(.+)$/m);
        const title = h1 ? h1[1].trim() : fileName;
        return { meta: { title }, fileName };
      })
    )
  )
    .filter((c): c is { meta: { title: string }; fileName: string } => c !== null)
    .sort((a, b) => Number.parseInt(a.fileName, 10) - Number.parseInt(b.fileName, 10));

  return { meta: { ...readmeMeta, date: formatDate(readmeMeta.date) }, html, chapters };
}

export async function getChapter(slug: string, chapter: string): Promise<ChapterDetail | null> {
  const chapterPath = `content/columns/${slug}/${chapter}`;
  try {
    const raw = await fs.readFile(chapterPath, 'utf-8');
    const html = parseMarkdown(raw, slug, { enableKatex: true, assetType: 'columns' });
    const h1 = raw.match(/^#\s+(.+)$/m);
    const title = h1 ? h1[1].trim() : chapter;
    return { meta: { title }, html, fileName: chapter };
  } catch {
    return null;
  }
}
