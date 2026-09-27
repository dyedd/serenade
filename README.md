# Serenade

Serenade 是一个基于 React Router Framework Mode 的 Markdown 博客程序。文章和站点数据保存在独立的 `content/` 目录中，可使用 Node SSR + Docker 部署，也可构建为预渲染静态站点。

## 特性

- Markdown 文章和专栏，支持 KaTeX 数学公式及代码高亮
- 标签、合集、项目、友链、朋友圈和 RSS
- React Router SSR 与文章级静态预渲染
- `pnpm cli post` 创建文章，可选 AI slug 和封面
- `pnpm cli sync` 同步内容到服务器
- 不要求把个人文章提交到这个程序仓库

## 快速开始

需要 Node.js 22+ 和 pnpm 10+。

```bash
pnpm install
cp .env.example .env
pnpm dev
```

打开 <http://127.0.0.1:5173>。运行页面前，需要在 `content/` 放入自己的站点数据和文章。`content/` 已被 Git 忽略；格式见[内容格式说明](docs/content-contract.md)。

## 内容和 CLI

`content/` 是运行时数据，可由私有仓库管理，也可在 Docker 中通过 volume 挂载。项目不会审核文章正文，也不会在 CI 中检查个人内容。

创建文章 scaffold：

```bash
pnpm cli post "文章标题"
pnpm cli post "文章标题" --slug my-post --no-cover
```

不使用 AI slug 时加 `--no-ai`；指定 `--slug` 可直接跳过交互。AI slug 和封面配置见 `.env.example`。

同步内容到服务器：

```bash
pnpm cli sync
pnpm cli sync content
pnpm cli sync post <slug>
pnpm cli sync json <friends.json|projects.json|collections.json>
```

服务器同步需要在 `.env` 中配置 `SERVER_HOST`、`SERVER_USER` 和 `SERVER_PATH`。`sync content` 会镜像整个内容目录，Unix 下使用 `rsync --delete`。

## 部署

### Docker SSR

准备好 `content/` 和站点配置后，在项目根目录运行：

```bash
cp .env.example .env
# 编辑 .env 中的 SITE_* 配置
docker compose up -d
```

Compose 将本地 `content/` 挂载到容器，编辑内容后无需重建镜像。默认地址为 <http://localhost:3000>，端口可用 `SERENADE_PORT` 覆盖。建议将 `.env` 和内容目录保存在私有位置。

### 静态站点

准备好内容目录后执行：

```bash
pnpm build:static
```

输出目录为 `build/client/`。文章、专栏、标签和站点页面会在构建时生成 HTML，文章及标签 URL 会进入 `sitemap.xml`。每次内容变更后需要重新构建和部署。

静态导出不提供 `/api/*`，因此朋友圈 RSS 聚合、API 调用、搜索和依赖请求时数据的分页功能需要 Node SSR 部署。静态 HTML 中不会自动生成尚未预渲染的分页 URL。内容量增加时，静态构建时间也会随页面数增加。

## SEO

页面通过 React Router SSR 提供可抓取的 HTML，并输出页面级 title、description、canonical、Open Graph 和 Twitter metadata。文章页另有 BlogPosting 结构化数据。`/sitemap.xml`、`/robots.txt` 和 `/feed.xml` 在 SSR 模式下可用；静态构建也会生成这些文件和内容页。

请在 `.env` 设置公开可访问的 `SITE_URL`，并确保封面图片 URL 可被社交平台访问。SEO 不保证搜索引擎收录或排名。

## 开发

| 命令 | 用途 |
| --- | --- |
| `pnpm dev` | 启动开发服务器 |
| `pnpm typecheck` | 生成路由类型并运行 TypeScript 检查 |
| `pnpm test` | SSR 构建及页面/API/RSS smoke test |
| `pnpm build` | 构建 Node SSR 应用 |
| `pnpm build:static` | 构建静态预渲染站点 |
| `pnpm verify` | 类型检查、测试和静态构建 |

测试使用临时 fixture，不检查真实文章内容。Node SSR 和静态构建都会读取当前 `content/`，静态部署前请先准备内容。

更多说明见[文档索引](docs/README.md)。

## 技术栈

React 19、React Router Framework Mode、Vite、Tailwind CSS v4、shadcn/ui、`marked`、KaTeX、highlight.js 和 `gray-matter`。

## License

MIT
