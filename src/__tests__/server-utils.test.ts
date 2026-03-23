/**
 * Tests for pure utility logic extracted from server.ts.
 *
 * getPageTitle and safeJson are not exported, so we test equivalent
 * implementations here to document and protect the behaviour. If these
 * functions are ever extracted to a shared module the tests should move there.
 */
import { describe, it, expect } from 'vitest';

// ---- safeJson ---------------------------------------------------------------
// Matches the implementation in server.ts: escape "<" so injected JSON cannot
// break out of a <script> tag.
function safeJson(value: unknown): string {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}

describe('safeJson', () => {
  it('serialises a plain object', () => {
    expect(safeJson({ page: 'home' })).toBe('{"page":"home"}');
  });

  it('escapes < to prevent script injection', () => {
    const result = safeJson({ html: '<script>alert(1)</script>' });
    expect(result).not.toContain('<');
    expect(result).toContain('\\u003c');
  });

  it('handles null', () => {
    expect(safeJson(null)).toBe('null');
  });

  it('handles arrays', () => {
    expect(safeJson([1, 2, 3])).toBe('[1,2,3]');
  });

  it('handles nested objects without < correctly', () => {
    const result = safeJson({ a: { b: 'value' } });
    expect(result).toBe('{"a":{"b":"value"}}');
  });

  it('multiple < characters are all escaped', () => {
    const result = safeJson('<a><b>');
    expect(result.split('\\u003c').length - 1).toBe(2);
  });
});

// ---- getPageTitle -----------------------------------------------------------
// Mirrors the PAGE_TITLES map and branching logic from server.ts.
import type { InitialData } from '../types';

const PAGE_TITLES: Partial<Record<InitialData['page'], string>> = {
  accountability: 'Accountability - POM',
  projects: 'Projects - POM',
  'crypto-conversations': 'Crypto Conversations - POM',
  'mute-list': 'Mute List - POM',
  assorted: 'Assorted - POM',
  '404': '404 - Page Not Found',
};

// Minimal stub of CONVERSATION_DETAILS shape used in getPageTitle
const STUB_CONVERSATIONS: Record<string, { title: string }> = {
  'test-convo': { title: 'A Test Conversation' },
};

function getPageTitle(
  data: InitialData,
  conversationDetails: Record<string, { title: string }> = STUB_CONVERSATIONS,
): string {
  if (data.page === 'post' && data.postPage?.post) {
    return `${data.postPage.post.title} - POM`;
  }
  if (
    data.page === 'crypto-conversation' &&
    data.conversationId &&
    conversationDetails[data.conversationId]
  ) {
    return `${conversationDetails[data.conversationId].title} - POM`;
  }
  return PAGE_TITLES[data.page] ?? 'POM';
}

describe('getPageTitle', () => {
  it('returns "POM" for the home page', () => {
    expect(getPageTitle({ page: 'home' })).toBe('POM');
  });

  it('returns "POM" for the posts listing page', () => {
    expect(getPageTitle({ page: 'posts', posts: [] })).toBe('POM');
  });

  it('returns post title for a post page with a post', () => {
    const data: InitialData = {
      page: 'post',
      postPage: {
        post: {
          slug: 'hello-world',
          title: 'Hello World',
          excerpt: '',
          date: '2024-01-01',
          formattedDate: 'January 1, 2024',
          html: '',
        },
        prevPost: null,
        nextPost: null,
      },
    };
    expect(getPageTitle(data)).toBe('Hello World - POM');
  });

  it('falls back to "POM" for a post page without a post', () => {
    const data: InitialData = {
      page: 'post',
      postPage: { post: null, prevPost: null, nextPost: null },
    };
    expect(getPageTitle(data)).toBe('POM');
  });

  it('returns the conversation title for a known crypto-conversation', () => {
    const data: InitialData = { page: 'crypto-conversation', conversationId: 'test-convo' };
    expect(getPageTitle(data)).toBe('A Test Conversation - POM');
  });

  it('falls back to "POM" for an unknown crypto-conversation id', () => {
    const data: InitialData = { page: 'crypto-conversation', conversationId: 'unknown-id' };
    expect(getPageTitle(data)).toBe('POM');
  });

  it('returns correct title for accountability page', () => {
    expect(getPageTitle({ page: 'accountability' })).toBe('Accountability - POM');
  });

  it('returns correct title for projects page', () => {
    expect(getPageTitle({ page: 'projects' })).toBe('Projects - POM');
  });

  it('returns correct title for assorted page', () => {
    expect(getPageTitle({ page: 'assorted' })).toBe('Assorted - POM');
  });

  it('returns correct title for 404 page', () => {
    expect(getPageTitle({ page: '404' })).toBe('404 - Page Not Found');
  });

  it('returns correct title for mute-list page', () => {
    expect(getPageTitle({ page: 'mute-list' })).toBe('Mute List - POM');
  });

  it('returns correct title for crypto-conversations index page', () => {
    expect(getPageTitle({ page: 'crypto-conversations' })).toBe('Crypto Conversations - POM');
  });
});
