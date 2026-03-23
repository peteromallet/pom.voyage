import { useEffect, useState } from 'react';

interface ScrollPositionState {
  scrollY: number;
  scrollPercent: number;
  distanceFromBottom: number;
}

function getState(): ScrollPositionState {
  if (typeof window === 'undefined') {
    return { scrollY: 0, scrollPercent: 0, distanceFromBottom: 0 };
  }

  const scrollY = window.pageYOffset || document.documentElement.scrollTop;
  const viewportHeight = window.innerHeight;
  const totalHeight = Math.max(
    document.body.scrollHeight,
    document.body.offsetHeight,
    document.documentElement.clientHeight,
    document.documentElement.scrollHeight,
    document.documentElement.offsetHeight,
  );
  const distanceFromBottom = totalHeight - (scrollY + viewportHeight);
  const maxScroll = Math.max(totalHeight - viewportHeight, 1);

  return {
    scrollY,
    scrollPercent: Math.min(Math.max(scrollY / maxScroll, 0), 1),
    distanceFromBottom,
  };
}

export function useScrollPosition() {
  const [state, setState] = useState<ScrollPositionState>(getState);

  useEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;
      setState(getState());
    };

    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(update);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    update();

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return state;
}
