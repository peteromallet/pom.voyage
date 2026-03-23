import { useEffect, useRef, type MutableRefObject } from 'react';
import type { HomeCardData } from '../../data/home-cards';
import { useCardExpansion } from '../../hooks/useCardExpansion';
import { useLoadingStagger } from '../../hooks/useLoadingStagger';
import { useTruncationDetector } from '../../hooks/useTruncationDetector';
import { CardContent } from './cards';

interface DashboardProps {
  cards: HomeCardData[];
  itemRefs: MutableRefObject<Map<string, HTMLDivElement>>;
}

export function Dashboard({ cards, itemRefs }: DashboardProps) {
  const dashboardRef = useRef<HTMLDivElement | null>(null);
  const { expandedCardId, isMobile, onCardMouseEnter, onCardToggle } = useCardExpansion();

  useLoadingStagger(dashboardRef, [cards.map((card) => card.id).join('|')]);
  useTruncationDetector(dashboardRef, [cards.map((card) => card.id).join('|'), expandedCardId]);

  // Calculate equal-height rows — only recalculate when cards change or on resize, NOT on expansion
  useEffect(() => {
    const dashboard = dashboardRef.current;
    if (!dashboard || isMobile) {
      dashboard?.classList.add('visible');
      return;
    }

    function recalcRows() {
      if (!dashboard) return;
      const cardsInDom = Array.from(dashboard.querySelectorAll<HTMLElement>('.card'));
      const rows = new Map<number, HTMLElement[]>();

      cardsInDom.forEach((card) => {
        const top = Math.round(card.getBoundingClientRect().top);
        const row = rows.get(top) ?? [];
        row.push(card);
        rows.set(top, row);
      });

      rows.forEach((rowCards) => {
        const maxHeight = Math.max(...rowCards.map((card) => card.scrollHeight));
        rowCards.forEach((card) => {
          card.style.setProperty('--row-height', `${maxHeight}px`);
        });
      });

      dashboard.classList.add('visible');
    }

    recalcRows();

    const resizeObserver = new ResizeObserver(() => recalcRows());
    resizeObserver.observe(dashboard);

    return () => resizeObserver.disconnect();
  }, [cards, isMobile]);

  return (
    <div className="dashboard" ref={dashboardRef}>
      {cards
        .slice()
        .sort((left, right) => left.position - right.position)
        .map((card) => {
          const expanded = expandedCardId === card.id;
          return (
            <div
              key={card.id}
              ref={(node) => {
                if (node) {
                  itemRefs.current.set(card.id, node);
                } else {
                  itemRefs.current.delete(card.id);
                }
              }}
              className={`${card.cardClassName}${expanded ? ' expanded' : ''}`}
              data-category={card.category}
              data-position={String(card.position)}
              data-card-id={card.id}
              onPointerEnter={(event) =>
                onCardMouseEnter(card.id, event.currentTarget.getBoundingClientRect())
              }
              onClick={() => onCardToggle(card.id)}
              style={!isMobile && !expanded ? { height: 'var(--row-height)' } : undefined}
            >
              <CardContent card={card} expanded={expanded} isMobile={isMobile} />
            </div>
          );
        })}
    </div>
  );
}
