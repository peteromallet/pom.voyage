import { fireEvent, render, screen } from '@testing-library/react';
import { marked } from 'marked';
import { describe, expect, it } from 'vitest';
import {
  RecommendationsBody,
  renderBody,
  sanitizeHtml,
  splitHtmlWithCarousels,
  type CarouselBlock,
} from '../Recommendations';

function htmlFor(markdown: string) {
  return renderBody(markdown)
    .filter((segment) => segment.type === 'html')
    .map((segment) => segment.html)
    .join('');
}

function parseHtml(html: string) {
  const container = document.createElement('div');
  container.innerHTML = html;
  return container;
}

describe('Recommendations media rendering', () => {
  it('keeps directive-free markdown rendering unchanged', () => {
    const markdown = 'Hello **there**.\n\n<a href="javascript:alert(1)">bad link</a>';

    expect(renderBody(markdown)).toEqual([
      { type: 'html', html: sanitizeHtml(marked.parse(markdown) as string) },
    ]);
  });

  it('renders an image media directive with width and wrap classes', () => {
    const container = parseHtml(htmlFor(':::media{type=image width=half wrap=right src="x.png" alt="a"}\n:::'));
    const image = container.querySelector('img');

    expect(image).not.toBeNull();
    expect(image).toHaveClass('media', 'media-half', 'media-wrap-right');
    expect(image).toHaveAttribute('src', 'x.png');
    expect(image).toHaveAttribute('alt', 'a');
  });

  it('wraps linkable image media in a safe external link', () => {
    const container = parseHtml(htmlFor(':::media{type=image src="x.png" alt="a" link="https://example.com"}\n:::'));
    const link = container.querySelector('a');
    const image = link?.querySelector('img');

    expect(link).toHaveAttribute('href', 'https://example.com');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    expect(image).toHaveAttribute('src', 'x.png');
    expect(image).toHaveClass('media', 'media-full', 'media-wrap-block');
  });

  it('renders a video media directive via the React video component, muted with an unmute control', () => {
    const { container } = render(
      <RecommendationsBody markdown={':::media{type=video src="v.mp4" width=full}\n:::'} />,
    );
    const frame = container.querySelector('.media-video-frame');
    const video = frame?.querySelector('video');
    const source = video?.querySelector('source');
    const unmute = screen.getByRole('button', { name: 'Unmute video' });

    expect(frame).toHaveClass('media', 'media-full', 'media-wrap-block');
    expect(video).toHaveAttribute('controls');
    expect(video).toHaveAttribute('playsinline');
    expect(video?.muted).toBe(true);
    expect(source).toHaveAttribute('src', 'v.mp4');
    expect(unmute).toBeVisible();

    fireEvent.click(unmute);
    expect(screen.queryByRole('button', { name: 'Unmute video' })).not.toBeInTheDocument();
  });

  it('renders title and button overlays on an image with optional links and reveals on tap', () => {
    const { container } = render(
      <RecommendationsBody markdown={
        ':::media{type=image src="x.png" alt="a" title="Studio" title_link="https://studio.example.com" button="Visit" button_link="https://shop.example.com"}\n:::'
      } />,
    );

    const frame = container.querySelector('.media-frame');
    const title = frame?.querySelector('a.media-title');
    const button = frame?.querySelector('a.media-button');

    expect(frame).toHaveClass('media', 'media-full', 'media-wrap-block');
    expect(frame).not.toHaveClass('media-revealed');
    expect(title).toHaveAttribute('href', 'https://studio.example.com');
    expect(title).toHaveTextContent('Studio');
    expect(button).toHaveAttribute('href', 'https://shop.example.com');
    expect(button).toHaveTextContent('Visit');

    fireEvent.click(frame!);
    expect(frame).toHaveClass('media-revealed');
  });

  it('falls back to the media link when button has no explicit destination', () => {
    const { container } = render(
      <RecommendationsBody markdown={
        ':::media{type=image src="x.png" link="https://primary.example.com" button="Open"}\n:::'
      } />,
    );
    const button = container.querySelector('a.media-button');

    expect(button).toHaveAttribute('href', 'https://primary.example.com');
  });

  it('omits title and button overlays when not specified', () => {
    const container = parseHtml(htmlFor(':::media{type=image src="x.png" alt="a"}\n:::'));

    expect(container.querySelector('.media-title')).toBeNull();
    expect(container.querySelector('.media-button')).toBeNull();
    expect(container.querySelector('.media-frame')).toBeNull();
  });

  it('renders carousel items and disables boundary controls', () => {
    render(
      <RecommendationsBody
        markdown={[
          ':::carousel{width=full}',
          '- type=image src="first.png" alt="First item"',
          '- type=image src="second.png" alt="Second item"',
          '- type=video src="third.mp4"',
          ':::',
        ].join('\n')}
      />,
    );

    const previous = screen.getByRole('button', { name: 'Previous media' });
    const next = screen.getByRole('button', { name: 'Next media' });

    expect(screen.getByAltText('First item')).toBeVisible();
    expect(previous).toBeDisabled();
    expect(next).not.toBeDisabled();

    fireEvent.click(next);
    expect(screen.getByAltText('Second item')).toBeVisible();
    expect(previous).not.toBeDisabled();

    fireEvent.click(next);
    expect(screen.queryByAltText('Second item')).not.toBeInTheDocument();
    expect(screen.getByText('3 / 3')).toBeVisible();
    expect(next).toBeDisabled();
  });

  it('strips scripts and event handlers while preserving directive output', () => {
    const container = parseHtml(htmlFor([
      '<script>alert(1)</script>',
      '<img src=x onerror=alert(1)>',
      ':::media{type=image src="safe.png" alt="safe"}',
      ':::',
    ].join('\n\n')));

    expect(container.querySelector('script')).toBeNull();
    expect(container.innerHTML).not.toContain('onerror');
    expect(container.querySelector('img[src="safe.png"]')).toHaveClass('media', 'media-full', 'media-wrap-block');
  });

  it('round-trips carousel placeholders through marked, sanitization, and paragraph wrapping', () => {
    const carousel: CarouselBlock = {
      kind: 'carousel',
      width: 'full',
      wrap: 'block',
      items: [{ kind: 'image', src: 'one.png', alt: 'One' }],
    };
    const parsed = sanitizeHtml(marked.parse('before\n\n<p><!--CAROUSEL:0--></p>\n\nafter') as string);

    expect(parsed).toContain('<!--CAROUSEL:0-->');

    const segments = splitHtmlWithCarousels(parsed, [carousel]);

    expect(segments).toHaveLength(3);
    expect(segments[0]).toMatchObject({ type: 'html' });
    expect(segments[1]).toEqual({ type: 'carousel', data: carousel });
    expect(segments[2]).toMatchObject({ type: 'html' });
    expect(segments.map((segment) => (segment.type === 'html' ? segment.html : '')).join('')).not.toContain('CAROUSEL');
  });
});
