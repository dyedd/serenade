// GET /api/tags → { tagName: count, ... }
import { listTags } from '~/lib/content/tags';

export async function loader() {
  return listTags();
}
