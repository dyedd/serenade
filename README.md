# Serenade · 动静结合的 Markdown 博客与 AI 写作助手

Serenade 是一个基于 Nuxt 的博客 / 知识库 / 朋友圈系统：内容用 Markdown（与少量 JSON）保存，页面可以静态导出，也可以用 Node 运行；同时也提供一套可选的 AI 写作脚手架，用来生成 URL slug 与封面图。

## 动静结合：把「内容」与「发布」分开

很多争论其实都混在一起：要不要服务器、要不要数据库、要不要反复编译。

Serenade 的选择很明确：

- **静**：内容永远是文件（`content/`），不依赖数据库
- **动**：在 Node 运行时读取这些文件，SSR 渲染页面，并提供搜索、RSS 等能力
- **合**：同一套内容结构，既能 `build` 跑服务，也能 `generate` 导出静态

## 两种部署方式

| 你在乎的事 | 静态导出（`nuxt generate`） | Node 运行（`nuxt build`） |
| ---------- | --------------------------- | ------------------------- |
| 服务器     | 不需要（静态托管即可）      | 需要（Node 进程）         |
| 数据库     | 不需要                      | 不需要                    |
| 内容更新   | 重新 generate               | 同步 `content/` 即可      |
| 运行时能力 | 受限                        | 完整                      |
| 适合场景   | 低维护、纯静态              | 频繁更新、需要动态能力    |

你可以把它理解成一句宣传语：

> 内容是静的，发布是自由的。

## 可以主打的亮点

- **构建一次，内容常新（Node 模式）**：文章/友链/项目更新只需要同步 `content/`
- **0 数据库**：Markdown 天然适合 Git 管理，迁移与备份都轻
- **博客 + 知识库 + 朋友圈**：文章、VuePress 风格专栏、友链与 RSS 订阅聚合、项目展示
- **AI 写作脚手架（可选）**：生成 URL slug、生成文章封面，把重复劳动交给机器
- **同构体验**：既可静态托管，也可 SSR 运行

## 功能概览

- 文章系统：`content/posts/<slug>/README.md`
- 专栏/知识库：`content/columns/<slug>/`
- 标签聚合：从 front-matter 统计
- 全文搜索：服务端搜索 API
- 友链 / 朋友圈：`content/friends.json` + RSS 拉取
- 项目展示：`content/projects.json`
- 数学公式：KaTeX
- UI：TailwindCSS、暗黑模式、响应式布局

## 快速开始

```bash
pnpm install
pnpm dev
```

访问：`http://localhost:3000`

## 部署

### 1) Node 部署（推荐：频繁更新）

#### 方式 A：Docker Compose（一键）

```bash
docker compose up -d --build
```

- 默认监听 `3000`，可用 `SERENADE_PORT=8080 docker compose up -d --build` 映射到其它端口
- `compose.yml` 默认把宿主机 `./content` 挂载进容器：内容更新后刷新即可生效
- 如果你修改了代码/依赖，需要重新 `--build` 构建镜像

#### 方式 B：裸机（不使用 Docker）

```bash
pnpm build
# 上传 .output/ 与 content/ 到服务器
node .output/server/index.mjs
```

后续更新内容：只同步 `content/`，无需重新 `build`。

项目内置 `npm run sync`（Windows 使用 `scp`，Linux/Mac 使用 `rsync`）同步 `content/` 与/或 `.output/`。

### 2) 静态导出（推荐：0 服务器）

```bash
pnpm generate
# 部署 dist/ 到任意静态托管
```

- 更新内容需要重新 `generate`（可交给 CI 自动化）

## 内容结构

```
content/
  posts/
    <post-slug>/
      README.md
      cover.png (可选)
  columns/
    <column-slug>/
      README.md
      <chapter>.md
  friends.json
  projects.json
```

## 脚本工具

- `npm run new:post`：创建文章（可选 AI 生成 URL / 配图）
- `npm run new:column`：创建专栏
- `npm run sync`：同步到服务器（支持同步 `content/`、`.output/`、指定文章/专栏）

AI 与同步相关配置见 `.env.example`：

- 生成 URL slug：配置 `OPENAI_API_KEY`
- 生成封面图：配置 `IMAGE_API_KEY`

## 站点配置

编辑 `site.config.ts`：

```ts
export const siteConfig = {
  author: "",
  title: "",
  description: "Writing code, painful and happy",
  keywords: "blog",
  lang: "zh-CN",
  startTime: "2017-02-11",
};
```

## API

接口位于 `server/api/`，常用如下：

- `GET /api/posts?page=&pageSize=`：文章列表（按日期倒序）
- `GET /api/posts/<path>`：单篇文章（meta + html + prev/next）
- `GET /api/posts/search?keyword=&page=&pageSize=`：全文搜索
- `GET /api/columns` / `GET /api/columns/<path>`：专栏与章节
- `GET /api/tags` / `GET /api/tags/<tag>`：标签统计 / 标签文章
- `GET /api/projects` / `GET /api/projects/categories`：项目
- `GET /api/friends`：友链 / RSS 朋友圈（需联网）

## 贡献

欢迎提交 Issue 和 Pull Request。

## License

MIT
