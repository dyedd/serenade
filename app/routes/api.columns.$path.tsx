// GET /api/columns/:path
import type { Route } from './+types/api.columns.$path';
import { getColumn } from '~/lib/content/columns';

export async function loader({ params }: Route.LoaderArgs) {
  const column = await getColumn(params.path);
  if (!column) throw new Response('Not Found', { status: 404 });
  return column;
}
