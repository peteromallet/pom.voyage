import { useCallback, useEffect, useRef, useState } from 'react';
import { useMediaQuery } from './useMediaQuery';

export function useCardExpansion() {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);
  const shellRectsRef = useRef<Map<string, DOMRect>>(new Map());

  useEffect(() => {
    if (!isMobile) setExpandedCardId(null);
  }, [isMobile]);

  useEffect(() => {
    if (!isMobile || !expandedCardId) return;

    const onBodyClick = (event: MouseEvent | TouchEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target?.closest('[data-card-id]')) setExpandedCardId(null);
    };

    document.addEventListener('click', onBodyClick);
    document.addEventListener('touchstart', onBodyClick);
    return () => {
      document.removeEventListener('click', onBodyClick);
      document.removeEventListener('touchstart', onBodyClick);
    };
  }, [expandedCardId, isMobile]);

  const onCardMouseEnter = useCallback(
    (cardId: string, rect: DOMRect) => {
      if (isMobile) return;
      shellRectsRef.current.set(cardId, rect);
      setExpandedCardId(cardId);
    },
    [isMobile],
  );

  useEffect(() => {
    if (isMobile || !expandedCardId) return;

    const onPointerMove = (event: PointerEvent) => {
      const rect = shellRectsRef.current.get(expandedCardId);
      if (
        rect &&
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom
      ) {
        return;
      }

      const hit = document.elementFromPoint(event.clientX, event.clientY) as HTMLElement | null;
      const nextCard = hit?.closest<HTMLElement>('[data-card-id]');
      const nextCardId = nextCard?.dataset.cardId;

      if (nextCardId === expandedCardId) {
        // Still over the expanded card (which grew beyond its original rect)
        shellRectsRef.current.set(expandedCardId, nextCard!.getBoundingClientRect());
        return;
      }

      if (nextCardId) {
        shellRectsRef.current.set(nextCardId, nextCard!.getBoundingClientRect());
        setExpandedCardId(nextCardId);
        return;
      }

      setExpandedCardId(null);
    };

    const onScroll = () => {
      const currentCard = document.querySelector<HTMLElement>(`[data-card-id="${expandedCardId}"]`);
      if (!currentCard) return;
      shellRectsRef.current.set(expandedCardId, currentCard.getBoundingClientRect());
    };

    document.addEventListener('pointermove', onPointerMove);
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      document.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('scroll', onScroll);
    };
  }, [expandedCardId, isMobile]);

  const onCardToggle = useCallback(
    (cardId: string) => {
      if (!isMobile) return;
      setExpandedCardId((current) => (current === cardId ? null : cardId));
    },
    [isMobile],
  );

  return {
    expandedCardId,
    isMobile,
    onCardMouseEnter,
    onCardToggle,
  };
}
