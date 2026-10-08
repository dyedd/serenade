import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Search as SearchIcon } from 'lucide-react';
import { Spinner } from '~/components/ui/spinner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog';
import { Input } from '~/components/ui/input';

interface Hit {
  path: string;
  title: string;
  date: string;
  abstract: string;
  tags: string[];
  readingTime?: string;
}

export function SearchBox({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [query, setQuery] = useState('');
  const [hits, setHits] = useState<Hit[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) {
      setQuery('');
      setHits([]);
      setLoading(false);
    }
  }, [open]);

  useEffect(() => {
    if (!open || !query.trim()) {
      setHits([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/posts/search?keyword=${encodeURIComponent(query)}&pageSize=8`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as { data: Hit[] };
        if (!cancelled) setHits(data.data);
      } catch {
        if (!cancelled) setHits([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 200);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [open, query]);

  const go = (path: string) => {
    onOpenChange(false);
    navigate(`/posts/${path}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="top-[20%] translate-y-0 gap-0 overflow-hidden p-0 sm:max-w-lg"
        showCloseButton={false}
      >
        <DialogHeader className="sr-only">
          <DialogTitle>搜索文章</DialogTitle>
          <DialogDescription>输入关键词搜索文章标题、正文和标签</DialogDescription>
        </DialogHeader>
        <div className="flex items-center gap-2 border-b border-border px-3">
          <SearchIcon className="size-4 shrink-0 text-black/60" aria-hidden />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索文章、标签…"
            aria-label="搜索文章"
            className="h-11 border-0 bg-transparent shadow-none focus-visible:ring-0 dark:bg-transparent"
            autoComplete="off"
            autoFocus
          />
        </div>
        <div className="max-h-72 overflow-y-auto p-1">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
              <Spinner /> 搜索中…
            </div>
          ) : hits.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              {query.trim() ? `没有匹配 “${query}” 的文章` : '输入关键词开始搜索'}
            </p>
          ) : (
            <ul>
              {hits.map((h) => (
                <li key={h.path}>
                  <button
                    type="button"
                    onClick={() => go(h.path)}
                    className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-left text-sm transition-colors duration-200 ease hover:bg-muted"
                  >
                    <SearchIcon className="h-4 w-4 shrink-0 text-black/40" />
                    <span className="flex min-w-0 flex-col">
                      <span className="truncate font-medium">{h.title}</span>
                      <span className="text-xs text-muted-foreground">
                        {h.date}
                        {h.readingTime ? ` · ${h.readingTime}` : ''}
                        {h.tags.length > 0 ? ` · ${h.tags.map((t) => `#${t}`).join(' ')}` : ''}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
