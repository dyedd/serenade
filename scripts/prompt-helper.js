import readline from 'readline';

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

const normalizeYesNoAnswer = (answer) => {
  const normalized = String(answer ?? '').trim().toLowerCase();

  if (normalized.length === 0) {
    return true;
  } else if (normalized === 'y' || normalized === 'yes') {
    return true;
  } else if (normalized === 'n' || normalized === 'no') {
    return false;
  } else {
    return null;
  }
};

const confirmQuestion = async (rl, query) => {
  const prompt = `${query} (Y/n，回车默认 Y): `;

  while (true) {
    const answer = await question(rl, prompt);
    const result = normalizeYesNoAnswer(answer);

    if (result !== null) {
      return result;
    } else {
      console.log('?? 输入无效，请输入 y 或 n（回车默认 Y）');
    }
  }
};

const isSafeUrl = (url) => {
  const normalizedUrl = String(url ?? '').trim();

  if (normalizedUrl.length === 0) {
    return { valid: false, reason: 'URL不能为空' };
  } else {
    const hasTraversal =
      normalizedUrl.includes('..') ||
      normalizedUrl.includes('/') ||
      normalizedUrl.includes('\\');

    if (hasTraversal) {
      return { valid: false, reason: 'URL不能包含路径遍历字符（.. / \\）' };
    } else {
      const hasControlChars =
        normalizedUrl.includes('\0') ||
        normalizedUrl.includes('\n') ||
        normalizedUrl.includes('\r');

      if (hasControlChars) {
        return { valid: false, reason: 'URL不能包含控制字符' };
      } else {
        const dangerousChars = ['<', '>', ':', '"', '|', '?', '*'];
        const invalidChar = dangerousChars.find((char) => normalizedUrl.includes(char));

        if (invalidChar) {
          return { valid: false, reason: `URL不能包含特殊字符：${invalidChar}` };
        } else {
          return { valid: true };
        }
      }
    }
  }
};

export { createInterface, question, confirmQuestion, isSafeUrl };
