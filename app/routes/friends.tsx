// Friends page: application rules + JSON template with copy + links list.
import { useState } from 'react';
import type { Route } from './+types/friends';
import { Check, ChevronDown, Copy, Link2 } from 'lucide-react';
import { loadFriends, type Friend } from '~/lib/content/friends';
import { siteConfig } from '~/lib/site-config';
import { pageMeta } from '~/lib/meta';
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
import { Card } from '~/components/ui/card';
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '~/components/ui/empty';
import { PageHeader } from '~/components/PageHeader';

export function meta(_: Route.MetaArgs) {
  return pageMeta({ title: '友情链接', path: '/friends', description: '交换友情链接' });
}

export async function loader() {
  return { friends: await loadFriends(), template: siteConfig.friends.applicationTemplate };
}

// 申请友链前必读
const FRIEND_RULES = [
  '申请友链时请确保您的站点同时也有我们的站点的友链，若审批通过后移除本站链接，本站也将移除友链，并加入黑名单。',
  '确保您的网站不存在政治敏感问题及违法内容。',
  '确保站点可以以 HTTPS 访问。',
  '不同意商业及非个人的网站的友链申请。',
];

// Avatar with initial-letter fallback for broken logos.
function FriendAvatar({ src, name }: { src: string; name: string }) {
  return (
    <Avatar className="size-12 shrink-0 border border-border">
      <AvatarImage src={src} alt={name} loading="lazy" referrerPolicy="no-referrer" />
      <AvatarFallback className="rounded-full bg-muted font-mono text-lg text-(--brand)">
        {name.charAt(0).toUpperCase()}
      </AvatarFallback>
    </Avatar>
  );
}

export default function FriendsPage({ loaderData }: Route.ComponentProps) {
  const { friends, template } = loaderData;
  // JSON.stringify keeps the template byte-identical to the runtime siteConfig.
  const templateJson = JSON.stringify(template, null, 2);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(templateJson);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('复制失败', error);
    }
  };

  return (
    <section className="py-8">
      <PageHeader title="友情链接">共有 {friends.length} 位网上邻居。</PageHeader>

      <details className="group mb-20 paper-card p-6">
        <summary className="flex cursor-pointer list-none items-center justify-between font-heading text-lg font-semibold [&::-webkit-details-marker]:hidden">
          申请友链
          <ChevronDown className="size-4 text-black/60 transition-transform duration-200 ease group-open:rotate-180" />
        </summary>
        <div className="mt-6">
          <h2 className="mb-3 text-sm font-medium">申请前必读</h2>
          <ul className="list-disc space-y-1 pl-5 text-sm text-black/60">
            {FRIEND_RULES.map((rule) => (
              <li key={rule}>{rule}</li>
            ))}
          </ul>

          <h2 className="mt-6 mb-3 text-sm font-medium">申请方式</h2>
          <p className="mb-4 text-sm text-black/60">
            请将你的友链信息按照以下格式发送至{' '}
            <a
              href={siteConfig.socialLinks.email.url}
              className="font-medium text-(--brand) hover:underline"
            >
              邮箱
            </a>
          </p>
          <div className="code-block-wrapper paper-card overflow-hidden shadow-none">
            <div className="code-header flex select-none items-center justify-between border-b border-border bg-card px-6 py-3 text-xs text-black/60">
              <span className="font-mono">json</span>
              <button
                type="button"
                onClick={handleCopy}
                aria-label="复制友链模板"
                className="flex cursor-pointer items-center gap-1.5 text-black/60 transition-colors duration-200 ease hover:text-black"
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5 text-primary" aria-hidden />
                ) : (
                  <Copy className="h-3.5 w-3.5" aria-hidden />
                )}
                <span className={copied ? 'font-mono text-primary' : 'font-mono'}>
                  {copied ? '已复制 ✓' : '复制'}
                </span>
              </button>
            </div>
            <pre className="overflow-x-auto p-6 text-sm leading-relaxed text-foreground">
              <code className="block font-mono">{templateJson}</code>
            </pre>
          </div>
        </div>
      </details>

      {/* 友链列表 */}
      {friends.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Link2 />
            </EmptyMedia>
            <EmptyTitle>暂无友链</EmptyTitle>
            <EmptyDescription>期待与你交换链接。</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {friends.map((f: Friend) => (
            <li key={f.url} className="min-w-0">
              <Card className="card-lift card-dashed h-full gap-0 py-0 shadow-none">
                <a
                  href={f.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-discover="false"
                  title={f.description || '点击访问友链'}
                  className="group flex h-full items-center gap-3 p-4"
                >
                  <FriendAvatar src={f.logo} name={f.name} />
                  <div className="min-w-0 flex-1">
                    <h2 className="truncate font-bold text-foreground transition-colors duration-200 ease group-hover:text-(--brand)">
                      {f.name}
                    </h2>
                    <p className="mt-0.5 truncate text-sm text-black/60">
                      {f.description || '暂无简介'}
                    </p>
                  </div>
                </a>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
