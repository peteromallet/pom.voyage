import type { SocialLinkData } from '../../data/home-cards';
import { Icon } from '../icons';

interface SocialLinksProps {
  links: SocialLinkData[];
}

export function SocialLinks({ links }: SocialLinksProps) {
  return (
    <div className="social-links loading-element">
      {links.map((link) =>
        <a
          key={link.label}
          href={link.href}
          target={link.href.startsWith('mailto:') ? undefined : '_blank'}
          rel={link.href.startsWith('mailto:') ? undefined : 'noreferrer'}
          className="social-link loading-element"
          aria-label={link.label}
        >
          <span className="social-icon-wrap">
            <Icon name={link.icon === 'x' ? 'x-twitter' : link.icon} />
          </span>
        </a>,
      )}
    </div>
  );
}
