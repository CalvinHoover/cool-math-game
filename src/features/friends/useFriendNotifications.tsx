'use client';

import { startTransition, useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { userChannel } from '@/features/notifications/messages';
import {
  SupabaseNotificationTransport,
  type NotificationTransport,
} from '@/features/notifications/transport';
import { useToast } from '@/features/notifications/ToastProvider';
import {
  getFriends,
  getFriendRequests,
  acceptFriendRequest as apiAccept,
  denyFriendRequest as apiDeny,
  removeFriend as apiRemove,
} from './api';
import type { Friend, FriendRequest } from './types';

export type FriendNotificationsHook = {
  friends: Friend[];
  requests: FriendRequest[];
  connected: boolean;
  loading: boolean;
  refresh: () => Promise<void>;
  acceptRequest: (requestId: string) => Promise<void>;
  denyRequest: (requestId: string) => Promise<void>;
  removeFriend: (userId: string) => Promise<void>;
};

export function useFriendNotifications(
  myId: string,
  transport?: NotificationTransport
): FriendNotificationsHook {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const { pushToast } = useToast();

  const transportRef = useRef<NotificationTransport | null>(null);
  const channelName = userChannel(myId);

  // One-off fetch on mount to sync state after being offline.
  // Realtime replaces periodic polling, NOT this initial fetch.
  const refresh = useCallback(async () => {
    const [nextFriends, nextRequests] = await Promise.all([
      getFriends(),
      getFriendRequests(),
    ]);
    startTransition(() => {
      setFriends(nextFriends);
      setRequests(nextRequests);
    });
  }, []);

  useEffect(() => {
    let cancelled = false;
    refresh()
      .catch(() => {})
      .finally(() => {
        if (!cancelled) startTransition(() => setLoading(false));
      });
    return () => {
      cancelled = true;
    };
  }, [refresh]);

  // Subscribe to the personal notification channel for live updates.
  useEffect(() => {
    if (transportRef.current === null) {
      transportRef.current = transport ?? new SupabaseNotificationTransport(supabase);
    }
    const t = transportRef.current;

    const unsubscribe = t.subscribe(channelName, (event) => {
      if (event.type === 'friend_request_received') {
        pushToast(`${event.fromUser.username} sent you a friend request!`);
        getFriendRequests().then(setRequests).catch(() => {});
      } else if (event.type === 'friend_request_accepted') {
        pushToast(`${event.byUser.username} accepted your friend request!`);
        getFriends().then(setFriends).catch(() => {});
      }
    });
    startTransition(() => setConnected(true));

    return () => {
      unsubscribe();
      startTransition(() => setConnected(false));
    };
  }, [channelName, transport, pushToast]);

  const acceptRequest = useCallback(async (requestId: string) => {
    await apiAccept(requestId);
    setRequests((prev) => prev.filter((r) => r.id !== requestId));
    getFriends().then(setFriends).catch(() => {});
  }, []);

  const denyRequest = useCallback(async (requestId: string) => {
    await apiDeny(requestId);
    setRequests((prev) => prev.filter((r) => r.id !== requestId));
  }, []);

  const removeFriend = useCallback(async (userId: string) => {
    await apiRemove(userId);
    setFriends((prev) => prev.filter((f) => f.profile.id !== userId));
  }, []);

  return {
    friends,
    requests,
    connected,
    loading,
    refresh,
    acceptRequest,
    denyRequest,
    removeFriend,
  };
}
