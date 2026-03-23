import { useMemo, useRef, useState } from 'react';
import type { HomeCardData, HomeFilter } from '../data/home-cards';
import { useFLIP } from './useFLIP';

export function useFilterSystem(cards: HomeCardData[]) {
  const [activeFilters, setActiveFilters] = useState<Set<HomeFilter>>(new Set(['all']));
  const itemRefs = useRef(new Map<string, HTMLDivElement>());

  const visibleCards = useMemo(() => {
    return cards.filter((card) => {
      if (activeFilters.has('all')) return true;
      const categories = card.category?.split(' ') ?? [];
      return categories.some((category) => activeFilters.has(category as HomeFilter));
    });
  }, [activeFilters, cards]);

  useFLIP(
    visibleCards
      .map((card) => itemRefs.current.get(card.id))
      .filter((value): value is HTMLDivElement => Boolean(value)),
    [visibleCards.map((card) => card.id).join('|')],
    250,
  );

  const toggleFilter = (filter: HomeFilter) => {
    setActiveFilters((current) => {
      const next = new Set(current);
      if (filter === 'all') {
        return new Set(['all']);
      }

      if (next.has('all')) {
        next.delete('all');
        next.add(filter);
        return next;
      }

      if (next.has(filter)) {
        next.delete(filter);
      } else {
        next.add(filter);
      }

      if (next.size === 0) {
        next.add('all');
      }

      return next;
    });
  };

  const isActive = (filter: HomeFilter) => activeFilters.has(filter);

  return {
    activeFilters,
    isActive,
    itemRefs,
    toggleFilter,
    visibleCards,
  };
}
