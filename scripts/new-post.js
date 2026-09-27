import fs from 'fs';
import path from 'path';
import {
  maybeGenerateCover,
  postsDir,
  resolveContentUrl,
} from './content-helper.js';
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
      options.slug = args[index + 1] ?? '';
      index += 1;
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

const buildReadmeContent = (title) => `---
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
    writeReadmeFile(readmePath, title);

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
