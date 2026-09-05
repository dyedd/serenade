# Serenade · 动静结合的 Markdown 博客

基于 **Vite + React Router v7 + shadcn/ui** 的博客 / 知识库 / 朋友圈系统。
内容用 Markdown(与少量 JSON)保存,支持**静态导出**与 **Node SSR**两种部署形态,运行时读取 `content/` 热更新。

## 技术栈

| 层        | 技术                                                                |
| --------- | ------------------------------------------------------------------- |
| 构建      | Vite 8                                                              |
| 框架      | React Router v7(App Router、Turbopack dev)                          |
| UI        | React 19 + Tailwind v4 + shadcn/ui(Nova preset,Radix 基座)         |
| 字体      | Geist Variable + Geist Mono Variable + Noto Serif SC Variable       |
| 内容      | `marked` + `marked-katex-extension` + `highlight.js` + `gray-matter` |
| 数据源    | `content/`(纯文件,无数据库)                                         |
| 脚本      | Node CLI: `tsx`,AI helper 直连 OpenAI 兼容 API                       |

## 快速开始

```bash
pnpm install
pnpm dev        # http://127.0.0.1:5173
```

需要 Node ≥ 22、pnpm ≥ 10。

## 命令

| 命令                | 作用                                                          |
| ------------------- | ------------------------------------------------------------- |
| `pnpm dev`          | 启动 dev server(Vite + HMR,Turbopack)                        |
| `pnpm typecheck`    | `react-router typegen && tsc` 全量类型检查                     |
| `pnpm tsx app/lib/content/__check.ts` | 内容读取层自检(18 项)                       |
| `pnpm build`        | SSR 构建(默认:`ssr: true`)                                   |
| `pnpm build:static` | 静态导出:prerender 所有可发现路由到 `build/client/*.html`     |
| `pnpm start`        | 启动生产服务:`react-router-serve ./build/server/index.js`     |
| `pnpm new:post`     | 创建新文章(支持 AI 生成 slug/封面)                            |
| `pnpm new:column`   | 创建新专栏                                                    |
| `pnpm sync`         | 同步 `content/` 到服务器(Windows scp / Linux rsync)           |

## 两种部署方式

```
┌──────────────────────────────────────────────────────────────────────┐
│ 客户端                                                               │
│ 浏览器(SSR HTML 或预渲染 HTML)                                       │
└───────────────────────────────┬──────────────────────────────────────┘
                                ▼
┌──────────────────────────────────────────────────────────────────────┐
│ Node 模式(SSR + 动态)                                                │
│  - pnpm build → node build/server/index.js                            │
│  - pnpm start → react-router-serve                                    │
│  - 内容改动:容器重启后挂载的 content/ 即生效                          │
│  - /api/friends:运行时拉取 RSS                                        │
└───────────────────────────────┬──────────────────────────────────────┘
                                ▼
┌──────────────────────────────────────────────────────────────────────┐
│ 静态模式(prerender + CDN)                                             │
│  - pnpm build:static → 198 个 HTML + assets + feed.xml 写入 build/client │
│  - 任何静态服务器都能托管:`python -m http.server 4173 --directory`    │
│  - /api/friends:构建时一次性拉取并嵌入(朋友圈为构建快照)             │
└──────────────────────────────────────────────────────────────────────┘
```

### Docker(推荐 Node 模式)

```bash
mkdir -p content && cp -r /path/to/your/content/* content/
docker compose up -d
```

默认 `http://localhost:3000`。镜像名 `ghcr.io/dyedd/serenade:latest`,
`content/` 通过 volume 挂载(`./content:/app/content`),改文章后无需重建。

### 静态导出

```bash
pnpm build:static
# 输出 build/client/ —— 部署到任意 CDN / Nginx / GitHub Pages / COS
```

> 静态模式下,友链朋友圈是**构建时刻的快照**。如需实时,请用 Node 模式。

## 站点配置

通过 `.env` 中的 `SITE_*` 环境变量覆盖,默认值定义在 `app/lib/site-config.ts`。

```env
SITE_TITLE=染念的笔记
SITE_AUTHOR=染念
SITE_URL=https://dyedd.cn
SITE_EMAIL=1176996982@qq.com
SITE_PROFILE_INTRO=第一句|第二句
SITE_PROFILE_MOTTO=第一句|第二句
SITE_PROFILE_TECH_STACK=Python::https://img.shields.io/...|Vue::https://...
```

完整可配置项见 `.env.example`。
没有 `.env` 时,使用 `site-config.ts` 中的内置默认值。

## 内容结构

```
content/
├── posts/
│   └── <post-slug>/
│       ├── README.md       # front-matter + markdown
│       └── cover.png       # 可选
├── columns/
│   └── <column-slug>/
│       ├── README.md       # 专栏说明(可仅含 front-matter)
│       └── <chapter>.md    # 章节,文件名按字典序排序
├── friends.json            # 友链列表
└── projects.json           # 项目 + 分类
```

## 路由

