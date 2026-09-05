// GET /api/projects?category=&page=&pageSize=
import type { Route } from './+types/api.projects';
import { listProjects } from '~/lib/content/projects';

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const page = Number.parseInt(url.searchParams.get('page') ?? '1', 10) || 1;
  const pageSize = Number.parseInt(url.searchParams.get('pageSize') ?? '3', 10) || 3;
  const category = url.searchParams.get('category') ?? undefined;
  return listProjects({ page, pageSize, category });
}
