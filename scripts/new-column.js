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

const columnsDir = path.join(__dirname, '..', 'content', 'columns');

const toSafeFilename = (rawName) => rawName.replace(/[^a-zA-Z0-9_-]/g, '-');

const isExistingMarkdownFile = (directory, filename) => {
  const fullPath = path.join(directory, `${filename}.md`);
  return fs.existsSync(fullPath);
};

const isExistingDirectory = (directory, name) => {
  const fullPath = path.join(directory, name);
  return fs.existsSync(fullPath);
};

const validateUrlOrLog = (url, directory, { invalidPrefix, existsMessage }) => {
  const safeCheck = isSafeUrl(url);

  if (!safeCheck.valid) {
    console.error(`${invalidPrefix}${safeCheck.reason}`);
    return false;
  } else if (isExistingDirectory(directory, url)) {
    console.error(existsMessage);
    return false;
  } else {
    return true;
  }
};

const validateFilenameOrLog = (directory, filename, existsMessage) => {
  if (isExistingMarkdownFile(directory, filename)) {
    console.error(existsMessage);
    return false;
  } else {
    return true;
  }
};

const promptForUrl = async (rl, directory, options) => {
  const manualUrl = await question(rl, '请手动输入URL路径: ');
  const isValid = validateUrlOrLog(manualUrl, directory, options);

  if (isValid) {
    return manualUrl;
  } else {
    return null;
  }
};

const promptForFilename = async (rl, columnPath, existsMessage) => {
  const manualFilename = await question(rl, '请手动输入文件名: ');
  const safeName = toSafeFilename(manualFilename);
  const isValid = validateFilenameOrLog(columnPath, safeName, existsMessage);

  if (isValid) {
    return safeName;
  } else {
    return null;
  }
};

const resolveColumnUrl = async (rl, title) => {
  const customUrl = await question(rl, '?? 请输入自定义URL路径（直接回车跳过）: ');

  if (customUrl) {
    const isValid = validateUrlOrLog(customUrl, columnsDir, {
      invalidPrefix: '? 错误：',
      existsMessage: `? 错误：URL路径 "${customUrl}" 已存在`,
    });

    if (isValid) {
      console.log(`? 使用自定义URL: ${customUrl}`);
      return { value: customUrl, hadError: false };
    } else {
      return { value: null, hadError: true };
    }
  } else {
    const useAI = await confirmQuestion(rl, '?? 是否使用AI生成URL路径？');

    if (useAI) {
      console.log('?? 正在使用AI生成URL路径...');
      const aiUrl = await generateUrlWithAI(title);

      if (aiUrl) {
        console.log(`? AI建议的URL: ${aiUrl}`);
        const acceptAI = await confirmQuestion(rl, '是否使用此URL？');

        if (acceptAI) {
          if (isExistingDirectory(columnsDir, aiUrl)) {
            console.log(`??  URL路径 "${aiUrl}" 已存在`);
            const manualUrl = await promptForUrl(rl, columnsDir, {
              invalidPrefix: '? ',
              existsMessage: '? URL路径已存在',
            });

            if (manualUrl) {
              return { value: manualUrl, hadError: false };
            } else {
              return { value: null, hadError: true };
            }
          } else {
            return { value: aiUrl, hadError: false };
          }
        } else {
          const manualUrl = await promptForUrl(rl, columnsDir, {
            invalidPrefix: '? ',
            existsMessage: '? URL路径已存在',
          });

          if (manualUrl) {
            return { value: manualUrl, hadError: false };
          } else {
            return { value: null, hadError: true };
          }
        }
      } else {
        console.log('??  AI生成失败');
        const manualUrl = await promptForUrl(rl, columnsDir, {
          invalidPrefix: '? ',
          existsMessage: '? URL路径已存在',
        });

        if (manualUrl) {
          return { value: manualUrl, hadError: false };
        } else {
          return { value: null, hadError: true };
        }
      }
    } else {
      const manualUrl = await promptForUrl(rl, columnsDir, {
        invalidPrefix: '? ',
        existsMessage: '? URL路径已存在',
      });

      if (manualUrl) {
        return { value: manualUrl, hadError: false };
      } else {
        return { value: null, hadError: true };
      }
    }
  }
};

const resolveChapterFilename = async (rl, columnPath, title) => {
  const customFilename = await question(rl, '?? 请输入文件名（不含.md，直接回车跳过）: ');

  if (customFilename) {
    const safeFilename = toSafeFilename(customFilename);
    const isValid = validateFilenameOrLog(
      columnPath,
      safeFilename,
      `? 错误：文件 "${safeFilename}.md" 已存在`
    );

    if (isValid) {
      console.log(`? 使用自定义文件名: ${safeFilename}.md`);
      return { value: safeFilename, hadError: false };
    } else {
      return { value: null, hadError: true };
    }
  } else {
    const useAI = await confirmQuestion(rl, '?? 是否使用AI生成文件名？');

    if (useAI) {
      console.log('?? 正在使用AI生成文件名...');
      const aiFilename = await generateUrlWithAI(title);

      if (aiFilename) {
        console.log(`? AI建议的文件名: ${aiFilename}.md`);
        const acceptAI = await confirmQuestion(rl, '是否使用此文件名？');

        if (acceptAI) {
          if (isExistingMarkdownFile(columnPath, aiFilename)) {
            console.log(`??  文件 "${aiFilename}.md" 已存在`);
            const manualFilename = await promptForFilename(
              rl,
              columnPath,
              '? 文件已存在'
            );

            if (manualFilename) {
              return { value: manualFilename, hadError: false };
            } else {
              return { value: null, hadError: true };
            }
          } else {
            return { value: aiFilename, hadError: false };
          }
        } else {
          const manualFilename = await promptForFilename(
            rl,
            columnPath,
            '? 文件已存在'
          );

          if (manualFilename) {
            return { value: manualFilename, hadError: false };
          } else {
            return { value: null, hadError: true };
          }
        }
      } else {
        console.log('??  AI生成失败');
        const manualFilename = await promptForFilename(
          rl,
          columnPath,
          '? 文件已存在'
        );

        if (manualFilename) {
          return { value: manualFilename, hadError: false };
        } else {
          return { value: null, hadError: true };
        }
      }
    } else {
      const manualFilename = await promptForFilename(
        rl,
        columnPath,
        '? 文件已存在'
      );

      if (manualFilename) {
        return { value: manualFilename, hadError: false };
      } else {
        return { value: null, hadError: true };
      }
    }
  }
};

