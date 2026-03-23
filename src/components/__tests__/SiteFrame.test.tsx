import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SiteFrame } from '../SiteFrame';

describe('SiteFrame', () => {
  it('renders children', () => {
    render(
      <SiteFrame>
        <p>Test child content</p>
      </SiteFrame>,
    );
    expect(screen.getByText('Test child content')).toBeInTheDocument();
  });

  it('does not render the footer by default', () => {
    const { container } = render(
      <SiteFrame>
        <span>content</span>
      </SiteFrame>,
    );
    expect(container.querySelector('.github-suggestion-footer')).toBeNull();
  });

  it('renders the footer when showFooter is true', () => {
    const { container } = render(
      <SiteFrame showFooter>
        <span>content</span>
      </SiteFrame>,
    );
    expect(container.querySelector('.github-suggestion-footer')).not.toBeNull();
  });

  it('footer contains a link to the GitHub repository', () => {
    render(
      <SiteFrame showFooter>
        <span>content</span>
      </SiteFrame>,
    );
    const link = screen.getByRole('link', { name: /suggest changes/i });
    expect(link).toHaveAttribute('href', expect.stringContaining('github.com'));
  });

  it('renders POM border elements', () => {
    const { container } = render(
      <SiteFrame>
        <span>content</span>
      </SiteFrame>,
    );
    expect(container.querySelector('.pom-border-top')).not.toBeNull();
    expect(container.querySelector('.pom-border-bottom')).not.toBeNull();
  });

  it('renders 360 POM letter spans (60 repetitions × 3 letters × 2 borders)', () => {
    const { container } = render(
      <SiteFrame>
        <span>content</span>
      </SiteFrame>,
    );
    // Each border (top + bottom) has 60 * 3 = 180 spans, total 360
    const spans = container.querySelectorAll('.letter-p, .letter-o, .letter-m');
    expect(spans.length).toBe(360);
  });
});
