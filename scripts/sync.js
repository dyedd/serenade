import { execFileSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import os from 'os';
import {
  closeInterface,
  createInterface,
  exitIfFailed,
  exitWithError,
  finishCliAction,
  promptRequired,
  question,
} from './prompt-helper.js';
import { columnsDir, postsDir, projectRoot } from './content-helper.js';
import { hasFrontMatterDate, insertTimestamp, normalizeSlug, slugRuleHint } from './front-matter.js';

const SERVER_HOST = process.env.SERVER_HOST;
const SERVER_USER = process.env.SERVER_USER;
const SERVER_PATH = process.env.SERVER_PATH;

const isWindows = os.platform() === 'win32';

const checkConfig = () => {
  const hasConfig = [SERVER_HOST, SERVER_USER, SERVER_PATH].every(Boolean);

  if (!hasConfig) {
    exitWithError('❌ 错误：未配置服务器信息', {
      usage: [
        '请在 .env 文件中配置以下变量：',
        '  SERVER_HOST - 服务器地址',
        '  SERVER_USER - 服务器用户名',
        '  SERVER_PATH - 服务器目标路径',
      ].join('\n'),
    });
  } else {
    if (isWindows) {
      console.log('ℹ️ 检测到 Windows 系统，将使用 scp 命令（不支持增量同步）');
    } else {
      console.log('ℹ️ 检测到 Unix 系统，将使用 rsync 命令（支持增量同步）');
    }
  }
};

const quoteRemotePath = (remotePath) => {
  if (typeof remotePath === 'string') {
    const trimmedPath = remotePath.trim();

    if (trimmedPath.length > 0) {
      const jsonPath = JSON.stringify(trimmedPath);
      const escapedDollar = jsonPath.replace(/\$/g, '\\$');
      const escapedBacktick = escapedDollar.replace(/`/g, '\\`');
      return escapedBacktick;
    } else {
      return null;
    }
  } else {
    return null;
  }
};

const runRemoteCommand = (command) => {
  if (typeof command === 'string') {
    const trimmedCommand = command.trim();

    if (trimmedCommand.length > 0) {
      try {
        execFileSync(
          'ssh',
          [`${SERVER_USER}@${SERVER_HOST}`, trimmedCommand],
          { stdio: 'inherit' }
        );
        return true;
      } catch (error) {
        if (error instanceof Error) {
          console.error('❌ 远程命令执行失败:', error.message);
        } else {
          console.error('❌ 远程命令执行失败: 未知错误');
        }
        return false;
      }
    } else {
      console.error('❌ 错误：远程命令为空');
      return false;
    }
  } else {
    console.error('❌ 错误：远程命令无效');
    return false;
  }
};

const ensureRemoteDirectory = (remoteDir, label) => {
  const quotedPath = quoteRemotePath(remoteDir);

  if (quotedPath) {
    console.log(`🔧 确保远程${label}目录存在...`);
    const created = runRemoteCommand(`mkdir -p ${quotedPath}`);

    if (created) {
      return true;
    } else {
      console.error(`❌ 创建远程${label}目录失败`);
      return false;
    }
  } else {
    console.error('❌ 错误：远程目录路径无效');
    return false;
  }
};

const cleanRemoteDirectoryContents = (remoteDir, label) => {
  const quotedPath = quoteRemotePath(remoteDir);

  if (quotedPath) {
    console.log(`🧹 清空远程${label}目录内容...`);
    const cleaned = runRemoteCommand(`find ${quotedPath} -mindepth 1 -maxdepth 1 -exec rm -rf -- {} +`);

    if (cleaned) {
      return true;
    } else {
      console.error(`❌ 清空远程${label}目录内容失败`);
      return false;
    }
  } else {
    console.error('❌ 错误：远程目录路径无效');
    return false;
  }
};

const prepareRemoteDirectory = (remoteDir, label, shouldCleanContents = false) => {
  if (!ensureRemoteDirectory(remoteDir, label)) {
    return false;
  }

  if (shouldCleanContents) {
    return cleanRemoteDirectoryContents(remoteDir, label);
  }

  return true;
};

const normalizeContentEntryName = (value, label) => {
  if (typeof value !== 'string') {
    console.error(`❌ 错误：${label}URL名称无效`);
    return null;
  }

  const name = value.trim();

  if (name.length === 0) {
    console.error(`❌ 错误：${label}URL名称不能为空`);
    return null;
  }

  if (!normalizeSlug(name)) {
    console.error(`❌ 错误：${label}URL名称${slugRuleHint}`);
    return null;
  }

  return name;
};

const resolveContentEntryDirectory = (type, rawName, label) => {
  const urlName = normalizeContentEntryName(rawName, label);

  if (!urlName) {
    return null;
  }

  const baseDir = path.resolve(projectRoot, 'content', type);
  const entryPath = path.resolve(baseDir, urlName);
  const relativePath = path.relative(baseDir, entryPath);
  const isInsideBase = relativePath && !relativePath.startsWith('..') && !path.isAbsolute(relativePath);

  if (!isInsideBase) {
    console.error(`❌ 错误：${label}路径越界`);
    return null;
  }

  if (!fs.existsSync(entryPath) || !fs.statSync(entryPath).isDirectory()) {
    console.error(`❌ 错误：${label} "${urlName}" 不存在`);
    return null;
  }

  return { urlName, entryPath };
};

// 保留时区偏移，避免 YAML 按 UTC 解析本地时间。
const getCurrentTimestamp = () => {
  const now = new Date();
  const pad = (value) => String(value).padStart(2, '0');
  const offsetMinutes = -now.getTimezoneOffset();
  const sign = offsetMinutes >= 0 ? '+' : '-';
  const offsetHours = pad(Math.floor(Math.abs(offsetMinutes) / 60));
  const offsetRemainder = pad(Math.abs(offsetMinutes) % 60);

  return [
    `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`,
    `T${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`,
    `${sign}${offsetHours}:${offsetRemainder}`,
  ].join('');
};

const collectReadmeFiles = (dir) => {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((item) => item.isDirectory())
    .map((item) => path.join(dir, item.name, 'README.md'))
    .filter((readmePath) => fs.existsSync(readmePath));
};

const updateTimestamps = () => {
  console.log('🔍 检查并添加缺失的时间戳...');
  const timestamp = getCurrentTimestamp();
  const readmeFiles = [
    ...collectReadmeFiles(postsDir),
    ...collectReadmeFiles(columnsDir),
  ];

  let updatedCount = 0;
  const skipped = [];

  for (const readmePath of readmeFiles) {
    const content = fs.readFileSync(readmePath, 'utf8');
    if (hasFrontMatterDate(content)) continue;

    const result = insertTimestamp(content, timestamp);
    const relativePath = path.relative(projectRoot, readmePath);

    if (result.updated) {
      fs.writeFileSync(readmePath, result.content, 'utf8');
      console.log(`  📝 ${relativePath}`);
      updatedCount += 1;
    } else {
      // 缺 front matter 这类文件无法自动补，必须如实报出来而不是算作「已完成」。
      skipped.push(relativePath);
    }
  }

  if (updatedCount > 0) {
    console.log(`✅ 已为 ${updatedCount} 个文件添加时间戳: ${timestamp}`);
  }
  if (skipped.length > 0) {
    console.warn(`⚠️ ${skipped.length} 个文件缺少 front matter，无法自动添加时间戳：`);
    for (const file of skipped) console.warn(`  ${file}`);
  }
  if (updatedCount === 0 && skipped.length === 0) {
    console.log('✅ 所有文件都已有时间戳');
  }

  return true;
};

const ensureReadmeTimestamp = (readmePath) => {
  if (!fs.existsSync(readmePath)) {
    console.log('ℹ️ 未找到 README.md，跳过时间戳');
    return false;
  }

  const content = fs.readFileSync(readmePath, 'utf8');
  if (hasFrontMatterDate(content)) {
    console.log('ℹ️ 已存在时间戳，保持不变');
    return false;
  }

  const timestamp = getCurrentTimestamp();
  const result = insertTimestamp(content, timestamp);

  if (!result.updated) {
    console.warn('⚠️ 未找到 front matter，跳过时间戳');
    return false;
  }

  fs.writeFileSync(readmePath, result.content, 'utf8');
  console.log(`✅ 已添加时间戳: ${timestamp}`);
  return true;
};

const runSyncCommand = ({ windowsArgs, unixArgs, successMessage, errorMessage }) => {
  try {
    if (isWindows) {
      execFileSync('scp', windowsArgs, { stdio: 'inherit' });
    } else {
      execFileSync('rsync', unixArgs, { stdio: 'inherit' });
    }
    console.log(successMessage);
    return true;
  } catch (error) {
    if (error instanceof Error) {
      console.error(errorMessage, error.message);
    } else {
      console.error(errorMessage, '未知错误');
    }
    return false;
  }
};

const syncContent = () => {
  updateTimestamps();
  console.log('');
  const remoteContentDir = `${SERVER_PATH}/content`;
  const isReady = prepareRemoteDirectory(remoteContentDir, '内容');

  if (isReady) {
    console.log('📤 同步内容到服务器...');
    const contentPath = path.join(projectRoot, 'content');
    const target = `${SERVER_USER}@${SERVER_HOST}:${SERVER_PATH}/content/`;

    return runSyncCommand({
      // 数组参数绕过 shell；整目录同步才允许删除远端多余文件。
      windowsArgs: ['-r', `${contentPath}\\*`, target],
      unixArgs: ['-avz', '--delete', `${contentPath}/`, target],
      successMessage: '✅ 内容同步完成',
      errorMessage: '❌ 内容同步失败:',
    });
  } else {
    return false;
  }
};


const syncContentEntry = ({ type, urlName, label }) => {
  const entry = resolveContentEntryDirectory(type, urlName, label);

  if (!entry) {
    return false;
  }

  const readmePath = path.join(entry.entryPath, 'README.md');
  ensureReadmeTimestamp(readmePath);

  const remoteDir = `${SERVER_PATH}/content/${type}/${entry.urlName}`;
  const isReady = prepareRemoteDirectory(remoteDir, label, isWindows);

  if (!isReady) {
    return false;
  }

  console.log('');
  console.log(`📤 同步${label} "${entry.urlName}" 到服务器...`);
  const target = `${SERVER_USER}@${SERVER_HOST}:${remoteDir}/`;

  return runSyncCommand({
    // 单篇同步不删除远端同目录的其他文件。
    windowsArgs: ['-r', entry.entryPath, target],
    unixArgs: ['-avz', `${entry.entryPath}/`, target],
    successMessage: `✅ ${label}同步完成`,
    errorMessage: `❌ ${label}同步失败:`,
  });
};

const syncPost = (urlName) => syncContentEntry({ type: 'posts', urlName, label: '文章' });

const syncJsonFile = (fileName) => {
  const validFiles = ['friends.json', 'projects.json', 'collections.json', 'career.json'];

  if (!validFiles.includes(fileName)) {
    console.error(`❌ 错误：只支持同步 ${validFiles.join(', ')}`);
    return false;
  } else {
    const filePath = path.join(projectRoot, 'content', fileName);

    if (!fs.existsSync(filePath)) {
      console.error(`❌ 错误：文件 "${fileName}" 不存在`);
      return false;
    } else {
      console.log(`📤 同步 ${fileName} 到服务器...`);
      const target = `${SERVER_USER}@${SERVER_HOST}:${SERVER_PATH}/content/${fileName}`;

      return runSyncCommand({
        windowsArgs: [filePath, target],
        unixArgs: ['-avz', filePath, target],
        successMessage: '✅ 文件同步完成',
        errorMessage: '❌ 文件同步失败:',
      });
    }
  }
};

const handleArgsMode = (mode, target) => {
  if (mode === 'content') {
    exitIfFailed(syncContent());
    return true;
  } else if (mode === 'post') {
    if (!target) {
      exitWithError('❌ 错误：请指定文章URL名称', { usage: '用法: pnpm cli sync post <url-name>' });
    } else {
      exitIfFailed(syncPost(target));
    }
    return true;
  } else if (mode === 'json') {
    if (!target) {
      exitWithError('❌ 错误：请指定JSON文件名', { usage: '用法: pnpm cli sync json <friends.json|projects.json|collections.json>' });
    } else {
      exitIfFailed(syncJsonFile(target));
    }
    return true;
  } else {
    return false;
  }
};

const handleInteractiveChoice = async (rl, choice) => {
  if (choice === '1') {
    finishCliAction(rl, syncContent());
  } else if (choice === '2') {
    const urlName = await promptRequired(rl, '👉 请输入文章URL名称: ', '❌ 错误：URL名称不能为空');
    finishCliAction(rl, syncPost(urlName));
  } else if (choice === '3') {
    const fileName = await promptRequired(
      rl,
      '👉 请输入文件名 (friends.json/projects.json/collections.json): ',
      '❌ 错误：文件名不能为空'
    );
    finishCliAction(rl, syncJsonFile(fileName));
  } else {
    exitWithError('❌ 无效的选项', { rl });
  }
};

export async function syncContentCommand(args = []) {
  checkConfig();

  const mode = args[0];
  const target = args[1];
  const handled = handleArgsMode(mode, target);

  if (handled) {
    return;
  } else {
    const rl = createInterface();

    try {
      console.log('请选择同步模式：');
      console.log('1. 同步内容 (content)');
      console.log('2. 同步指定文章 (post)');
      console.log('3. 同步JSON文件 (json)')
      console.log('');

      const choice = await question(rl, '👉 请输入选项 (1-3): ');
      await handleInteractiveChoice(rl, choice);
    } catch (error) {
      if (error instanceof Error) {
        console.error('❌ 发生错误:', error.message);
      } else {
        console.error('❌ 发生错误: 未知错误');
      }
      closeInterface(rl);
      process.exit(1);
    }
  }
}
