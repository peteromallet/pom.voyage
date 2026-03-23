export interface DomContract {
  description: string;
  selector: string;
  count?: number;
}

export const HOME_DOM_CONTRACTS: DomContract[] = [
  { description: 'About section wrapper', selector: '#about-section', count: 1 },
  { description: 'Square image containers', selector: '.square-image-container', count: 3 },
  { description: 'Filter buttons', selector: '.filter-btn', count: 6 },
  { description: 'Weights chart container', selector: '#weights-chart-container', count: 1 },
  { description: 'Weights title', selector: '#weights-title', count: 1 },
  { description: 'Plant bud', selector: '#initialBud', count: 1 },
  { description: 'Plant canvas', selector: '#plantCanvas', count: 1 },
];
