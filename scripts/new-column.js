import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateUrlWithAI, generateImageWithAI } from './ai-helper.js';
import {
  createInterface,
  question,
  confirmQuestion,
  isSafeUrl
} from './prompt-helper.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const columnsDir = path.join(__dirname, '..', 'content', 'columns');

function getExistingColumns() {
  if (!fs.existsSync(columnsDir)) {
    return [];
  }

  return fs
    .readdirSync(columnsDir)
    .filter(name => {
      const fullPath = path.join(columnsDir, name);
      return fs.statSync(fullPath).isDirectory();
    });
}

async function selectColumn(rl) {
  const columns = getExistingColumns();

  if (columns.length === 0) {
    console.error('❌ 错误：没有找到任何专栏，请先创建专栏');
    return null;
  }

  console.log('\n📚 可用的专栏：');
  columns.forEach((col, index) => {
    const readmePath = path.join(columnsDir, col, 'README.md');
    let title = col;

    if (fs.existsSync(readmePath)) {
      const content = fs.readFileSync(readmePath, 'utf8');
      const titleMatch = content.match(/^title:\s*(.+)$/m);
      if (titleMatch) {
        title = titleMatch[1];
      }
    }

    console.log(`  ${index + 1}. ${title} (${col})`);
  });

  const answer = await question(rl, '\n请选择专栏（输入序号或专栏路径）: ');

  if (!answer) {
    return null;
  }

  const index = parseInt(answer) - 1;

  if (!isNaN(index) && index >= 0 && index < columns.length) {
    return columns[index];
  }

  if (columns.includes(answer)) {
    return answer;
  }

  console.error('❌ 错误：无效的选择');
  return null;
}

async function createArticle(rl) {
  const title = await question(rl, '📝 请输入章节标题: ');

  if (!title) {
    console.error('❌ 错误：章节标题不能为空');
    return false;
  }

  const columnSlug = await selectColumn(rl);

  if (!columnSlug) {
    return false;
  }

  const columnPath = path.join(columnsDir, columnSlug);

  let filename = null;
  const customFilename = await question(rl, '📄 请输入文件名（不含.md，直接回车跳过）: ');

  if (customFilename) {
    const safeFilename = customFilename.replace(/[^a-zA-Z0-9_-]/g, '-');

    if (fs.existsSync(path.join(columnPath, `${safeFilename}.md`))) {
      console.error(`❌ 错误：文件 "${safeFilename}.md" 已存在`);
      return false;
    }

    filename = safeFilename;
    console.log(`✅ 使用自定义文件名: ${filename}.md`);
  }

  if (!filename) {
    const useAI = await confirmQuestion(rl, '🤖 是否使用AI生成文件名？');

    if (useAI) {
      console.log('🤖 正在使用AI生成文件名...');
      const aiFilename = await generateUrlWithAI(title);

      if (aiFilename) {
        console.log(`✨ AI建议的文件名: ${aiFilename}.md`);

        const acceptAI = await confirmQuestion(rl, '是否使用此文件名？');

        if (acceptAI) {
          if (fs.existsSync(path.join(columnPath, `${aiFilename}.md`))) {
            console.log(`⚠️  文件 "${aiFilename}.md" 已存在`);
            const manualFilename = await question(rl, '请手动输入文件名: ');
            const safeName = manualFilename.replace(/[^a-zA-Z0-9_-]/g, '-');

            if (fs.existsSync(path.join(columnPath, `${safeName}.md`))) {
              console.error('❌ 文件已存在');
              return false;
            }

            filename = safeName;
          } else {
            filename = aiFilename;
          }
        } else {
          const manualFilename = await question(rl, '请手动输入文件名: ');
          const safeName = manualFilename.replace(/[^a-zA-Z0-9_-]/g, '-');

          if (fs.existsSync(path.join(columnPath, `${safeName}.md`))) {
            console.error('❌ 文件已存在');
            return false;
          }

          filename = safeName;
        }
      } else {
        console.log('⚠️  AI生成失败');
        const manualFilename = await question(rl, '请手动输入文件名: ');
        const safeName = manualFilename.replace(/[^a-zA-Z0-9_-]/g, '-');

        if (fs.existsSync(path.join(columnPath, `${safeName}.md`))) {
          console.error('❌ 文件已存在');
          return false;
        }

        filename = safeName;
      }
    } else {
      const manualFilename = await question(rl, '请手动输入文件名: ');
      const safeName = manualFilename.replace(/[^a-zA-Z0-9_-]/g, '-');

      if (fs.existsSync(path.join(columnPath, `${safeName}.md`))) {
        console.error('❌ 文件已存在');
        return false;
      }

      filename = safeName;
    }
  }

  if (!filename) {
    console.error('❌ 错误：未能确定有效的文件名');
    return false;
  }

  const articlePath = path.join(columnPath, `${filename}.md`);
  const articleContent = `# ${title}\n\n`;

  fs.writeFileSync(articlePath, articleContent, 'utf8');

  console.log('');
  console.log('✅ 章节创建成功！');
  console.log(`📁 路径: ${articlePath}`);
  console.log(`📝 标题: ${title}`);
  console.log(`📄 文件名: ${filename}.md`);
  console.log(`📚 所属专栏: ${columnSlug}`);

  return true;
}

