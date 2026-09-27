# Serenade 开发入口

Serenade 是一个基于 React Router Framework Mode 的 Markdown 博客程序。这里的工程规则只约束程序代码、构建、测试和部署工具。

## 先看哪里

- [README.md](README.md)：安装、配置、部署和同步
- [docs/README.md](docs/README.md)：项目文档索引
- [docs/architecture.md](docs/architecture.md)：路由、渲染和内容读取边界
- [docs/testing.md](docs/testing.md)：程序验证方式
- [docs/content-contract.md](docs/content-contract.md)：运行时支持的内容格式
- [app/lib/content/AGENTS.md](app/lib/content/AGENTS.md)：内容读取层的局部约定

## 目录职责

- `app/`：React Router 页面、API、组件和内容读取层
- `scripts/`：文章创建、服务器同步和测试辅助脚本
- `docs/`：程序知识、决策和验证说明
- `content/`：使用者自己的运行时数据，可替换、挂载或私有管理
- `public/`：静态资源

`content/` 不属于程序质量门禁。CI 不审核文章、标签、摘要、图片或 JSON 内容；程序测试使用独立的临时数据。

## 常用命令

```bash
pnpm dev
pnpm typecheck
pnpm test
pnpm build
pnpm build:static
pnpm cli post "文章标题" [--slug slug] [--no-ai] [--no-cover]
pnpm cli sync
```

改动路由、渲染或构建时，至少运行 `pnpm typecheck`、`pnpm test` 和对应的构建命令。

## 代码约定

- 使用 TypeScript、React 和两空格缩进。
- 组件文件使用 PascalCase，hooks 使用 `useX`。
- 页面和 API 通过 `app/lib/content/` 读取内容，不直接访问 `content/`。
- 优先复用现有组件、工具和依赖，不为单一用途增加抽象或依赖。
- 必要注释使用简体中文，只解释代码无法表达的约束。
- 不编辑 `.react-router/types/` 和 `build/` 生成文件。

## 内容与同步

文章由使用者自行编写和管理。`pnpm cli post` 只负责创建文章目录和 Markdown 起始文件，可选调用 AI 生成 slug 或封面；它不审核正文，也不通过 CI 检查文章内容。

`pnpm cli sync` 负责把本地 `content/` 同步到服务器。运行前检查 `.env` 中的服务器配置，不要把密钥提交到仓库。
