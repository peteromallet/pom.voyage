import { describe, it, expect } from 'vitest';
import { parseFrontmatter, extractExcerpt } from '../local-posts';

describe('parseFrontmatter', () => {
  it('parses frontmatter from a markdown string', () => {
    const raw = '---\ntitle: Hello World\ndate: 2024-01-15\n---\n\n# Hello World\n\nContent here.';
    const result = parseFrontmatter(raw);
    expect(result.metadata.title).toBe('Hello World');
    expect(result.metadata.date).toBe('2024-01-15');
    expect(result.content).toContain('# Hello World');
  });

  it('returns raw content when no frontmatter is present', () => {
    const raw = '# No Frontmatter\n\nJust content.';
    const result = parseFrontmatter(raw);
    expect(result.metadata).toEqual({});
    expect(result.content).toBe(raw);
  });

  it('handles colons in values', () => {
    const raw = '---\ntitle: Hello: World\n---\n\nContent.';
    const result = parseFrontmatter(raw);
    expect(result.metadata.title).toBe('Hello: World');
  });

  it('skips lines without colons', () => {
    const raw = '---\ntitle: Test\nno-colon-here\ndate: 2024-01-01\n---\n\nContent.';
    const result = parseFrontmatter(raw);
    expect(result.metadata.title).toBe('Test');
    expect(result.metadata.date).toBe('2024-01-01');
  });
});

describe('extractExcerpt', () => {
  it('extracts the first paragraph text', () => {
    const content = '# Title\n\nThis is the excerpt.';
    const result = extractExcerpt(content);
    expect(result).toBe('This is the excerpt.');
  });

  it('truncates long excerpts to 30 chars with ellipsis', () => {
    const content = '# Title\n\nThis is a really long excerpt that should be truncated.';
    const result = extractExcerpt(content);
    expect(result.length).toBeLessThanOrEqual(33); // 30 + "..."
    expect(result).toContain('...');
  });

  it('skips headings and HTML tags', () => {
    const content = '# Title\n\n## Subtitle\n\n<div>skip</div>\n\nActual excerpt.';
    const result = extractExcerpt(content);
    expect(result).toBe('Actual excerpt.');
  });

  it('strips markdown links from excerpt', () => {
    const content = '# Title\n\nCheck out [my link](http://example.com) here.';
    const result = extractExcerpt(content);
    expect(result).not.toContain('[');
    expect(result).toContain('my link');
  });

  it('returns empty string for content with no body text', () => {
    const content = '# Title\n\n## Only Headings';
    const result = extractExcerpt(content);
    expect(result).toBe('');
  });
});
