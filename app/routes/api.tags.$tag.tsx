import type { Route } from './+types/api.tags.$tag';
import { getPostsByTag, safeDecode } from '~/lib/content/tags';
import { normalizePage, normalizePageSize } from '~/lib/content/posts';

export async function loader({ params, request }: Route.LoaderArgs) {
  const tag = safeDecode(params.tag);
  const url = new URL(request.url);
  const page = normalizePage(url.searchParams.get('page'));
  const pageSize = normalizePageSize(url.searchParams.get('pageSize'), 10);
  return getPostsByTag(tag, { page, pageSize });
}
