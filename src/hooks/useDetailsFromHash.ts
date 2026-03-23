import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export function useDetailsFromHash() {
  const location = useLocation();

  useEffect(() => {
    if (!location.hash) return;
    const element = document.querySelector(location.hash);
    if (!(element instanceof HTMLDetailsElement)) return;

    element.open = true;
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    element.classList.add('highlight');

    const timeout = window.setTimeout(() => {
      element.classList.remove('highlight');
    }, 2000);

    return () => window.clearTimeout(timeout);
  }, [location.hash]);
}
