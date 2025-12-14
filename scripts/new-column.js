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

const args = process.argv.slice(2);
const columnsDir = path.join(__dirname, '..', 'content', 'columns');

async function main() {
  const rl = createInterface();

  try {
    let title;
    let description;

    if (args.length >= 2) {
      title = args[0];
      description = args[1];
      console.log(`📝 专栏标题: ${title}`);
      console.log(`📄 专栏描述: ${description}`);
    } else if (args.length === 1) {
      title = args[0];
      console.log(`📝 专栏标题: ${title}`);
      description = await question(rl, '📄 请输入专栏描述: ');

      if (!description) {
        console.error('❌ 错误：专栏描述不能为空');
        rl.close();
        process.exit(1);
      }
    } else {
      title = await question(rl, '📝 请输入专栏标题: ');

      if (!title) {
        console.error('❌ 错误：专栏标题不能为空');
        rl.close();
        process.exit(1);
      }

      description = await question(rl, '📄 请输入专栏描述: ');

      if (!description) {
        console.error('❌ 错误：专栏描述不能为空');
        rl.close();
        process.exit(1);
      }
    }

    let finalUrl = null;
    let customUrl = await question(rl, '🔗 请输入自定义URL路径（直接回车跳过）: ');

    if (customUrl) {
      const safeCheck = isSafeUrl(customUrl);

      if (!safeCheck.valid) {
        console.error(`❌ 错误：${safeCheck.reason}`);
        rl.close();
        process.exit(1);
      }

      if (fs.existsSync(path.join(columnsDir, customUrl))) {
        console.error(`❌ 错误：URL路径 "${customUrl}" 已存在`);
        rl.close();
        process.exit(1);
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
                rl.close();
                process.exit(1);
              }

              if (fs.existsSync(path.join(columnsDir, manualUrl))) {
                console.error('❌ URL路径已存在');
                rl.close();
                process.exit(1);
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
              rl.close();
              process.exit(1);
            }

            if (fs.existsSync(path.join(columnsDir, manualUrl))) {
              console.error('❌ URL路径已存在');
              rl.close();
              process.exit(1);
            }

            finalUrl = manualUrl;
          }
        } else {
          console.log('⚠️  AI生成失败');
          const manualUrl = await question(rl, '请手动输入URL路径: ');
          const safeCheck = isSafeUrl(manualUrl);

          if (!safeCheck.valid) {
            console.error(`❌ ${safeCheck.reason}`);
            rl.close();
            process.exit(1);
          }

          if (fs.existsSync(path.join(columnsDir, manualUrl))) {
            console.error('❌ URL路径已存在');
            rl.close();
            process.exit(1);
          }

          finalUrl = manualUrl;
        }
      } else {
        const manualUrl = await question(rl, '请手动输入URL路径: ');
        const safeCheck = isSafeUrl(manualUrl);

        if (!safeCheck.valid) {
          console.error(`❌ ${safeCheck.reason}`);
          rl.close();
          process.exit(1);
        }

        if (fs.existsSync(path.join(columnsDir, manualUrl))) {
          console.error('❌ URL路径已存在');
          rl.close();
          process.exit(1);
        }

        finalUrl = manualUrl;
      }
    }

    if (!finalUrl) {
      console.error('❌ 错误：未能确定有效的URL路径');
      rl.close();
      process.exit(1);
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

    rl.close();
  } catch (error) {
    console.error('❌ 发生错误:', error.message);
    rl.close();
    process.exit(1);
  }
}

main();

