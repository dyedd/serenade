// Career path as a quiet list. A hairline marks the column; type is caption
// text, not a badge, so the row stays inside the track and does not grow chrome.
import type { CareerItem } from '~/lib/content/career';

type Node = CareerItem & { slot?: boolean };

export function CareerTrack({ items }: { items: readonly CareerItem[] }) {
  const nodes: Node[] = [
    ...items,
    {
      period: '',
      org: '此后',
      role: '',
      type: '',
      note: '新的节点会写在这里，不用改版式。',
      slot: true,
    },
  ];
  const spoken = nodes
    .map((n) => [n.org, n.role, n.type, n.period, n.note].filter(Boolean).join('，'))
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
            className={row.slot ? 'career-item career-item-slot' : 'career-item'}
          >
            <div className="career-copy">
              <div className="career-org-row">
                <span className="career-org">{row.org || row.role}</span>
                {row.type ? <span className="career-type">{row.type}</span> : null}
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
