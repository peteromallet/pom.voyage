import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { PostPage } from '../Post';
import type { PostPageData } from '../../types';

vi.mock('../../lib/client-posts', () => ({
  getClientPostPage: vi.fn().mockResolvedValue(null),
}));

afterEach(() => {
  vi.restoreAllMocks();
});

const FULL_POST_DATA: PostPageData = {
  post: {
    slug: 'hello-world',
    title: 'Hello World',
    excerpt: 'An excerpt.',
    date: '2024-01-15',
    formattedDate: 'January 15, 2024',
    html: '<p>Post body content.</p>',
  },
  prevPost: {
    slug: 'prev-post',
    title: 'Previous Post',
    excerpt: '',
    date: '2024-01-14',
    formattedDate: 'January 14, 2024',
  },
  nextPost: {
    slug: 'next-post',
    title: 'Next Post',
    excerpt: '',
    date: '2024-01-16',
    formattedDate: 'January 16, 2024',
  },
};

function renderPostPage(data?: PostPageData) {
  return render(
    <MemoryRouter initialEntries={['/posts/hello-world']}>
      <Routes>
        <Route path="/posts/:slug" element={<PostPage data={data} />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('PostPage', () => {
  it('renders without crashing when no data is provided (loading state)', () => {
    const { container } = renderPostPage(undefined);
    expect(container).not.toBeNull();
  });

  it('renders the post title', () => {
    renderPostPage(FULL_POST_DATA);
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });

  it('renders the formatted date', () => {
    renderPostPage(FULL_POST_DATA);
    expect(screen.getByText('January 15, 2024')).toBeInTheDocument();
  });

  it('renders navigation link to previous post', () => {
    renderPostPage(FULL_POST_DATA);
    expect(screen.getByText('Previous Post')).toBeInTheDocument();
    const prevLink = screen.getByText('Previous Post').closest('a');
    expect(prevLink).toHaveAttribute('href', '/posts/prev-post');
  });

  it('renders navigation link to next post', () => {
    renderPostPage(FULL_POST_DATA);
    expect(screen.getByText('Next Post')).toBeInTheDocument();
    const nextLink = screen.getByText('Next Post').closest('a');
    expect(nextLink).toHaveAttribute('href', '/posts/next-post');
  });

  it('renders nothing (null) when post is not found in provided data', () => {
    const noPostData: PostPageData = { post: null, prevPost: null, nextPost: null };
    const { container } = renderPostPage(noPostData);
    // The component returns null when there's no post after loading
    expect(container.querySelector('article')).toBeNull();
  });

  it('renders post content HTML', () => {
    renderPostPage(FULL_POST_DATA);
    expect(screen.getByText('Post body content.')).toBeInTheDocument();
  });
});
