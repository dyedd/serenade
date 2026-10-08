import readline from 'readline';
import { normalizeSlug, slugRuleHint } from './front-matter.js';

const createInterface = () =>
  readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

const question = (rl, query) =>
  new Promise((resolve) => {
    rl.question(query, (answer) => {
      resolve(answer.trim());
    });
  });

const closeInterface = (rl) => {
  if (rl && typeof rl.close === 'function') {
    rl.close();
  }
};

const exitWithError = (message, { rl = null, usage = null } = {}) => {
  console.error(message);

  if (usage) {
    console.log(usage);
  }

  closeInterface(rl);
  process.exit(1);
};

const exitIfFailed = (success) => {
  if (!success) {
    process.exit(1);
  }
};

const finishCliAction = (rl, success) => {
  closeInterface(rl);
  exitIfFailed(success);
};

const promptRequired = async (rl, prompt, emptyMessage) => {
  const value = await question(rl, prompt);

  if (!value) {
    exitWithError(emptyMessage, { rl });
  }

  return value;
};

const normalizeYesNoAnswer = (answer) => {
  const normalized = String(answer ?? '').trim().toLowerCase();

  if (normalized.length === 0 || normalized === 'y' || normalized === 'yes') {
    return true;
  }

  if (normalized === 'n' || normalized === 'no') {
    return false;
  }

  return null;
};

const confirmQuestion = async (rl, query) => {
  const prompt = `${query} (Y/n，回车默认 Y): `;

  while (true) {
    const answer = await question(rl, prompt);
    const result = normalizeYesNoAnswer(answer);

    if (result !== null) {
      return result;
    }

    console.log('❌ 输入无效，请输入 y 或 n（回车默认 Y）');
  }
};

const isSafeUrl = (url) => {
  const normalizedUrl = String(url ?? '').trim();

  if (normalizedUrl.length === 0) {
    return { valid: false, reason: 'URL不能为空' };
  }

  if (!normalizeSlug(normalizedUrl)) {
    return { valid: false, reason: `URL ${slugRuleHint}` };
  }

  return { valid: true };
};

export {
  createInterface,
  question,
  confirmQuestion,
  isSafeUrl,
  closeInterface,
  exitWithError,
  exitIfFailed,
  finishCliAction,
  promptRequired,
};
