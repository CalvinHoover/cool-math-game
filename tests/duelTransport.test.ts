import { describe, expect, it, vi } from 'vitest';
import { isDuelEvent } from '@/features/duel/messages';
import { SupabaseRealtimeTransport } from '@/features/duel/transport';
import type { DuelEvent } from '@/features/duel/messages';

// --- isDuelEvent ---

describe('isDuelEvent', () => {
  it('returns false for null', () => {
    expect(isDuelEvent(null)).toBe(false);
  });

  it('returns false for a plain object without a type field', () => {
    expect(isDuelEvent({ foo: 'bar' })).toBe(false);
  });

  it('returns false for an unknown type string', () => {
    expect(isDuelEvent({ type: 'unknown:event' })).toBe(false);
  });

  it('returns true for match:start', () => {
    const event: DuelEvent = { type: 'match:start', opponent: 'alice' };
    expect(isDuelEvent(event)).toBe(true);
  });

  it('returns true for mining:question', () => {
    expect(isDuelEvent({ type: 'mining:question', questionId: 'q1', problem: { body: '1+1', correctAnswer: '2' } })).toBe(true);
  });

  it('returns true for attack:launched', () => {
    expect(isDuelEvent({ type: 'attack:launched', attackId: 'a1', problem: { body: '2+2', correctAnswer: '4' }, senderId: 'u1' })).toBe(true);
  });

  it('returns true for attack:answered', () => {
    expect(isDuelEvent({ type: 'attack:answered', attackId: 'a1', correct: true })).toBe(true);
  });

  it('returns true for hp:update', () => {
    expect(isDuelEvent({ type: 'hp:update', playerId: 'u1', newHp: 75 })).toBe(true);
  });

  it('returns true for coins:update', () => {
    expect(isDuelEvent({ type: 'coins:update', playerId: 'u1', newCoins: 20 })).toBe(true);
  });

  it('returns true for match:over', () => {
    expect(isDuelEvent({ type: 'match:over', winnerId: 'u1' })).toBe(true);
  });

  it('returns true for player:forfeit', () => {
    expect(isDuelEvent({ type: 'player:forfeit', playerId: 'u1' })).toBe(true);
  });
});

// --- SupabaseRealtimeTransport ---

function makeSupabaseMock() {
  const sendFn = vi.fn().mockResolvedValue({ error: null });
  const subscribeFn = vi.fn().mockReturnThis();
  const onFn = vi.fn().mockReturnThis();
  const removeChannelFn = vi.fn();

  const channelObj = { on: onFn, subscribe: subscribeFn, send: sendFn };
  const channelFn = vi.fn().mockReturnValue(channelObj);

  const supabaseMock = {
    channel: channelFn,
    removeChannel: removeChannelFn,
  };

  return { supabaseMock, channelObj, channelFn, onFn, subscribeFn, sendFn, removeChannelFn };
}

describe('SupabaseRealtimeTransport', () => {
  it('subscribe calls supabase.channel() with the correct channel name', () => {
    const { supabaseMock, channelFn } = makeSupabaseMock();
    const t = new SupabaseRealtimeTransport(supabaseMock as never);
    t.subscribe('match:123', vi.fn());
    expect(channelFn).toHaveBeenCalledWith('match:123');
  });

  it('subscribe registers a broadcast handler with event "duel"', () => {
    const { supabaseMock, onFn } = makeSupabaseMock();
    const t = new SupabaseRealtimeTransport(supabaseMock as never);
    t.subscribe('match:123', vi.fn());
    expect(onFn).toHaveBeenCalledWith('broadcast', { event: 'duel' }, expect.any(Function));
  });

  it('subscribe calls .subscribe() on the channel', () => {
    const { supabaseMock, subscribeFn } = makeSupabaseMock();
    const t = new SupabaseRealtimeTransport(supabaseMock as never);
    t.subscribe('match:123', vi.fn());
    expect(subscribeFn).toHaveBeenCalled();
  });

  it('subscribe returns an unsubscribe function that removes the channel', () => {
    const { supabaseMock, removeChannelFn, channelObj } = makeSupabaseMock();
    const t = new SupabaseRealtimeTransport(supabaseMock as never);
    const unsubscribe = t.subscribe('match:123', vi.fn());
    unsubscribe();
    expect(removeChannelFn).toHaveBeenCalledWith(channelObj);
  });

  it('does not invoke the handler for payloads that fail isDuelEvent validation', () => {
    const { supabaseMock, onFn } = makeSupabaseMock();
    const handler = vi.fn();
    const t = new SupabaseRealtimeTransport(supabaseMock as never);
    t.subscribe('match:123', handler);

    const broadcastCallback = onFn.mock.calls[0][2] as (p: unknown) => void;
    broadcastCallback({ payload: { type: 'invalid:event' } });
    expect(handler).not.toHaveBeenCalled();
  });

  it('invokes the handler for valid DuelEvent payloads', () => {
    const { supabaseMock, onFn } = makeSupabaseMock();
    const handler = vi.fn();
    const t = new SupabaseRealtimeTransport(supabaseMock as never);
    t.subscribe('match:123', handler);

    const broadcastCallback = onFn.mock.calls[0][2] as (p: unknown) => void;
    broadcastCallback({ payload: { type: 'match:over', winnerId: 'u1' } });
    expect(handler).toHaveBeenCalledWith({ type: 'match:over', winnerId: 'u1' });
  });

  it('publish calls channel.send with type "broadcast" and event as payload', async () => {
    const { supabaseMock, sendFn } = makeSupabaseMock();
    const t = new SupabaseRealtimeTransport(supabaseMock as never);
    t.subscribe('match:123', vi.fn());

    const event: DuelEvent = { type: 'hp:update', playerId: 'u1', newHp: 50 };
    await t.publish('match:123', event);

    expect(sendFn).toHaveBeenCalledWith({
      type: 'broadcast',
      event: 'duel',
      payload: event,
    });
  });
});
