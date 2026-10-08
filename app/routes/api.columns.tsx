import type { Route } from './+types/api.columns';
import { listColumns } from '~/lib/content/columns';
import { clampPageSize, normalizePage } from '~/lib/content/posts';

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const page = normalizePage(url.searchParams.get('page'));
  const pageSize = clampPageSize(
    Number.parseInt(url.searchParams.get('pageSize') ?? '', 10),
    10,
  );
  return listColumns({ page, pageSize });
}
