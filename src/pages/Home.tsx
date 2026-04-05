import { useRef } from 'react';
import { Header } from '../components/Header';
import { PlantCanvas } from '../components/PlantCanvas';
import { Dashboard } from '../components/home/Dashboard';
import { FilterButtons } from '../components/home/FilterButtons';
import { SocialLinks } from '../components/home/SocialLinks';
import { SquareImages } from '../components/home/SquareImages';
import { VideosReadyProvider } from '../hooks/useVideosReady';
import {
  HOME_CARDS,
  HOME_FILTERS,
  HOME_SOCIAL_LINKS,
  HOME_SQUARE_IMAGES,
} from '../data/home-cards';
import { useFilterSystem } from '../hooks/useFilterSystem';
import { useLoadingStagger } from '../hooks/useLoadingStagger';

export function HomePage() {
  const aboutRef = useRef<HTMLDivElement | null>(null);
  const { isActive, itemRefs, toggleFilter, visibleCards } = useFilterSystem(HOME_CARDS);

  useLoadingStagger(aboutRef);

  return (
    <VideosReadyProvider>
      <div className="container">
        <Header activeTab="about" homeMode />
        <div id="about-section" className="content-section pb-20" ref={aboutRef}>
          <SquareImages images={HOME_SQUARE_IMAGES} />
          <SocialLinks links={HOME_SOCIAL_LINKS} />
          <FilterButtons filters={HOME_FILTERS} isActive={isActive} onToggle={toggleFilter} />
          <Dashboard cards={visibleCards} itemRefs={itemRefs} />
        </div>
        <PlantCanvas />
      </div>
    </VideosReadyProvider>
  );
}
