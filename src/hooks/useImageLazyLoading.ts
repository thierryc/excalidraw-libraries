import { useEffect, useRef } from 'react';

export const useImageLazyLoading = () => {
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const lazyImages = document.querySelectorAll("img.lazy");

    if ("IntersectionObserver" in window) {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }

      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const lazyImage = entry.target as HTMLImageElement;
              lazyImage.src = lazyImage.dataset.src || '';
              lazyImage.classList.remove("lazy");
              observerRef.current?.unobserve(lazyImage);
            }
          });
        },
        {
          rootMargin: "0px 0px 500px 0px",
        }
      );

      lazyImages.forEach((lazyImage) => {
        observerRef.current?.observe(lazyImage);
      });
    } else {
      lazyImages.forEach((lazyImage) => {
        (lazyImage as HTMLImageElement).src = (lazyImage as HTMLImageElement).dataset.src || '';
      });
    }

    return () => {
      observerRef.current?.disconnect();
    };
  }, []);
};