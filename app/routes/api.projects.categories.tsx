// GET /api/projects/categories
import { listProjectCategories } from '~/lib/content/projects';

export async function loader() {
  return listProjectCategories();
}
