import { describe, it, expect } from 'vitest';
import { formatDate, renderMarkdown } from '../markdown';

describe('formatDate', () => {
  it('formats a date string to human-readable format', () => {
    expect(formatDate('2024-01-15')).toBe('January 15, 2024');
  });

  it('formats end-of-year dates correctly', () => {
    expect(formatDate('2023-12-31')).toBe('December 31, 2023');
  });

  it('formats single-digit days', () => {
    expect(formatDate('2024-03-01')).toBe('March 1, 2024');
  });
});

describe('renderMarkdown', () => {
  it('strips the top-level title', () => {
    const md = '# My Title\n\nSome content here.';
    const html = renderMarkdown(md);
    expect(html).not.toContain('My Title');
    expect(html).toContain('Some content here.');
  });

  it('rewrites relative asset paths to Supabase URLs', () => {
    const md = '# Title\n\n![img](../assets/photo.jpg)';
    const html = renderMarkdown(md);
    expect(html).toContain('https://ddbobialzdjkzainyqgb.supabase.co/storage/v1/object/public/assets/photo.jpg');
  });

  it('adds playsinline and muted attributes to video tags', () => {
    const md = '# Title\n\n<video src="test.mp4">';
    const html = renderMarkdown(md);
    expect(html).toContain('playsinline');
    expect(html).toContain('muted');
  });

  it('removes script tags and inline handlers', () => {
    const md = '# Title\n\n<script>alert(1)</script><p onclick="evil()">safe</p>';
    const html = renderMarkdown(md);
    expect(html).not.toContain('<script');
    expect(html).not.toContain('onclick=');
    expect(html).toContain('safe');
  });

  it('returns empty paragraph for content with only a title', () => {
    const html = renderMarkdown('# Just a Title');
    expect(html.trim()).toBe('');
  });
});
