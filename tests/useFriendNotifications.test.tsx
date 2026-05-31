import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { ToastProvider } from '@/features/notifications/ToastProvider';
import { MockNotificationTransport } from './mockNotificationTransport';
import { userChannel } from '@/features/notifications/messages';

const api = vi.hoisted(() => ({
  getFriends: vi.fn(),
  getFriendRequests: vi.fn(),
  acceptFriendRequest: vi.fn(),
  denyFriendRequest: vi.fn(),
  removeFriend: vi.fn(),
}));

vi.mock('@/features/friends/api', () => api);

import { useFriendNotifications } from '@/features/friends/useFriendNotifications';

const myId = 'user-1';
const channel = userChannel(myId);

const aliceProfile = { id: 'alice', username: 'alice', level: 1 };
const bobProfile = { id: 'bob', username: 'bob', level: 2 };

function wrapper({ children }: { children: ReactNode }) {
  return <ToastProvider>{children}</ToastProvider>;
}

beforeEach(() => {
  vi.clearAllMocks();
  api.getFriends.mockResolvedValue([]);
  api.getFriendRequests.mockResolvedValue([]);
});

describe('useFriendNotifications', () => {
  it('fetches friends and requests exactly once on mount (no polling)', async () => {
    const transport = new MockNotificationTransport();
    renderHook(() => useFriendNotifications(myId, transport), { wrapper });

    await waitFor(() => {
      expect(api.getFriends).toHaveBeenCalledTimes(1);
      expect(api.getFriendRequests).toHaveBeenCalledTimes(1);
    });

    // No further calls over time = no interval polling.
    await new Promise((r) => setTimeout(r, 50));
    expect(api.getFriends).toHaveBeenCalledTimes(1);
    expect(api.getFriendRequests).toHaveBeenCalledTimes(1);
  });

  it('subscribes to the per-user notification channel', () => {
    const transport = new MockNotificationTransport();
    const spy = vi.spyOn(transport, 'subscribe');
    renderHook(() => useFriendNotifications(myId, transport), { wrapper });
    expect(spy).toHaveBeenCalledWith(channel, expect.any(Function));
  });

  it('on friend_request_received: shows a toast and refetches requests', async () => {
    const transport = new MockNotificationTransport();
    const { result } = renderHook(() => useFriendNotifications(myId, transport), { wrapper });

    await waitFor(() => expect(api.getFriendRequests).toHaveBeenCalledTimes(1));

    api.getFriendRequests.mockResolvedValue([
      { id: 'r1', fromUser: aliceProfile, toUser: bobProfile, status: 'pending', createdAt: '' },
    ]);

    act(() => {
      transport.simulate(channel, { type: 'friend_request_received', fromUser: aliceProfile });
    });

    expect(document.body.textContent).toContain('alice sent you a friend request!');
    await waitFor(() => expect(result.current.requests).toHaveLength(1));
  });

  it('on friend_request_accepted: shows a toast and refetches friends', async () => {
    const transport = new MockNotificationTransport();
    const { result } = renderHook(() => useFriendNotifications(myId, transport), { wrapper });

    await waitFor(() => expect(api.getFriends).toHaveBeenCalledTimes(1));

    api.getFriends.mockResolvedValue([
      { profile: bobProfile, status: { isFriend: true, incomingRequest: false, outgoingRequest: false } },
    ]);

    act(() => {
      transport.simulate(channel, { type: 'friend_request_accepted', byUser: bobProfile });
    });

    expect(document.body.textContent).toContain('bob accepted your friend request!');
    await waitFor(() => expect(result.current.friends).toHaveLength(1));
  });

  it('acceptRequest calls the API and removes the request locally', async () => {
    api.getFriendRequests.mockResolvedValue([
      { id: 'r1', fromUser: aliceProfile, toUser: bobProfile, status: 'pending', createdAt: '' },
    ]);
    api.acceptFriendRequest.mockResolvedValue({});
    const transport = new MockNotificationTransport();
    const { result } = renderHook(() => useFriendNotifications(myId, transport), { wrapper });

    await waitFor(() => expect(result.current.requests).toHaveLength(1));

    await act(async () => {
      await result.current.acceptRequest('r1');
    });

    expect(api.acceptFriendRequest).toHaveBeenCalledWith('r1');
    expect(result.current.requests).toHaveLength(0);
  });

  it('unsubscribes on unmount', () => {
    const transport = new MockNotificationTransport();
    const unsub = vi.fn();
    vi.spyOn(transport, 'subscribe').mockReturnValue(unsub);
    const { unmount } = renderHook(() => useFriendNotifications(myId, transport), { wrapper });
    unmount();
    expect(unsub).toHaveBeenCalled();
  });
});
