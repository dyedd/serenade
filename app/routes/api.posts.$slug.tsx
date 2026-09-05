// GET /api/posts/:slug
import type { Route } from './+types/api.posts.$slug';
import { getPost } from '~/lib/content/posts';

export async function loader({ params }: Route.LoaderArgs) {
  const post = await getPost(params.slug);
  if (!post) throw new Response('Not Found', { status: 404 });
  return post;
}
