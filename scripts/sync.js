import { execSync, execFileSync } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { createInterface, question } from './prompt-helper.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SERVER_HOST = process.env.SERVER_HOST;
const SERVER_USER = process.env.SERVER_USER;
const SERVER_PATH = process.env.SERVER_PATH;

const projectRoot = path.join(__dirname, '..');
const args = process.argv.slice(2);
const isWindows = os.platform() === 'win32';

const checkConfig = () => {
  const hasConfig = [SERVER_HOST, SERVER_USER, SERVER_PATH].every(Boolean);

  if (!hasConfig) {
    console.error('? 错误：未配置服务器信息');
    console.log('请在 .env 文件中配置以下变量：');
    console.log('  SERVER_HOST - 服务器地址');
    console.log('  SERVER_USER - 服务器用户名');
    console.log('  SERVER_PATH - 服务器目标路径');
    process.exit(1);
  } else {
    if (isWindows) {
      console.log('?? 检测到 Windows 系统，将使用 scp 命令（不支持增量同步）');
    } else {
      console.log('?? 检测到 Unix 系统，将使用 rsync 命令（支持增量同步）');
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
          console.error('? 远程命令执行失败:', error.message);
        } else {
          console.error('? 远程命令执行失败: 未知错误');
        }
        return false;
      }
    } else {
      console.error('? 错误：远程命令为空');
      return false;
    }
  } else {
    console.error('? 错误：远程命令无效');
    return false;
  }
};

const cleanRemoteDirectory = (remoteDir, label) => {
  const quotedPath = quoteRemotePath(remoteDir);

  if (quotedPath) {
    console.log(`?? 清理远程${label}目录...`);
    const removed = runRemoteCommand(`rm -rf ${quotedPath}`);

    if (removed) {
      const created = runRemoteCommand(`mkdir -p ${quotedPath}`);

      if (created) {
        console.log(`? 远程${label}目录已清理`);
        return true;
      } else {
        console.error(`? 创建远程${label}目录失败`);
        return false;
      }
    } else {
      console.error(`? 清理远程${label}目录失败`);
      return false;
    }
  } else {
    console.error('? 错误：远程目录路径无效');
    return false;
  }
};

const getExistingColumns = () => {
  const columnsDir = path.join(projectRoot, 'content', 'columns');

  if (!fs.existsSync(columnsDir)) {
    return [];
  } else {
    return fs
      .readdirSync(columnsDir)
      .filter((name) => {
        const fullPath = path.join(columnsDir, name);
        return fs.statSync(fullPath).isDirectory();
      });
  }
};

const selectColumn = async (rl) => {
  const columns = getExistingColumns();

  if (columns.length === 0) {
    console.error('? 错误：没有找到任何专栏');
    return null;
  } else {
    console.log('\n?? 可用的专栏：');
    columns.forEach((col, index) => {
      const readmePath = path.join(projectRoot, 'content', 'columns', col, 'README.md');
      let title = col;

      if (fs.existsSync(readmePath)) {
        const content = fs.readFileSync(readmePath, 'utf8');
        const titleMatch = content.match(/^title:\s*(.+)$/m);

        if (titleMatch) {
          title = titleMatch[1];
        } else {
          title = col;
        }
      } else {
        title = col;
      }

      console.log(`  ${index + 1}. ${title} (${col})`);
    });

    const answer = await question(rl, '\n?? 请选择专栏（输入序号或专栏路径）: ');

    if (!answer) {
      return null;
    } else {
      const index = parseInt(answer, 10) - 1;

      if (!Number.isNaN(index) && index >= 0 && index < columns.length) {
        return columns[index];
      } else if (columns.includes(answer)) {
        return answer;
      } else {
        console.error('? 错误：无效的选择');
        return null;
      }
    }
  }
};

const getCurrentTimestamp = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

