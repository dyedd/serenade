// `<id>.html` URL → `/posts/<slug>` redirect map, imported as a typed record
// so the redirect route can do O(1) lookups.
import map from './redirects.json';

export const redirects = map as Record<string, string>;

export function resolveRedirect(htmlKey: string): string | null {
  // The key in redirects.json is "<id>.html"; we also handle plain "<id>" for safety.
  const withExt = htmlKey.endsWith('.html') ? htmlKey : `${htmlKey}.html`;
  const slug = redirects[withExt] ?? redirects[htmlKey];
  return slug ? `/posts/${slug}` : null;
}
