import type { DuelTransport } from '@/features/duel/transport';
import type { DuelEvent } from '@/features/duel/messages';

export class MockDuelTransport implements DuelTransport {
  published: { channel: string; event: DuelEvent }[] = [];
  private handlers: Map<string, (event: DuelEvent) => void> = new Map();

  subscribe(channel: string, handler: (event: DuelEvent) => void): () => void {
    this.handlers.set(channel, handler);
    return () => this.handlers.delete(channel);
  }

  async publish(channel: string, event: DuelEvent): Promise<void> {
    this.published.push({ channel, event });
  }

  simulate(channel: string, event: DuelEvent): void {
    this.handlers.get(channel)?.(event);
  }
}
