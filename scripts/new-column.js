import fs from 'fs';
import path from 'path';
import {
  columnsDir,
  maybeGenerateCover,
  resolveChapterFilename,
  resolveContentUrl,
  selectColumn,
} from './content-helper.js';
import {
  closeInterface,
  createInterface,
  exitIfFailed,
  finishCliAction,
  promptRequired,
  question,
} from './prompt-helper.js';

const buildColumnReadmeContent = (title, description) => `---
title: ${title}
description: ${description}
type: "公开"
image: "cover.png"
---
`;

const createArticle = async (rl) => {
  const title = await question(rl, '👉 请输入章节标题: ');

  if (!title) {
    console.error('❌ 错误：章节标题不能为空');
    return false;
  }

  const columnSlug = await selectColumn(rl, '❌ 错误：没有找到任何专栏，请先创建专栏');

  if (!columnSlug) {
    return false;
  }

  const columnPath = path.join(columnsDir, columnSlug);
  const filename = await resolveChapterFilename(rl, columnPath, title);

  if (!filename) {
    console.error('❌ 错误：未能确定有效的文件名');
    return false;
  }

  const articlePath = path.join(columnPath, `${filename}.md`);
  const articleContent = `# ${title}\n\n`;

  fs.writeFileSync(articlePath, articleContent, 'utf8');

  console.log('');
  console.log('✅ 章节创建成功！');
  console.log(`📝 路径: ${articlePath}`);
  console.log(`📝 标题: ${title}`);
  console.log(`📝 文件名: ${filename}.md`);
  console.log(`📝 所属专栏: ${columnSlug}`);

  return true;
};

const createColumn = async (rl) => {
  const title = await question(rl, '👉 请输入专栏标题: ');

  if (!title) {
    console.error('❌ 错误：专栏标题不能为空');
    return false;
  }

  const description = await question(rl, '👉 请输入专栏描述: ');

  if (!description) {
    console.error('❌ 错误：专栏描述不能为空');
    return false;
  }

  const finalUrl = await resolveContentUrl(rl, title, columnsDir);

  if (!finalUrl) {
    console.error('❌ 错误：未能确定有效的URL路径');
    return false;
  }

  const newColumnDir = path.join(columnsDir, finalUrl);
  const readmePath = path.join(newColumnDir, 'README.md');

  fs.mkdirSync(newColumnDir, { recursive: true });
  fs.writeFileSync(readmePath, buildColumnReadmeContent(title, description), 'utf8');

  console.log('');
  console.log('✅ 专栏创建成功！');
  console.log(`📝 路径: ${readmePath}`);
  console.log(`📝 标题: ${title}`);
  console.log(`📝 URL: ${finalUrl}`);
  console.log(`📝 描述: ${description}`);

  await maybeGenerateCover(rl, title, newColumnDir);

  console.log('');
  console.log('现在你可以开始向这个专栏中添加文章了！');

  return true;
};

const runMode = async (rl, modeChoice) => {
  if (modeChoice === '1') {
    console.log('\n📚 专栏创建模式\n');
    finishCliAction(rl, await createColumn(rl));
    return;
  }

  if (modeChoice === '2') {
    console.log('\n📝 章节创建模式\n');
    finishCliAction(rl, await createArticle(rl));
    return;
  }

  console.error('❌ 无效的选项');
  closeInterface(rl);
  process.exit(1);
};

async function main() {
  const rl = createInterface();

  try {
    console.log('请选择操作模式：');
    console.log('  1. 创建新专栏');
    console.log('  2. 创建章节');
    console.log('');

    const modeChoice = await promptRequired(rl, '👉 请输入选项（1或2）: ', '❌ 错误：选项不能为空');
    await runMode(rl, modeChoice);
  } catch (error) {
    if (error instanceof Error) {
      console.error('❌ 发生错误:', error.message);
    } else {
      console.error('❌ 发生错误: 未知错误');
    }

    closeInterface(rl);
    exitIfFailed(false);
  }
}

main();
