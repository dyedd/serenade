export function parseJson<T>(raw: string, filePath: string, parse: (value: unknown, filePath: string) => T): T {
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch (error) {
    const message = error instanceof Error ? error.message : '未知错误';
    throw new Error(`${filePath}: JSON 解析失败: ${message}`);
  }
  return parse(value, filePath);
}

export function asRecord(value: unknown, filePath: string, label: string): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`${filePath}: ${label}必须是对象`);
  }
  return value as Record<string, unknown>;
}

export function asString(value: unknown, filePath: string, label: string, allowEmpty = false): string {
  if (typeof value !== 'string' || (!allowEmpty && value.trim().length === 0)) {
    throw new Error(`${filePath}: ${label}必须是非空字符串`);
  }
  return value;
}

export function asOptionalString(value: unknown, filePath: string, label: string): string | undefined {
  if (value === undefined || value === null) return undefined;
  return asString(value, filePath, label, true);
}

export function asStringArray(value: unknown, filePath: string, label: string): string[] {
  if (!Array.isArray(value) || value.some((item) => typeof item !== 'string')) {
    throw new Error(`${filePath}: ${label}必须是字符串数组`);
  }
  return value;
}

export function asUrl(value: unknown, filePath: string, label: string, allowEmpty = false): string {
  const text = asString(value, filePath, label, allowEmpty);
  if (text.length === 0 && allowEmpty) return text;
  try {
    const url = new URL(text);
    if (!['http:', 'https:'].includes(url.protocol)) throw new Error('协议不支持');
  } catch {
    throw new Error(`${filePath}: ${label}必须是有效的 HTTP(S) URL`);
  }
  return text;
}

export interface PostFrontMatter {
  title: string;
  date: string | Date | null | undefined;
  tags: string[];
  cover: string;
  abstract: string;
}

export function parsePostFrontMatter(
  value: Record<string, unknown>,
  filePath: string,
  fallbackTitle?: string,
): PostFrontMatter {
  const title = value.title === undefined && fallbackTitle
    ? fallbackTitle
    : asString(value.title, filePath, 'title');
  const rawTags = value.tags === undefined ? [] : value.tags;
  const tags = typeof rawTags === 'string' ? [rawTags] : asStringArray(rawTags, filePath, 'tags');
  const date = value.date;
  if (date !== undefined && date !== null && typeof date !== 'string' && !(date instanceof Date)) {
    throw new Error(`${filePath}: date 必须是字符串或日期`);
  }
  return {
    title,
    date,
    tags,
    cover: asOptionalString(value.cover, filePath, 'cover') ?? '',
    abstract: asOptionalString(value.abstract, filePath, 'abstract') ?? '',
  };
}
