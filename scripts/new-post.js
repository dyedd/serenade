import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('❌ 错误：请提供文章标题');
  console.log('用法: node scripts/new-post.js "文章标题"');
  process.exit(1);
}

const title = args[0];

const now = new Date();
const date = now.getFullYear() + '-' +
  String(now.getMonth() + 1).padStart(2, '0') + '-' +
  String(now.getDate()).padStart(2, '0') + ' ' +
  String(now.getHours()).padStart(2, '0') + ':' +
  String(now.getMinutes()).padStart(2, '0') + ':' +
  String(now.getSeconds()).padStart(2, '0');

const postsDir = path.join(__dirname, '..', 'content', 'posts');

const suggestedDirName = title
  .toLowerCase()
  .replace(/[^a-z0-9\s-]/g, '')
  .replace(/\s+/g, '-')
  .replace(/-+/g, '-')
  .replace(/^-+|-+$/g, '')
  .trim();

const isValidDirName = suggestedDirName &&
  suggestedDirName.length > 0 &&
  !suggestedDirName.match(/^[-\s]+$/) &&
  !suggestedDirName.match(/^\d+$/) &&
  !fs.existsSync(path.join(postsDir, suggestedDirName));

let finalDirName;

if (isValidDirName) {
  finalDirName = suggestedDirName;
} else {
  let counter = 1;
  let autoDirName;
  do {
    autoDirName = `new-posts-${counter}`;
    counter++;
  } while (fs.existsSync(path.join(postsDir, autoDirName)));
  finalDirName = autoDirName;

  if (suggestedDirName) {
    console.log('⚠️  建议的文件夹名无效或已存在:', suggestedDirName);
  }
  console.log(`📁 将使用默认名称: ${finalDirName}`);
  console.log('');
}

const newPostDir = path.join(postsDir, finalDirName);
const readmePath = path.join(newPostDir, 'README.md');

fs.mkdirSync(newPostDir, { recursive: true });

const readmeContent = `---
title: ${title}
date: ${date}
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

console.log('✅ 文章创建成功！');
console.log(`📁 路径: ${readmePath}`);
console.log(`📝 标题: ${title}`);
console.log(`📅 日期: ${date}`);
console.log('');
console.log('现在你可以开始编辑文章内容了！');
