// Career path. The rail is a hairline behind the list; labels stay in normal
// flow so they wrap inside the track (rail inset) instead of a percentage
// width drawn past that inset.
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
                {row.type ? <TypeBadge type={row.type} /> : null}
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
