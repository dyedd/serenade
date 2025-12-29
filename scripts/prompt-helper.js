import readline from 'readline';

/**
 * 创建readline接口
 */
function createInterface() {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
}

/**
 * 询问问题并获取用户输入
 */
function question(rl, query) {
  return new Promise(resolve => {
    rl.question(query, answer => {
      resolve(answer.trim());
    });
  });
}

/**
 * 询问是/否问题
 */
async function confirmQuestion(rl, query) {
  const prompt = `${query} (Y/n，回车默认 Y): `;

  while (true) {
    const answer = await question(rl, prompt);
    const normalized = answer.toLowerCase();

    if (normalized.length === 0) {
      return true;
    } else if (normalized === 'y' || normalized === 'yes') {
      return true;
    } else if (normalized === 'n' || normalized === 'no') {
      return false;
    } else {
      console.log('⚠️ 输入无效，请输入 y 或 n（回车默认 Y）');
    }
  }
}

/**
 * 验证URL是否安全（只检查安全性，不限制格式）
 */
function isSafeUrl(url) {
  if (!url || url.length === 0) {
    return { valid: false, reason: 'URL不能为空' };
  }

  if (url.includes('..') || url.includes('/') || url.includes('\\')) {
    return { valid: false, reason: 'URL不能包含路径遍历字符（.. / \\）' };
  }

  if (url.includes('\0') || url.includes('\n') || url.includes('\r')) {
    return { valid: false, reason: 'URL不能包含控制字符' };
  }

  const dangerousChars = ['<', '>', ':', '"', '|', '?', '*'];
  for (const char of dangerousChars) {
    if (url.includes(char)) {
      return { valid: false, reason: `URL不能包含特殊字符：${char}` };
    }
  }

  return { valid: true };
}

export {
  createInterface,
  question,
  confirmQuestion,
  isSafeUrl
};
