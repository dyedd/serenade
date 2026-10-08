#!/usr/bin/env node
import readline from 'node:readline';

try {
  process.loadEnvFile();
} catch (error) {
  if (error?.code !== 'ENOENT') throw error;
}

const { createPost } = await import('./new-post.js');
const { syncContentCommand } = await import('./sync.js');

const menuItems = [
  { key: '1', action: 'post', label: '创建文章', desc: '创建 Markdown 文章骨架' },
  { key: '2', action: 'sync-content', label: '同步全部内容', desc: '将 content/ 同步到服务器' },
  { key: '3', action: 'sync-post', label: '同步指定文章', desc: '只同步一篇文章' },
  { key: '4', action: 'sync-json', label: '同步 JSON 文件', desc: '同步 friends、projects 或 collections' },
  { key: '5', action: 'help', label: '查看命令帮助', desc: '查看命令模式和参数' },
  { key: '6', action: 'exit', label: '退出', desc: '退出 Serenade CLI' },
];

const usage = `用法:
  pnpm cli                          打开交互菜单
  pnpm cli post [标题] [选项]        创建文章
    --slug <slug>                   指定 URL slug
    --no-ai                         不生成 AI slug
    --no-cover                      不生成 AI 封面
  pnpm cli sync                     打开同步菜单
  pnpm cli sync content             同步整个 content/
  pnpm cli sync post <slug>         同步一篇文章
  pnpm cli sync json <file>         同步一个 JSON 文件
  pnpm cli help                     显示帮助`;

const printHelp = () => console.log(usage);
const ask = async (prompt) => {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const answer = await new Promise((resolve) => rl.question(prompt, resolve));
  rl.close();
  return answer.trim();
};

const ansi = {
  reset: '\u001b[0m',
  dim: '\u001b[2m',
  cyan: '\u001b[36m',
  white: '\u001b[97m',
  bgCyan: '\u001b[46m',
};

