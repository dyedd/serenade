import fs from 'node:fs/promises';
import path from 'node:path';
import { asOptionalString, asRecord, asString, asStringArray, parseJson } from './validation';

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
  return parseJson(fileContent, PROJECTS_FILE, (value, filePath) => {
    const root = asRecord(value, filePath, '项目数据');
    const categories = asRecord(root.categories, filePath, '项目 categories');
    return {
      categories: Object.fromEntries(Object.entries(categories).map(([key, rawCategory]) => {
        const category = asRecord(rawCategory, filePath, `项目分类 ${key}`);
        const rawProjects = category.projects;
        if (!Array.isArray(rawProjects)) throw new Error(`${filePath}: 项目分类 ${key}.projects 必须是数组`);
        const projects = rawProjects.map((rawProject, index) => {
          const project = asRecord(rawProject, filePath, `项目分类 ${key}.projects[${index}]`);
          const entry = {
            ...project,
            name: asString(project.name, filePath, `项目分类 ${key}.projects[${index}].name`),
            description: asOptionalString(project.description, filePath, `项目分类 ${key}.projects[${index}].description`),
            url: asOptionalString(project.url, filePath, `项目分类 ${key}.projects[${index}].url`),
            github: asOptionalString(project.github, filePath, `项目分类 ${key}.projects[${index}].github`),
            link: asOptionalString(project.link, filePath, `项目分类 ${key}.projects[${index}].link`),
            cover: asOptionalString(project.cover, filePath, `项目分类 ${key}.projects[${index}].cover`),
            tags: project.tags === undefined ? undefined : asStringArray(project.tags, filePath, `项目分类 ${key}.projects[${index}].tags`),
            techStack: project.techStack === undefined ? undefined : asStringArray(project.techStack, filePath, `项目分类 ${key}.projects[${index}].techStack`),
            date: asString(project.date, filePath, `项目分类 ${key}.projects[${index}].date`),
          } satisfies ProjectEntry;
          if (Number.isNaN(new Date(entry.date).getTime())) {
            throw new Error(`${filePath}: 项目分类 ${key}.projects[${index}].date 无效`);
          }
          return entry;
        });
        return [key, {
          name: asString(category.name, filePath, `项目分类 ${key}.name`),
          icon: asString(category.icon, filePath, `项目分类 ${key}.icon`, true),
          projects,
        } satisfies ProjectCategory];
      })),
    };
  });
}

// 首页「随便看看」用的两个项目。按日期轮换而不是 Math.random()：随机值在 SSR
// 与客户端水合时会给出不同结果，React 会报水合不一致。
export async function listRandomProjects(now = new Date()) {
  const data = await readProjects();
  const projects = Object.entries(data.categories)
    .flatMap(([categoryKey, cat]) =>
      cat.projects.map((p) => ({ ...p, categoryKey, categoryName: cat.name }))
    );
  if (projects.length === 0) return [];

  const start = Math.floor(now.getTime() / 86_400_000) % projects.length;
  return Array.from(
    { length: Math.min(2, projects.length) },
    (_, offset) => projects[(start + offset) % projects.length]
  );
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
  pageSize: number;
  category?: string;
}) {
  const page = options.page ?? 1;
  const pageSize = Math.max(1, Math.floor(options.pageSize));
  const data = await readProjects();

  if (!options.category) {
    const all: Array<ProjectEntry & { categoryKey: string; categoryName: string }> = Object.entries(
      data.categories
    ).flatMap(([catKey, catData]) =>
      catData.projects.map((p) => ({ ...p, categoryKey: catKey, categoryName: catData.name }))
    );
    // 日期相同时用名称兜底，保证分页顺序稳定。
    all.sort(
      (a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime() ||
        a.name.localeCompare(b.name, 'zh-CN')
    );
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
