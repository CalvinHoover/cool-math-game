import type { SupabaseClient, RealtimeChannel } from '@supabase/supabase-js';
import { isNotificationEvent, type NotificationEvent } from './messages';

export interface NotificationTransport {
  subscribe(channel: string, handler: (event: NotificationEvent) => void): () => void;
  publish(channel: string, event: NotificationEvent): Promise<void>;
}

export class SupabaseNotificationTransport implements NotificationTransport {
  private supabase: SupabaseClient;
  private channels: Map<string, RealtimeChannel> = new Map();

  constructor(supabaseClient: SupabaseClient) {
    this.supabase = supabaseClient;
  }

  subscribe(channelName: string, handler: (event: NotificationEvent) => void): () => void {
    const channel = this.supabase
      .channel(channelName)
      .on(
        'broadcast',
        { event: 'notification' },
        (payload: { payload: unknown }) => {
          if (isNotificationEvent(payload.payload)) {
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

  async publish(channelName: string, event: NotificationEvent): Promise<void> {
    const channel = this.channels.get(channelName);
    if (!channel) {
      console.warn(`[NotificationTransport] publish called before subscribe on channel: ${channelName}`);
      return;
    }
    await channel.send({
      type: 'broadcast',
      event: 'notification',
      payload: event,
    });
  }
}
