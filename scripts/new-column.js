import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const args = process.argv.slice(2);
if (args.length < 2) {
  console.error('❌ 错误：请提供专栏标题和描述');
  console.log('用法: node scripts/new-column.js "专栏标题" "专栏描述"');
  process.exit(1);
}

const title = args[0];
const description = args[1];

const columnsDir = path.join(__dirname, '..', 'content', 'columns');

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
  !fs.existsSync(path.join(columnsDir, suggestedDirName));

let finalDirName;

if (isValidDirName) {
  finalDirName = suggestedDirName;
} else {
  let counter = 1;
  let autoDirName;
  do {
    autoDirName = `new-columns-${counter}`;
    counter++;
  } while (fs.existsSync(path.join(columnsDir, autoDirName)));
  finalDirName = autoDirName;

  if (suggestedDirName) {
    console.log('⚠️  建议的文件夹名无效或已存在:', suggestedDirName);
  }
  console.log(`📁 将使用默认名称: ${finalDirName}`);
  console.log('');
}

const newColumnDir = path.join(columnsDir, finalDirName);
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

console.log('✅ 专栏创建成功！');
console.log(`📁 路径: ${readmePath}`);
console.log(`📝 标题: ${title}`);
console.log(`📄 描述: ${description}`);
console.log('');
console.log('现在你可以开始向这个专栏中添加文章了！');
