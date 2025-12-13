const API_KEY = process.env.OPENAI_API_KEY;
const BASE_URL = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1';
const MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

/**
 * 调用AI生成URL路径
 */
async function generateUrlWithAI(title, type = 'posts') {
  if (!API_KEY) {
    console.error('❌ 错误：未找到API密钥');
    console.log('请在项目根目录创建 .env 文件，并配置 OPENAI_API_KEY');
    console.log('参考 .env.example 文件');
    return null;
  }

  const typeText = type === 'posts' ? '文章' : '专栏';

  const prompt = `你是一个URL生成助手。基于以下博客${typeText}的URL命名规律，为新标题生成一个合适的URL路径。

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
        temperature: 0.3,
        max_tokens: 100
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

export { generateUrlWithAI };

