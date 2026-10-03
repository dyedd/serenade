# Serenade

Serenade 是一个基于 React Router Framework Mode 的 Markdown 博客程序。

程序从独立的 `content/` 目录读取文章和站点数据。你可以使用 Node.js SSR、Docker 或静态站点部署程序。

## 特性

- 读取 Markdown 文章和专栏。
- 支持 KaTeX 数学公式和代码高亮。
- 提供标签、合集、项目、友链、朋友圈和 RSS。
- 首页最多显示两个随机项目。SSR 在每次请求时选择项目。静态站点在构建时选择项目。
- 支持 React Router SSR。
- 支持文章级静态预渲染。
- 支持图片灯箱和深色模式。
- 使用 CLI 创建文章和同步内容。

## 快速开始

安装以下软件：

- Node.js 22 或更高版本。
- pnpm 10 或更高版本。
- Docker。仅在使用 Docker 部署时需要。

```bash
pnpm install
```

创建 `.env`：

macOS、Linux 或 Git Bash：

```bash
cp .env.example .env
```

PowerShell：

```powershell
Copy-Item .env.example .env
```

编辑 `.env`。至少设置站点的 `SITE_*` 配置。不要提交 `.env` 或任何密钥。

准备 `content/`。你可以使用本地目录、私有内容仓库或 Docker volume。内容格式见[内容格式说明](docs/content-contract.md)。

启动开发服务器：

```bash
pnpm dev
```

打开 <http://127.0.0.1:5173>。

## 内容目录

`content/` 是运行时数据。Git 默认忽略此目录。程序不会在 CI 中审核个人文章。

常用路径如下：

```text
content/
├── posts/<slug>/README.md
├── columns/<slug>/README.md
├── columns/<slug>/001.md
├── career.json
├── collections.json
├── friends.json
└── projects.json
```

文章目录名会成为文章 URL。文章使用 Markdown front matter：

```yaml
---
title: 文章标题
date: 2025-01-31
tags: [技术]
abstract: 可选摘要
cover: 可选封面
---

正文 Markdown
```

JSON 文件由 `app/lib/content/` 中的 loader 读取。格式错误会在对应页面或 API 请求中报告。字段要求见[内容格式说明](docs/content-contract.md)。

## CLI

### 创建文章

创建文章目录和 Markdown 起始文件：

```bash
pnpm cli post "文章标题"
pnpm cli post "文章标题" --slug my-post --no-ai --no-cover
```

`--no-ai` 不调用 AI 生成 slug。`--no-cover` 不调用 AI 生成封面。相关 API 配置见 `.env.example`。

### 同步内容

同步命令需要以下配置：

```dotenv
SERVER_HOST=your_server_host
SERVER_USER=deploy
SERVER_PATH=/srv/serenade
```

同步整个 `content/`、一篇文章或一个 JSON 文件：

```bash
pnpm cli sync
pnpm cli sync content
pnpm cli sync post <slug>
pnpm cli sync json <friends.json|projects.json|collections.json>
```

Linux 和 macOS 使用 `rsync`。Windows 使用 `scp`。同步整个内容目录时，Unix 模式会使用 `rsync --delete`。

## 配置

将 `.env.example` 复制为 `.env`，再修改配置值。`.env` 只在本地或服务器保存。

常用配置分为三组：

| 组 | 用途 | 示例字段 |
| --- | --- | --- |
| AI | 生成文章 slug 和封面 | `OPENAI_API_KEY`、`IMAGE_API_KEY` |
| 同步 | 连接内容服务器 | `SERVER_HOST`、`SERVER_USER`、`SERVER_PATH` |
| 站点 | 设置标题、简介、社交链接和个人介绍 | `SITE_TITLE`、`SITE_URL`、`SITE_PROFILE_INTRO` |

多行文本使用 `|` 分隔。例如：

```dotenv
SITE_PROFILE_INTRO=第一行|第二行
SITE_PROFILE_MOTTO=保持简单|持续交付
```

技术栈使用 `名称::图标地址` 格式，并使用 `|` 分隔：

```dotenv
SITE_PROFILE_TECH_STACK=TypeScript::https://cdn.simpleicons.org/typescript/3178C6|React::https://cdn.simpleicons.org/react/61DAFB
```

完整字段和通用示例见 `.env.example`。

## 部署

### Docker SSR

准备 `.env` 和 `content/`。在项目根目录运行：

```bash
docker compose up -d
```

Compose 会把本地 `content/` 挂载到容器的 `/app/content`。修改内容后不需要重建镜像。默认地址为 <http://localhost:3000>。

使用 `SERENADE_PORT` 修改主机端口：

```dotenv
SERENADE_PORT=8080
```

### 静态站点

准备 `.env` 和 `content/`。执行以下命令：

```bash
pnpm build:static
```

输出目录为 `build/client/`。构建会生成首页、文章、专栏、标签、RSS、sitemap 和 robots 文件。每次内容变更后都必须重新构建。

静态站点不提供 `/api/*`。以下功能需要 Node.js SSR：

- API 请求。
- 搜索。
- 朋友圈 RSS 聚合。
- 依赖请求时数据的分页。

## SEO

SSR 和静态构建会输出以下 metadata：

- `title`
- `description`
- `canonical`
- Open Graph
- Twitter metadata
- 文章页的 BlogPosting 结构化数据

SSR 模式提供 `/sitemap.xml`、`/robots.txt` 和 `/feed.xml`。静态构建也会生成这些文件。

请将 `SITE_URL` 设置为公开访问的完整 URL。请确保封面图片 URL 可以被社交平台访问。SEO 不保证收录或排名。

## 开发

| 命令 | 用途 |
| --- | --- |
| `pnpm dev` | 启动开发服务器 |
| `pnpm typecheck` | 生成路由类型并运行 TypeScript 检查 |
| `pnpm test` | 构建 SSR 并运行页面、API 和 RSS 测试 |
| `pnpm build` | 构建 Node.js SSR 应用 |
| `pnpm build:static` | 构建静态预渲染站点 |
| `pnpm verify` | 类型检查、测试和静态构建 |

测试使用临时 fixture。测试不会检查真实文章内容。SSR 和静态构建会读取当前 `content/`，因此运行前必须准备内容目录。

## 项目结构

```text
app/
├── components/       可复用 React 组件
├── lib/content/      内容读取层
└── routes/           页面、API、RSS 和静态资源路由
content/              使用者的运行时内容
scripts/              CLI、同步和测试工具
public/               静态资源
docs/                 程序文档
```

页面和 API 必须通过 `app/lib/content/` 读取内容。路由代码不应直接读取 `content/`。

更多信息见[文档索引](docs/README.md)：

- [架构地图](docs/architecture.md)
- [内容格式说明](docs/content-contract.md)
- [程序验证](docs/testing.md)

## 技术栈

React 19、React Router Framework Mode、Vite、Tailwind CSS v4、shadcn/ui、`marked`、KaTeX、highlight.js 和 `gray-matter`。

## License

MIT
