import type { SocialLinkData } from '../../data/home-cards';
import { Icon } from '../icons';
import styles from './SocialLinks.module.css';

interface SocialLinksProps {
  links: SocialLinkData[];
}

export function SocialLinks({ links }: SocialLinksProps) {
  return (
    <div className={`${styles.socialLinks} loading-element`}>
      {links.map((link) =>
        <a
          key={link.label}
          href={link.href}
          target={link.href.startsWith('mailto:') ? undefined : '_blank'}
          rel={link.href.startsWith('mailto:') ? undefined : 'noreferrer'}
          className={`${styles.socialLink} loading-element`}
          aria-label={link.label}
        >
          <span className={styles.iconWrap}>
            <Icon name={link.icon === 'x' ? 'x-twitter' : link.icon} />
          </span>
        </a>,
      )}
    </div>
  );
}
