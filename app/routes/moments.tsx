// Moments (朋友圈): server-side renders the friend list; the RSSAggregator
// client component then fetches each friend's RSS and shows one flat timeline
// of the latest articles.
import type { Route } from './+types/moments';
import { loadFriends } from '~/lib/content/friends';
import { RSSAggregator } from '~/components/friends/RSSAggregator';
import { pageMeta } from '~/lib/meta';

export function meta(_: Route.MetaArgs) {
  return pageMeta({ title: '朋友圈', path: '/moments', description: '朋友们的最新创作' });
}

export async function loader() {
  return { friends: await loadFriends() };
}

export default function MomentsPage({ loaderData }: Route.ComponentProps) {
  return (
    <section className="py-8">
      <header className="mb-8">
        <p className="eyebrow mb-2">friends feed</p>
        <h1 className="font-heading text-3xl font-bold tracking-tight">朋友圈</h1>
        <p className="mt-2 border-l-2 border-(--brand) pl-3 text-sm text-muted-foreground">
          朋友们的最新创作，实时更新
        </p>
      </header>
      <RSSAggregator friends={loaderData.friends} />
    </section>
  );
}