const insertTimestamp = (content, timestamp) => {
  const updatedContent = content.replace(
    /^(---\s*\ntitle:[^\n]+\s*\n)/m,
    `$1date: ${timestamp}\n`
  );

  if (content !== updatedContent) {
    return { updated: true, content: updatedContent };
  } else {
    return { updated: false, content };
  }
};

const updateReadmeFiles = (dir, timestamp) => {
  if (!fs.existsSync(dir)) {
    return 0;
  } else {
    const items = fs.readdirSync(dir, { withFileTypes: true });

    return items.reduce((count, item) => {
      if (item.isDirectory()) {
        const readmePath = path.join(dir, item.name, 'README.md');

        if (fs.existsSync(readmePath)) {
          const content = fs.readFileSync(readmePath, 'utf8');
          const hasDate = /^date:\s*.+$/m.test(content);

          if (!hasDate) {
            const result = insertTimestamp(content, timestamp);

            if (result.updated) {
              fs.writeFileSync(readmePath, result.content, 'utf8');
              const relativePath = path.relative(projectRoot, readmePath);
              console.log(`  ?? ${relativePath}`);
              return count + 1;
            } else {
              return count;
            }
          } else {
            return count;
          }
        } else {
          return count;
        }
      } else {
        return count;
      }
    }, 0);
  }
};

const updateTimestamps = () => {
  console.log('?? 检查并添加缺失的时间戳...');
  const timestamp = getCurrentTimestamp();

  const postsDir = path.join(projectRoot, 'content', 'posts');
  const columnsDir = path.join(projectRoot, 'content', 'columns');

  const updatedPosts = updateReadmeFiles(postsDir, timestamp);
  const updatedColumns = updateReadmeFiles(columnsDir, timestamp);
  const updatedCount = updatedPosts + updatedColumns;

  if (updatedCount > 0) {
    console.log(`? 已为 ${updatedCount} 个文件添加时间戳: ${timestamp}`);
  } else {
    console.log('? 所有文件都已有时间戳');
  }

  return true;
};

const ensureReadmeTimestamp = (readmePath) => {
  if (!fs.existsSync(readmePath)) {
    console.log('?? 未找到 README.md，跳过时间戳');
    return false;
  } else {
    const content = fs.readFileSync(readmePath, 'utf8');
    const hasDate = /^date:\s*.+$/m.test(content);

    if (hasDate) {
      console.log('?? 已存在时间戳，保持不变');
      return false;
    } else {
      const timestamp = getCurrentTimestamp();
      const result = insertTimestamp(content, timestamp);

      if (result.updated) {
        fs.writeFileSync(readmePath, result.content, 'utf8');
        console.log(`? 已添加时间戳: ${timestamp}`);
        return true;
      } else {
        console.log('?? 未找到可插入的位置，跳过时间戳');
        return false;
      }
    }
  }
};

