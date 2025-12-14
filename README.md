# Serenade - AI 驱动的动静结合博客系统

**Serenade** 源自意大利语 _serenata_，意为在夜晚吟唱的歌谣。

为什么我要取这么优雅的名字就是因为这个程序是动静结合的，我觉得非常美妙，动次哒次，是不是就是一首歌的开头了呢？至于为什么是夜谣，大概就是晚上想到的吧。

✨ **现已集成 AI 能力**：智能生成 URL、自动创建配图，让内容创作更高效！

---

## ✨ 核心特性

### 📝 内容管理

- **Markdown 文章** - Hexo 风格格式，支持快速迁移与历史文章导入
- **专栏系统** - VuePress 风格组织系列文章，支持章节结构与目录导航
- **标签分类** - 多维度标签管理，快速定位与筛选内容
- **全文搜索** - 关键词智能搜索，支持高亮显示与模糊匹配
- **数学公式** - 集成 KaTeX，完美渲染 LaTeX 数学表达式

### 🤖 AI 辅助

- **智能 URL 生成** - AI 自动生成符合 kebab-case 规范的文章路径
- **AI 配图生成** - 基于标题自动生成精美配图

### 🎨 界面体验

- **暗黑模式** - 深色/浅色主题自动切换，适配系统偏好
- **响应式设计** - 完美适配桌面、平板和移动端
- **现代化 UI** - 基于 TailwindCSS 构建的精美界面
- **项目展示** - 精美的作品展示页，支持分页加载与随机排序

### ⚡ 性能与扩展

- **高性能** - 基于 Nuxt 4 的 SSR 与 SSG，极速加载
- **友链展示** - 精美的友链卡片设计
- **社交统计** - GitHub 贡献图谱等可视化数据
- **可扩展性** - 模块化架构，易于定制与二次开发

---

## 🛠️ 技术栈

