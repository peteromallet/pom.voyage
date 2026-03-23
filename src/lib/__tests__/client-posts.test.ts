import {
  describe,
  it,
  expect,
  afterEach,
  vi
} from 'vitest';
import { getClientPosts, getClientPostPage } from '../client-posts';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function setWindowConfig(config: unknown) {
  (window as any).__APP_CONFIG__ = config;
}

function clearWindowConfig() {
  delete (window as any).__APP_CONFIG__;
}

const FAKE_CONFIG = {
  supabaseUrl: 'https://fake.supabase.co',
  supabaseAnonKey: 'fake-anon-key',
};

const POST_ROW_1 = {
  slug: 'hello-world',
  title: 'Hello World',
  date: '2024-01-15',
  excerpt: 'A short excerpt.',
};

const POST_ROW_2 = {
  slug: 'second-post',
  title: 'Second Post',
  date: '2024-01-10',
  excerpt: 'Another excerpt.',
};

// ---------------------------------------------------------------------------
// getClientPosts
// ---------------------------------------------------------------------------

describe('getClientPosts', () => {
  afterEach(() => {
    clearWindowConfig();
    vi.restoreAllMocks();
  });

  it('returns null when window.__APP_CONFIG__ is not set', async () => {
    clearWindowConfig();
    const result = await getClientPosts();
    expect(result).toBeNull();
  });

  it('returns null when config is missing supabaseUrl', async () => {
    setWindowConfig({ supabaseAnonKey: 'key' });
    const result = await getClientPosts();
    expect(result).toBeNull();
  });

  it('returns null when config is missing supabaseAnonKey', async () => {
    setWindowConfig({ supabaseUrl: 'https://fake.supabase.co' });
    const result = await getClientPosts();
    expect(result).toBeNull();
  });

  it('fetches posts from Supabase and normalises them', async () => {
    setWindowConfig(FAKE_CONFIG);

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => [POST_ROW_1, POST_ROW_2],
      }),
    );

    const posts = await getClientPosts();
    expect(posts).not.toBeNull();
    expect(posts!.length).toBe(2);
    expect(posts![0].slug).toBe('hello-world');
    expect(posts![0].title).toBe('Hello World');
    expect(posts![0].excerpt).toBe('A short excerpt.');
    expect(posts![0].date).toBe('2024-01-15');
    expect(typeof posts![0].formattedDate).toBe('string');
    expect(posts![0].formattedDate.length).toBeGreaterThan(0);
  });

  it('calls fetch with the correct Supabase URL and auth headers', async () => {
    setWindowConfig(FAKE_CONFIG);

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [],
    });
    vi.stubGlobal('fetch', mockFetch);

    await getClientPosts();

    expect(mockFetch).toHaveBeenCalledOnce();
    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toContain(FAKE_CONFIG.supabaseUrl);
    expect(url).toContain('posts');
    expect(options.headers.apikey).toBe(FAKE_CONFIG.supabaseAnonKey);
    expect(options.headers.Authorization).toContain(FAKE_CONFIG.supabaseAnonKey);
  });

  it('throws when the Supabase response is not ok', async () => {
    setWindowConfig(FAKE_CONFIG);

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({}),
      }),
    );

    await expect(getClientPosts()).rejects.toThrow('500');
  });

  it('normalises missing excerpt to empty string', async () => {
    setWindowConfig(FAKE_CONFIG);

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => [{ slug: 's', title: 'T', date: '2024-01-01', excerpt: null }],
      }),
    );

    const posts = await getClientPosts();
    expect(posts![0].excerpt).toBe('');
  });
});

// ---------------------------------------------------------------------------
// getClientPostPage
// ---------------------------------------------------------------------------

describe('getClientPostPage', () => {
  afterEach(() => {
    clearWindowConfig();
    vi.restoreAllMocks();
  });

  it('returns null when config is not available', async () => {
    clearWindowConfig();
    const result = await getClientPostPage('some-slug');
    expect(result).toBeNull();
  });

  it('returns { post: null, prevPost: null, nextPost: null } when post is not found', async () => {
    setWindowConfig(FAKE_CONFIG);

    vi.stubGlobal(
      'fetch',
      vi.fn()
        .mockResolvedValueOnce({ ok: true, json: async () => [] })  // post query → empty
        .mockResolvedValueOnce({ ok: true, json: async () => [POST_ROW_1, POST_ROW_2] }), // all posts
    );

    const result = await getClientPostPage('nonexistent');
    expect(result).toEqual({ post: null, prevPost: null, nextPost: null });
  });

  it('returns post detail and navigation when post is found', async () => {
    setWindowConfig(FAKE_CONFIG);

    const postWithMarkdown = { ...POST_ROW_1, markdown: '# Hello World\n\nBody text.' };

    vi.stubGlobal(
      'fetch',
      vi.fn()
        .mockResolvedValueOnce({ ok: true, json: async () => [postWithMarkdown] })
        .mockResolvedValueOnce({ ok: true, json: async () => [POST_ROW_1, POST_ROW_2] }),
    );

    const result = await getClientPostPage('hello-world');
    expect(result).not.toBeNull();
    expect(result!.post).not.toBeNull();
    expect(result!.post!.slug).toBe('hello-world');
    expect(result!.post!.title).toBe('Hello World');
    expect(typeof result!.post!.html).toBe('string');
  });

  it('sets nextPost correctly when current post is first in list', async () => {
    setWindowConfig(FAKE_CONFIG);

    const postWithMarkdown = { ...POST_ROW_1, markdown: '# Hello World\n\nBody.' };

    vi.stubGlobal(
      'fetch',
      vi.fn()
        .mockResolvedValueOnce({ ok: true, json: async () => [postWithMarkdown] })
        .mockResolvedValueOnce({ ok: true, json: async () => [POST_ROW_1, POST_ROW_2] }),
    );

    const result = await getClientPostPage('hello-world');
    expect(result!.prevPost).toBeNull();
    expect(result!.nextPost).not.toBeNull();
    expect(result!.nextPost!.slug).toBe('second-post');
  });

  it('sets prevPost correctly when current post is last in list', async () => {
    setWindowConfig(FAKE_CONFIG);

    const postWithMarkdown = { ...POST_ROW_2, markdown: '# Second Post\n\nBody.' };

    vi.stubGlobal(
      'fetch',
      vi.fn()
        .mockResolvedValueOnce({ ok: true, json: async () => [postWithMarkdown] })
        .mockResolvedValueOnce({ ok: true, json: async () => [POST_ROW_1, POST_ROW_2] }),
    );

    const result = await getClientPostPage('second-post');
    expect(result!.nextPost).toBeNull();
    expect(result!.prevPost).not.toBeNull();
    expect(result!.prevPost!.slug).toBe('hello-world');
  });
});
