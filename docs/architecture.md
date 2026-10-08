# 架构地图

## 运行方式

- `app/routes.ts` 定义 React Router 路由树。
- `app/routes/` 负责页面、API、RSS 和静态资源入口。
- `app/routes/_layout.tsx` 提供页面壳层；可复用 UI 在 `app/components/`。
- 默认构建 Node.js 服务端应用，不预渲染个人内容。
- `pnpm build:static` 通过 `SERENADE_PRERENDER=true` 预渲染站点、文章、标签和专栏路由；服务端产物仍会生成，目录仍为 `build/server`。
- `content/` 是使用者自己的运行时数据，Docker 服务端部署时通过 volume 挂载（只读）。

## 站点配置

`SITE_*` 是**运行期**配置：服务端每次渲染时从 `process.env` 读取，并把解析结果注入 HTML
（`window.__SERENADE_SITE_CONFIG__`），浏览器端从该 payload 读取。

- 改配置只需重启容器/进程，不需要重新构建镜像。
- 组件统一通过 `app/lib/site-config.ts` 的 `siteConfig` / `getSiteConfig()` 取值，
  不要直接读 `process.env`：浏览器里没有 `process`。
- `docker-compose.yml` 会把未设置的变量注入成空字符串，因此配置读取把空串视为「未配置」。

## 程序边界

```text
路由和组件
    ↓
app/lib/content/
    ↓
content/
```

- 页面和 API 通过 `app/lib/content/` 读取 Markdown 和 JSON。
- `app/lib/content/` 是程序读取内容的唯一边界，路由不得自行 glob/readFile。
- 路由负责参数、响应和页面组合，不重复实现文件读取。
- 分页参数统一用 `app/lib/content/posts.ts` 的 `readPageParams`，`pageSize` 有上界。
- 内容读取层不依赖 UI 组件。
- `scripts/cli.js`：独立 CLI 入口，提供命令模式和全屏 TUI 菜单
- `scripts/new-post.js`：创建文章 scaffold，可选调用 AI 生成 slug 和封面
- `scripts/sync.js`：把内容同步到服务器；不检查文章正文
- `scripts/front-matter.js`：CLI 侧共用的 slug 规则与 front matter 时间戳写入

这个边界约束的是程序代码，不代表程序会审核或管理使用者的文章。

## 内容位置

- `content/posts/<slug>/README.md`：文章正文和 front matter
- `content/columns/<slug>/`：专栏介绍和章节
- `content/*.json`：职业轨迹、友链、项目和合集
- 文章资源和封面位于对应文章目录

内容格式见 [content-contract.md](content-contract.md)。内容不在仓库 CI 中做质量检查；应用只在运行时读取并报告格式错误。

## 请求类型

- 页面路由由 React Router 服务端模式或静态构建处理。
- `/api/*` 路由返回 JSON。
- `/feed.xml` 返回 RSS；静态构建时生成静态 feed 文件。
- `/sitemap.xml` 和 `/robots.txt` 提供搜索引擎发现入口。
- `/api/*` 路由返回 JSON，静态部署不包含这些运行时 API。
- `/assets/*` 返回 `content/` 中的图片和附件。
- `*` 路由负责旧 `.html` 地址重定向和 404 页面。

## 变更规则

- 新页面先在 `app/routes.ts` 中声明，再创建对应 route module。
- 新 API 复用已有 content loader，不直接读取文件。
- 改动页面生成方式时同时验证服务端模式和静态构建；静态构建需准备内容目录。
- 改动同步工具时只验证同步命令和安全的路径处理，不把文章内容检查加入 CI。
- 新增可索引内容路由时，同步更新静态预渲染路径和 sitemap。
