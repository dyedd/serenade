# 使用说明

## 创建新文章

直接运行：

```bash
node scripts/new-post.js
```

或者带标题：

```bash
node scripts/new-post.js "文章标题"
```

脚本会问你要不要用 AI 生成 URL，如果不用就手动输入一个。

文章会创建在 `content/posts/{url}/README.md`

## 创建新专栏

```bash
node scripts/new-column.js
```

或者：

```bash
node scripts/new-column.js "专栏标题" "专栏描述"
```

专栏会创建在 `content/columns/{url}/README.md`

## AI 生成 URL

如果想用 AI 自动生成 URL，需要先配置 OpenAI API Key。

在项目根目录复制 `.env.example` 为 `.env`，然后填入：

```env
OPENAI_API_KEY=你的key
```

AI 会把中文标题转成英文 URL，比如：

- "Django 实现 jwt 方式登录" → `django-jwt-login`
- "2024 年总结" → `2024summary`

不想用 AI 就直接手动输入 URL 就行。
