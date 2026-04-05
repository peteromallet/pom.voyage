import { createContext, useCallback, useContext, useState } from 'react';

const VideosReadyContext = createContext(false);
const SetVideosReadyContext = createContext<(() => void) | null>(null);

export function VideosReadyProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const markReady = useCallback(() => setReady(true), []);

  return (
    <SetVideosReadyContext.Provider value={markReady}>
      <VideosReadyContext.Provider value={ready}>{children}</VideosReadyContext.Provider>
    </SetVideosReadyContext.Provider>
  );
}

export function useVideosReady() {
  return useContext(VideosReadyContext);
}

export function useSetVideosReady() {
  const setter = useContext(SetVideosReadyContext);
  if (!setter) throw new Error('useSetVideosReady must be used within VideosReadyProvider');
  return setter;
}
