import { useEffect, useState } from 'react';
import { useMediaQuery } from './useMediaQuery';

export function useImageHover(length: number) {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!isMobile) {
      setActiveIndex(null);
    }
  }, [isMobile]);

  return {
    activeIndex,
    isMobile,
    onEnter(index: number) {
      setActiveIndex(index);
    },
    onLeave() {
      if (!isMobile) setActiveIndex(null);
    },
    onToggle(index: number) {
      if (!isMobile) return;
      setActiveIndex((current) => (current === index ? null : index));
    },
    clearOthers(index: number) {
      if (!isMobile) return false;
      return index === activeIndex;
    },
    length,
  };
}
