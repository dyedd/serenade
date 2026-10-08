import fg from 'fast-glob';
import fs from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';
import { paginate, toPosixPath, type Paginated } from './posts';
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

// fast-glob 在 Windows 上返回反斜杠路径，split('/') 会拿到整条路径。
function baseName(file: string): string {
  return path.basename(toPosixPath(file));
}

function isReadmeFile(file: string): boolean {
  return baseName(file).toLowerCase() === 'readme.md';
}

// 章节排序：文件名（001.md、002.md …）决定顺序，README 不是章节。
// 非数字前缀的章节文件 parseInt 得 NaN，退回按文件名比较以保证顺序稳定。
function compareChapterFiles(a: string, b: string): number {
  const na = Number.parseInt(baseName(a), 10);
  const nb = Number.parseInt(baseName(b), 10);
  if (Number.isFinite(na) && Number.isFinite(nb) && na !== nb) return na - nb;
  if (Number.isFinite(na) && !Number.isFinite(nb)) return -1;
  if (!Number.isFinite(na) && Number.isFinite(nb)) return 1;
  return baseName(a).localeCompare(baseName(b), 'zh-CN');
}

async function loadColumnFiles(slug: string): Promise<string[]> {
  return fg(`content/columns/${slug}/*.md`, { caseSensitiveMatch: false });
}

async function readChapterList(slug: string): Promise<string[]> {
  const files = await loadColumnFiles(slug);
  return files
    .filter((file) => !isReadmeFile(file))
    .sort(compareChapterFiles);
}

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
      const chapterFiles = await readChapterList(slug);
      return {
        path: slug,
        title: meta.title ?? slug,
        date: formatDate(meta.date),
        image: meta.image ? `/assets/columns/${slug}/${String(meta.image).replace(/^\.\//, '')}` : null,
        description: meta.description ?? '',
        type: meta.type ?? '',
        chapterCount: chapterFiles.length,
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

  const target = readmes.find((f) => toPosixPath(f).endsWith('/README.md')) ?? readmes[0];
  const raw = await fs.readFile(target, 'utf-8');
  const { data: readmeMeta, content: readmeMarkdown } = matter(raw);
  const html = parseMarkdown(readmeMarkdown, slug, { enableKatex: true, assetType: 'columns' });

  const chapterFiles = await readChapterList(slug);
  const chapters = (
    await Promise.all(
      chapterFiles.map(async (file) => {
        const fileName = baseName(file);
        const chapterRaw = await fs.readFile(file, 'utf-8');
        const { content: chapterBody } = matter(chapterRaw);
        const h1 = chapterBody.match(/^#\s+(.+)$/m);
        return { meta: { title: h1 ? h1[1].trim() : fileName }, fileName };
      })
    )
  );

  return { meta: { ...readmeMeta, date: formatDate(readmeMeta.date) }, html, chapters };
}

export async function getChapter(slug: string, chapter: string): Promise<ChapterDetail | null> {
  const chapterPath = `content/columns/${slug}/${chapter}`;
  // 章节名来自 URL：只接受同目录下的普通文件名，避免 ../ 读到 content/ 以外。
  if (chapter !== path.basename(chapter) || chapter.includes('\\')) return null;
  if (!chapter.toLowerCase().endsWith('.md')) return null;

  const files = await loadColumnFiles(slug);
  const match = files.find((file) => baseName(file).toLowerCase() === chapter.toLowerCase());
  if (!match) return null;

  try {
    const raw = await fs.readFile(match, 'utf-8');
    const { content } = matter(raw);
    const html = parseMarkdown(content, slug, { enableKatex: true, assetType: 'columns' });
    const h1 = content.match(/^#\s+(.+)$/m);
    return { meta: { title: h1 ? h1[1].trim() : chapter }, html, fileName: chapter };
  } catch (error) {
    // 只把「文件读不到」当 404，其他错误（权限、IO）要暴露出来。
    if ((error as NodeJS.ErrnoException)?.code === 'ENOENT') return null;
    throw new Error(`${chapterPath}: 章节读取失败`, { cause: error });
  }
}
