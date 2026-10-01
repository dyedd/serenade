# 内容格式说明

`content/` 是使用者自己的运行时数据，可以放在私有目录、挂载卷或另一个内容仓库中。这里描述程序能够读取的格式，方便部署和迁移；它不是文章审核规则，也不作为 CI 门禁。

## 文章

每个 `content/posts/<slug>/` 通常包含 `README.md`。目录名用于 URL，建议使用字母、数字、点、下划线和短横线。

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

`tags` 可以是字符串或字符串数组。`cover` 可以是文章目录中的相对路径、站内路径或外部 URL。

## 专栏

```text
content/columns/<slug>/README.md
content/columns/<slug>/001.md
content/columns/<slug>/002.md
```

README 提供专栏信息，其他 Markdown 文件按文件名排序作为章节。

## JSON 数据

- `career.json`：职业轨迹数组，常用字段为 `period`、`org`、`role`、`note`。
- `friends.json`：友链数组，常用字段为 `name`、`url`、`logo`、`description`、`rss`。
- `projects.json`：`{ "categories": {} }` 结构，分类下包含项目数组。
- `collections.json`：合集 slug 映射，每个合集包含标题、描述和文章或外部链接。

具体字段由 `app/lib/content/` 的 loader 在运行时读取。格式错误会在对应页面或 API 请求中报告。

## 创建和同步

```bash
pnpm cli post "文章标题"
pnpm cli sync
pnpm cli sync content
pnpm cli sync post <slug>
pnpm cli sync json <friends.json|projects.json|collections.json>
```

`pnpm cli post` 只创建文章目录和 Markdown 起始文件，可选调用 AI 生成 slug 或封面；它不检查正文内容。同步命令只负责传输使用者已经准备好的内容。
