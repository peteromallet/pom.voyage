import type { AppConfig, InitialData } from '.';

declare global {
  interface Window {
    __INITIAL_DATA__?: InitialData;
    __APP_CONFIG__?: AppConfig;
  }
}

export {};
