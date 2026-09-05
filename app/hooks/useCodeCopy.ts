import { useEffect } from 'react';

export function useCodeCopy() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const btn = (e.target as HTMLElement).closest('.copy-btn');
      if (!btn) return;
      const wrapper = btn.closest('.code-block-wrapper');
      const code = wrapper?.querySelector('pre code');
      if (!code) return;
      const original = btn.innerHTML;
      const flash = (text: string) => {
        btn.innerHTML = `<span style="font-family:var(--font-mono)">${text}</span>`;
        window.setTimeout(() => {
          btn.innerHTML = original;
        }, 1500);
      };
      navigator.clipboard.writeText(code.textContent ?? '').then(
        () => flash('已复制 ✓'),
        () => flash('复制失败'),
      );
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);
}
