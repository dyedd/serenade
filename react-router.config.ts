import type { Config } from "@react-router/dev/config";
import { getColumn, listColumns } from "./app/lib/content/columns";
import { listPostIndex } from "./app/lib/content/posts";
import { listTags } from "./app/lib/content/tags";

const staticBuild = process.env.SERENADE_PRERENDER === "true";

export default {
  ssr: true,
  async prerender() {
    if (!staticBuild) return [];

    const paths = new Set([
      "/",
      "/posts",
      "/columns",
      "/tags",
      "/projects",
      "/friends",
      "/moments",
      "/robots.txt",
      "/sitemap.xml",
    ]);
    const [posts, tags, columns] = await Promise.all([
      listPostIndex(),
      listTags(),
      listColumns({ page: 1, pageSize: 10000 }),
    ]);

    for (const post of posts) paths.add(`/posts/${encodeURIComponent(post.path)}`);
    for (const tag of Object.keys(tags)) paths.add(`/tags/${encodeURIComponent(tag)}`);
    for (const column of columns.data) {
      const columnPath = `/columns/${encodeURIComponent(column.path)}`;
      paths.add(columnPath);
      const detail = await getColumn(column.path);
      for (const chapter of detail?.chapters ?? []) {
        paths.add(`${columnPath}/${encodeURIComponent(chapter.fileName)}`);
      }
    }
    if (posts.length > 0) paths.add("/feed.xml");

    return [...paths];
  },
} satisfies Config;
