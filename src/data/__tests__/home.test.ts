import { describe, it, expect } from 'vitest';
import { HOME_CARDS, HOME_SOCIAL_LINKS, HOME_SQUARE_IMAGES } from '../home-cards';

describe('home-cards data', () => {
  it('defines square image tiles', () => {
    expect(HOME_SQUARE_IMAGES).toHaveLength(3);
  });

  it('defines social links', () => {
    expect(HOME_SOCIAL_LINKS.length).toBeGreaterThan(0);
  });

  it('defines dashboard cards with stable positions', () => {
    expect(HOME_CARDS.length).toBeGreaterThan(0);
    expect(new Set(HOME_CARDS.map((card) => card.position)).size).toBe(HOME_CARDS.length);
  });
});
