import { useEffect, useRef, useCallback } from 'react';

export const useImagePreloader = () => {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const preloadedImages = useRef<Set<string>>(new Set());

  const preloadImage = useCallback((src: string) => {
    if (preloadedImages.current.has(src)) return;
    
    const img = new Image();
    img.src = src;
    preloadedImages.current.add(src);
  }, []);

  const preloadImages = useCallback((images: string[]) => {
    images.forEach(preloadImage);
  }, [preloadImage]);

  const observeElement = useCallback((element: Element, imagesToPreload: string[]) => {
    if (!observerRef.current) {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const images = JSON.parse(entry.target.getAttribute('data-images') || '[]');
              preloadImages(images);
              observerRef.current?.unobserve(entry.target);
            }
          });
        },
        {
          rootMargin: '200px', // Start loading 200px before the element comes into view
        }
      );
    }

    element.setAttribute('data-images', JSON.stringify(imagesToPreload));
    observerRef.current.observe(element);
  }, [preloadImages]);

  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  return {
    preloadImage,
    preloadImages,
    observeElement,
  };
};