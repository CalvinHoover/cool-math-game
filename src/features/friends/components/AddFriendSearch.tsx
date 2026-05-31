'use client';

import { startTransition, useCallback, useEffect, useRef, useState } from 'react';
import type { PublicProfile } from '@/features/profile/types';
import type { FriendStatus } from '../types';
import { searchUsers, getFriendStatus, sendFriendRequest } from '../api';

type ResultState = {
  status: FriendStatus | null;
  requested: boolean;
  sending: boolean;
};

const DEBOUNCE_MS = 300;

function buttonLabel(state: ResultState): { label: string; disabled: boolean } {
  if (state.requested) return { label: 'Requested', disabled: true };
  if (!state.status) return { label: 'Add Friend', disabled: true };
  if (state.status.isFriend) return { label: 'Friends', disabled: true };
  if (state.status.outgoingRequest) return { label: 'Requested', disabled: true };
  if (state.status.incomingRequest) return { label: 'Respond', disabled: true };
  if (state.sending) return { label: 'Sending…', disabled: true };
  return { label: 'Add Friend', disabled: false };
}

export default function AddFriendSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<PublicProfile[]>([]);
  const [states, setStates] = useState<Record<string, ResultState>>({});
  const [searching, setSearching] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    const trimmed = query.trim();
    if (!trimmed) {
      startTransition(() => {
        setResults([]);
        setStates({});
      });
      return;
    }

    timerRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const users = await searchUsers(trimmed);
        setResults(users);

        const entries = await Promise.all(
          users.map(async (user) => {
            const status = await getFriendStatus(user.id).catch(() => null);
            return [user.id, { status, requested: false, sending: false }] as const;
          })
        );
        setStates(Object.fromEntries(entries));
      } catch {
        setResults([]);
        setStates({});
      } finally {
        setSearching(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [query]);

  const handleSend = useCallback(async (userId: string) => {
    setStates((prev) => ({ ...prev, [userId]: { ...prev[userId], sending: true } }));
    try {
      await sendFriendRequest(userId);
      setStates((prev) => ({
        ...prev,
        [userId]: { ...prev[userId], requested: true, sending: false },
      }));
    } catch {
      setStates((prev) => ({ ...prev, [userId]: { ...prev[userId], sending: false } }));
    }
  }, []);

  return (
    <section className="border bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
      <h2 className="text-xl font-bold">Add Friends</h2>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by username…"
        aria-label="Search users by username"
        className="mt-3 w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-800"
      />

      {searching && <p className="mt-3 text-sm text-gray-500">Searching…</p>}

      <ul className="mt-3 space-y-2">
        {results.map((user) => {
          const state = states[user.id] ?? { status: null, requested: false, sending: false };
          const { label, disabled } = buttonLabel(state);
          return (
            <li
              key={user.id}
              className="flex items-center justify-between rounded-md border border-gray-200 px-3 py-2 dark:border-gray-700"
            >
              <span>
                <span className="font-semibold">{user.username}</span>
                <span className="ml-2 text-sm text-gray-500">Level {user.level}</span>
              </span>
              <button
                type="button"
                disabled={disabled}
                onClick={() => handleSend(user.id)}
                className="rounded-md bg-blue-600 px-3 py-1 text-sm text-white disabled:cursor-not-allowed disabled:bg-gray-400"
              >
                {label}
              </button>
            </li>
          );
        })}
      </ul>

      {!searching && query.trim() && results.length === 0 && (
        <p className="mt-3 text-sm text-gray-500">No users found.</p>
      )}
    </section>
  );
}