const runSyncCommand = ({ windowsCommand, unixCommand, successMessage, errorMessage }) => {
  try {
    if (isWindows) {
      execSync(windowsCommand, { stdio: 'inherit', shell: true });
    } else {
      execSync(unixCommand, { stdio: 'inherit' });
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
  const isCleaned = cleanRemoteDirectory(remoteContentDir, '内容');

  if (isCleaned) {
    console.log('?? 同步内容到服务器...');
    const contentPath = path.join(projectRoot, 'content');
    const target = `${SERVER_USER}@${SERVER_HOST}:${SERVER_PATH}/content/`;

    return runSyncCommand({
      windowsCommand: `scp -r "${contentPath}/*" "${target}"`,
      unixCommand: `rsync -avz --delete "${contentPath}/" "${target}"`,
      successMessage: '? 内容同步完成',
      errorMessage: '? 内容同步失败:',
    });
  } else {
    return false;
  }
};

const syncContentWithoutUpdate = () => {
  const remoteContentDir = `${SERVER_PATH}/content`;
  const isCleaned = cleanRemoteDirectory(remoteContentDir, '内容');

  if (isCleaned) {
    console.log('?? 同步内容到服务器...');
    const contentPath = path.join(projectRoot, 'content');
    const target = `${SERVER_USER}@${SERVER_HOST}:${SERVER_PATH}/content/`;

    return runSyncCommand({
      windowsCommand: `scp -r "${contentPath}/*" "${target}"`,
      unixCommand: `rsync -avz --delete "${contentPath}/" "${target}"`,
      successMessage: '? 内容同步完成',
      errorMessage: '? 内容同步失败:',
    });
  } else {
    return false;
  }
};

const syncOutput = () => {
  const remoteOutputDir = `${SERVER_PATH}/.output`;
  const isCleaned = cleanRemoteDirectory(remoteOutputDir, '构建产物');

  if (isCleaned) {
    console.log('?? 同步构建产物到服务器...');
    const outputPath = path.join(projectRoot, '.output');
    const target = `${SERVER_USER}@${SERVER_HOST}:${SERVER_PATH}/.output/`;

    return runSyncCommand({
      windowsCommand: `scp -r "${outputPath}/*" "${target}"`,
      unixCommand: `rsync -avz --delete "${outputPath}/" "${target}"`,
      successMessage: '? 构建产物同步完成',
      errorMessage: '? 构建产物同步失败:',
    });
  } else {
    return false;
  }
};

const syncAll = () => {
  console.log('?? 同步全部内容到服务器...');
  console.log('');
  updateTimestamps();
  console.log('');

  const contentSuccess = syncContentWithoutUpdate();
  const outputSuccess = syncOutput();
  const success = contentSuccess && outputSuccess;

  if (success) {
    console.log('');
    console.log('? 全部同步完成！');
  } else {
    console.log('');
    console.log('?? 部分同步失败，请检查错误信息');
  }

  return success;
};

const syncPost = (urlName) => {
  const postPath = path.join(projectRoot, 'content', 'posts', urlName);
  const postExists = fs.existsSync(postPath);

  if (postExists) {
    const readmePath = path.join(postPath, 'README.md');
    ensureReadmeTimestamp(readmePath);

    const remotePostDir = `${SERVER_PATH}/content/posts/${urlName}`;
    const isCleaned = cleanRemoteDirectory(remotePostDir, '文章');

    if (isCleaned) {
      console.log('');
      console.log(`?? 同步文章 "${urlName}" 到服务器...`);
      const target = `${SERVER_USER}@${SERVER_HOST}:${SERVER_PATH}/content/posts/${urlName}/`;

      return runSyncCommand({
        windowsCommand: `scp -r "${postPath}" "${SERVER_USER}@${SERVER_HOST}:${SERVER_PATH}/content/posts/"`,
        unixCommand: `rsync -avz --delete "${postPath}/" "${target}"`,
        successMessage: '? 文章同步完成',
        errorMessage: '? 文章同步失败:',
      });
    } else {
      return false;
    }
  } else {
    console.error(`? 错误：文章 "${urlName}" 不存在`);
    return false;
  }
};

const syncColumn = (urlName) => {
  const columnPath = path.join(projectRoot, 'content', 'columns', urlName);
  const columnExists = fs.existsSync(columnPath);

  if (columnExists) {
    const readmePath = path.join(columnPath, 'README.md');
    ensureReadmeTimestamp(readmePath);

    const remoteColumnDir = `${SERVER_PATH}/content/columns/${urlName}`;
    const isCleaned = cleanRemoteDirectory(remoteColumnDir, '专栏');

    if (isCleaned) {
      console.log(`?? 同步专栏 "${urlName}" 到服务器...`);
      const target = `${SERVER_USER}@${SERVER_HOST}:${SERVER_PATH}/content/columns/${urlName}/`;

      return runSyncCommand({
        windowsCommand: `scp -r "${columnPath}" "${SERVER_USER}@${SERVER_HOST}:${SERVER_PATH}/content/columns/"`,
        unixCommand: `rsync -avz --delete "${columnPath}/" "${target}"`,
        successMessage: '? 专栏同步完成',
        errorMessage: '? 专栏同步失败:',
      });
    } else {
      return false;
    }
  } else {
    console.error(`? 错误：专栏 "${urlName}" 不存在`);
    return false;
  }
};

const syncJsonFile = (fileName) => {
  const validFiles = ['friends.json', 'projects.json'];

  if (!validFiles.includes(fileName)) {
    console.error(`? 错误：只支持同步 ${validFiles.join(', ')}`);
    return false;
  } else {
    const filePath = path.join(projectRoot, 'content', fileName);

    if (!fs.existsSync(filePath)) {
      console.error(`? 错误：文件 "${fileName}" 不存在`);
      return false;
    } else {
      console.log(`?? 同步 ${fileName} 到服务器...`);
      const target = `${SERVER_USER}@${SERVER_HOST}:${SERVER_PATH}/content/${fileName}`;

      return runSyncCommand({
        windowsCommand: `scp "${filePath}" "${target}"`,
        unixCommand: `rsync -avz "${filePath}" "${target}"`,
        successMessage: '? 文件同步完成',
        errorMessage: '? 文件同步失败:',
      });
    }
  }
};

const handleArgsMode = (mode, target) => {
  if (mode === 'content') {
    syncContent();
    return true;
  } else if (mode === 'output') {
    syncOutput();
    return true;
  } else if (mode === 'all') {
    syncAll();
    return true;
  } else if (mode === 'post') {
    if (!target) {
      console.error('? 错误：请指定文章URL名称');
      console.log('用法: npm run sync post <url-name>');
      process.exit(1);
    } else {
      syncPost(target);
    }
    return true;
  } else if (mode === 'column') {
    if (!target) {
      console.error('? 错误：请指定专栏URL名称');
      console.log('用法: npm run sync column <url-name>');
      process.exit(1);
    } else {
      syncColumn(target);
    }
    return true;
  } else if (mode === 'json') {
    if (!target) {
      console.error('? 错误：请指定JSON文件名');
      console.log('用法: npm run sync json <friends.json|projects.json>');
      process.exit(1);
    } else {
      syncJsonFile(target);
    }
    return true;
  } else {
    return false;
  }
};

const requireInput = async (rl, prompt, emptyMessage) => {
  const value = await question(rl, prompt);

  if (!value) {
    console.error(emptyMessage);
    rl.close();
    process.exit(1);
  } else {
    return value;
  }
};

const handleInteractiveChoice = async (rl, choice) => {
  if (choice === '1') {
    syncContent();
    rl.close();
  } else if (choice === '2') {
    syncOutput();
    rl.close();
  } else if (choice === '3') {
    syncAll();
    rl.close();
  } else if (choice === '4') {
    const urlName = await requireInput(rl, '?? 请输入文章URL名称: ', '? 错误：URL名称不能为空');
    syncPost(urlName);
    rl.close();
  } else if (choice === '5') {
    const urlName = await selectColumn(rl);

    if (!urlName) {
      console.error('? 错误：未选择专栏');
      rl.close();
      process.exit(1);
    } else {
      syncColumn(urlName);
      rl.close();
    }
  } else if (choice === '6') {
    const fileName = await requireInput(
      rl,
      '?? 请输入文件名 (friends.json/projects.json): ',
      '? 错误：文件名不能为空'
    );
    syncJsonFile(fileName);
    rl.close();
  } else {
    console.error('? 无效的选项');
    rl.close();
    process.exit(1);
  }
};

async function main() {
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
      console.log('2. 同步构建产物 (.output)');
      console.log('3. 同步全部');
      console.log('4. 同步指定文章 (post)');
      console.log('5. 同步指定专栏 (column)');
      console.log('6. 同步JSON文件 (json)');
      console.log('');

      const choice = await question(rl, '?? 请输入选项 (1-6): ');
      await handleInteractiveChoice(rl, choice);
    } catch (error) {
      if (error instanceof Error) {
        console.error('? 发生错误:', error.message);
      } else {
        console.error('? 发生错误: 未知错误');
      }
      rl.close();
      process.exit(1);
    }
  }
}

main();
