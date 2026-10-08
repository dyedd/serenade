const SLUG_RE = /^[A-Za-z0-9._-]+$/;

const isDotPath = (name) => name === '.' || name === '..';

// YAML 标量必须转义，否则标题里的冒号、引号或换行会破坏 front matter。
const quoteYamlString = (value) => JSON.stringify(String(value ?? ''));

const normalizeSlug = (value) => {
  if (typeof value !== 'string') return null;
  const name = value.trim();
  if (name.length === 0) return null;
  if (name.includes('..') || name.includes('/') || name.includes('\\')) return null;
  if (isDotPath(name)) return null;
  // 以短横线开头的名字几乎总是「开关被当成了值」（例如 --slug --no-ai）。
  if (name.startsWith('-')) return null;
  if (!SLUG_RE.test(name)) return null;
  return name;
};

const slugRuleHint = '只能包含字母、数字、点号、短横线或下划线，且不能以短横线开头或为 . / ..';

const FRONT_MATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n|$)/;

const splitFrontMatter = (content) => {
  const match = FRONT_MATTER_RE.exec(content);
  if (!match) return null;
  return {
    block: match[0],
    body: match[1],
    rest: content.slice(match[0].length),
  };
};

const hasFrontMatterDate = (content) => {
  const parts = splitFrontMatter(content);
  return parts ? /^date:[ \t]*\S/m.test(parts.body) : false;
};

const insertTimestamp = (content, timestamp) => {
  const parts = splitFrontMatter(content);
  if (!parts) return { updated: false, content, reason: 'missing-front-matter' };
  if (/^date:[ \t]*\S/m.test(parts.body)) return { updated: false, content, reason: 'already-has-date' };

  const titleLine = /^title:.*$/m;
  let updatedBody;
  if (titleLine.test(parts.body)) {
    updatedBody = parts.body.replace(titleLine, (line) => `${line}\ndate: ${timestamp}`);
  } else {
    updatedBody = `${parts.body}\ndate: ${timestamp}`;
  }

  const block = `---\n${updatedBody}\n---`;
  return { updated: true, content: `${block}${parts.rest}`, reason: null };
};

export {
  insertTimestamp,
  hasFrontMatterDate,
  normalizeSlug,
  quoteYamlString,
  slugRuleHint,
  splitFrontMatter,
};
