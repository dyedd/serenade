// Career path as a quiet list. A hairline marks the column.
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { CareerItem } from '~/lib/content/career';

export function CareerTrack({ items }: { items: readonly CareerItem[] }) {
  const [expanded, setExpanded] = useState(false);
  const hasMore = items.length > 3;
  const nodes = expanded ? items : items.slice(0, 3);
  const spoken = nodes
    .map((n) => [n.org, n.role, n.period, n.note].filter(Boolean).join('，'))
    .join('。');

  const blockCopy = (e: { preventDefault: () => void }) => {
    e.preventDefault();
  };

  return (
    <div className="career-track-wrap">
      <p className="sr-only">{spoken}</p>
      <ol
        id="career-list"
        className="career-track"
        onCopy={blockCopy}
        onCut={blockCopy}
        onContextMenu={blockCopy}
      >
        {nodes.map((row) => (
          <li
            key={`${row.org}-${row.role}-${row.period}`}
            className="career-item"
          >
            <div className="career-copy">
              <div className="career-org-row">
                <span className="career-org">{row.org || row.role}</span>
              </div>
              {row.org && row.role ? <div className="career-role">{row.role}</div> : null}
              {row.period ? <div className="career-period">{row.period}</div> : null}
              {row.note ? <div className="career-note">{row.note}</div> : null}
            </div>
          </li>
        ))}
      </ol>
      {hasMore ? (
        <button
          type="button"
          aria-expanded={expanded}
          aria-controls="career-list"
          onClick={() => setExpanded((open) => !open)}
          className="mt-1 inline-flex cursor-pointer items-center gap-1 text-sm text-muted-foreground transition-colors duration-200 ease hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          {expanded ? '收起经历' : '展开更多'}
          <ChevronDown
            className={`size-4 transition-transform duration-200 ease${expanded ? ' rotate-180' : ''}`}
            aria-hidden
          />
        </button>
      ) : null}
    </div>
  );
}
