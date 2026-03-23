import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { PostsPage } from '../Posts';
import type { PostSummary } from '../../types';

// Prevent actual fetch calls in tests
vi.mock('../../lib/client-posts', () => ({
  getClientPosts: vi.fn().mockResolvedValue(null),
}));

function renderPosts(props: React.ComponentProps<typeof PostsPage> = {}) {
  return render(
    <MemoryRouter>
      <PostsPage {...props} />
    </MemoryRouter>,
  );
}

const SAMPLE_POSTS: PostSummary[] = [
  {
    slug: 'first-post',
    title: 'First Post',
    excerpt: 'First excerpt.',
    date: '2024-01-15',
    formattedDate: 'January 15, 2024',
  },
  {
    slug: 'second-post',
    title: 'Second Post',
    excerpt: 'Second excerpt.',
    date: '2024-01-10',
    formattedDate: 'January 10, 2024',
  },
];

afterEach(() => {
  vi.restoreAllMocks();
});

describe('PostsPage', () => {
  it('renders without crashing', () => {
    const { container } = renderPosts();
    expect(container).not.toBeNull();
  });

  it('renders header navigation', () => {
    renderPosts({ posts: SAMPLE_POSTS });
    expect(screen.getByText('About')).toBeInTheDocument();
    expect(screen.getByText('Posts')).toBeInTheDocument();
  });

  it('renders "No posts yet." when passed an empty posts array', async () => {
    await act(async () => {
      renderPosts({ posts: [] });
    });
    expect(screen.getByText(/no posts yet/i)).toBeInTheDocument();
  });

  it('renders a list of post cards when posts are provided', () => {
    renderPosts({ posts: SAMPLE_POSTS });
    expect(screen.getByText('First Post')).toBeInTheDocument();
    expect(screen.getByText('Second Post')).toBeInTheDocument();
  });

  it('renders post excerpts', () => {
    renderPosts({ posts: SAMPLE_POSTS });
    expect(screen.getByText('First excerpt.')).toBeInTheDocument();
    expect(screen.getByText('Second excerpt.')).toBeInTheDocument();
  });

  it('renders formatted dates', () => {
    renderPosts({ posts: SAMPLE_POSTS });
    expect(screen.getByText('January 15, 2024')).toBeInTheDocument();
  });

  it('each post card links to the correct post URL', () => {
    renderPosts({ posts: SAMPLE_POSTS });
    const links = screen.getAllByRole('link');
    const postLinks = links.filter((l) => l.getAttribute('href')?.startsWith('/posts/'));
    expect(postLinks.length).toBe(2);
    expect(postLinks[0]).toHaveAttribute('href', '/posts/first-post');
    expect(postLinks[1]).toHaveAttribute('href', '/posts/second-post');
  });
});
