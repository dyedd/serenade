// Projects: read content/projects.json, paginate by category or "all".
import fs from 'node:fs/promises';
import path from 'node:path';

export interface ProjectEntry {
  name: string;
  description?: string;
  url?: string;
  github?: string;
  link?: string;
  cover?: string;
  tags?: string[];
  techStack?: string[];
  date: string;
  [key: string]: unknown;
}

export interface ProjectCategory {
  name: string;
  icon: string;
  projects: ProjectEntry[];
}

export type ProjectsData = { categories: Record<string, ProjectCategory> };

const PROJECTS_FILE = path.join(process.cwd(), 'content', 'projects.json');

async function readProjects(): Promise<ProjectsData> {
  const fileContent = await fs.readFile(PROJECTS_FILE, 'utf-8');
  try {
    return JSON.parse(fileContent) as ProjectsData;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error('项目数据解析失败');
    }
    throw error;
  }
}

export async function listProjectCategories() {
  const data = await readProjects();
  return Object.entries(data.categories).map(([key, cat]) => ({
    key,
    name: cat.name,
    icon: cat.icon,
    count: cat.projects.length,
  }));
}

export async function listProjects(options: {
  page?: number;
  pageSize?: number;
  category?: string;
} = {}) {
  const page = options.page ?? 1;
  const pageSize = options.pageSize ?? (options.category ? 10 : 6);
  const data = await readProjects();

  if (!options.category) {
    const all: Array<ProjectEntry & { categoryKey: string; categoryName: string }> = Object.entries(
      data.categories
    ).flatMap(([catKey, catData]) =>
      catData.projects.map((p) => ({ ...p, categoryKey: catKey, categoryName: catData.name }))
    );
    all.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return {
      category: 'all',
      total: all.length,
      page,
      pageSize,
      totalPages: Math.ceil(all.length / pageSize) || 0,
      hasMore: end < all.length,
      data: { name: '全部', categories: data.categories, projects: all.slice(start, end) },
    };
  }

  const categoryData = data.categories[options.category];
  if (!categoryData) {
    throw new Error(`未找到分类: ${options.category}`);
  }
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  return {
    category: options.category,
    total: categoryData.projects.length,
    page,
    pageSize,
    totalPages: Math.ceil(categoryData.projects.length / pageSize) || 0,
    hasMore: end < categoryData.projects.length,
    data: { ...categoryData, projects: categoryData.projects.slice(start, end) },
  };
}
