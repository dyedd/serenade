// Dark mode toggle button. Sun/moon swap with a small zoom transition.
// `mounted` gates the icon so SSR and the first client render agree
// (the pre-hydration script in root.tsx already applied the real theme).
import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { useTheme } from '~/hooks/useTheme';

export function DarkModeToggle() {
  const { isDark, toggle } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  const dark = mounted && isDark;

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={toggle}
      aria-label={dark ? '切换到亮色' : '切换到暗色'}
      className="hover:text-(--brand)"
    >
      {dark ? (
        <Sun key="sun" className="h-4 w-4 animate-in fade-in zoom-in-50 duration-300" />
      ) : (
        <Moon key="moon" className="h-4 w-4 animate-in fade-in zoom-in-50 duration-300" />
      )}
    </Button>
  );
}
