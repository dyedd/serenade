// List-page title block. Eyebrow is the page path (~/posts); counts belong
// in meta only when the page has no other census (sidebar, filters, …).
import type { ReactNode } from 'react';

interface PageHeaderProps {
  eyebrow?: ReactNode;
  title: ReactNode;
  meta?: ReactNode;
  actions?: ReactNode;
  children?: ReactNode;
}

export function PageHeader({ eyebrow, title, meta, actions, children }: PageHeaderProps) {
  return (
    <header className="mb-10">
      {eyebrow || actions ? (
        <div className="mb-2 flex items-baseline justify-between gap-4">
          {eyebrow ? <p className="eyebrow">{eyebrow}</p> : <span />}
          {actions ? <div className="mono-meta shrink-0">{actions}</div> : null}
        </div>
      ) : null}
      <h1 className="font-heading text-3xl font-bold tracking-tight">{title}</h1>
      {meta ? <div className="mono-meta mt-2">{meta}</div> : null}
      {children ? <div className="page-lead mt-3">{children}</div> : null}
    </header>
  );
}
