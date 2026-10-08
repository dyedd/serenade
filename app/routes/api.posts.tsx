import type { Route } from './+types/api.posts';
import { listPosts, normalizePage, normalizePageSize } from '~/lib/content/posts';

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const page = normalizePage(url.searchParams.get('page'));
  const pageSize = normalizePageSize(url.searchParams.get('pageSize'), 10);
  return listPosts({ page, pageSize });
}
