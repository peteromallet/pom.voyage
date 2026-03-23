import { useEffect, type RefObject } from 'react';

// Track whether initial stagger has already run (persists across mounts)
let hasStaggeredOnce = false;

export function useLoadingStagger(ref: RefObject<HTMLElement | null>, deps: unknown[] = []) {
  useEffect(() => {
    const root = ref.current;
    if (!root) return;

    const loadingElements = Array.from(
      root.querySelectorAll<HTMLElement>('.loading-element:not(.removed)'),
    );

    // Skip stagger animation on subsequent mounts (client-side navigation back)
    if (hasStaggeredOnce) {
      // All images are likely cached — just make sure nothing is hidden
      loadingElements.forEach((el) => el.removeAttribute('data-stagger-pending'));
      return;
    }

    hasStaggeredOnce = true;

    // Mark elements as pending (hidden) — CSS hides [data-stagger-pending]
    loadingElements.forEach((element, index) => {
      element.setAttribute('data-stagger-pending', '');
      element.style.transitionDelay = `${(index + 1) * 80}ms`;
    });

    const cleanups = loadingElements.map((element) => {
      const images = Array.from(element.querySelectorAll<HTMLImageElement>('img:not(.ignore-load)'));

      const reveal = () => {
        element.removeAttribute('data-stagger-pending');
      };

      if (images.length === 0) {
        reveal();
        return () => undefined;
      }

      let remaining = images.length;
      const markLoaded = () => {
        remaining -= 1;
        if (remaining <= 0) reveal();
      };

      const listeners = images.map((image) => {
        if (image.complete || !image.src) {
          markLoaded();
          return () => undefined;
        }

        const onLoad = () => markLoaded();
        const onError = () => markLoaded();
        image.addEventListener('load', onLoad, { once: true });
        image.addEventListener('error', onError, { once: true });
        return () => {
          image.removeEventListener('load', onLoad);
          image.removeEventListener('error', onError);
        };
      });

      return () => listeners.forEach((cleanup) => cleanup());
    });

    return () => {
      cleanups.forEach((cleanup) => cleanup());
    };
  }, [ref, ...deps]);
}
