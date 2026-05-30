import type { SupabaseClient, RealtimeChannel } from '@supabase/supabase-js';
import { isDuelEvent, type DuelEvent } from './messages';

export interface DuelTransport {
  subscribe(channel: string, handler: (event: DuelEvent) => void): () => void;
  publish(channel: string, event: DuelEvent): Promise<void>;
}

export class SupabaseRealtimeTransport implements DuelTransport {
  private supabase: SupabaseClient;
  private channels: Map<string, RealtimeChannel> = new Map();

  constructor(supabaseClient: SupabaseClient) {
    this.supabase = supabaseClient;
  }

  subscribe(channelName: string, handler: (event: DuelEvent) => void): () => void {
    const channel = this.supabase
      .channel(channelName)
      .on(
        'broadcast',
        { event: 'duel' },
        (payload: { payload: unknown }) => {
          if (isDuelEvent(payload.payload)) {
            handler(payload.payload);
          }
        }
      )
      .subscribe();

    this.channels.set(channelName, channel);

    return () => {
      this.supabase.removeChannel(channel);
      this.channels.delete(channelName);
    };
  }

  async publish(channelName: string, event: DuelEvent): Promise<void> {
    const channel = this.channels.get(channelName);
    if (!channel) {
      console.warn(`[DuelTransport] publish called before subscribe on channel: ${channelName}`);
      return;
    }
    await channel.send({
      type: 'broadcast',
      event: 'duel',
      payload: event,
    });
  }
}
