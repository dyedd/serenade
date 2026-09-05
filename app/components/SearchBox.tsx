// Search dialog: shadcn Command (cmdk) over /api/posts/search.
// Triggered from a search button in the nav; opens a modal with debounced query.
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Search as SearchIcon } from 'lucide-react';
import { Spinner } from '~/components/ui/spinner';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '~/components/ui/command';

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
    if (!query.trim()) {
      setHits([]);
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
  }, [query]);

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="搜索文章"
      description="输入关键词搜索文章标题、正文和标签"
    >
      <CommandInput
        placeholder="搜索文章..."
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
            <Spinner /> 搜索中…
          </div>
        ) : hits.length === 0 ? (
          <CommandEmpty>
            {query.trim() ? `没有匹配 “${query}” 的文章` : '输入关键词开始搜索'}
          </CommandEmpty>
        ) : (
          <CommandGroup heading="文章">
            {hits.map((h) => (
              <CommandItem
                key={h.path}
                value={`${h.path} ${h.title} ${h.tags.join(' ')}`}
                onSelect={() => {
                  onOpenChange(false);
                  navigate(`/posts/${h.path}`);
                }}
              >
                <SearchIcon className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                <div className="flex flex-col min-w-0">
                  <span className="font-medium truncate">{h.title}</span>
                  <span className="text-xs text-muted-foreground">
                    {h.date}
                    {h.readingTime ? ` · ${h.readingTime}` : ''}
                    {h.tags.length > 0 ? ` · ${h.tags.map((t) => `#${t}`).join(' ')}` : ''}
                  </span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}