| 路由                                  | 类型 | 说明                                          |
| ------------------------------------- | ---- | --------------------------------------------- |
| `/`                                   | SSR  | 首页                                          |
| `/posts`                              | SSR  | 文章列表(分页)                                |
| `/posts/:slug`                        | SSR  | 文章详情                                      |
| `/columns`                            | SSR  | 专栏列表                                      |
| `/columns/:path`                      | SSR  | 专栏详情 + 章节侧栏                           |
| `/columns/:path/:chapter`             | SSR  | 章节内容                                      |
| `/tags`                               | SSR  | 标签云                                        |
| `/tags/:tag`                          | SSR  | 该标签下的文章                                |
| `/projects`                           | SSR  | 项目展示                                      |
| `/friends`                            | SSR  | 友链                                          |
| `/moments`                            | SSR  | 朋友圈(客户端拉取 RSS)                       |
| `/feed.xml`                           | SSR  | RSS,带 ETag/304                               |
| `/<id>.html`                          | 301  | 旧 URL → `/posts/<slug>` 重定向                |
| `/api/posts[?page=]`                  | JSON | 文章列表                                      |
| `/api/posts/:slug`                    | JSON | 文章详情                                      |
| `/api/posts/search?keyword=`          | JSON | 全文搜索                                      |
| `/api/columns[?page=]`                | JSON | 专栏列表                                      |
| `/api/columns/:path`                  | JSON | 专栏详情                                      |
| `/api/columns/:path/:chapter`         | JSON | 章节内容                                      |
| `/api/tags`                           | JSON | 标签统计                                      |
| `/api/tags/:tag`                      | JSON | 该标签下的文章                                |
| `/api/projects[?category=]`           | JSON | 项目列表                                      |
| `/api/projects/categories`            | JSON | 项目分类                                      |
| `/api/friends[?url=]`                 | JSON | 友链 + 单站 RSS 拉取                          |
| `/api/assets/:type/:slug/:file`       | 二进制 | content 内图片/附件流式回传                  |

## 脚本工具

- `pnpm new:post` — 创建文章,可选用 AI 生成 URL slug(`OPENAI_*`)和封面图(`IMAGE_*`)
- `pnpm new:column` — 创建专栏
- `pnpm sync` — 同步 `content/` 到服务器,支持单篇同步

`OPENAI_BASE_URL` 使用 OpenAI 兼容 API base URL(如 `https://api.openai.com/v1`),脚本固定请求 `/chat/completions`。
`IMAGE_BASE_URL` 同上;`IMAGE_API_MODE=images` 请求 `/images/generations`,`=chat` 请求 `/chat/completions`。

## 项目结构

```
my-blog/
├── app/
│   ├── root.tsx                       # HTML shell + favicon + fonts
│   ├── routes.ts                      # 路由声明
│   ├── app.css                        # Tailwind v4 + Geist/Noto Serif SC + shadcn tokens
│   ├── routes/
│   │   ├── _layout.tsx                # 全局 Nav + Footer + BackToTop
│   │   ├── home.tsx                   # 首页(渐变名字、社交、最新文章)
│   │   ├── posts._index.tsx           # 文章列表
│   │   ├── posts.$slug.tsx            # 文章详情
│   │   ├── columns._index.tsx
│   │   ├── columns.$path._index.tsx
│   │   ├── columns.$path.$chapter.tsx
│   │   ├── tags._index.tsx
│   │   ├── tags.$tag.tsx
│   │   ├── projects.tsx
│   │   ├── friends.tsx
│   │   ├── moments.tsx
│   │   ├── feed[.]xml.tsx             # /feed.xml(SSR,带 ETag/304)
│   │   ├── $.tsx                      # splat:旧 .html 重定向 + 404 兜底
│   │   └── api.*.tsx                  # 12 个 API 路由
│   ├── components/
│   │   ├── Nav.tsx                    # shadcn DropdownMenu
│   │   ├── Footer.tsx
│   │   ├── BackToTop.tsx
│   │   ├── DarkModeToggle.tsx
│   │   ├── Pagination.tsx
│   │   ├── ui/                        # shadcn primitives
│   │   └── friends/RSSAggregator.tsx
│   ├── hooks/useTheme.ts
│   ├── lib/
│   │   ├── site-config.ts             # SITE_* env 读取
│   │   ├── utils.ts                   # shadcn cn()
│   │   ├── redirects.ts + .json       # 180 条旧 URL
│   │   └── content/                   # 内容读取层
│   │       ├── posts.ts columns.ts tags.ts projects.ts friends.ts
│   │       ├── markdown.ts            # marked + katex + hljs
│   │       ├── assets.ts reading-time.ts
│   │       └── __check.ts             # 自检
│   └── rss.d.ts                       # rss 包类型声明
├── components.json                    # shadcn 配置
├── content/                           # 内容(项目仓库保留)
├── public/                            # 静态资源(logo.jpg / iconfont.js / favicon)
├── scripts/                           # Node CLI(new-post / sync / AI helpers)
├── react-router.config.ts             # ssr + prerender 配置
├── vite.config.ts                     # Vite 8 + tailwindcss + reactRouter 插件
├── Dockerfile                         # 多阶段 pnpm 构建
├── docker-compose.yml                 # SITE_* env + content/ volume
└── package.json
```

## 致谢

- [React Router](https://reactrouter.com/) — 框架
- [shadcn/ui](https://ui.shadcn.com/) — UI 基座
- [Tailwind CSS](https://tailwindcss.com/) — 样式
- [marked](https://marked.js.org/) + [KaTeX](https://katex.org/) + [highlight.js](https://highlightjs.org/) — Markdown 渲染

## License

MIT
