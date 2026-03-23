import type { ReactElement } from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { AppConfig } from '../types';

const defaultConfig: AppConfig = {
  supabaseAnonKey: 'test-anon-key',
  supabaseUrl: 'https://example.supabase.co',
};

export function renderWithRouter(ui: ReactElement, route = '/') {
  window.__APP_CONFIG__ = defaultConfig;
  return render(<MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>);
}