const getExistingColumns = () => {
  if (!fs.existsSync(columnsDir)) {
    return [];
  } else {
    return fs
      .readdirSync(columnsDir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name);
  }
};

const selectColumn = async (rl) => {
  const columns = getExistingColumns();

  if (columns.length === 0) {
    console.error('? 错误：没有找到任何专栏，请先创建专栏');
    return null;
  } else {
    console.log('\n?? 可用的专栏：');
    columns.forEach((col, index) => {
      const readmePath = path.join(columnsDir, col, 'README.md');
      let title = col;

      if (fs.existsSync(readmePath)) {
        const content = fs.readFileSync(readmePath, 'utf8');
        const titleMatch = content.match(/^title:\s*(.+)$/m);

        if (titleMatch) {
          title = titleMatch[1];
        } else {
          title = col;
        }
      } else {
        title = col;
      }

      console.log(`  ${index + 1}. ${title} (${col})`);
    });

    const answer = await question(rl, '\n请选择专栏（输入序号或专栏路径）: ');

    if (!answer) {
      return null;
    } else {
      const index = parseInt(answer, 10) - 1;

      if (!Number.isNaN(index) && index >= 0 && index < columns.length) {
        return columns[index];
      } else if (columns.includes(answer)) {
        return answer;
      } else {
        console.error('? 错误：无效的选择');
        return null;
      }
    }
  }
};

const createArticle = async (rl) => {
  const title = await question(rl, '?? 请输入章节标题: ');

  if (!title) {
    console.error('? 错误：章节标题不能为空');
    return false;
  } else {
    const columnSlug = await selectColumn(rl);

    if (!columnSlug) {
      return false;
    } else {
      const columnPath = path.join(columnsDir, columnSlug);
      const { value: filename, hadError: filenameHadError } =
        await resolveChapterFilename(rl, columnPath, title);

      if (!filename) {
        if (!filenameHadError) {
          console.error('? 错误：未能确定有效的文件名');
        } else {
          return false;
        }
        return false;
      } else {
        const articlePath = path.join(columnPath, `${filename}.md`);
        const articleContent = `# ${title}\n\n`;

        fs.writeFileSync(articlePath, articleContent, 'utf8');

        console.log('');
        console.log('? 章节创建成功！');
        console.log(`?? 路径: ${articlePath}`);
        console.log(`?? 标题: ${title}`);
        console.log(`?? 文件名: ${filename}.md`);
        console.log(`?? 所属专栏: ${columnSlug}`);

        return true;
      }
    }
  }
};

const maybeGenerateCover = async (rl, title, newColumnDir) => {
  const hasImageAPI = Boolean(process.env.IMAGE_API_KEY);

  if (!hasImageAPI) {
    return false;
  } else {
    console.log('');
    const generateImage = await confirmQuestion(rl, '?? 是否生成AI配图？');

    if (generateImage) {
      console.log('?? 正在生成配图...');
      const imagePath = path.join(newColumnDir, 'cover.png');
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

const createColumn = async (rl) => {
  const title = await question(rl, '?? 请输入专栏标题: ');

  if (!title) {
    console.error('? 错误：专栏标题不能为空');
    return false;
  } else {
    const description = await question(rl, '?? 请输入专栏描述: ');

    if (!description) {
      console.error('? 错误：专栏描述不能为空');
      return false;
    } else {
      const { value: finalUrl, hadError: urlHadError } = await resolveColumnUrl(rl, title);

      if (!finalUrl) {
        if (!urlHadError) {
          console.error('? 错误：未能确定有效的URL路径');
        } else {
          return false;
        }
        return false;
      } else {
        const newColumnDir = path.join(columnsDir, finalUrl);
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

        console.log('');
        console.log('? 专栏创建成功！');
        console.log(`?? 路径: ${readmePath}`);
        console.log(`?? 标题: ${title}`);
        console.log(`?? URL: ${finalUrl}`);
        console.log(`?? 描述: ${description}`);

        await maybeGenerateCover(rl, title, newColumnDir);

        console.log('');
        console.log('现在你可以开始向这个专栏中添加文章了！');

        return true;
      }
    }
  }
};

const runMode = async (rl, modeChoice) => {
  if (modeChoice === '1') {
    console.log('\n?? 专栏创建模式\n');
    const success = await createColumn(rl);

    if (!success) {
      rl.close();
      process.exit(1);
    } else {
      rl.close();
    }
  } else if (modeChoice === '2') {
    console.log('\n?? 章节创建模式\n');
    const success = await createArticle(rl);

    if (!success) {
      rl.close();
      process.exit(1);
    } else {
      rl.close();
    }
  } else {
    console.error('? 无效的选项');
    rl.close();
    process.exit(1);
  }
};

async function main() {
  const rl = createInterface();

  try {
    console.log('请选择操作模式：');
    console.log('  1. 创建新专栏');
    console.log('  2. 创建章节');
    console.log('');

    const modeChoice = await question(rl, '请输入选项（1或2）: ');
    await runMode(rl, modeChoice);
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
