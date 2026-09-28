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
    <header className="mb-20">
      {eyebrow ? <div className="mb-3 text-sm text-black/60">{eyebrow}</div> : null}
      <div className="flex items-baseline justify-between gap-4">
        <h1 className="min-w-0 font-heading text-[2rem] font-semibold leading-tight tracking-[-0.02em] break-words text-foreground">
          {title}
        </h1>
        {actions ? <div className="shrink-0 text-sm text-black/60">{actions}</div> : null}
      </div>
      {meta ? <p className="mt-2 text-sm text-black/60">{meta}</p> : null}
      {children ? <div className="page-lead mt-4">{children}</div> : null}
    </header>
  );
}
