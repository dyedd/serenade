import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  confirmQuestion,
  isSafeUrl,
  question,
} from './prompt-helper.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.join(__dirname, '..');
const postsDir = path.join(projectRoot, 'content', 'posts');
const columnsDir = path.join(projectRoot, 'content', 'columns');

const toSafeFilename = (rawName) => String(rawName ?? '').replace(/[^a-zA-Z0-9_-]/g, '-');

const isExistingDirectory = (directory, name) => fs.existsSync(path.join(directory, name));

const isExistingMarkdownFile = (directory, filename) =>
  fs.existsSync(path.join(directory, `${filename}.md`));

const validateUrl = (url, directory, existsMessage) => {
  const safeCheck = isSafeUrl(url);

  if (!safeCheck.valid) {
    return { valid: false, message: `❌ 错误：${safeCheck.reason}` };
  }

  if (isExistingDirectory(directory, url)) {
    return { valid: false, message: existsMessage };
  }

  return { valid: true };
};

const validateFilename = (directory, filename, existsMessage) => {
  if (!filename) {
    return { valid: false, message: '❌ 错误：文件名不能为空' };
  }

  if (isExistingMarkdownFile(directory, filename)) {
    return { valid: false, message: existsMessage };
  }

  return { valid: true };
};

const promptForValidUrl = async (rl, directory, existsMessage = '❌ URL路径已存在') => {
  const manualUrl = await question(rl, '👉 请手动输入URL路径: ');
  const result = validateUrl(manualUrl, directory, existsMessage);

  if (!result.valid) {
    console.error(result.message);
    return null;
  }

  return manualUrl;
};

const promptForValidFilename = async (rl, directory, existsMessage = '❌ 文件已存在') => {
  const manualFilename = await question(rl, '👉 请手动输入文件名: ');
  const safeFilename = toSafeFilename(manualFilename);
  const result = validateFilename(directory, safeFilename, existsMessage);

  if (!result.valid) {
    console.error(result.message);
    return null;
  }

  return safeFilename;
};

const fallbackToManual = async ({ rl, directory, kind, existsMessage }) => {
  if (kind === 'filename') {
    return promptForValidFilename(rl, directory, existsMessage);
  }

  return promptForValidUrl(rl, directory, existsMessage);
};

const resolveGeneratedValue = async ({
  rl,
  title,
  directory,
  kind = 'url',
  prompt,
  confirmPrompt,
  generateMessage,
  suggestionLabel,
  conflictLabel,
  existsMessage,
}) => {
  const customValue = await question(rl, prompt);

  if (customValue) {
    const value = kind === 'filename' ? toSafeFilename(customValue) : customValue;
    const result =
      kind === 'filename'
        ? validateFilename(directory, value, existsMessage)
        : validateUrl(value, directory, existsMessage);

    if (!result.valid) {
      console.error(result.message);
      return null;
    }

    console.log(`✅ 使用自定义${suggestionLabel}: ${kind === 'filename' ? `${value}.md` : value}`);
    return value;
  }

  const useAI = await confirmQuestion(rl, confirmPrompt);

  if (!useAI) {
    return fallbackToManual({ rl, directory, kind, existsMessage });
  }

  console.log(generateMessage);
  const { generateUrlWithAI } = await import('./ai-helper.js');
  const aiValue = await generateUrlWithAI(title);

  if (!aiValue) {
    console.log('ℹ️ AI生成失败');
    return fallbackToManual({ rl, directory, kind, existsMessage });
  }

  const value = kind === 'filename' ? toSafeFilename(aiValue) : aiValue;
  console.log(`ℹ️ AI建议的${suggestionLabel}: ${kind === 'filename' ? `${value}.md` : value}`);
  const acceptAI = await confirmQuestion(rl, '是否使用此建议？');

  if (!acceptAI) {
    return fallbackToManual({ rl, directory, kind, existsMessage });
  }

  const result =
    kind === 'filename'
      ? validateFilename(directory, value, existsMessage)
      : validateUrl(value, directory, existsMessage);

  if (!result.valid) {
    console.log(result.message);
    return fallbackToManual({ rl, directory, kind, existsMessage });
  }

  return value;
};

const resolveContentUrl = (rl, title, directory) =>
  resolveGeneratedValue({
    rl,
    title,
    directory,
    kind: 'url',
    prompt: '👉 请输入自定义URL路径（直接回车跳过）: ',
    confirmPrompt: '🤖 是否使用AI生成URL路径？',
    generateMessage: '🤖 正在使用AI生成URL路径...',
    suggestionLabel: 'URL',
    conflictLabel: 'URL路径',
    existsMessage: '❌ 错误：URL路径已存在',
  });

const resolveChapterFilename = (rl, columnPath, title) =>
  resolveGeneratedValue({
    rl,
    title,
    directory: columnPath,
    kind: 'filename',
    prompt: '👉 请输入文件名（不含.md，直接回车跳过）: ',
    confirmPrompt: '🤖 是否使用AI生成文件名？',
    generateMessage: '🤖 正在使用AI生成文件名...',
    suggestionLabel: '文件名',
    conflictLabel: '文件',
    existsMessage: '❌ 错误：文件已存在',
  });

const getExistingColumns = () => {
  if (!fs.existsSync(columnsDir)) {
    return [];
  }

  return fs
    .readdirSync(columnsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);
};

const getReadmeTitle = (readmePath, fallback) => {
  if (!fs.existsSync(readmePath)) {
    return fallback;
  }

  const content = fs.readFileSync(readmePath, 'utf8');
  const titleMatch = content.match(/^title:\s*(.+)$/m);

  return titleMatch ? titleMatch[1] : fallback;
};

const selectColumn = async (rl, emptyMessage = '❌ 错误：没有找到任何专栏') => {
  const columns = getExistingColumns();

  if (columns.length === 0) {
    console.error(emptyMessage);
    return null;
  }

  console.log('\n📚 可用的专栏：');
  columns.forEach((column, index) => {
    const readmePath = path.join(columnsDir, column, 'README.md');
    const title = getReadmeTitle(readmePath, column);
    console.log(`  ${index + 1}. ${title} (${column})`);
  });

  const answer = await question(rl, '\n👉 请选择专栏（输入序号或专栏路径）: ');

  if (!answer) {
    return null;
  }

  const index = parseInt(answer, 10) - 1;

  if (!Number.isNaN(index) && index >= 0 && index < columns.length) {
    return columns[index];
  }

  if (columns.includes(answer)) {
    return answer;
  }

  console.error('❌ 错误：无效的选择');
  return null;
};

const maybeGenerateCover = async (rl, title, targetDir) => {
  if (!process.env.IMAGE_API_KEY) {
    return false;
  }

  console.log('');
  const shouldGenerate = await confirmQuestion(rl, '🎨 是否生成AI配图？');

  if (!shouldGenerate) {
    return false;
  }

  console.log('🎨 正在生成配图...');
  const imagePath = path.join(targetDir, 'cover.png');
  const { generateImageWithAI } = await import('./ai-helper.js');
  const result = await generateImageWithAI(title, imagePath);

  if (result) {
    console.log(`✅ 配图已生成: ${imagePath}`);
    return true;
  }

  console.log('ℹ️ 配图生成失败，请手动添加');
  return false;
};

export {
  projectRoot,
  postsDir,
  columnsDir,
  toSafeFilename,
  isExistingDirectory,
  isExistingMarkdownFile,
  resolveContentUrl,
  resolveChapterFilename,
  getExistingColumns,
  getReadmeTitle,
  selectColumn,
  maybeGenerateCover,
};
