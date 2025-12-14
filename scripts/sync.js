import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import os from 'os';
import {
  createInterface,
  question
} from './prompt-helper.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SERVER_HOST = process.env.SERVER_HOST;
const SERVER_USER = process.env.SERVER_USER;
const SERVER_PATH = process.env.SERVER_PATH;

const projectRoot = path.join(__dirname, '..');
const args = process.argv.slice(2);
const isWindows = os.platform() === 'win32';

function checkConfig() {
  if (!SERVER_HOST || !SERVER_USER || !SERVER_PATH) {
    console.error('❌ 错误：未配置服务器信息');
    console.log('请在 .env 文件中配置以下变量：');
    console.log('  SERVER_HOST - 服务器地址');
    console.log('  SERVER_USER - 服务器用户名');
    console.log('  SERVER_PATH - 服务器目标路径');
    process.exit(1);
  }

  if (isWindows) {
    console.log('ℹ️  检测到 Windows 系统，将使用 scp 命令（不支持增量同步）');
  } else {
    console.log('ℹ️  检测到 Unix 系统，将使用 rsync 命令（支持增量同步）');
  }
}

function getCurrentTimestamp() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

function updateTimestamps() {
  console.log('🕐 检查并添加缺失的时间戳...');
  const timestamp = getCurrentTimestamp();
  let updatedCount = 0;

  const postsDir = path.join(projectRoot, 'content', 'posts');
  const columnsDir = path.join(projectRoot, 'content', 'columns');

  function updateReadmeFiles(dir) {
    if (!fs.existsSync(dir)) {
      return;
    }

    const items = fs.readdirSync(dir);

    for (const item of items) {
      const itemPath = path.join(dir, item);
      const stat = fs.statSync(itemPath);

      if (stat.isDirectory()) {
        const readmePath = path.join(itemPath, 'README.md');

        if (fs.existsSync(readmePath)) {
          const content = fs.readFileSync(readmePath, 'utf8');

          if (!/^date:\s*.+$/m.test(content)) {
            const updatedContent = content.replace(
              /^(---\s*\ntitle:[^\n]+\s*\n)/m,
              `$1date: ${timestamp}\n`
            );

            if (content !== updatedContent) {
              fs.writeFileSync(readmePath, updatedContent, 'utf8');
              updatedCount++;
              const relativePath = path.relative(projectRoot, readmePath);
              console.log(`  📝 ${relativePath}`);
            }
          }
        }
      }
    }
  }

  updateReadmeFiles(postsDir);
  updateReadmeFiles(columnsDir);

  if (updatedCount > 0) {
    console.log(`✅ 已为 ${updatedCount} 个文件添加时间戳: ${timestamp}`);
  } else {
    console.log('✅ 所有文件都已有时间戳');
  }

  return true;
}

function syncContent() {
  updateTimestamps();
  console.log('');
  console.log('📦 同步内容到服务器...');
  const contentPath = path.join(projectRoot, 'content');
  const target = `${SERVER_USER}@${SERVER_HOST}:${SERVER_PATH}/content/`;

  try {
    if (isWindows) {
      execSync(
        `scp -r "${contentPath}/*" "${target}"`,
        { stdio: 'inherit', shell: true }
      );
    } else {
      execSync(
        `rsync -avz --delete "${contentPath}/" "${target}"`,
        { stdio: 'inherit' }
      );
    }
    console.log('✅ 内容同步完成');
    return true;
  } catch (error) {
    console.error('❌ 内容同步失败:', error.message);
    return false;
  }
}

function syncOutput() {
  console.log('🚀 同步构建产物到服务器...');
  const outputPath = path.join(projectRoot, '.output');
  const target = `${SERVER_USER}@${SERVER_HOST}:${SERVER_PATH}/.output/`;

  try {
    if (isWindows) {
      execSync(
        `scp -r "${outputPath}/*" "${target}"`,
        { stdio: 'inherit', shell: true }
      );
    } else {
      execSync(
        `rsync -avz --delete "${outputPath}/" "${target}"`,
        { stdio: 'inherit' }
      );
    }
    console.log('✅ 构建产物同步完成');
    return true;
  } catch (error) {
    console.error('❌ 构建产物同步失败:', error.message);
    return false;
  }
}

function syncAll() {
  console.log('🔄 同步全部内容到服务器...');
  console.log('');
  updateTimestamps();
  console.log('');

  const contentSuccess = syncContentWithoutUpdate();
  const outputSuccess = syncOutput();
  const success = contentSuccess && outputSuccess;

  if (success) {
    console.log('');
    console.log('✨ 全部同步完成！');
  } else {
    console.log('');
    console.log('⚠️  部分同步失败，请检查错误信息');
  }

  return success;
}

function syncContentWithoutUpdate() {
  console.log('📦 同步内容到服务器...');
  const contentPath = path.join(projectRoot, 'content');
  const target = `${SERVER_USER}@${SERVER_HOST}:${SERVER_PATH}/content/`;

  try {
    if (isWindows) {
      execSync(
        `scp -r "${contentPath}/*" "${target}"`,
        { stdio: 'inherit', shell: true }
      );
    } else {
      execSync(
        `rsync -avz --delete "${contentPath}/" "${target}"`,
        { stdio: 'inherit' }
      );
    }
    console.log('✅ 内容同步完成');
    return true;
  } catch (error) {
    console.error('❌ 内容同步失败:', error.message);
    return false;
  }
}

