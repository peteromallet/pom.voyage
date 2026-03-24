import { Link } from 'react-router-dom';
import { Header } from '../components/Header';
import { ASSORTED_DIRECTORY_ITEMS } from '../data/assorted-content';

export function AssortedPage() {
  return (
    <div className="container">
      <Header activeTab="assorted" />
      <div id="sorted-section" className="content-section">
        <div className="sorted-section-content">
          <div className="flex flex-col gap-4">
            {ASSORTED_DIRECTORY_ITEMS.map((item) =>
              item.href ? (
                <Link key={item.name} to={item.href} className="dir-link">
                  <span className="dir-link-name">{item.name}</span>
                  <span className="dir-link-description">{item.description}</span>
                  <span className="dir-arrow">→</span>
                </Link>
              ) : (
                <div key={item.name} className="dir-link coming-soon">
                  <span className="coming-soon-tag">Coming soon</span>
                  <span className="dir-link-name">{item.name}</span>
                  <span className="dir-link-description">{item.description}</span>
                </div>
              ),
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
