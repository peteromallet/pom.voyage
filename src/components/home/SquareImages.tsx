import { useEffect, useRef, useState } from 'react';
import type { SquareImageData } from '../../data/home-cards';
import { useImageHover } from '../../hooks/useImageHover';
import styles from './SquareImages.module.css';

interface SquareImagesProps {
  images: SquareImageData[];
}

export function SquareImages({ images }: SquareImagesProps) {
  const { activeIndex, isMobile, onEnter, onLeave, onToggle } = useImageHover(images.length);
  const videoRefs = useRef<Array<HTMLVideoElement | null>>([]);
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);

  useEffect(() => {
    if (playingIndex === null) return;

    videoRefs.current.forEach((video, index) => {
      if (!video || index === playingIndex) return;
      video.pause();
      video.style.display = 'none';
      video.currentTime = images[index].startTime;
    });
  }, [images, playingIndex]);

  return (
    <div className={styles.wrapper}>
      <div className={styles.grid}>
        {images.map((image, index) => {
          const isActive = activeIndex === index;
          const isPlaying = playingIndex === index;
          return (
            <div
              key={image.label}
              className={`square-image-container loading-element has-video ${styles.squareImageContainer}${isActive ? ` ${styles.mobileActive}` : ''}`}
              onClick={() => onToggle(index)}
              onMouseEnter={() => onEnter(index)}
              onMouseLeave={() => onLeave()}
            >
              <img
                src={image.imageSrc}
                alt={image.alt}
                className={styles.media}
                style={isPlaying ? { display: 'none' } : undefined}
                onClick={() => {
                  const video = videoRefs.current[index];
                  if (!video) return;
                  setPlayingIndex(index);
                  video.currentTime = image.startTime;
                  video.style.display = 'block';
                  void video.play();
                }}
              />
              <video
                ref={(node) => {
                  videoRefs.current[index] = node;
                }}
                src={image.videoSrc}
                preload={isMobile ? 'metadata' : 'auto'}
                playsInline
                className={styles.media}
                style={{ display: 'none' }}
                onLoadedMetadata={(event) => {
                  event.currentTarget.currentTime = image.startTime;
                }}
                onEnded={(event) => {
                  event.currentTarget.style.display = 'none';
                  setPlayingIndex((current) => (current === index ? null : current));
                }}
              />
              <div className={styles.label}>{image.label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
