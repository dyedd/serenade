import { useEffect } from 'react';

export function useCodeCopy() {
  useEffect(() => {
    // 记下每个按钮的原始内容，而不是每次点击都读当前 innerHTML：
    // 1.5 秒内连点两次时，第二次读到的是上一次的「已复制」提示，之后再也恢复不了。
    const originals = new WeakMap<Element, string>();
    const timers = new Map<Element, number>();

    const flash = (btn: Element, text: string) => {
      btn.innerHTML = `<span style="font-family:var(--font-mono)">${text}</span>`;
      const existing = timers.get(btn);
      if (existing !== undefined) window.clearTimeout(existing);
      timers.set(
        btn,
        window.setTimeout(() => {
          btn.innerHTML = originals.get(btn) ?? btn.innerHTML;
          timers.delete(btn);
        }, 1500),
      );
    };

    const onClick = (e: MouseEvent) => {
      const btn = (e.target as HTMLElement).closest('.copy-btn');
      if (!btn) return;
      const wrapper = btn.closest('.code-block-wrapper');
      const code = wrapper?.querySelector('pre code');
      if (!code) return;

      if (!originals.has(btn)) originals.set(btn, btn.innerHTML);

      // http（非安全上下文）下 navigator.clipboard 不存在，直接调用会同步抛错，
      // .then 的失败分支根本不会执行。
      if (!navigator.clipboard?.writeText) {
        flash(btn, '当前环境不支持复制');
        return;
      }

      navigator.clipboard.writeText(code.textContent ?? '').then(
        () => flash(btn, '已复制 ✓'),
        () => flash(btn, '复制失败'),
      );
    };

    document.addEventListener('click', onClick);
    return () => {
      document.removeEventListener('click', onClick);
      for (const timer of timers.values()) window.clearTimeout(timer);
      timers.clear();
    };
  }, []);
}
