// GET /api/tags/:tag
import type { Route } from './+types/api.tags.$tag';
import { getPostsByTag } from '~/lib/content/tags';

export async function loader({ params, request }: Route.LoaderArgs) {
  const tag = decodeURIComponent(params.tag);
  const url = new URL(request.url);
  const page = Number.parseInt(url.searchParams.get('page') ?? '1', 10) || 1;
  const pageSize = Number.parseInt(url.searchParams.get('pageSize') ?? '10', 10) || 10;
  return getPostsByTag(tag, { page, pageSize });
}
