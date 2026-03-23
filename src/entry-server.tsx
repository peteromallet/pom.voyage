import React from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import { App } from './App';
import type { InitialData } from './types';

interface RenderResult {
  html: string;
}

export function render(url: string, data: InitialData): RenderResult {
  const html = renderToString(
    <React.StrictMode>
      <StaticRouter location={url}>
        <App initialData={data} />
      </StaticRouter>
    </React.StrictMode>,
  );

  return { html };
}
