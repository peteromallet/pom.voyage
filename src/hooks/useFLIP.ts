import { useLayoutEffect, useRef } from 'react';

export function useFLIP<T extends HTMLElement>(
  elements: T[],
  deps: unknown[],
  duration = 500,
) {
  const previousRects = useRef(new Map<T, DOMRect>());

  useLayoutEffect(() => {
    const nextRects = new Map<T, DOMRect>();
    elements.forEach((element) => {
      nextRects.set(element, element.getBoundingClientRect());
    });

    elements.forEach((element) => {
      const previousRect = previousRects.current.get(element);
      const nextRect = nextRects.get(element);

      if (!previousRect || !nextRect) return;

      const deltaX = previousRect.left - nextRect.left;
      const deltaY = previousRect.top - nextRect.top;

      if (Math.abs(deltaX) < 0.5 && Math.abs(deltaY) < 0.5) return;

      element.style.transition = 'none';
      element.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
      void element.offsetWidth;
      element.style.transition = `transform ${duration}ms ease-out, opacity ${duration}ms ease-out`;
      element.style.transform = '';

      window.setTimeout(() => {
        if (element.style.transition.includes('transform')) {
          element.style.transition = '';
        }
      }, duration);
    });

    previousRects.current = nextRects;
  }, deps);
}
