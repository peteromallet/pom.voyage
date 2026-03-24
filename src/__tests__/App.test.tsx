import { describe, it, expect, vi } from 'vitest';
import { render, screen, act as rtlAct } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { App } from '../App';
import type { InitialData } from '../types';

// Prevent real network calls from client-posts
vi.mock('../lib/client-posts', () => ({
  getClientPosts: vi.fn().mockResolvedValue(null),
  getClientPostPage: vi.fn().mockResolvedValue(null),
}));

vi.mock('../pages/Feedback', () => ({
  FeedbackPage: () => <div>Feedback Page Mock</div>,
}));

function renderApp(initialData: InitialData, route = '/') {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <App initialData={initialData} />
    </MemoryRouter>,
  );
}

describe('App', () => {
  it('renders the home page at "/"', () => {
    const { container } = renderApp({ page: 'home' }, '/');
    // Use the section-toggle nav to avoid ambiguity with HOME_BODY_HTML filter buttons
    expect(container.querySelector('.section-toggle')).not.toBeNull();
    expect(screen.getByText('About')).toBeInTheDocument();
  });

  it('renders the posts listing page at "/posts"', async () => {
    await rtlAct(async () => {
      renderApp({ page: 'posts', posts: [] }, '/posts');
    });
    expect(screen.getByText(/no posts yet/i)).toBeInTheDocument();
  });

  it('renders post cards when posts are provided', () => {
    const posts = [
      {
        slug: 'test-post',
        title: 'Test Post',
        excerpt: 'An excerpt.',
        date: '2024-01-01',
        formattedDate: 'January 1, 2024',
      },
    ];
    renderApp({ page: 'posts', posts }, '/posts');
    expect(screen.getByText('Test Post')).toBeInTheDocument();
  });

  it('renders the 404 page at "/404"', () => {
    renderApp({ page: '404' }, '/404');
    expect(screen.getByText(/went missing/i)).toBeInTheDocument();
  });

  it('renders the 404 page for unknown routes', () => {
    renderApp({ page: '404' }, '/this-does-not-exist');
    expect(screen.getByText(/went missing/i)).toBeInTheDocument();
  });

  it('renders the assorted page at "/assorted"', () => {
    const { container } = renderApp({ page: 'assorted' }, '/assorted');
    // ASSORTED_INDEX_HTML contains the assorted section
    expect(container.querySelector('#sorted-section')).not.toBeNull();
  });

  it('renders the feedback page at "/assorted/feedback"', () => {
    renderApp({ page: 'feedback', feedback: [] }, '/assorted/feedback');
    expect(screen.getByText('Feedback Page Mock')).toBeInTheDocument();
  });
});
