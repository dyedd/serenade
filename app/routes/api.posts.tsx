// GET /api/posts?page=&pageSize=
import type { Route } from './+types/api.posts';
import { listPosts } from '~/lib/content/posts';

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const page = Number.parseInt(url.searchParams.get('page') ?? '1', 10) || 1;
  const pageSize = Number.parseInt(url.searchParams.get('pageSize') ?? '10', 10) || 10;
  return listPosts({ page, pageSize });
}
