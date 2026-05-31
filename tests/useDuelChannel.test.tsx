import { describe, expect, it, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDuelChannel } from '@/features/duel/useDuelChannel';
import { MockDuelTransport } from './mockDuelTransport';
import type { DuelEvent } from '@/features/duel/messages';

describe('useDuelChannel', () => {
  it('calls transport.subscribe with "match:{matchId}" on mount', () => {
    const transport = new MockDuelTransport();
    const subscribeSpy = vi.spyOn(transport, 'subscribe');

    renderHook(() => useDuelChannel('abc-123', transport));

    expect(subscribeSpy).toHaveBeenCalledWith('match:abc-123', expect.any(Function));
  });

  it('calls the unsubscribe function on unmount', () => {
    const transport = new MockDuelTransport();
    const unsubscribeFn = vi.fn();
    vi.spyOn(transport, 'subscribe').mockReturnValue(unsubscribeFn);

    const { unmount } = renderHook(() => useDuelChannel('abc-123', transport));
    unmount();

    expect(unsubscribeFn).toHaveBeenCalled();
  });

  it('sendEvent calls transport.publish with the correct channel and event', async () => {
    const transport = new MockDuelTransport();
    const { result } = renderHook(() => useDuelChannel('abc-123', transport));

    const event: DuelEvent = { type: 'coins:update', playerId: 'u1', newCoins: 10 };
    await act(async () => {
      await result.current.sendEvent(event);
    });

    expect(transport.published).toContainEqual({ channel: 'match:abc-123', event });
  });

  it('lastEvent is null on initial render', () => {
    const transport = new MockDuelTransport();
    const { result } = renderHook(() => useDuelChannel('abc-123', transport));
    expect(result.current.lastEvent).toBeNull();
  });

  it('lastEvent updates when transport delivers an event', () => {
    const transport = new MockDuelTransport();
    const { result } = renderHook(() => useDuelChannel('abc-123', transport));

    act(() => {
      transport.simulate('match:abc-123', { type: 'hp:update', playerId: 'u1', newHp: 75 });
    });

    expect(result.current.lastEvent).toEqual({ type: 'hp:update', playerId: 'u1', newHp: 75 });
  });

  it('connected becomes true after subscribe', async () => {
    const transport = new MockDuelTransport();
    const { result } = renderHook(() => useDuelChannel('abc-123', transport));

    await act(async () => {});

    expect(result.current.connected).toBe(true);
  });

  it('subscribes to a new channel when matchId changes', () => {
    const transport = new MockDuelTransport();
    const subscribeSpy = vi.spyOn(transport, 'subscribe');

    const { rerender } = renderHook(
      ({ matchId }) => useDuelChannel(matchId, transport),
      { initialProps: { matchId: 'match-1' } }
    );

    rerender({ matchId: 'match-2' });

    expect(subscribeSpy).toHaveBeenCalledWith('match:match-1', expect.any(Function));
    expect(subscribeSpy).toHaveBeenCalledWith('match:match-2', expect.any(Function));
  });
});
