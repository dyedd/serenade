import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateUrlWithAI, generateImageWithAI } from './ai-helper.js';
import {
  createInterface,
  question,
  confirmQuestion,
  isSafeUrl,
} from './prompt-helper.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const args = process.argv.slice(2);
const postsDir = path.join(__dirname, '..', 'content', 'posts');

const exitWithError = (rl, message) => {
  console.error(message);
  rl.close();
  process.exit(1);
};

const isUrlTaken = (url) => fs.existsSync(path.join(postsDir, url));

const ensureSafeUrl = (rl, url, { invalidPrefix, existsMessage }) => {
  const safeCheck = isSafeUrl(url);

  if (!safeCheck.valid) {
    exitWithError(rl, `${invalidPrefix}${safeCheck.reason}`);
  } else if (isUrlTaken(url)) {
    exitWithError(rl, existsMessage);
  } else {
    return url;
  }
};

const promptForUniqueUrl = async (rl, prompt, options) => {
  const url = await question(rl, prompt);
  return ensureSafeUrl(rl, url, options);
};

const resolveTitle = async (rl) => {
  if (args.length > 0) {
    const title = args[0];
    console.log(`?? 文章标题: ${title}`);
    return title;
  } else {
    const title = await question(rl, '?? 请输入文章标题: ');

    if (!title) {
      exitWithError(rl, '? 错误：文章标题不能为空');
    } else {
      return title;
    }
  }
};

const resolvePostUrl = async (rl, title) => {
  const customUrl = await question(rl, '?? 请输入自定义URL路径（直接回车跳过）: ');

  if (customUrl) {
    const finalUrl = ensureSafeUrl(rl, customUrl, {
      invalidPrefix: '? 错误：',
      existsMessage: `? 错误：URL路径 "${customUrl}" 已存在`,
    });
    console.log(`? 使用自定义URL: ${customUrl}`);
    return finalUrl;
  } else {
    const useAI = await confirmQuestion(rl, '?? 是否使用AI生成URL路径？');

    if (!useAI) {
      return promptForUniqueUrl(rl, '请手动输入URL路径: ', {
        invalidPrefix: '? ',
        existsMessage: '? URL路径已存在',
      });
    } else {
      console.log('?? 正在使用AI生成URL路径...');
      const aiUrl = await generateUrlWithAI(title);

      if (!aiUrl) {
        console.log('??  AI生成失败');
        return promptForUniqueUrl(rl, '请手动输入URL路径: ', {
          invalidPrefix: '? ',
          existsMessage: '? URL路径已存在',
        });
      } else {
        console.log(`? AI建议的URL: ${aiUrl}`);
        const acceptAI = await confirmQuestion(rl, '是否使用此URL？');

        if (acceptAI) {
          if (isUrlTaken(aiUrl)) {
            console.log(`??  URL路径 "${aiUrl}" 已存在`);
            return promptForUniqueUrl(rl, '请手动输入URL路径: ', {
              invalidPrefix: '? ',
              existsMessage: '? URL路径已存在',
            });
          } else {
            return aiUrl;
          }
        } else {
          return promptForUniqueUrl(rl, '请手动输入URL路径: ', {
            invalidPrefix: '? ',
            existsMessage: '? URL路径已存在',
          });
        }
      }
    }
  }
};

const writeReadmeFile = (readmePath, title) => {
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
};

const maybeGenerateCover = async (rl, title, newPostDir) => {
  const hasImageAPI = Boolean(process.env.IMAGE_API_KEY);

  if (!hasImageAPI) {
    return false;
  } else {
    console.log('');
    const generateImage = await confirmQuestion(rl, '?? 是否生成AI配图？');

    if (generateImage) {
      console.log('?? 正在生成配图...');
      const imagePath = path.join(newPostDir, 'cover.png');
      const result = await generateImageWithAI(title, imagePath);

      if (result) {
        console.log(`? 配图已生成: ${imagePath}`);
        return true;
      } else {
        console.log('??  配图生成失败，请手动添加');
        return false;
      }
    } else {
      return false;
    }
  }
};

async function main() {
  const rl = createInterface();

  try {
    const title = await resolveTitle(rl);
    const finalUrl = await resolvePostUrl(rl, title);

    if (!finalUrl) {
      exitWithError(rl, '? 错误：未能确定有效的URL路径');
    } else {
      const newPostDir = path.join(postsDir, finalUrl);
      const readmePath = path.join(newPostDir, 'README.md');

      fs.mkdirSync(newPostDir, { recursive: true });
      writeReadmeFile(readmePath, title);

      console.log('');
      console.log('? 文章创建成功！');
      console.log(`?? 路径: ${readmePath}`);
      console.log(`?? 标题: ${title}`);
      console.log(`?? URL: ${finalUrl}`);

      await maybeGenerateCover(rl, title, newPostDir);

      console.log('');
      console.log('现在你可以开始编辑文章内容了！');

      rl.close();
    }
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

main();
