import { Link, useLocation } from 'react-router-dom';
import { HeroPomLetters } from './PomLetters';

type HeaderTab = 'about' | 'posts' | 'assorted';

interface HeaderProps {
  activeTab: HeaderTab;
  homeMode?: boolean;
}

function ToggleItem({ active, href, label, currentPath }: { active: boolean; href: string; label: string; currentPath: string }) {
  const isExactPage = currentPath === href;
  if (active && isExactPage) {
    return <span className="toggle-btn active">{label}</span>;
  }
  return (
    <Link to={href} className={`toggle-btn${active ? ' active' : ''}`}>
      {label}
    </Link>
  );
}

export function Header({ activeTab, homeMode = false }: HeaderProps) {
  const { pathname } = useLocation();

  return (
    <div className="mx-auto mb-1 w-full text-center">
      {homeMode ? (
        <HeroPomLetters />
      ) : (
        <Link to="/" className="large-letters" id="pom-letters">
          <HeroPomLetters interactive={false} bare />
        </Link>
      )}

      <div className="section-toggle mt-0.5 mb-6 mx-auto items-center justify-center gap-3">
        <ToggleItem active={activeTab === 'about'} href="/" label="About" currentPath={pathname} />
        <span className="toggle-separator">|</span>
        <ToggleItem active={activeTab === 'posts'} href="/posts" label="Posts" currentPath={pathname} />
        <span className="toggle-separator">|</span>
        <ToggleItem active={activeTab === 'assorted'} href="/assorted" label="Assorted" currentPath={pathname} />
      </div>
    </div>
  );
}
