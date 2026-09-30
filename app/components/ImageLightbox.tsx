// 正文和封面图点击后放大。图片来自 Markdown HTML，用事件委托，不改每篇文章的结构。
import { useEffect, useState } from 'react';

export function ImageLightbox() {
  const [image, setImage] = useState<{ src: string; alt: string } | null>(null);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const img = target.closest('img.post-image, img.post-cover');
      if (!(img instanceof HTMLImageElement)) return;
      const src = img.currentSrc || img.src;
      if (!src) return;
      event.preventDefault();
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

  useEffect(() => {
    document.body.style.overflow = image ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
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
