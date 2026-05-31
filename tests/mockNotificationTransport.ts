import type { NotificationTransport } from '@/features/notifications/transport';
import type { NotificationEvent } from '@/features/notifications/messages';

export class MockNotificationTransport implements NotificationTransport {
  published: { channel: string; event: NotificationEvent }[] = [];
  private handlers: Map<string, (event: NotificationEvent) => void> = new Map();

  subscribe(channel: string, handler: (event: NotificationEvent) => void): () => void {
    this.handlers.set(channel, handler);
    return () => this.handlers.delete(channel);
  }

  async publish(channel: string, event: NotificationEvent): Promise<void> {
    this.published.push({ channel, event });
  }

  simulate(channel: string, event: NotificationEvent): void {
    this.handlers.get(channel)?.(event);
  }
}
