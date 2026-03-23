import { useEffect, useMemo, useState } from 'react';
import { Icon } from './icons';
import styles from './VideoPlayer.module.css';

interface VideoPlayerProps {
  className?: string;
  thumbnailSrc: string;
  thumbnailAlt: string;
  embedSrc: string;
  embedTitle: string;
  expanded: boolean;
  isMobile: boolean;
}

export function VideoPlayer({
  className = '',
  thumbnailSrc,
  thumbnailAlt,
  embedSrc,
  embedTitle,
  expanded,
  isMobile,
}: VideoPlayerProps) {
  const [revealed, setRevealed] = useState(false);
  const iframeSrc = useMemo(() => {
    if (!revealed) return '';
    return `${embedSrc}${embedSrc.includes('?') ? '&' : '?'}autoplay=1`;
  }, [embedSrc, revealed]);

  useEffect(() => {
    if (!expanded && isMobile) {
      setRevealed(false);
    }
  }, [expanded, isMobile]);

  return (
    <div
      className={`${styles.videoContainer} ${className}`.trim()}
      data-revealed={revealed ? 'true' : 'false'}
      onMouseLeave={() => {
        if (!isMobile) {
          setRevealed(false);
        }
      }}
    >
      <img
        src={thumbnailSrc}
        alt={thumbnailAlt}
        className={styles.thumbnail}
      />
      <button
        type="button"
        className={styles.overlay}
        aria-label={`Play ${embedTitle}`}
        onClick={(event) => {
          event.stopPropagation();
          setRevealed(true);
        }}
      >
        <Icon name="play-circle" className={styles.playIcon} />
      </button>
      <div className={styles.embed}>
        {revealed ? (
          <iframe
            width="100%"
            height="100%"
            src={iframeSrc}
            title={embedTitle}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            playsInline
          />
        ) : null}
      </div>
    </div>
  );
}
