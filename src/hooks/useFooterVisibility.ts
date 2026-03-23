import { useEffect, useState } from 'react';
import { useScrollPosition } from './useScrollPosition';

export function useFooterVisibility() {
  const { distanceFromBottom } = useScrollPosition();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(distanceFromBottom <= 50);
  }, [distanceFromBottom]);

  return visible;
}
