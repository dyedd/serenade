// GET /api/columns/:path/:chapter
import type { Route } from './+types/api.columns.$path.$chapter';
import { getChapter } from '~/lib/content/columns';

export async function loader({ params }: Route.LoaderArgs) {
  const chapter = await getChapter(params.path, params.chapter);
  if (!chapter) throw new Response('Not Found', { status: 404 });
  return chapter;
}
