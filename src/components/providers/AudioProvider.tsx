'use client';

import { createContext, useContext, useEffect, useState } from 'react';

interface AudioProviderState {
  muted: boolean;
  toggleMute: () => void;
}

const AudioProviderContext = createContext<AudioProviderState | undefined>(undefined);

const STORAGE_KEY = 'audio-muted';

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === 'true') {
      setMuted(true);
    }
  }, []);

  const toggleMute = () => {
    setMuted((prev) => {
      const next = !prev;
      window.localStorage.setItem(STORAGE_KEY, String(next));
      return next;
    });
  };

  return (
    <AudioProviderContext.Provider value={{ muted, toggleMute }}>
      {children}
    </AudioProviderContext.Provider>
  );
}

export function useAudio() {
  const context = useContext(AudioProviderContext);
  if (context === undefined) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
}
