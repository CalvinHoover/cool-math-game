'use client';

import { useState } from 'react';
import type { Friend } from '../types';

type FriendsListProps = {
  friends: Friend[];
  onRemove?: (userId: string) => Promise<void>;
};

export default function FriendsList({ friends, onRemove }: FriendsListProps) {
  const [busy, setBusy] = useState<Record<string, boolean>>({});

  async function handleRemove(userId: string) {
    if (!onRemove) return;
    setBusy((prev) => ({ ...prev, [userId]: true }));
    try {
      await onRemove(userId);
    } finally {
      setBusy((prev) => ({ ...prev, [userId]: false }));
    }
  }

  return (
    <section className="border bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
      <h2 className="text-xl font-bold">Friends</h2>

      {friends.length === 0 ? (
        <p className="mt-2 text-gray-500">No friends yet.</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {friends.map((friend) => (
            <li
              key={friend.profile.id}
              className="flex items-center justify-between rounded-md border border-gray-200 px-3 py-2 dark:border-gray-700"
            >
              <span>
                <span className="font-semibold">{friend.profile.username}</span>
                <span className="ml-2 text-sm text-gray-500">Level {friend.profile.level}</span>
              </span>
              {onRemove && (
                <button
                  type="button"
                  disabled={busy[friend.profile.id]}
                  onClick={() => handleRemove(friend.profile.id)}
                  className="rounded-md border border-red-500 px-3 py-1 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50 dark:hover:bg-red-950"
                >
                  Remove
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
