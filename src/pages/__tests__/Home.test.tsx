import { describe, it, expect } from 'vitest';
import { HomePage } from '../Home';
import { renderWithRouter } from '../../test-utils/render';

function renderHome() {
  return renderWithRouter(<HomePage />);
}

describe('HomePage', () => {
  it('renders without crashing', () => {
    const { container } = renderHome();
    expect(container).not.toBeNull();
  });

  it('renders the header navigation tabs', () => {
    const { container } = renderHome();
    // Use CSS selectors to avoid ambiguity with "Posts" in HOME_BODY_HTML filter buttons
    expect(container.querySelector('.section-toggle')).not.toBeNull();
    expect(container.querySelector('.section-toggle a[href="/posts"]')).not.toBeNull();
    expect(container.querySelector('.section-toggle a[href="/assorted"]')).not.toBeNull();
  });

  it('renders the home content area and dashboard cards', () => {
    const { container } = renderHome();
    expect(container.querySelector('#about-section')).not.toBeNull();
    expect(container.querySelector('.dashboard')).not.toBeNull();
  });
});