| 领域         | 技术选型                                        |
| ------------ | ----------------------------------------------- |
| **核心框架** | [Nuxt 4](https://nuxt.com/) - Vue 3 全栈框架    |
| **前端框架** | Vue 3 + Composition API                         |
| **样式方案** | [TailwindCSS](https://tailwindcss.com/)         |
| **Markdown** | [marked](https://marked.js.org/) - 高性能解析器 |
| **数学公式** | [KaTeX](https://katex.org/) - 快速 LaTeX 渲染   |
| **日期处理** | date-fns / dayjs                                |
| **构建工具** | Vite                                            |
| **部署方案** | 支持静态生成与服务端部署                        |

---

## 📦 项目结构

```
serenade/
├── 📁 app/                # 应用主目录
│   ├── 📁 assets/         # 静态资源
│   │   └── css/          # 样式文件
│   ├── 📁 components/    # Vue 组件库
│   │   ├── columns/      # 专栏相关组件
│   │   ├── friends/      # 友链组件
│   │   ├── post/         # 文章相关组件
│   │   └── projects/     # 项目展示组件
│   ├── 📁 composables/   # Vue 组合式 API
│   │   ├── useApiFetch.js     # API 调用封装
│   │   ├── useDarkMode.js     # 暗黑模式管理
│   │   ├── useGroupBy.js      # 数据分组工具
│   │   ├── useSearch.js       # 搜索功能
│   │   └── useSearchApi.js    # 搜索 API 封装
│   ├── 📁 data/          # 数据配置
│   │   └── custom-projects.json # 自定义项目信息
│   ├── 📁 layouts/       # Nuxt 布局模板
│   ├── 📁 middleware/    # 中间件
│   ├── 📁 pages/         # 页面路由文件
│   │   ├── columns/      # 专栏页面
│   │   ├── friends/      # 友链页面
│   │   ├── index.vue     # 首页
│   │   ├── moments.vue   # 动态页面
│   │   ├── posts/        # 文章页面
│   │   ├── projects/     # 项目展示页面
│   │   └── tags/         # 标签页面
│   └── 📁 plugins/       # 插件
├── 📁 content/           # 内容存储 (Markdown)
│   ├── columns/          # 专栏文章目录
│   ├── posts/            # 普通文章目录
│   └── projects.json     # 项目数据配置
├── 📁 public/            # 公共资源
├── 📁 scripts/           # 脚本工具
├── 📁 server/            # 服务端 API
│   └── api/              # API 接口实现
├── nuxt.config.ts        # Nuxt 配置文件
├── site.config.ts        # 站点配置
└── package.json          # 项目依赖清单
```

---

## 🚀 快速开始

### 1️⃣ 安装依赖

```bash
# 使用 npm
npm install

# 或使用 yarn
yarn install

# 或使用 pnpm (推荐)
pnpm install
```

### 2️⃣ 启动开发服务器

```bash
npm run dev
```

浏览器访问 [http://localhost:3000](http://localhost:3000)

### 3️⃣ 构建生产版本

```bash
npm run build
```

### 4️⃣ 预览生产版本

```bash
npm run preview
```

### 5️⃣ 生成静态站点

```bash
npm run generate
```

---

## 📝 内容编写指南

### 文章创建规范

#### 1️⃣ 普通文章

在 `content/posts/` 目录下创建 Markdown 文件：

```yaml
---
title: 文章标题
date: 2024-01-01
tags: ["前端", "Vue", "Nuxt"]
description: 文章摘要描述
cover: /images/posts/cover.jpg  # 可选：封面图
---

# 正文内容

这里是文章正文，支持 **Markdown** 语法。

## 代码高亮

`const message = "Hello, Serenade!";`

- 第一项
- 第二项
  - 子项
  - 子项

```

#### 2️⃣ 专栏文章

在 `content/columns/<专栏名>/` 目录下创建系列文章：

```yaml
---
title: 第1章：初探门径
order: 1 # 文章顺序
---
# 第1章内容

系列文章的第一章内容...
```

#### 3️⃣ 数学公式支持

使用 `$...$` 或 `$$...$$` 包裹 LaTeX 公式：

```latex
# 行内公式
这是一行文字，包含爱因斯坦的著名公式 $E = mc^2$。

# 区块公式
毕达哥拉斯定理：
$$
a^2 + b^2 = c^2
$$

# 复杂公式
欧拉公式（数学中最美的公式之一）：
$$
e^{i\pi} + 1 = 0
$$
```

#### 4️⃣ 项目数据配置

在 `content/projects.json` 中配置项目信息：

```json
{
  "categories": {
    "typecho": {
      "name": "Typecho",
      "icon": "🎯",
      "projects": [
        {
          "name": "lanstar",
          "description": "一款三栏、清新、个性的 typecho 主题",
          "cover": "/assets/posts/lanstar/cover.jpg",
          "link": "https://github.com/dyedd/lanstar",
          "techStack": ["PHP", "HTML", "CSS", "JavaScript"],
          "date": "2020-08-20"
        }
      ]
    }
  }
}
```

---

## 🛠️ 脚本工具使用

项目提供了一系列便捷的脚本工具，帮助您快速创建和管理内容。

### 📝 创建新文章

使用 AI 辅助创建文章，自动生成 URL 路径和配图：

```bash
npm run new:post
```

**功能特性：**

- 交互式输入文章标题
- 可选：自定义 URL 路径
- 可选：使用 AI 生成符合规范的 URL 路径
- 可选：使用 AI 生成文章配图
- 自动创建文章目录和 README.md 模板

**使用示例：**

```bash
# 运行命令
npm run new:post

# 输入标题
📝 请输入文章标题: Vue3响应式原理深入解析

# 选择是否使用AI生成URL
🤖 是否使用AI生成URL路径？ (y/n): y
✨ AI建议的URL: vue3-reactivity-deep-dive

# 选择是否生成配图（需配置 IMAGE_API_KEY）
🎨 是否生成AI配图？ (y/n): y
```

### 📚 创建新专栏

创建专栏系列文章：

```bash
npm run new:column
```

**功能特性：**

- 输入专栏标题和描述
- AI 辅助生成 URL 路径
- 可选生成专栏封面图
- 自动创建专栏目录结构

### 🚀 同步到服务器

将内容同步到远程服务器，支持多种同步模式：

```bash
npm run sync
```

**交互式菜单：**

```
请选择同步模式：
1. 同步内容 (content)
2. 同步构建产物 (.output)
3. 同步全部
4. 同步指定文章 (post)
5. 同步指定专栏 (column)
6. 同步JSON文件 (json)
```

**功能说明：**

1. **同步内容** - 同步所有文章和专栏

   - 自动为新文章添加时间戳（首次同步时）
   - 已有时间戳的文章保持不变

2. **同步构建产物** - 同步 `.output` 目录

3. **同步全部** - 同步内容 + 构建产物

4. **同步指定文章** - 只同步单个文章

   ```bash
   # 交互式输入
   请输入文章URL名称: vue3-reactivity-deep-dive
   ```

5. **同步指定专栏** - 只同步单个专栏

   ```bash
   # 交互式输入
   请输入专栏URL名称: my-column-name
   ```

6. **同步 JSON 文件** - 同步 `friends.json` 或 `projects.json`
   ```bash
   # 交互式输入
   请输入文件名: friends.json
   ```

**跨平台支持：**

- **Windows**: 自动使用 `scp` 命令（Windows 10/11 自带）
- **Linux/Mac**: 自动使用 `rsync` 命令（支持增量同步）

### ⚙️ 环境配置

在项目根目录创建 `.env` 文件（参考 `.env.example`）：

```bash
# OpenAI API (用于生成URL)
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_MODEL=gpt-4o-mini

# Image Generation API (用于生成配图，可选)
IMAGE_API_KEY=your_image_api_key_here
IMAGE_BASE_URL=https://ark.cn-beijing.volces.com/api/v3
IMAGE_MODEL=doubao-seedream

# Server Configuration (用于同步文件到服务器)
SERVER_HOST=your_server_ip_or_domain
SERVER_USER=root
SERVER_PATH=/path/to/your/blog
```

**配置说明：**

- `OPENAI_API_KEY` - 必需，用于 AI 生成 URL 路径
- `IMAGE_API_KEY` - 可选，用于 AI 生成配图
- `SERVER_*` - 必需（使用同步功能时），服务器连接信息

---

## 🎨 自定义配置

### 站点信息配置

编辑 `site.config` 文件自定义站点：

```javascript
export default {
  title: "Serenade - 个人博客",
  description: "技术与思考的结晶",
  author: "Your Name",
  url: "https://yoursite.com",
  social: {
    github: "https://github.com/username",
  },
};
```

### 样式定制指南

#### 🎨 色彩主题

在 `assets/css/main.css` 中修改全局样式：

```css
:root {
  --primary-color: #3b82f6;
  --secondary-color: #8b5cf6;
}

.dark {
  --primary-color: #60a5fa;
  --secondary-color: #a78bfa;
}
```

---

## 🔌 API 接口文档

`server/api/` 目录包含所有服务端接口：

### 文章相关

- **`/api/posts`** - 获取文章列表

  - 参数：`page`, `pageSize`, `category`, `tag`

- **`/api/posts/[path]`** - 获取单篇文章

  - 参数：`path` (文章路径)

- **`/api/posts/search`** - 搜索文章
  - 参数：`q` (搜索关键词)

### 项目相关

- **`/api/projects`** - 获取所有项目（分页）

  - 参数：`page`, `pageSize` (默认 3)

- **`/api/projects/categories`** - 获取项目分类
  - 参数：`category` (可选，获取特定分类)

### 其他接口

- **`/api/columns`** - 专栏列表
- **`/api/friends`** - 友链数据
- **`/api/tags`** - 标签云
- **`/api/tags/[name]`** - 标签下的文章

---

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

### 开发流程

1. Fork 本项目
2. 创建特性分支：`git checkout -b feature/new-feature`
3. 提交更改：`git commit -am 'feat: 添加新功能'`
4. 推送分支：`git push origin feature/new-feature`
5. 创建 Pull Request

---

## 📄 开源协议

本项目基于 [MIT License](LICENSE) 开源协议。

---

## 🙏 致谢

感谢以下优秀的开源项目：

- [Nuxt 3](https://nuxt.com/) - Vue 3 全栈框架
- [Vue.js](https://vuejs.org/) - 渐进式 JavaScript 框架
- [TailwindCSS](https://tailwindcss.com/) - 实用优先的 CSS 框架
- [KaTeX](https://katex.org/) - 快速的数学公式渲染器
- [marked](https://marked.js.org/) - 高性能 Markdown 解析器

---

**⭐ 如果这个项目对你有帮助，欢迎给我一个 Star！**
