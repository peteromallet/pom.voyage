import { useEffect, useRef, useState } from 'react';
import type { SquareImageData } from '../../data/home-cards';
import { useImageHover } from '../../hooks/useImageHover';

interface SquareImagesProps {
  images: SquareImageData[];
}

export function SquareImages({ images }: SquareImagesProps) {
  const { activeIndex, onEnter, onLeave, onToggle } = useImageHover(images.length);
  const videoRefs = useRef<Array<HTMLVideoElement | null>>([]);
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);

  // Preload all videos in background on mount
  useEffect(() => {
    videoRefs.current.forEach((video) => {
      if (video) video.preload = 'auto';
    });
  }, []);

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
    <div className="square-images-wrapper">
      <div className="square-images-grid">
        {images.map((image, index) => {
          const isActive = activeIndex === index;
          const isPlaying = playingIndex === index;
          return (
            <div
              key={image.label}
              className={`square-image-container loading-element has-video${isActive ? ' square-image-mobile-active' : ''}`}
              onClick={() => onToggle(index)}
              onMouseEnter={() => onEnter(index)}
              onMouseLeave={() => onLeave()}
            >
              <img
                src={image.imageSrc}
                alt={image.alt}
                className="square-image-media"
                style={isPlaying ? { display: 'none' } : undefined}
                onClick={() => {
                  const video = videoRefs.current[index];
                  if (!video) return;
                  video.currentTime = image.startTime;
                  const hideImageAndPlay = () => {
                    video.removeEventListener('playing', hideImageAndPlay);
                    setPlayingIndex(index);
                    video.style.display = 'block';
                  };
                  video.addEventListener('playing', hideImageAndPlay);
                  void video.play();
                }}
              />
              <video
                ref={(node) => {
                  videoRefs.current[index] = node;
                }}
                src={image.videoSrc}
                preload="metadata"
                playsInline
                className="square-image-media"
                style={{ display: 'none' }}
                onLoadedMetadata={(event) => {
                  event.currentTarget.currentTime = image.startTime;
                }}
                onEnded={(event) => {
                  event.currentTarget.style.display = 'none';
                  setPlayingIndex((current) => (current === index ? null : current));
                }}
              />
              <div className="square-image-label">{image.label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
