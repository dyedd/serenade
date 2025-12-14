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
const postsDir = path.join(__dirname, '..', 'content', 'posts');

async function main() {
  const rl = createInterface();

  try {
    let title;

    if (args.length > 0) {
      title = args[0];
      console.log(`📝 文章标题: ${title}`);
    } else {
      title = await question(rl, '📝 请输入文章标题: ');

      if (!title) {
        console.error('❌ 错误：文章标题不能为空');
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

      if (fs.existsSync(path.join(postsDir, customUrl))) {
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
            if (fs.existsSync(path.join(postsDir, aiUrl))) {
              console.log(`⚠️  URL路径 "${aiUrl}" 已存在`);
              const manualUrl = await question(rl, '请手动输入URL路径: ');
              const safeCheck = isSafeUrl(manualUrl);

              if (!safeCheck.valid) {
                console.error(`❌ ${safeCheck.reason}`);
                rl.close();
                process.exit(1);
              }

              if (fs.existsSync(path.join(postsDir, manualUrl))) {
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

            if (fs.existsSync(path.join(postsDir, manualUrl))) {
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

          if (fs.existsSync(path.join(postsDir, manualUrl))) {
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

        if (fs.existsSync(path.join(postsDir, manualUrl))) {
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

    const newPostDir = path.join(postsDir, finalUrl);
    const readmePath = path.join(newPostDir, 'README.md');

    fs.mkdirSync(newPostDir, { recursive: true });

    const readmeContent = `---
title: ${title}
tags: []
---

在这里开始写你的文章内容...

## 小标题

你可以使用 Markdown 语法来编写文章。

\`\`\`javascript
// 代码示例
console.log('Hello, World!');
\`\`\`

> 引用文本

- 列表项 1
- 列表项 2
- 列表项 3

[链接文本](https://example.com)

![图片描述](图片URL)
`;

    fs.writeFileSync(readmePath, readmeContent, 'utf8');

    console.log('');
    console.log('✅ 文章创建成功！');
    console.log(`📁 路径: ${readmePath}`);
    console.log(`📝 标题: ${title}`);
    console.log(`🔗 URL: ${finalUrl}`);

    const hasImageAPI = process.env.IMAGE_API_KEY;
    if (hasImageAPI) {
      console.log('');
      const generateImage = await confirmQuestion(rl, '🎨 是否生成AI配图？');

      if (generateImage) {
        console.log('🎨 正在生成配图...');
        const imagePath = path.join(newPostDir, 'cover.png');
        const result = await generateImageWithAI(title, imagePath);

        if (result) {
          console.log(`✅ 配图已生成: ${imagePath}`);
        } else {
          console.log('⚠️  配图生成失败，请手动添加');
        }
      }
    }

    console.log('');
    console.log('现在你可以开始编辑文章内容了！');

    rl.close();
  } catch (error) {
    console.error('❌ 发生错误:', error.message);
    rl.close();
    process.exit(1);
  }
}

main();

