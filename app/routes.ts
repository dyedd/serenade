import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

export default [
  layout("routes/_layout.tsx", [
    index("routes/home.tsx"),
    route("posts", "routes/posts._index.tsx"),
    route("posts/:slug", "routes/posts.$slug.tsx"),
    route("columns", "routes/columns._index.tsx"),
    route("columns/:path", "routes/columns.$path._index.tsx"),
    route("columns/:path/:chapter", "routes/columns.$path.$chapter.tsx"),
    route("tags", "routes/tags._index.tsx"),
    route("tags/:tag", "routes/tags.$tag.tsx"),
    route("projects", "routes/projects.tsx"),
    route("friends", "routes/friends.tsx"),
    route("moments", "routes/moments.tsx"),
    // Splat: /<id>.html 301 重定向或 404 兜底（走站点壳，404 也有导航）。
    route("*", "routes/$.tsx"),
  ]),
  // Standalone routes (no layout).
  route("feed.xml", "routes/feed[.]xml.tsx"),
  route("robots.txt", "routes/robots[.]txt.tsx"),
  route("sitemap.xml", "routes/sitemap[.]xml.tsx"),

  // API routes (no layout, all return JSON / binary).
  route("api/posts", "routes/api.posts.tsx"),
  route("api/posts/search", "routes/api.posts.search.tsx"),
  route("api/posts/:slug", "routes/api.posts.$slug.tsx"),
  route("api/columns", "routes/api.columns.tsx"),
  route("api/columns/:path", "routes/api.columns.$path.tsx"),
  route("api/columns/:path/:chapter", "routes/api.columns.$path.$chapter.tsx"),
  route("api/tags", "routes/api.tags.tsx"),
  route("api/tags/:tag", "routes/api.tags.$tag.tsx"),
  route("api/projects", "routes/api.projects.tsx"),
  route("api/projects/categories", "routes/api.projects.categories.tsx"),
  route("api/friends", "routes/api.friends.tsx"),
  route("assets/:type/:slug/:file", "routes/assets.$type.$slug.$file.tsx"),
] satisfies RouteConfig;