async function createColumn(rl) {
  const title = await question(rl, '📝 请输入专栏标题: ');

  if (!title) {
    console.error('❌ 错误：专栏标题不能为空');
    return false;
  }

  const description = await question(rl, '📄 请输入专栏描述: ');

  if (!description) {
    console.error('❌ 错误：专栏描述不能为空');
    return false;
  }

  let finalUrl = null;
  const customUrl = await question(rl, '🔗 请输入自定义URL路径（直接回车跳过）: ');

  if (customUrl) {
    const safeCheck = isSafeUrl(customUrl);

    if (!safeCheck.valid) {
      console.error(`❌ 错误：${safeCheck.reason}`);
      return false;
    }

    if (fs.existsSync(path.join(columnsDir, customUrl))) {
      console.error(`❌ 错误：URL路径 "${customUrl}" 已存在`);
      return false;
    }

    finalUrl = customUrl;
    console.log(`✅ 使用自定义URL: ${finalUrl}`);
  }

  if (!finalUrl) {
    const useAI = await confirmQuestion(rl, '🤖 是否使用AI生成URL路径？');

    if (useAI) {
      console.log('🤖 正在使用AI生成URL路径...');
      const aiUrl = await generateUrlWithAI(title);

      if (aiUrl) {
        console.log(`✨ AI建议的URL: ${aiUrl}`);

        const acceptAI = await confirmQuestion(rl, '是否使用此URL？');

        if (acceptAI) {
          if (fs.existsSync(path.join(columnsDir, aiUrl))) {
            console.log(`⚠️  URL路径 "${aiUrl}" 已存在`);
            const manualUrl = await question(rl, '请手动输入URL路径: ');
            const safeCheck = isSafeUrl(manualUrl);

            if (!safeCheck.valid) {
              console.error(`❌ ${safeCheck.reason}`);
              return false;
            }

            if (fs.existsSync(path.join(columnsDir, manualUrl))) {
              console.error('❌ URL路径已存在');
              return false;
            }

            finalUrl = manualUrl;
          } else {
            finalUrl = aiUrl;
          }
        } else {
          const manualUrl = await question(rl, '请手动输入URL路径: ');
          const safeCheck = isSafeUrl(manualUrl);

          if (!safeCheck.valid) {
            console.error(`❌ ${safeCheck.reason}`);
            return false;
          }

          if (fs.existsSync(path.join(columnsDir, manualUrl))) {
            console.error('❌ URL路径已存在');
            return false;
          }

          finalUrl = manualUrl;
        }
      } else {
        console.log('⚠️  AI生成失败');
        const manualUrl = await question(rl, '请手动输入URL路径: ');
        const safeCheck = isSafeUrl(manualUrl);

        if (!safeCheck.valid) {
          console.error(`❌ ${safeCheck.reason}`);
          return false;
        }

        if (fs.existsSync(path.join(columnsDir, manualUrl))) {
          console.error('❌ URL路径已存在');
          return false;
        }

        finalUrl = manualUrl;
      }
    } else {
      const manualUrl = await question(rl, '请手动输入URL路径: ');
      const safeCheck = isSafeUrl(manualUrl);

      if (!safeCheck.valid) {
        console.error(`❌ ${safeCheck.reason}`);
        return false;
      }

      if (fs.existsSync(path.join(columnsDir, manualUrl))) {
        console.error('❌ URL路径已存在');
        return false;
      }

      finalUrl = manualUrl;
    }
  }

  if (!finalUrl) {
    console.error('❌ 错误：未能确定有效的URL路径');
    return false;
  }

  const newColumnDir = path.join(columnsDir, finalUrl);
  const readmePath = path.join(newColumnDir, 'README.md');
  fs.mkdirSync(newColumnDir, { recursive: true });

  const readmeContent = `---
title: ${title}
description: ${description}
type: "公开"
image: "cover.png"
---
`;

  fs.writeFileSync(readmePath, readmeContent, 'utf8');

  console.log('');
  console.log('✅ 专栏创建成功！');
  console.log(`📁 路径: ${readmePath}`);
  console.log(`📝 标题: ${title}`);
  console.log(`🔗 URL: ${finalUrl}`);
  console.log(`📄 描述: ${description}`);

  const hasImageAPI = process.env.IMAGE_API_KEY;
  if (hasImageAPI) {
    console.log('');
    const generateImage = await confirmQuestion(rl, '🎨 是否生成AI配图？');

    if (generateImage) {
      console.log('🎨 正在生成配图...');
      const imagePath = path.join(newColumnDir, 'cover.png');
      const result = await generateImageWithAI(title, imagePath);

      if (result) {
        console.log(`✅ 配图已生成: ${imagePath}`);
      } else {
        console.log('⚠️  配图生成失败，请手动添加');
      }
    }
  }

  console.log('');
  console.log('现在你可以开始向这个专栏中添加文章了！');

  return true;
}

async function main() {
  const rl = createInterface();

  try {
    console.log('请选择操作模式：');
    console.log('  1. 创建新专栏');
    console.log('  2. 创建章节');
    console.log('');

    const modeChoice = await question(rl, '请输入选项（1或2）: ');

    if (modeChoice === '1') {
      console.log('\n📚 专栏创建模式\n');
      const success = await createColumn(rl);

      if (!success) {
        rl.close();
        process.exit(1);
      }
    } else if (modeChoice === '2') {
      console.log('\n📄 章节创建模式\n');
      const success = await createArticle(rl);

      if (!success) {
        rl.close();
        process.exit(1);
      }
    } else {
      console.error('❌ 无效的选项');
      rl.close();
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

