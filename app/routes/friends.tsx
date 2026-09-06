// Friends page: application rules + JSON template with copy + links list.
import { useState } from 'react';
import type { Route } from './+types/friends';
import { Check, Copy, Link2, UserRound } from 'lucide-react';
import { loadFriends, type Friend } from '~/lib/content/friends';
import { siteConfig } from '~/lib/site-config';
import { pageMeta } from '~/lib/meta';
import { Alert, AlertDescription, AlertTitle } from '~/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
import { Badge } from '~/components/ui/badge';
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
      <PageHeader eyebrow="friends" title="友情链接" meta={`共 ${friends.length} 位朋友`} />

      {/* 申请友链前必读 */}
      <Alert className="mb-10 border-(--brand-line) bg-(--brand-soft)">
        <UserRound data-icon="inline-start" />
        <AlertTitle>申请友链前必读</AlertTitle>
        <AlertDescription>
          <ul className="list-disc space-y-1 pl-5">
            {FRIEND_RULES.map((rule) => (
              <li key={rule}>{rule}</li>
            ))}
          </ul>
        </AlertDescription>
      </Alert>

      {/* 友链申请方式 */}
      <div className="mb-12">
        <h2 className="mb-3 flex items-center gap-2 text-lg font-bold">
          <Link2 className="h-4 w-4 text-(--brand)" aria-hidden />
          友链申请方式
        </h2>
        <p className="mb-4 text-sm text-muted-foreground">
          请将你的友链信息按照以下格式发送至{' '}
          <a
            href={siteConfig.socialLinks.email.url}
            className="font-medium text-(--brand) hover:underline"
          >
            邮箱
          </a>
        </p>

        {/* JSON 模板代码块：头部 + 一键复制 */}
        <div className="my-6 overflow-hidden rounded-lg border border-border bg-[#282c34] shadow-lg">
          <div className="flex select-none items-center justify-between border-b border-white/10 bg-[#21252b] px-4 py-1.5 text-xs text-neutral-300">
            <span className="font-mono opacity-80">json</span>
            <button
              type="button"
              onClick={handleCopy}
              aria-label="复制友链模板"
              className="flex cursor-pointer items-center gap-1.5 text-neutral-400 opacity-80 transition-all hover:text-white hover:opacity-100"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-green-400" aria-hidden />
              ) : (
                <Copy className="h-3.5 w-3.5" aria-hidden />
              )}
              <span className={copied ? 'font-mono text-green-400' : 'font-mono'}>
                {copied ? '已复制 ✓' : '复制'}
              </span>
            </button>
          </div>
          <pre className="overflow-x-auto p-4 text-sm leading-relaxed text-neutral-200">
            <code className="block font-mono">{templateJson}</code>
          </pre>
        </div>
      </div>

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
        <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {friends.map((f: Friend) => (
            <li key={f.url}>
              <Card className="card-lift h-full gap-0 py-0">
                <a
                  href={f.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-discover="false"
                  title={f.description || '点击访问友链'}
                  className="group flex h-full gap-3 p-4"
                >
                  <FriendAvatar src={f.logo} name={f.name} />
                  <div className="min-w-0 flex-1">
                    <h2 className="truncate font-bold text-foreground transition-colors group-hover:text-(--brand)">
                      {f.name}
                    </h2>
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                      {f.description || '暂无简介'}
                    </p>
                    {f.rss ? <Badge variant="brand" className="mt-2">RSS</Badge> : null}
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
