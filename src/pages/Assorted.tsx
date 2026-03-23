import { Link } from 'react-router-dom';
import { Header } from '../components/Header';
import { ASSORTED_DIRECTORY_ITEMS } from '../data/assorted-content';
import styles from './Assorted.module.css';

export function AssortedPage() {
  return (
    <div className="container">
      <Header activeTab="assorted" />
      <div id="sorted-section" className="content-section">
        <div className="sorted-section-content">
          <div className="flex flex-col gap-4">
            {ASSORTED_DIRECTORY_ITEMS.map((item) =>
              item.href ? (
                <Link key={item.name} to={item.href} className={styles.dirLink}>
                  <span className={styles.name}>{item.name}</span>
                  <span className={styles.description}>{item.description}</span>
                  <span className="dir-arrow">→</span>
                </Link>
              ) : (
                <div key={item.name} className={`${styles.dirLink} ${styles.comingSoon}`}>
                  <span className={styles.comingSoonTag}>Coming soon</span>
                  <span className={styles.name}>{item.name}</span>
                  <span className={styles.description}>{item.description}</span>
                </div>
              ),
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
