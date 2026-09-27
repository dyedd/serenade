# 程序验证

验证对象是博客程序，不是使用者的文章内容。

## 命令

```bash
pnpm typecheck       # React Router 类型和 TypeScript
pnpm test            # SSR 构建和路由/API smoke test
pnpm build           # Node SSR 构建
pnpm build:static    # 静态构建
```

`pnpm test` 会先构建不读取个人内容的 SSR 产物，再用临时内容启动生产服务，检查页面 metadata、SEO endpoints、文章 API、文章详情和 RSS 条件请求。测试结束后会删除临时数据。

测试 fixture 只用于覆盖程序路径，不代表项目要求提交或审核真实文章。

## 修改后的最低检查

- 组件或工具：`pnpm typecheck`、`pnpm test`
- 路由或 loader：`pnpm typecheck`、`pnpm test`、`pnpm build`
- SSR 或静态构建配置：以上命令加 `pnpm build:static`；静态构建需要准备 `content/`。
- 同步脚本：运行对应的帮助或路径检查，不连接真实服务器

CI 只检查程序代码和构建结果，不检查 `content/` 中的个人文章。
