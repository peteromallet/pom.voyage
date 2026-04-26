import { useEffect, useState } from 'react';
import { marked } from 'marked';
import { Header } from '../components/Header';
import type { RecommendationEntry } from '../types';

export type MediaWidth = 'full' | 'half' | 'third';
export type MediaWrap = 'block' | 'left' | 'right';

export type MediaItem = {
  kind: 'image' | 'video';
  src: string;
  alt?: string;
  link?: string;
  poster?: string;
  autoplay?: boolean;
  loop?: boolean;
  muted?: boolean;
};

export type MediaBlock = {
  kind: 'media';
  item: MediaItem;
  width: MediaWidth;
  wrap: MediaWrap;
};

export type CarouselBlock = {
  kind: 'carousel';
  items: MediaItem[];
  width: MediaWidth;
  wrap: MediaWrap;
};

export type RecommendationDirectiveBlock = MediaBlock | CarouselBlock;

export type RecommendationMarkdownPart =
  | { kind: 'markdown'; markdown: string }
  | RecommendationDirectiveBlock;

export type RenderedRecommendationSegment =
  | { type: 'html'; html: string }
  | { type: 'carousel'; data: CarouselBlock };

const ATTRIBUTE_PATTERN = /(\w+)=(?:"([^"]*)"|(\S+))/g;
const DIRECTIVE_OPEN_PATTERN = /^:::(media|carousel)\{([^}]*)\}\s*$/;
const DIRECTIVE_CLOSE_PATTERN = /^:::\s*$/;
const CAROUSEL_PLACEHOLDER_PATTERN = /(?:<p>\s*)?<!--CAROUSEL:(\d+)-->(?:\s*<\/p>)?/g;

export function parseDirectiveAttributes(input: string): Record<string, string> {
  const attributes: Record<string, string> = {};

  for (const match of input.matchAll(ATTRIBUTE_PATTERN)) {
    attributes[match[1]] = match[2] ?? match[3] ?? '';
  }

  return attributes;
}

function parseWidth(value?: string): MediaWidth {
  return value === 'half' || value === 'third' ? value : 'full';
}

function parseWrap(value?: string): MediaWrap {
  return value === 'left' || value === 'right' ? value : 'block';
}

function isEnabled(value?: string): boolean | undefined {
  return value === 'true' ? true : undefined;
}

function parseMediaItem(attributes: Record<string, string>, context: string): MediaItem | null {
  if (attributes.type !== 'image' && attributes.type !== 'video') {
    console.warn(`Skipping ${context}: unknown media type "${attributes.type ?? ''}"`);
    return null;
  }

  if (!attributes.src) {
    console.warn(`Skipping ${context}: missing src`);
    return null;
  }

  return {
    kind: attributes.type,
    src: attributes.src,
    alt: attributes.alt,
    link: attributes.link,
    poster: attributes.poster,
    autoplay: isEnabled(attributes.autoplay),
    loop: isEnabled(attributes.loop),
    muted: isEnabled(attributes.muted),
  };
}

export function parseRecommendationDirectiveBlocks(markdown: string): RecommendationMarkdownPart[] {
  const lines = markdown.split(/\r?\n/);
  const parts: RecommendationMarkdownPart[] = [];
  let markdownBuffer: string[] = [];

  const flushMarkdown = () => {
    if (markdownBuffer.length === 0) return;
    parts.push({ kind: 'markdown', markdown: markdownBuffer.join('\n') });
    markdownBuffer = [];
  };

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const openMatch = line.trim().match(DIRECTIVE_OPEN_PATTERN);

    if (!openMatch) {
      markdownBuffer.push(line);
      continue;
    }

    const directiveKind = openMatch[1] as 'media' | 'carousel';
    const attributes = parseDirectiveAttributes(openMatch[2]);
    const closeIndex = lines.findIndex((candidate, candidateIndex) => (
      candidateIndex > index && DIRECTIVE_CLOSE_PATTERN.test(candidate.trim())
    ));

    if (closeIndex === -1) {
      markdownBuffer.push(line);
      continue;
    }

    flushMarkdown();

    if (directiveKind === 'media') {
      const item = parseMediaItem(attributes, 'media directive');
      if (item) {
        parts.push({
          kind: 'media',
          item,
          width: parseWidth(attributes.width),
          wrap: parseWrap(attributes.wrap),
        });
      }
    } else {
      const items = lines
        .slice(index + 1, closeIndex)
        .map((itemLine) => itemLine.trim())
        .filter((itemLine) => itemLine.startsWith('- '))
        .map((itemLine) => parseMediaItem(
          parseDirectiveAttributes(itemLine.slice(2).trim()),
          'carousel item',
        ))
        .filter((item): item is MediaItem => Boolean(item));

      if (items.length > 0) {
        parts.push({
          kind: 'carousel',
          items,
          width: parseWidth(attributes.width),
          wrap: parseWrap(attributes.wrap),
        });
      } else {
        console.warn('Skipping carousel directive: no valid media items');
      }
    }

    index = closeIndex;
  }

  flushMarkdown();

  return parts;
}

