import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import styles from './PomLetters.module.css';

const BORDER_REPETITIONS = 60;
const BORDER_SEQUENCE = ['P', 'O', 'M'] as const;
const NAME_SEQUENCE = ['P', 'E', 'T', 'E', 'R', 'O', 'M', 'A', 'L', 'L', 'E', 'Y'];

interface HeroPomLettersProps {
  interactive?: boolean;
  bare?: boolean;
}

export function HeroPomLetters({ interactive = true, bare = false }: HeroPomLettersProps) {
  const [clickedLetters, setClickedLetters] = useState<Set<number>>(new Set());
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [allClicked, setAllClicked] = useState(false);
  const resetTimeout = useRef<number | null>(null);

  useEffect(() => {
    if (clickedLetters.size === 3) {
      setAllClicked(true);
      if (resetTimeout.current) window.clearTimeout(resetTimeout.current);
      resetTimeout.current = window.setTimeout(() => {
        setClickedLetters(new Set());
        setAllClicked(false);
      }, 5000);
    } else if (clickedLetters.size < 3) {
      setAllClicked(false);
    }

    return () => {
      if (resetTimeout.current) window.clearTimeout(resetTimeout.current);
    };
  }, [clickedLetters]);

  const onLetterClick = (index: number) => {
    if (!interactive) return;
    setClickedLetters((current) => {
      const next = new Set(current);
      next.add(index);
      return next;
    });
  };

  const content = (
    <>
      {BORDER_SEQUENCE.map((letter, index) => {
        const isHovered = hoveredIndex === index;
        const isAdjacent = hoveredIndex !== null && Math.abs(hoveredIndex - index) === 1;
        const isClicked = clickedLetters.has(index);

        return (
          <div
            key={`${letter}-${index}`}
            className={[
              'letter',
              isClicked ? 'clicked' : '',
              isHovered ? 'transformed' : '',
              isAdjacent ? 'adjacent' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            onClick={(event) => {
              if (interactive) {
                event.stopPropagation();
                event.preventDefault();
              }
              onLetterClick(index);
            }}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            {letter}
          </div>
        );
      })}
      <div className="name-reveal">Peter O&apos;Malley</div>
    </>
  );

  if (bare) {
    return content;
  }

  return (
    <div
      className={`${styles.hero} large-letters${allClicked ? ' active' : ''}`}
      id="pom-letters"
      onMouseLeave={() => {
        setHoveredIndex(null);
        if (!allClicked) setClickedLetters(new Set());
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget && !allClicked) {
          setClickedLetters(new Set());
        }
      }}
    >
      {content}
    </div>
  );
}

const BORDER_COLORS = [
  '#ff6b9d', // pink
  '#c084fc', // purple
  '#67e8f9', // cyan
  '#fbbf24', // amber
  '#34d399', // emerald
  '#f87171', // red
  '#818cf8', // indigo
  '#fb923c', // orange
  '#a3e635', // lime
  '#f472b6', // rose
  '#22d3ee', // sky
  '#facc15', // yellow
];

function BorderLetter({
  index,
  sequenceIndex,
}: {
  index: number;
  sequenceIndex: number;
}) {
  const [active, setActive] = useState(false);
  const [deactivating, setDeactivating] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  const activate = () => {
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    setDeactivating(false);
    setActive(true);
  };

  const deactivate = () => {
    setDeactivating(true);
    timeoutRef.current = window.setTimeout(() => {
      setActive(false);
      setDeactivating(false);
    }, 800);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
  }, []);

  const originalLetter = BORDER_SEQUENCE[sequenceIndex];
  const content = active ? NAME_SEQUENCE[index % NAME_SEQUENCE.length] : originalLetter;
  const activeColor = active ? BORDER_COLORS[index % 12] : undefined;

  return (
    <span
      className={[
        originalLetter === 'P' ? 'letter-p' : originalLetter === 'O' ? 'letter-o' : 'letter-m',
        active ? 'transformed' : '',
        deactivating ? 'deactivating' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      style={activeColor ? { color: activeColor } : undefined}
      onMouseEnter={activate}
      onMouseLeave={deactivate}
      onTouchStart={(event) => {
        event.preventDefault();
        activate();
        timeoutRef.current = window.setTimeout(() => {
          deactivate();
        }, 1500);
      }}
    >
      {content}
    </span>
  );
}

export function BorderPomLetters() {
  const items = useMemo(() => {
    const letters: Array<{ index: number; sequenceIndex: number }> = [];
    for (let repeat = 0; repeat < BORDER_REPETITIONS; repeat += 1) {
      letters.push({ index: repeat * 3, sequenceIndex: 0 });
      letters.push({ index: repeat * 3 + 1, sequenceIndex: 1 });
      letters.push({ index: repeat * 3 + 2, sequenceIndex: 2 });
    }
    return letters;
  }, []);

  return (
    <>
      {items.map((item) => (
        <Fragment key={item.index}>
          <BorderLetter index={item.index} sequenceIndex={item.sequenceIndex} />
        </Fragment>
      ))}
    </>
  );
}
