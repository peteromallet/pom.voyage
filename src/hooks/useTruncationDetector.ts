import { useEffect, type RefObject } from 'react';

export function useTruncationDetector(ref: RefObject<HTMLElement | null>, deps: unknown[] = []) {
  useEffect(() => {
    const root = ref.current;
    if (!root) return;

    const update = () => {
      root.querySelectorAll<HTMLElement>('.card p').forEach((paragraph) => {
        if (paragraph.scrollHeight > paragraph.clientHeight) {
          paragraph.classList.add('truncated');
        } else {
          paragraph.classList.remove('truncated');
        }
      });
    };

    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [ref, ...deps]);
}
