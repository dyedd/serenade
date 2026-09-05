// GET /api/posts/search?keyword=&page=&pageSize=
import type { Route } from './+types/api.posts.search';
import { searchPosts } from '~/lib/content/posts';

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const keyword = url.searchParams.get('keyword') ?? '';
  const page = Number.parseInt(url.searchParams.get('page') ?? '1', 10) || 1;
  const pageSize = Number.parseInt(url.searchParams.get('pageSize') ?? '10', 10) || 10;
  return searchPosts({ keyword, page, pageSize });
}
