import { hydrateRoot } from 'react-dom/client';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { App } from './App';
import './tailwind.css';
import './styles/global.css';
import type { AppConfig, InitialData } from './types';

declare global {
  interface Window {
    __INITIAL_DATA__?: InitialData;
    __APP_CONFIG__?: AppConfig;
  }
}

const initialData = window.__INITIAL_DATA__ ?? { page: 'home' };

// Clear SSR data after capture so it's only used for the first hydration render.
// Without this, client-side navigation reuses stale SSR data from the wrong page.
delete window.__INITIAL_DATA__;

hydrateRoot(
  document.getElementById('root') as HTMLElement,
  <React.StrictMode>
    <BrowserRouter>
      <App initialData={initialData} />
    </BrowserRouter>
  </React.StrictMode>,
);
