import { Fragment } from 'react';
import styles from './Cards.module.css';
import type {
  DataCardData,
  HomeCardData,
  JSXLink,
  MemeCardData,
  ProjectCardData,
  StoryCardData,
  VideoCardData,
} from '../../data/home-cards';
import { VideoPlayer } from '../VideoPlayer';
import { WeightsChart } from '../WeightsChart';

interface CardTileProps {
  card: HomeCardData;
  expanded: boolean;
  isMobile: boolean;
}

function ParagraphList({ paragraphs }: { paragraphs: string[] }) {
  return (
    <div className={styles.textContent}>
      {paragraphs.map((paragraph) => (
        <Fragment key={paragraph}>
          <p>{paragraph}</p>
          {paragraph !== paragraphs[paragraphs.length - 1] ? <br /> : null}
        </Fragment>
      ))}
    </div>
  );
}

function LinkRow({
  links,
}: {
  links: Array<{ label: string; href: string }>;
}) {
  return (
    <div className={styles.linkRow}>
      <span>
        {links.map((link, index) => (
          <Fragment key={link.href}>
            <a href={link.href} target="_blank" rel="noreferrer" className={styles.yearLink}>
              {link.label}
            </a>
            {index < links.length - 1 ? (
              <span className="mx-1 inline-block text-[#ccc]">|</span>
            ) : null}
          </Fragment>
        ))}
      </span>
    </div>
  );
}

export function StoryCard({ card }: { card: StoryCardData }) {
  return (
    <>
      <div className={styles.imageContainer}>
        <img src={card.imageSrc} alt={card.imageAlt} />
      </div>
      <h3>{card.title}</h3>
      <ParagraphList paragraphs={card.paragraphs} />
      {card.linkLabel && card.linkHref ? (
        <div className={styles.linkRow}>
          <a href={card.linkHref} target="_blank" rel="noreferrer" className={styles.yearLink}>
            {card.linkLabel}
          </a>
        </div>
      ) : null}
      {card.linkLinks ? <LinkRow links={card.linkLinks} /> : null}
    </>
  );
}

function renderProjectBodyPart(part: string | JSXLink, index: number) {
  if (typeof part === 'string') return <Fragment key={index}>{part}</Fragment>;
  return (
    <a key={`${part.href}-${index}`} href={part.href} target="_blank" rel="noreferrer">
      {part.label}
    </a>
  );
}

export function ProjectCard({ card }: { card: ProjectCardData }) {
  return (
    <>
      <div className={styles.imageContainer}>
        <img src={card.imageSrc} alt={card.imageAlt} />
        {card.hoverGifSrc ? (
          <div className={styles.hoverGif}>
            <img src={card.hoverGifSrc} alt={card.hoverGifAlt} className="ignore-load" />
          </div>
        ) : null}
      </div>
      <h3>{card.title}</h3>
      <div className={styles.textContent}>
        <p>{card.body.map((part, index) => renderProjectBodyPart(part, index))}</p>
      </div>
      <div className={styles.linkRow}>
        <span>
          <a href={card.linkHref} target="_blank" rel="noreferrer" className={styles.yearLink}>
            {card.linkLabel}
          </a>
        </span>
      </div>
    </>
  );
}

export function VideoCardTile({
  card,
  expanded,
  isMobile,
}: {
  card: VideoCardData;
  expanded: boolean;
  isMobile: boolean;
}) {
  return (
    <>
      <VideoPlayer
        thumbnailSrc={card.thumbnailSrc}
        thumbnailAlt={card.thumbnailAlt}
        embedSrc={card.embedSrc}
        embedTitle={card.embedTitle}
        expanded={expanded}
        isMobile={isMobile}
      />
      <h3>{card.title}</h3>
      <ParagraphList paragraphs={card.body} />
      <LinkRow links={card.links} />
    </>
  );
}

export function DataCard({ card: _card }: { card: DataCardData }) {
  return <WeightsChart />;
}

export function MemeCard({
  card,
  expanded,
}: {
  card: MemeCardData;
  expanded: boolean;
}) {
  return (
    <>
      <div className={styles.imageContainer}>
        <img src={card.imageSrc} alt={card.imageAlt} className={styles.mainImage} />
      </div>
      <h3>{card.title}</h3>
      <ParagraphList paragraphs={card.body} />
      <div className={styles.memeHoverContainer}>
        {card.memeImages.map((image, index) => (
          <div
            key={image.src}
            className={styles.memeImage}
            style={expanded ? { transitionDelay: `${0.1 * (index + 1)}s` } : undefined}
          >
            <img src={image.src} alt={image.alt} />
          </div>
        ))}
      </div>
    </>
  );
}

export function CardContent({ card, expanded, isMobile }: CardTileProps) {
  switch (card.kind) {
    case 'story':
      return <StoryCard card={card} />;
    case 'project':
      return <ProjectCard card={card} />;
    case 'video':
      return <VideoCardTile card={card} expanded={expanded} isMobile={isMobile} />;
    case 'data':
      return <DataCard card={card} />;
    case 'meme':
      return <MemeCard card={card} expanded={expanded} />;
  }
}