const write = (value) => process.stdout.write(value);
const enterTui = () => write('\u001b[?1049h\u001b[2J\u001b[H\u001b[?25l\u001b[?1000h\u001b[?1006h');
const leaveTui = () => write(`${ansi.reset}\u001b[?25h\u001b[?1006l\u001b[?1000l\u001b[?1049l`);
const terminalWidth = () => Math.max(60, process.stdout.columns || 80);
const ansiPattern = /\u001b\[[0-?]*[ -/]*[@-~]/g;
const wideCharacterPattern = /[\u1100-\u115f\u2329\u232a\u2e80-\u303e\u3040-\ua4cf\uac00-\ud7a3\uf900-\ufaff\ufe10-\ufe19\ufe30-\ufe6f\uff00-\uff60\uffe0-\uffe6]/u;

const displayWidth = (value) =>
  [...String(value).replace(ansiPattern, '')].reduce((width, character) => {
    if (/\p{Mark}/u.test(character) || /[\u0000-\u001f\u007f]/u.test(character)) return width;
    return width + (wideCharacterPattern.test(character) ? 2 : 1);
  }, 0);

const padToWidth = (value, width) => `${value}${' '.repeat(Math.max(0, width - displayWidth(value)))}`;

const renderTui = (selected, status = '就绪') => {
  const width = terminalWidth();
  const compact = width < 86;
  const current = menuItems[selected];
  const lines = [
    `${ansi.cyan}SERENADE${ansi.reset} ${ansi.dim}/ CONTENT WORKSPACE${ansi.reset}`,
    `${ansi.dim}${'─'.repeat(Math.min(width, 96))}${ansi.reset}`,
    '',
  ];

  if (compact) {
    lines.push(`${ansi.white}功能${ansi.reset}`);
    menuItems.forEach((item, index) => {
      const label = `${item.key}  ${item.label}`;
      lines.push(
        index === selected
          ? `${ansi.bgCyan}${ansi.white} ❯ ${label} ${ansi.reset}`
          : `   ${label}`,
      );
    });
    lines.push('', `${ansi.dim}${current.desc}${ansi.reset}`);
  } else {
    const navWidth = 28;
    const detailWidth = width - navWidth - 7;
    const divider = `${ansi.dim}│${ansi.reset}`;
    lines.push(`${padToWidth(`${ansi.white}功能${ansi.reset}`, navWidth)}${divider} ${ansi.white}当前操作${ansi.reset}`);
    lines.push(`${ansi.dim}${'─'.repeat(navWidth)}┼${'─'.repeat(Math.max(20, detailWidth))}${ansi.reset}`);
    menuItems.forEach((item, index) => {
      const marker = index === selected ? `${ansi.cyan}❯${ansi.reset}` : ' ';
      const label = `${marker} ${item.key}  ${item.label}`;
      lines.push(`${padToWidth(label, navWidth)}${divider} ${index === selected ? item.desc : ''}`);
    });
    lines.push('', `${ansi.dim}选中${ansi.reset}  ${ansi.cyan}${current.label}${ansi.reset}`);
  }

  lines.push(
    '',
    `${ansi.dim}状态${ansi.reset}  ${status}`,
    `${ansi.dim}${'─'.repeat(Math.min(width, 96))}${ansi.reset}`,
    `${ansi.dim}↑↓ / j k${ansi.reset} 选择   ${ansi.dim}Enter${ansi.reset} 执行   ${ansi.dim}1-6${ansi.reset} 跳转   ${ansi.dim}q / Esc${ansi.reset} 退出`,
  );
  write(`\u001b[2J\u001b[H${lines.join('\n')}${ansi.reset}`);
};

const runMenuAction = async (action) => {
  if (action === 'post') await createPost([]);
  else if (action === 'sync-content') await syncContentCommand(['content']);
  else if (action === 'sync-post') {
    const slug = await ask('请输入文章 slug: ');
    if (slug) await syncContentCommand(['post', slug]);
  } else if (action === 'sync-json') {
    const file = await ask('请输入 JSON 文件名: ');
    if (file) await syncContentCommand(['json', file]);
  } else if (action === 'help') printHelp();
};

const runInteractive = async () => {
  if (!process.stdin.isTTY || !process.stdout.isTTY) return printHelp();
  enterTui();
  process.stdin.setRawMode(true);
  process.stdin.resume();
  let selected = 0;
  let busy = false;

  const finish = () => {
    if (escapeTimer) clearTimeout(escapeTimer);
    process.stdin.setRawMode(false);
    process.stdin.pause();
    process.stdin.removeListener('data', onInput);
    process.stdout.removeListener('resize', onResize);
    leaveTui();
    process.exit(0);
  };

  const runAction = async (action) => {
    busy = true;
    process.stdin.removeListener('data', onInput);
    process.stdin.setRawMode(false);
    process.stdin.resume();
    leaveTui();
    try {
      await runMenuAction(action);
    } finally {
      process.stdin.pause();
      enterTui();
      if (process.stdin.isTTY) {
        process.stdin.setRawMode(true);
        process.stdin.resume();
        process.stdin.on('data', onInput);
      }
      busy = false;
      renderTui(selected);
    }
  };

  const select = (index) => {
    if (index < 0 || index >= menuItems.length) return;
    selected = index;
    renderTui(selected);
  };

  const activate = () => {
    const { action } = menuItems[selected];
    if (action === 'exit') return finish();
    void runAction(action);
  };

  const handleKey = (key) => {
    if (busy) return;
    const numberIndex = Number(key) - 1;
    if (Number.isInteger(numberIndex) && numberIndex >= 0 && numberIndex < menuItems.length) {
      select(numberIndex);
    } else if (key === 'up' || key === 'k') {
      select((selected + menuItems.length - 1) % menuItems.length);
    } else if (key === 'down' || key === 'j') {
      select((selected + 1) % menuItems.length);
    } else if (key === 'q' || key === 'escape' || key === 'ctrl-c') {
      finish();
    } else if (key === 'return') {
      activate();
    }
  };

  let inputBuffer = '';
  let escapeTimer;
  const onInput = (chunk) => {
    if (escapeTimer) {
      clearTimeout(escapeTimer);
      escapeTimer = undefined;
    }
    inputBuffer += chunk.toString('utf8');
    while (inputBuffer) {
      const mouseMatch = inputBuffer.match(/^\u001b\[<([0-9]+);([0-9]+);([0-9]+)([mM])/);
      if (mouseMatch) {
        inputBuffer = inputBuffer.slice(mouseMatch[0].length);
        const [, button, , row, event] = mouseMatch;
        if (button === '0' && (event === 'M' || event === 'm')) {
          // 菜单顶部行数随布局变化，SGR 行号从 1 开始。
          const menuStartRow = terminalWidth() < 86 ? 4 : 6;
          const index = Number(row) - menuStartRow;
          select(index);
          if (event === 'm' && index >= 0 && index < menuItems.length) activate();
        }
        continue;
      }

      if (inputBuffer.startsWith('\u001b[<') || inputBuffer === '\u001b[') break;

      if (inputBuffer.startsWith('\u001b[A')) {
        inputBuffer = inputBuffer.slice(3);
        handleKey('up');
      } else if (inputBuffer.startsWith('\u001b[B')) {
        inputBuffer = inputBuffer.slice(3);
        handleKey('down');
      } else if (inputBuffer.startsWith('\u001b')) {
        if (inputBuffer.length === 1) {
          escapeTimer = setTimeout(() => {
            inputBuffer = '';
            handleKey('escape');
          }, 50);
          break;
        }
        // 一次消费完整的转义序列，避免残留前缀吞掉下一个按键。
        const sequence = inputBuffer.match(/^\u001b(\[[0-9;]*[A-Za-z~]|O[A-Za-z])/);
        inputBuffer = inputBuffer.slice(sequence ? sequence[0].length : 1);
        if (!sequence) handleKey('escape');
      } else {
        const character = inputBuffer[0];
        inputBuffer = inputBuffer.slice(1);
        handleKey(character === '\u0003' ? 'ctrl-c' : character === '\r' ? 'return' : character);
      }
    }
    if (inputBuffer.length > 256) inputBuffer = inputBuffer.slice(-32);
  };

  const onResize = () => {
    if (!busy) renderTui(selected);
  };

  process.stdin.on('data', onInput);
  process.stdout.on('resize', onResize);
  renderTui(selected);
};

const main = async (args = process.argv.slice(2)) => {
  const [command, ...rest] = args;
  if (!command) await runInteractive();
  else if (command === 'post') await createPost(rest);
  else if (command === 'sync') await syncContentCommand(rest);
  else if (command === 'help' || command === '--help' || command === '-h') printHelp();
  else {
    console.error(`未知命令: ${command}\n`);
    printHelp();
    process.exitCode = 1;
  }
};

await main();
