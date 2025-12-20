import path from 'path';

const API_KEY = process.env.OPENAI_API_KEY;
const BASE_URL = process.env.OPENAI_BASE_URL || 'https://aiping.cn/api/v1';
const MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

const IMAGE_API_KEY = process.env.IMAGE_API_KEY;
const IMAGE_BASE_URL = process.env.IMAGE_BASE_URL || 'https://aiping.cn/api/v1';
const IMAGE_MODEL = process.env.IMAGE_MODEL || 'Doubao-Seedream-4.5';

function normalizeCoverKindByTargetPath(targetPath) {
  if (typeof targetPath !== 'string') {
    return 'post';
  } else if (!targetPath) {
    return 'post';
  } else {
    const normalizedPath = path.normalize(targetPath);
    const segments = normalizedPath.split(path.sep).map(segment => segment.toLowerCase());

    if (segments.includes('columns')) {
      return 'column';
    } else if (segments.includes('posts')) {
      return 'post';
    } else {
      return 'post';
    }
  }
}

function getCoverAspectHint(coverKind) {
  if (coverKind === 'column') {
    return {
      kind: 'column',
      layoutHint: '9:16 竖图（portrait）',
      promptSuffix: 'aspect ratio 9:16, portrait, vertical composition, clean safe area for title',
    };
  } else if (coverKind === 'post') {
    return {
      kind: 'post',
      layoutHint: '16:9 横图（landscape）',
      promptSuffix: 'aspect ratio 16:9, landscape, wide composition, clean safe area for title',
    };
  } else {
    return {
      kind: 'post',
      layoutHint: '16:9 横图（landscape）',
      promptSuffix: 'aspect ratio 16:9, landscape, wide composition, clean safe area for title',
    };
  }
}

function appendPromptSuffix(prompt, suffix) {
  const normalizedPrompt = String(prompt || '').trim();
  const normalizedSuffix = String(suffix || '').trim();

  if (!normalizedPrompt && !normalizedSuffix) {
    return '';
  } else if (!normalizedPrompt) {
    return normalizedSuffix;
  } else if (!normalizedSuffix) {
    return normalizedPrompt;
  } else if (normalizedPrompt.includes(normalizedSuffix)) {
    return normalizedPrompt;
  } else {
    return `${normalizedPrompt}, ${normalizedSuffix}`;
  }
}

/**
 * 调用AI生成URL路径
 */
