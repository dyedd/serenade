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

const validateUrl = (url, directory) => {
  const safeCheck = isSafeUrl(url);
  if (!safeCheck.valid) {
    console.error(`❌ 错误：${safeCheck.reason}`);
    return null;
  }
  if (fs.existsSync(path.join(directory, url))) {
    console.error('❌ 错误：URL路径已存在');
    return null;
  }
  return url;
};

const promptForValidUrl = async (rl, directory) =>
  validateUrl(await question(rl, '👉 请手动输入URL路径: '), directory);

const resolveContentUrl = async (rl, title, directory, preset = '', allowAI = true) => {
  if (preset) return validateUrl(preset, directory);

  const customUrl = await question(rl, '👉 请输入自定义URL路径（直接回车跳过）: ');
  if (customUrl) return validateUrl(customUrl, directory);

  const useAI = allowAI && await confirmQuestion(rl, '🤖 是否使用AI生成URL路径？');
  if (!useAI) return promptForValidUrl(rl, directory);

  console.log('🤖 正在使用AI生成URL路径...');
  const { generateUrlWithAI } = await import('./ai-helper.js');
  const suggestion = await generateUrlWithAI(title);
  if (!suggestion) {
    console.log('ℹ️ AI生成失败');
    return promptForValidUrl(rl, directory);
  }

  console.log(`ℹ️ AI建议的URL: ${suggestion}`);
  const accepted = await confirmQuestion(rl, '是否使用此建议？');
  if (!accepted) return promptForValidUrl(rl, directory);
  return validateUrl(suggestion, directory) ?? promptForValidUrl(rl, directory);
};

const maybeGenerateCover = async (rl, title, targetDir, skip = false) => {
  if (skip || !process.env.IMAGE_API_KEY) {
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
  resolveContentUrl,
  maybeGenerateCover,
};
