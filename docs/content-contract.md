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

**只有 `README.md` 是文章正文。** 同一目录下的其他 `.md`（章节草稿、附件笔记等）不会出现在
文章列表、标签计数、搜索结果和 RSS 中；需要多篇内容请各自建立目录。

正文图片按「文章目录下的文件名」解析：`![](cover.png)` 会被改写成
`/assets/posts/<slug>/cover.png`。图片必须直接放在文章目录里，**不支持子目录**
（`![](images/a.png)` 不会命中任何文件）。

## 专栏

```text
content/columns/<slug>/README.md
content/columns/<slug>/001.md
content/columns/<slug>/002.md
```

README 提供专栏信息，其他 Markdown 文件作为章节。章节顺序按文件名里的数字前缀排列
（`001.md`、`002.md`…）；没有数字前缀的章节排在数字章节之后并按文件名排序。
`README.md` 本身不计入章节数。

## JSON 数据

- `career.json`：职业轨迹数组，常用字段为 `period`、`org`、`role`、`note`。
- `friends.json`：友链数组，常用字段为 `name`、`url`、`logo`、`description`、`rss`。
- `projects.json`：`{ "categories": {} }` 结构，分类下包含项目数组。
- `collections.json`：合集 slug 映射，每个合集包含标题、描述和文章或外部链接。

具体字段由 `app/lib/content/` 的 loader 在运行时读取。格式错误会在对应页面或 API 请求中报告。
可选文件（如 `collections.json`）缺失时按「没有数据」处理，不会让页面报错。

## 创建和同步

```bash
pnpm cli post "文章标题"
pnpm cli sync
pnpm cli sync content
pnpm cli sync post <slug>
pnpm cli sync json <friends.json|projects.json|collections.json>
```

`pnpm cli post` 只创建文章目录和 Markdown 起始文件，可选调用 AI 生成 slug 或封面；它不检查正文内容。同步命令只负责传输使用者已经准备好的内容。

目录名（slug）例如 `pnpm cli post "标题" --slug my-post`：只能包含字母、数字、点号、短横线或
下划线，不能以短横线开头。该规则由 `scripts/front-matter.js` 统一定义，创建与同步两侧一致。

`pnpm cli sync content` 会给缺少 `date` 的文章/专栏 README 补一个带时区偏移的时间戳
（`2025-03-04T05:06:07+08:00`），并明确报告哪些文件因为没有 front matter 而无法自动补全。

`career.json` 目前只能用 `pnpm cli sync content` 整体同步，不能单独用 `sync json` 指定。
