// Career path as a quiet list. A hairline marks the column.
import type { CareerItem } from '~/lib/content/career';

export function CareerTrack({ items }: { items: readonly CareerItem[] }) {
  const nodes = items;
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
    </div>
  );
}
