import { useMemo } from 'react';
import { useScrollPosition } from './useScrollPosition';

export function useBorderVisibility() {
  const { scrollY, distanceFromBottom } = useScrollPosition();

  return useMemo(() => {
    let topBorderClassName = 'pom-border-top';
    if (scrollY <= 0) {
      topBorderClassName += '';
    } else if (scrollY < 20) {
      topBorderClassName += ' fading';
    } else {
      topBorderClassName += ' visible';
    }

    let bottomBorderClassName = 'pom-border-bottom';
    if (distanceFromBottom <= 0) {
      bottomBorderClassName += ' hidden';
    } else if (distanceFromBottom < 50) {
      bottomBorderClassName += ' fading';
    }

    return { topBorderClassName, bottomBorderClassName, distanceFromBottom };
  }, [distanceFromBottom, scrollY]);
}
