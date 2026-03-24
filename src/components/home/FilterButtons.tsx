import type { HomeFilter } from '../../data/home-cards';

interface FilterButtonsProps {
  filters: Array<{ key: HomeFilter; label: string }>;
  isActive: (filter: HomeFilter) => boolean;
  onToggle: (filter: HomeFilter) => void;
}

export function FilterButtons({ filters, isActive, onToggle }: FilterButtonsProps) {
  return (
    <div className="loading-element mt-5 mb-4 flex flex-wrap justify-center gap-2 px-2.5">
      {filters.map((filter) => (
        <button
          key={filter.key}
          type="button"
          className={`filter-btn inline-flex items-center${isActive(filter.key) ? ' active' : ''}`}
          data-filter={filter.key}
          onClick={() => onToggle(filter.key)}
        >
          {filter.label} <span className="deselect-icon">×</span>
        </button>
      ))}
    </div>
  );
}
