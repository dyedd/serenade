// Shows ⌘⇧K on Apple, Ctrl+Shift+K elsewhere. Avoids browser Ctrl/⌘+K.
import { useEffect, useState } from 'react';
import { cn } from '~/lib/utils';

export const SEARCH_HOTKEY = {
  isMatch(e: KeyboardEvent) {
    return (e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'k';
  },
};

function detectHotkey() {
  if (typeof navigator === 'undefined') return 'Ctrl+Shift+K';
  const apple =
    /Mac|iPhone|iPad|iPod/.test(navigator.platform) || /Mac OS X/.test(navigator.userAgent);
  return apple ? '⌘⇧K' : 'Ctrl+Shift+K';
}

export function SearchHotkey({ className }: { className?: string }) {
  const [label, setLabel] = useState('Ctrl+Shift+K');
  useEffect(() => setLabel(detectHotkey()), []);
  return (
    <kbd
      className={cn(
        'inline-flex h-4 items-center rounded border border-border bg-muted px-1 font-mono text-[10px]',
        className,
      )}
    >
      {label}
    </kbd>
  );
}
