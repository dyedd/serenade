// Numbered pagination composed from the shadcn pagination primitives, with
// react-router Links so SSR + prerendered pages navigate without client JS.
// Page list keeps first/last and current ±1 with ellipsis between.
import { Link } from 'react-router';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '~/components/ui/button';
import {
  Pagination as ShadcnPagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
} from '~/components/ui/pagination';

interface PaginationProps {
  page: number;
  totalPages: number;
  basePath: string;
  pageParam?: string;
}

function pageHref(basePath: string, page: number, pageParam: string) {
  const sep = basePath.includes('?') ? '&' : '?';
  return page === 1 ? basePath : `${basePath}${sep}${pageParam}=${page}`;
}

// Compact page list with ellipsis: always show first/last, current ±1.
function pageList(page: number, totalPages: number): (number | '…')[] {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
  const pages = new Set<number>([1, totalPages, page - 1, page, page + 1]);
  const sorted = Array.from(pages).filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b);
  const out: (number | '…')[] = [];
  let prev = 0;
  for (const p of sorted) {
    if (p - prev > 1) out.push('…');
    out.push(p);
    prev = p;
  }
  return out;
}

export function Pagination({ page, totalPages, basePath, pageParam = 'page' }: PaginationProps) {
  if (totalPages <= 1) return null;

  const prev = Math.max(1, page - 1);
  const next = Math.min(totalPages, page + 1);

  return (
    <ShadcnPagination className="mt-12">
      <PaginationContent>
        <PaginationItem>
          <Button asChild variant="ghost" size="sm" disabled={page <= 1} className={page <= 1 ? 'pointer-events-none opacity-50' : undefined}>
            <Link to={pageHref(basePath, prev, pageParam)} aria-label="上一页">
              <ChevronLeft data-icon="inline-start" />
              上一页
            </Link>
          </Button>
        </PaginationItem>

        {pageList(page, totalPages).map((p, i) =>
          p === '…' ? (
            <PaginationItem key={`ellipsis-${i}`}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : p === page ? (
            <PaginationItem key={p}>
              <Link
                to={pageHref(basePath, p, pageParam)}
                aria-current="page"
                data-slot="pagination-link"
                data-active
                className="inline-flex size-8 items-center justify-center rounded-md border border-(--brand-line) bg-(--brand-soft) font-mono text-sm text-(--brand)"
              >
                {p}
              </Link>
            </PaginationItem>
          ) : (
            <PaginationItem key={p}>
              <Button asChild variant="ghost" size="icon" className="font-mono text-sm">
                <Link to={pageHref(basePath, p, pageParam)} aria-label={`第 ${p} 页`}>
                  {p}
                </Link>
              </Button>
            </PaginationItem>
          )
        )}

        <PaginationItem>
          <Button asChild variant="ghost" size="sm" disabled={page >= totalPages} className={page >= totalPages ? 'pointer-events-none opacity-50' : undefined}>
            <Link to={pageHref(basePath, next, pageParam)} aria-label="下一页">
              下一页
              <ChevronRight data-icon="inline-end" />
            </Link>
          </Button>
        </PaginationItem>
      </PaginationContent>
    </ShadcnPagination>
  );
}
