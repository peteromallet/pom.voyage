import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig(({ isSsrBuild }) => ({
  plugins: [react()],
  publicDir: false,
  build: {
    outDir: isSsrBuild ? 'dist' : 'dist/client',
    assetsDir: 'assets',
    manifest: !isSsrBuild,
    ssrManifest: !isSsrBuild,
    rollupOptions: {
      input: path.resolve(__dirname, 'src/entry-client.tsx'),
    },
  },
  server: {
    port: 5173,
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/__tests__/setup.ts'],
    globals: true,
  },
}));