function escapeAttribute(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function mediaClassName(width: MediaWidth, wrap: MediaWrap): string {
  return `media media-${width} media-wrap-${wrap}`;
}

function attribute(name: string, value: string | undefined): string {
  return value ? ` ${name}="${escapeAttribute(value)}"` : '';
}

function compileMediaBlock(block: MediaBlock): string {
  const className = mediaClassName(block.width, block.wrap);
  const { item } = block;

  if (item.kind === 'image') {
    const image = `<img class="${className}" src="${escapeAttribute(item.src)}" alt="${escapeAttribute(item.alt ?? '')}">`;

    if (!item.link) {
      return image;
    }

    return `<a href="${escapeAttribute(item.link)}" target="_blank" rel="noopener noreferrer">${image}</a>`;
  }

  const booleanAttributes = [
    item.autoplay ? ' autoplay' : '',
    item.loop ? ' loop' : '',
    item.muted ? ' muted' : '',
  ].join('');

  return `<video class="${className}" controls playsinline${attribute('poster', item.poster)}${booleanAttributes}><source src="${escapeAttribute(item.src)}"></video>`;
}

export function splitHtmlWithCarousels(
  html: string,
  carousels: CarouselBlock[],
): RenderedRecommendationSegment[] {
  const segments: RenderedRecommendationSegment[] = [];
  let lastIndex = 0;

  for (const match of html.matchAll(CAROUSEL_PLACEHOLDER_PATTERN)) {
    const matchIndex = match.index ?? 0;
    const htmlBefore = html.slice(lastIndex, matchIndex);
    if (htmlBefore) {
      segments.push({ type: 'html', html: htmlBefore });
    }

    const carousel = carousels[Number(match[1])];
    if (carousel) {
      segments.push({ type: 'carousel', data: carousel });
    } else {
      segments.push({ type: 'html', html: match[0] });
    }

    lastIndex = matchIndex + match[0].length;
  }

  const htmlAfter = html.slice(lastIndex);
  if (htmlAfter || segments.length === 0) {
    segments.push({ type: 'html', html: htmlAfter });
  }

  return segments;
}

export function sanitizeHtml(html: string) {
  // Recommendation body_markdown is author-controlled, so this sanitizer stays intentionally permissive.
  return html
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/\son[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/\s(href|src)\s*=\s*(['"])\s*javascript:[\s\S]*?\2/gi, ' $1="#"')
    .replace(/\s(href|src)\s*=\s*javascript:[^\s>]+/gi, ' $1="#"');
}

export function renderBody(markdown: string): RenderedRecommendationSegment[] {
  const carousels: CarouselBlock[] = [];
  const rewrittenMarkdown = parseRecommendationDirectiveBlocks(markdown)
    .map((part) => {
      if (part.kind === 'markdown') {
        return part.markdown;
      }

      if (part.kind === 'media') {
        return compileMediaBlock(part);
      }

      const carouselIndex = carousels.push(part) - 1;
      return `<!--CAROUSEL:${carouselIndex}-->`;
    })
    .join('\n\n');

  return splitHtmlWithCarousels(
    sanitizeHtml(marked.parse(rewrittenMarkdown) as string),
    carousels,
  );
}

interface Props {
  recommendations?: RecommendationEntry[];
}

export function RecommendationsPage({ recommendations: ssrData }: Props) {
  const [recommendations, setRecommendations] = useState<RecommendationEntry[]>(ssrData ?? []);

  useEffect(() => {
    if (ssrData && ssrData.length > 0) return;
    const config = window.__APP_CONFIG__;
    if (!config?.supabaseUrl || !config?.supabaseAnonKey) return;
    fetch(
      `${config.supabaseUrl}/rest/v1/recommendations?order=sort_order.asc&select=id,name,role_title,emoji,linkedin_url,location,body_markdown,image_url,intro_url,context,status,is_hired,is_freelancer,sort_order,created_at`,
      {
        headers: {
          apikey: config.supabaseAnonKey,
          Authorization: `Bearer ${config.supabaseAnonKey}`,
        },
      },
    )
      .then((r) => r.json())
      .then((data) => setRecommendations(data))
      .catch(() => {});
  }, [ssrData]);

  return (
    <div className="container">
      <Header activeTab="assorted" />
      <div id="sorted-section" className="content-section">
        <div className="sorted-section-content">
          <div className="sorted-breadcrumb">
            <a href="/assorted">Assorted</a> / Recommendations
          </div>
          <p className="mb-4 text-[0.8rem] text-[#999] italic">
            Fine individuals I recommend. Context on my relationship with each below. I <a href="https://advisable.notion.site/10-incredible-engineers-operators-and-designers-who-are-available-for-new-opportunities-ea659282b6a34735a0b8775e4ebc9cb2" target="_blank" rel="noopener noreferrer" className="text-[#4a90d9] hover:underline">started doing this</a> after I shut down my company. It resulted in everyone getting job offers, including many who still work at the company today.
          </p>

          {recommendations.length === 0 && (
            <p className="text-[0.85rem] text-[#999]">No recommendations yet.</p>
          )}

          <div className="flex flex-col" style={{ gap: '0.5rem' }}>
            {recommendations.map((rec) => (
              <RecommendationCard key={rec.id} rec={rec} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  hired: { label: 'Hired', className: 'recommendation-status-hired' },
  taking_clients: { label: 'Taking Clients', className: 'recommendation-status-available' },
  probably_unavailable: { label: 'Probably Unavailable', className: 'recommendation-status-unavailable' },
};

function StatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.probably_unavailable;
  return <span className={config.className}>{config.label}</span>;
}

export function Carousel({ items, width, wrap }: Pick<CarouselBlock, 'items' | 'width' | 'wrap'>) {
  const [index, setIndex] = useState(0);
  const currentItem = items[index];

  if (!currentItem) {
    return null;
  }

  const goPrevious = () => setIndex((current) => Math.max(0, current - 1));
  const goNext = () => setIndex((current) => Math.min(items.length - 1, current + 1));

  return (
    <div
      className={`${mediaClassName(width, wrap)} media-carousel`}
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === 'ArrowLeft') {
          event.preventDefault();
          goPrevious();
        }
        if (event.key === 'ArrowRight') {
          event.preventDefault();
          goNext();
        }
      }}
    >
      {currentItem.kind === 'image' ? (
        <img src={currentItem.src} alt={currentItem.alt ?? ''} className="media-carousel-item" />
      ) : (
        <video
          className="media-carousel-item"
          controls
          playsInline
          poster={currentItem.poster}
          autoPlay={currentItem.autoplay === true}
          loop={currentItem.loop === true}
          muted={currentItem.muted === true}
        >
          <source src={currentItem.src} />
        </video>
      )}
      <div className="media-carousel-controls">
        <button
          type="button"
          className="media-carousel-btn"
          onClick={goPrevious}
          disabled={index === 0}
          aria-label="Previous media"
        >
          Prev
        </button>
        <span className="media-carousel-count">
          {index + 1} / {items.length}
        </span>
        <button
          type="button"
          className="media-carousel-btn"
          onClick={goNext}
          disabled={index === items.length - 1}
          aria-label="Next media"
        >
          Next
        </button>
      </div>
    </div>
  );
}

export function RecommendationsBody({
  markdown,
  image,
}: {
  markdown: string;
  image?: { src: string; alt: string };
}) {
  return (
    <div className="recommendation-body text-[0.82rem] leading-[1.7] text-[#666]">
      {image && (
        <img
          src={image.src}
          alt={image.alt}
          className="recommendation-image"
        />
      )}
      {renderBody(markdown).map((segment, index) => (
        segment.type === 'html' ? (
          <div key={`html-${index}`} dangerouslySetInnerHTML={{ __html: segment.html }} />
        ) : (
          <Carousel
            key={`carousel-${index}`}
            items={segment.data.items}
            width={segment.data.width}
            wrap={segment.data.wrap}
          />
        )
      ))}
    </div>
  );
}

function RecommendationCard({ rec }: { rec: RecommendationEntry }) {
  return (
    <details className="recommendation-card">
      <summary className="recommendation-summary">
        <div className="recommendation-summary-content">
          {rec.image_url && (
            <img
              src={rec.image_url}
              alt={rec.name}
              className="recommendation-thumb"
            />
          )}
          <div className="recommendation-summary-text">
            <div className="flex items-center gap-2">
              {rec.emoji && <span className="text-base">{rec.emoji}</span>}
              <span className="text-[0.95rem] font-semibold text-[#333]">{rec.name}</span>
              {rec.linkedin_url && (
                <a
                  href={rec.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[0.75rem] text-[#4a90d9] hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  LinkedIn
                </a>
              )}
              {rec.location && (
                <>
                  <span className="text-[#ccc]">|</span>
                  <span className="text-[0.75rem] text-[#999]">{rec.location}</span>
                </>
              )}
            </div>
            <div className="mt-0.5 text-[0.8rem] text-[#666]">{rec.role_title}</div>
          </div>
          <StatusBadge status={rec.status} />
        </div>
      </summary>
      <div className="recommendation-expanded">
        <RecommendationsBody
          markdown={rec.body_markdown}
          image={rec.image_url ? { src: rec.image_url, alt: rec.name } : undefined}
        />
        {rec.context && (
          <div className="recommendation-context">
            <span className="recommendation-context-label">Context:</span> {rec.context}
          </div>
        )}
      </div>
    </details>
  );
}