async function generateUrlWithAI(title) {
  if (!API_KEY) {
    console.error('❌ 错误：未找到API密钥');
    console.log('请在项目根目录创建 .env 文件，并配置 OPENAI_API_KEY');
    console.log('参考 .env.example 文件');
    return null;
  }

  const prompt = `你是一个URL生成助手。基于以下博客内容的URL命名规律，为新标题生成一个合适的URL路径。

## URL命名规律总结

### 核心规则：
1. **格式风格**：主要使用kebab-case（小写字母+短横线分隔）
   - 示例：django-jwt-login, axios-cancel-request-js, vue3-reactivity-deep-dive

2. **中文转英文**：将中文标题转换为简洁、有意义的英文关键词
   - "Django实现jwt方式登录" → django-jwt-login
   - "使用axios取消请求" → axios-cancel-request-js
   - "2024年总结" → 2024summary

3. **技术术语保留**：技术相关词汇保留英文缩写或原名
   - 常见技术词：js, vue, react, django, python, c, cpp, rust, docker, git, jwt, api
   - 示例：django-vue-403-solution, intel-arc-wsl-oneapi-guide

4. **特殊字符处理**：删除所有特殊符号和表情符号
   - "2024年总结🤔" → 2024summary

5. **长度要求**：简洁但有描述性，通常2-6个单词
   - 避免过长：✗ how-to-implement-user-authentication-system-in-django-with-jwt
   - 合适长度：✓ django-jwt-auth

6. **数字处理**：年份、版本号可以保留
   - 2024summary, vue3-composition-api, python-3-12-features

### 真实示例参考：
- "Django实现jwt方式登录" → django-jwt-login
- "使用axios取消请求 - 原生JavaScript" → axios-cancel-request-js
- "2024年总结" → 2024summary
- "CSS常见单位" → css-common-units
- "C++中的vector用法" → cpp-vector-usage
- "LeetCode 509 斐波那契数" → leetcode-509-fibonacci

### 重要提醒：
- 不要过度翻译，保持技术词汇原样
- 不要添加无意义的词（如：article, post, blog）
- 保持一致性风格

---

现在请为以下标题生成URL路径：
标题："${title}"

要求：
1. 只返回URL路径本身，不要任何解释
2. 使用kebab-case格式
3. 保持简洁有意义
4. 技术词保留原样`;

  try {
    const response = await fetch(`${BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          {
            role: 'system',
            content: '你是一个URL生成专家，擅长根据文章标题生成简洁、有意义、符合规范的URL路径。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`API请求失败: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const suggestedUrl = data.choices[0].message.content.trim();

    return suggestedUrl;
  } catch (error) {
    console.error('❌ AI生成URL失败:', error.message);
    return null;
  }
}

/**
 * 生成配图
 */
async function generateImageWithAI(title, targetPath) {
  if (!IMAGE_API_KEY) {
    return null;
  }

  const coverKind = normalizeCoverKindByTargetPath(targetPath);
  const coverAspect = getCoverAspectHint(coverKind);

  try {
    // 先用 OpenAI 生成图片描述
    let imagePrompt;

    if (API_KEY) {
      console.log('🤔 分析标题，生成配图描述...');
      const response = await fetch(`${BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [
            {
              role: 'system',
              content: '你是一个图片描述生成专家。根据博客文章标题，生成适合作为配图的详细描述。描述要具体、视觉化，符合技术博客风格。'
            },
            {
              role: 'user',
              content: `请为标题"${title}"生成一个配图的详细描述。要求：
1. 提取标题中的关键技术词汇和主题
2. 描述要具体、有画面感
3. 风格：现代、简约、专业
4. 色彩：柔和、舒适
5. 构图比例：${coverAspect.layoutHint}
6. 只返回图片描述本身，不要解释

示例：
标题："Vue3响应式原理深入解析"
描述：A modern tech illustration showing Vue.js logo with flowing reactive data streams, abstract nodes connecting in a network pattern, soft gradient background in green and blue tones, minimalist style, clean composition, aspect ratio 16:9, landscape

现在请为"${title}"生成描述：`
            }
          ],
        })
      });

      if (response.ok) {
        const data = await response.json();
        imagePrompt = data.choices[0].message.content.trim();
        console.log(`📝 配图描述: ${imagePrompt}`);
      } else {
        imagePrompt = `Blog cover image for "${title}", modern minimalist style, soft colors, tech-themed`;
      }
    } else {
      imagePrompt = `Blog cover image for "${title}", modern minimalist style, soft colors, tech-themed`;
    }

    imagePrompt = appendPromptSuffix(imagePrompt, coverAspect.promptSuffix);

    console.log('🎨 开始生成图片...');
    const response = await fetch(`${IMAGE_BASE_URL}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${IMAGE_API_KEY}`
      },
      body: JSON.stringify({
        model: IMAGE_MODEL,
        input: {
          prompt: imagePrompt,
        },
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`图片生成API请求失败: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const imageUrl = data.data[0].url;

    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error('下载图片失败');
    }

    const buffer = await imageResponse.arrayBuffer();
    const fs = await import('fs');
    fs.writeFileSync(targetPath, Buffer.from(buffer));

    return true;
  } catch (error) {
    console.error('❌ AI生成配图失败:', error.message);
    return null;
  }
}

export { generateImageWithAI, generateUrlWithAI };

