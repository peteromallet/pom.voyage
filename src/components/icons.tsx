import type { SVGProps } from 'react';

type IconName =
  | 'github'
  | 'youtube'
  | 'mail'
  | 'play-circle'
  | 'arrow-left'
  | 'arrow-right'
  | 'zoom-in'
  | 'zoom-out'
  | 'target'
  | 'maximize-2'
  | 'x-twitter';

interface IconProps extends SVGProps<SVGSVGElement> {
  name: IconName;
}

const iconProps = {
  fill: 'none',
  stroke: 'currentColor',
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  strokeWidth: 2,
  viewBox: '0 0 24 24',
};

function Path({ name }: { name: IconName }) {
  switch (name) {
    case 'github':
      return (
        <>
          <path d="M9 19c-5 1.5-5-2.5-7-3" />
          <path d="M15 22v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 19 4.77 5.07 5.07 0 0 0 18.91 1S17.73.65 15 2.48a13.38 13.38 0 0 0-6 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77 5.44 5.44 0 0 0 3.5 8.5c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
        </>
      );
    case 'youtube':
      return (
        <>
          <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-1.96C18.88 4 12 4 12 4s-6.88 0-8.6.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.94 1.96C5.12 20 12 20 12 20s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58" />
          <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" />
        </>
      );
    case 'mail':
      return (
        <>
          <path d="M4 4h16v16H4z" />
          <path d="m22 6-10 7L2 6" />
        </>
      );
    case 'play-circle':
      return (
        <>
          <circle cx="12" cy="12" r="10" />
          <polygon points="10 8 16 12 10 16 10 8" />
        </>
      );
    case 'arrow-left':
      return (
        <>
          <path d="m12 19-7-7 7-7" />
          <path d="M19 12H5" />
        </>
      );
    case 'arrow-right':
      return (
        <>
          <path d="m12 5 7 7-7 7" />
          <path d="M5 12h14" />
        </>
      );
    case 'zoom-in':
      return (
        <>
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
          <path d="M11 8v6" />
          <path d="M8 11h6" />
        </>
      );
    case 'zoom-out':
      return (
        <>
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
          <path d="M8 11h6" />
        </>
      );
    case 'target':
      return (
        <>
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v4" />
          <path d="M12 18v4" />
          <path d="M2 12h4" />
          <path d="M18 12h4" />
        </>
      );
    case 'maximize-2':
      return (
        <>
          <path d="M15 3h6v6" />
          <path d="m9 21H3v-6" />
          <path d="m21 3-7 7" />
          <path d="m3 21 7-7" />
        </>
      );
    case 'x-twitter':
      return (
        <path
          d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
          fill="currentColor"
          stroke="none"
        />
      );
  }
}

export function Icon({ name, className, ...props }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width={18}
      height={18}
      {...iconProps}
      {...props}
    >
      <Path name={name} />
    </svg>
  );
}