function syncPost(urlName) {
  const postPath = path.join(projectRoot, 'content', 'posts', urlName);

  if (!fs.existsSync(postPath)) {
    console.error(`❌ 错误：文章 "${urlName}" 不存在`);
    return false;
  }

  const readmePath = path.join(postPath, 'README.md');
  if (fs.existsSync(readmePath)) {
    const content = fs.readFileSync(readmePath, 'utf8');
    if (!/^date:\s*.+$/m.test(content)) {
      const timestamp = getCurrentTimestamp();
      const updatedContent = content.replace(
        /^(---\s*\ntitle:[^\n]+\s*\n)/m,
        `$1date: ${timestamp}\n`
      );
      if (content !== updatedContent) {
        fs.writeFileSync(readmePath, updatedContent, 'utf8');
        console.log(`🕐 已添加时间戳: ${timestamp}`);
      }
    }
  }

  console.log('');
  console.log(`📦 同步文章 "${urlName}" 到服务器...`);
  const target = `${SERVER_USER}@${SERVER_HOST}:${SERVER_PATH}/content/posts/${urlName}/`;

  try {
    if (isWindows) {
      execSync(
        `scp -r "${postPath}" "${SERVER_USER}@${SERVER_HOST}:${SERVER_PATH}/content/posts/"`,
        { stdio: 'inherit', shell: true }
      );
    } else {
      execSync(
        `rsync -avz --delete "${postPath}/" "${target}"`,
        { stdio: 'inherit' }
      );
    }
    console.log('✅ 文章同步完成');
    return true;
  } catch (error) {
    console.error('❌ 文章同步失败:', error.message);
    return false;
  }
}

function syncColumn(urlName) {
  const columnPath = path.join(projectRoot, 'content', 'columns', urlName);

  if (!fs.existsSync(columnPath)) {
    console.error(`❌ 错误：专栏 "${urlName}" 不存在`);
    return false;
  }

  console.log(`📦 同步专栏 "${urlName}" 到服务器...`);
  const target = `${SERVER_USER}@${SERVER_HOST}:${SERVER_PATH}/content/columns/${urlName}/`;

  try {
    if (isWindows) {
      execSync(
        `scp -r "${columnPath}" "${SERVER_USER}@${SERVER_HOST}:${SERVER_PATH}/content/columns/"`,
        { stdio: 'inherit', shell: true }
      );
    } else {
      execSync(
        `rsync -avz --delete "${columnPath}/" "${target}"`,
        { stdio: 'inherit' }
      );
    }
    console.log('✅ 专栏同步完成');
    return true;
  } catch (error) {
    console.error('❌ 专栏同步失败:', error.message);
    return false;
  }
}

function syncJsonFile(fileName) {
  const validFiles = ['friends.json', 'projects.json'];
  if (!validFiles.includes(fileName)) {
    console.error(`❌ 错误：只支持同步 ${validFiles.join(', ')}`);
    return false;
  }

  const filePath = path.join(projectRoot, 'content', fileName);

  if (!fs.existsSync(filePath)) {
    console.error(`❌ 错误：文件 "${fileName}" 不存在`);
    return false;
  }

  console.log(`📦 同步 ${fileName} 到服务器...`);
  const target = `${SERVER_USER}@${SERVER_HOST}:${SERVER_PATH}/content/${fileName}`;

  try {
    if (isWindows) {
      execSync(
        `scp "${filePath}" "${target}"`,
        { stdio: 'inherit', shell: true }
      );
    } else {
      execSync(
        `rsync -avz "${filePath}" "${target}"`,
        { stdio: 'inherit' }
      );
    }
    console.log('✅ 文件同步完成');
    return true;
  } catch (error) {
    console.error('❌ 文件同步失败:', error.message);
    return false;
  }
}

async function main() {
  checkConfig();

  const mode = args[0];
  const target = args[1];

  if (mode === 'content') {
    syncContent();
    return;
  }

  if (mode === 'output') {
    syncOutput();
    return;
  }

  if (mode === 'all') {
    syncAll();
    return;
  }

  if (mode === 'post') {
    if (!target) {
      console.error('❌ 错误：请指定文章URL名称');
      console.log('用法: npm run sync post <url-name>');
      process.exit(1);
    }
    syncPost(target);
    return;
  }

  if (mode === 'column') {
    if (!target) {
      console.error('❌ 错误：请指定专栏URL名称');
      console.log('用法: npm run sync column <url-name>');
      process.exit(1);
    }
    syncColumn(target);
    return;
  }

  if (mode === 'json') {
    if (!target) {
      console.error('❌ 错误：请指定JSON文件名');
      console.log('用法: npm run sync json <friends.json|projects.json>');
      process.exit(1);
    }
    syncJsonFile(target);
    return;
  }

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

    const choice = await question(rl, '请输入选项 (1-6): ');

    if (choice === '1') {
      syncContent();
    } else if (choice === '2') {
      syncOutput();
    } else if (choice === '3') {
      syncAll();
    } else if (choice === '4') {
      const urlName = await question(rl, '请输入文章URL名称: ');
      if (!urlName) {
        console.error('❌ 错误：URL名称不能为空');
        rl.close();
        process.exit(1);
      }
      syncPost(urlName);
    } else if (choice === '5') {
      const urlName = await question(rl, '请输入专栏URL名称: ');
      if (!urlName) {
        console.error('❌ 错误：URL名称不能为空');
        rl.close();
        process.exit(1);
      }
      syncColumn(urlName);
    } else if (choice === '6') {
      const fileName = await question(rl, '请输入文件名 (friends.json/projects.json): ');
      if (!fileName) {
        console.error('❌ 错误：文件名不能为空');
        rl.close();
        process.exit(1);
      }
      syncJsonFile(fileName);
    } else {
      console.error('❌ 无效的选项');
      process.exit(1);
    }

    rl.close();
  } catch (error) {
    console.error('❌ 发生错误:', error.message);
    rl.close();
    process.exit(1);
  }
}

main();
