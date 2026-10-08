import type { Route } from './+types/api.posts.search';
import { normalizePage, normalizePageSize, searchPosts } from '~/lib/content/posts';

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const keyword = url.searchParams.get('keyword') ?? '';
  const page = normalizePage(url.searchParams.get('page'));
  const pageSize = normalizePageSize(url.searchParams.get('pageSize'), 10);
  return searchPosts({ keyword, page, pageSize });
}
