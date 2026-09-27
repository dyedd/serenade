import { createPost } from './new-post.js';
import { syncContentCommand } from './sync.js';

const usage = `用法:
  pnpm cli post [标题] [选项]
    --slug <slug>         直接指定 URL slug
    --no-ai               不询问 AI slug，改为手动输入
    --no-cover            跳过 AI 封面询问
  pnpm cli sync            同步内容（可交互）
  pnpm cli sync content    同步整个 content/
  pnpm cli sync post <url> 同步一篇文章
  pnpm cli sync json <friends.json|projects.json|collections.json>
`;

const [command, ...rest] = process.argv.slice(2);

if (!command || command === 'help' || command === '--help' || command === '-h') {
  console.log(usage.trim());
  process.exit(command ? 0 : 1);
}

if (command === 'post') {
  await createPost(rest);
} else if (command === 'sync') {
  await syncContentCommand(rest);
} else {
  console.error(`未知命令: ${command}`);
  console.log(usage.trim());
  process.exit(1);
}
