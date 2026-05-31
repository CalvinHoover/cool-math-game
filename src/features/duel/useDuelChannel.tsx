'use client';

import { startTransition, useCallback, useEffect, useRef, useState } from 'react';
import { SupabaseRealtimeTransport, type DuelTransport } from './transport';
import { supabase } from '@/lib/supabase';
import type { DuelEvent } from './messages';

export type DuelChannelHook = {
  sendEvent: (event: DuelEvent) => Promise<void>;
  lastEvent: DuelEvent | null;
  connected: boolean;
};

export function useDuelChannel(
  matchId: string,
  transport?: DuelTransport
): DuelChannelHook {
  const [lastEvent, setLastEvent] = useState<DuelEvent | null>(null);
  const [connected, setConnected] = useState(false);

  const transportRef = useRef<DuelTransport | null>(null);
  const channelName = `match:${matchId}`;

  useEffect(() => {
    if (transportRef.current === null) {
      transportRef.current = transport ?? new SupabaseRealtimeTransport(supabase);
    }
    const t = transportRef.current;

    const unsubscribe = t.subscribe(channelName, (event) => {
      setLastEvent(event);
    });
    startTransition(() => setConnected(true));

    return () => {
      unsubscribe();
      startTransition(() => setConnected(false));
    };
  }, [channelName, transport]);

  const sendEvent = useCallback(
    async (event: DuelEvent) => {
      if (!transportRef.current) return;
      await transportRef.current.publish(channelName, event);
    },
    [channelName]
  );

  return { sendEvent, lastEvent, connected };
}
