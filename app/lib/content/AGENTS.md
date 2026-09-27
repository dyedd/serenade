# 内容读取约定

- `content/` 是使用者自己的运行时数据，不属于程序 CI 的质量门禁。
- 页面和 API 必须复用本目录的 loader，不要自行读取 JSON 或 Markdown。
- 新增或修改字段时，先更新对应 loader 和 `docs/content-contract.md`，再更新调用方。
- 文章 front matter 通过 `parsePostFrontMatter` 读取；不要在单个 loader 中恢复宽松的 `unknown` 转换。
- 路径匹配要兼容 Windows 和 Unix 分隔符，文章 slug 按目录精确匹配。
- 格式错误在实际页面或 API 请求中报告；不要新增文章审核 CLI 或 CI 校验。
