import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NotFoundPage } from '../NotFound';

describe('NotFoundPage', () => {
  it('renders without crashing', () => {
    const { container } = render(<NotFoundPage />);
    expect(container).not.toBeNull();
  });

  it('displays the missing-page message', () => {
    render(<NotFoundPage />);
    expect(screen.getByText(/went missing/i)).toBeInTheDocument();
  });

  it('renders a link back to home', () => {
    render(<NotFoundPage />);
    const link = screen.getByRole('link', { name: /go back home/i });
    expect(link).toHaveAttribute('href', '/');
  });

  it('renders P, O, M letters', () => {
    render(<NotFoundPage />);
    expect(screen.getAllByText('P').length).toBeGreaterThan(0);
    expect(screen.getAllByText('O').length).toBeGreaterThan(0);
    expect(screen.getAllByText('M').length).toBeGreaterThan(0);
  });
});
