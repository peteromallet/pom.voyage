import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface HoverPopupProps {
  imageSrc: string | null;
  anchorRect: DOMRect | null;
  cursor: { x: number; y: number };
  visible: boolean;
}

export function HoverPopup({ imageSrc, anchorRect, cursor, visible }: HoverPopupProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !imageSrc) return null;

  const mobilePosition = anchorRect
    ? {
        left: `${Math.min(anchorRect.left, window.innerWidth - 320)}px`,
        top: `${anchorRect.bottom + 10}px`,
      }
    : undefined;
  const desktopPosition = {
    left: `${cursor.x + 20}px`,
    top: `${Math.max(20, cursor.y - 150)}px`,
  };

  return createPortal(
    <div
      className={`hover-popup${visible ? ' hover-popup-visible' : ''}`}
      style={'ontouchstart' in window ? mobilePosition : desktopPosition}
    >
      <img src={imageSrc} alt="" className="hover-popup-image" />
    </div>,
    document.body,
  );
}
