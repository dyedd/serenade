import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router';

export function ImageLightbox() {
  const [image, setImage] = useState<{ src: string; alt: string } | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const lastFocusedRef = useRef<HTMLElement | null>(null);
  const { pathname } = useLocation();

  // 前进/后退切换页面时关掉预览：它是挂在布局上的单例，不跟随路由重置。
  useEffect(() => {
    setImage(null);
  }, [pathname]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const img = target.closest('img.post-image, img.post-cover');
      if (!(img instanceof HTMLImageElement)) return;
      const src = img.currentSrc || img.src;
      if (!src) return;
      event.preventDefault();
      lastFocusedRef.current = document.activeElement as HTMLElement | null;
      setImage({ src, alt: img.alt });
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setImage(null);
    };
    document.addEventListener('click', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('click', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  // 声明成 aria-modal 就要真的把焦点管起来：打开时移入、Tab 不跑出去、关闭后归还。
  useEffect(() => {
    if (!image) return;
    const closeButton = closeButtonRef.current;
    closeButton?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;
      event.preventDefault();
      closeButton?.focus();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      lastFocusedRef.current?.focus?.();
    };
  }, [image]);

  // 只锁滚动，不覆写 body.style.overflow：Radix 的对话框也用同一个内联样式，
  // 无脑置空会把它的滚动锁一起解开。
  useEffect(() => {
    if (!image) return;
    const { body } = document;
    const previous = body.style.overflow;
    body.style.overflow = 'hidden';
    return () => {
      body.style.overflow = previous;
    };
  }, [image]);

  if (!image) return null;

  return (
    <div
      className="image-lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={image.alt || '图片预览'}
      onClick={(event) => {
        if (event.target === event.currentTarget) setImage(null);
      }}
    >
      <button
        ref={closeButtonRef}
        type="button"
        className="image-lightbox-close"
        aria-label="关闭预览"
        onClick={() => setImage(null)}
      >
        关闭
      </button>
      <img src={image.src} alt={image.alt} />
    </div>
  );
}
