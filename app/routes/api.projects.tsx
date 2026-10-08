import type { Route } from './+types/api.projects';
import { listProjects } from '~/lib/content/projects';
import { readPageParams } from '~/lib/content/posts';

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const category = url.searchParams.get('category') ?? undefined;
  const { page, pageSize } = readPageParams(url.searchParams, category ? 10 : 6);
  return listProjects({ page, pageSize, category });
}
