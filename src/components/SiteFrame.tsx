import type { ReactNode } from 'react';
import { BorderPomLetters } from './PomLetters';
import { useBorderVisibility } from '../hooks/useBorderVisibility';
import { useFooterVisibility } from '../hooks/useFooterVisibility';
import _siteFrameStyles from './SiteFrame.module.css';
void _siteFrameStyles; // Ensure CSS module is included in production bundle

interface SiteFrameProps {
  children: ReactNode;
  showFooter?: boolean;
}

export function SiteFrame({ children, showFooter = false }: SiteFrameProps) {
  const { topBorderClassName, bottomBorderClassName } = useBorderVisibility();
  const footerVisible = useFooterVisibility();

  return (
    <>
      <div className="inner-border"></div>
      <div className={topBorderClassName} suppressHydrationWarning>
        <div>
          <BorderPomLetters />
        </div>
      </div>
      <div className={bottomBorderClassName} suppressHydrationWarning>
        <div>
          <BorderPomLetters />
        </div>
      </div>
      {children}
      {showFooter ? (
        <div className={`github-suggestion-footer${footerVisible ? ' visible' : ''}`}>
          <span className="github-suggestion-text">
            Do you feel as though I&apos;ve inaccurately represented myself?{' '}
            <a href="https://github.com/peteromallet/peteromallet.github.io" target="_blank" rel="noreferrer">
              Suggest changes to this website
            </a>
            .
          </span>
        </div>
      ) : null}
    </>
  );
}
