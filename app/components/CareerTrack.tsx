// Career path as inline SVG. Rail/dots are drawn; labels sit in foreignObject
// so they wrap at reading size and stay unselectable.
import { Briefcase, GraduationCap, IdCard, Laptop } from 'lucide-react';
import type { CareerItem } from '~/lib/content/career';

const TYPE_ICON = {
  实习: IdCard,
  全职: Briefcase,
  在读: GraduationCap,
  业余: Laptop,
} as const;

function TypeBadge({ type }: { type: NonNullable<CareerItem['type']> }) {
  if (!type) return null;
  const Icon = TYPE_ICON[type as keyof typeof TYPE_ICON];
  return (
    <span className="career-type">
      {Icon ? <Icon aria-hidden /> : null}
      {type}
    </span>
  );
}

type Node = CareerItem & { slot?: boolean };

function rowHeight(n: Node) {
  const noteLines = n.note ? Math.max(1, Math.ceil(n.note.length / 22)) : 0;
  const orgLine = n.org ? 22 : 0;
  const roleLine = n.role ? 22 : 0;
  const periodLine = 16;
  return 12 + orgLine + roleLine + periodLine + noteLines * 20 + 16;
}

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

  let cursor = 8;
  const placed = nodes.map((n) => {
    const h = rowHeight(n);
    const top = cursor;
    cursor += h;
    return { ...n, top, h };
  });
  const height = cursor + 8;
  const railX = 18;
  const spoken = nodes
    .map((n) => [n.org, n.role, n.type, n.period, n.note].filter(Boolean).join('，'))
    .join('。');

  const blockCopy = (e: { preventDefault: () => void }) => {
    e.preventDefault();
  };

  return (
    <div className="career-track-wrap">
      <p className="sr-only">{spoken}</p>
      <svg
        className="career-track"
        width="100%"
        height={height}
        role="presentation"
        aria-hidden
        onCopy={blockCopy}
        onCut={blockCopy}
        onContextMenu={blockCopy}
      >
        <line
          x1={railX}
          y1={placed[0].top + 8}
          x2={railX}
          y2={placed[placed.length - 1].top + 8}
          className="career-rail"
        />
        {placed.map((row) => {
          const cy = row.top + 10;
          return (
            <g key={`${row.org}-${row.role}-${row.period}`}>
              {row.slot ? (
                <circle cx={railX} cy={cy} r="5.5" className="career-dot-slot" />
              ) : (
                <circle cx={railX} cy={cy} r="5.5" className="career-dot" />
              )}
              <foreignObject x={36} y={row.top} width="90%" height={row.h}>
                <div className="career-copy">
                  <div className="career-org-row">
                    <span className="career-org">{row.org || row.role}</span>
                    {row.type ? <TypeBadge type={row.type} /> : null}
                  </div>
                  {row.org && row.role ? <div className="career-role">{row.role}</div> : null}
                  {row.period ? <div className="career-period">{row.period}</div> : null}
                  {row.note ? <div className="career-note">{row.note}</div> : null}
                </div>
              </foreignObject>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
