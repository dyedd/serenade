import fs from 'fs';
import path from 'path';
import {
  maybeGenerateCover,
  postsDir,
  resolveContentUrl,
} from './content-helper.js';
import { quoteYamlString } from './front-matter.js';
import {
  closeInterface,
  createInterface,
  exitWithError,
  promptRequired,
} from './prompt-helper.js';

const parseOptions = (args) => {
  const options = { title: '', slug: '', noAi: false, noCover: false };
  const values = [];

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === '--slug') {
      const next = args[index + 1];
      // 只有下一个参数确实是一个值时才算 slug；否则 --slug 会吞掉 --no-ai 这类开关，
      // 静默建出名为 --no-ai 的目录。
      if (typeof next === 'string' && next.length > 0 && !next.startsWith('-')) {
        options.slug = next;
        index += 1;
      } else {
        exitWithError('❌ 错误：--slug 后面需要跟一个 URL 路径', {
          usage: '用法: pnpm cli post "标题" --slug my-post-slug [--no-ai] [--no-cover]',
        });
      }
    } else if (arg === '--no-ai') {
      options.noAi = true;
    } else if (arg === '--no-cover') {
      options.noCover = true;
    } else {
      values.push(arg);
    }
  }

  options.title = values[0] ?? '';
  return options;
};

const resolveTitle = async (rl, titleArg) => {
  const title = titleArg;

  if (title) {
    console.log(`ℹ️ 文章标题: ${title}`);
    return title;
  }

  return promptRequired(rl, '👉 请输入文章标题: ', '❌ 错误：文章标题不能为空');
};

// 标题按 YAML 双引号标量写出：含冒号、方括号、引号或换行的标题都不会破坏
// front matter（过去会写出 gray-matter 无法解析的文件，文章页直接报错）。
const buildReadmeContent = (title) => `---
title: ${quoteYamlString(title)}
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

const writeReadmeFile = (readmePath, title) => {
  fs.writeFileSync(readmePath, buildReadmeContent(title), 'utf8');
};

export async function createPost(args = []) {
  const rl = createInterface();

  try {
    const options = parseOptions(args);
    const title = await resolveTitle(rl, options.title);
    const finalUrl = await resolveContentUrl(rl, title, postsDir, options.slug, !options.noAi);

    if (!finalUrl) {
      exitWithError('❌ 错误：未能确定有效的URL路径', { rl });
    }

    const newPostDir = path.join(postsDir, finalUrl);
    const readmePath = path.join(newPostDir, 'README.md');

    fs.mkdirSync(newPostDir, { recursive: true });
    try {
      writeReadmeFile(readmePath, title);
    } catch (error) {
      // 写失败时把空目录收掉：残留的目录会让下次同 slug 创建被判定为「已存在」。
      fs.rmSync(newPostDir, { recursive: true, force: true });
      throw error;
    }

    console.log('');
    console.log('✅ 文章创建成功！');
    console.log(`📝 路径: ${readmePath}`);
    console.log(`📝 标题: ${title}`);
    console.log(`📝 URL: ${finalUrl}`);

    await maybeGenerateCover(rl, title, newPostDir, options.noCover);

    console.log('');
    console.log('现在你可以开始编辑文章内容了！');

    closeInterface(rl);
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
