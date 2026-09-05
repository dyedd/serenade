// Floating "back to top" button. Hidden until the page scrolls past 400px.
import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';

export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollUp = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <button
      type="button"
      onClick={scrollUp}
      aria-label="回到顶部"
      className={[
        'fixed bottom-8 right-8 z-50 inline-flex h-10 w-10 items-center justify-center rounded-full',
        'bg-primary text-primary-foreground shadow-lg shadow-primary/20',
        'transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
        visible ? 'opacity-100 translate-y-0' : 'pointer-events-none opacity-0 translate-y-4',
      ].join(' ')}
    >
      <ArrowUp className="h-4 w-4" />
    </button>
  );
}
