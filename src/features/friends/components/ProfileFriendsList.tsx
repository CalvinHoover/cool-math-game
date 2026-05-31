'use client';

import { startTransition, useEffect, useState } from 'react';
import { getFriends } from '../api';
import type { Friend } from '../types';
import FriendsList from './FriendsList';

// Read-only friends list for the profile page (no remove action).
export default function ProfileFriendsList() {
  const [friends, setFriends] = useState<Friend[]>([]);

  useEffect(() => {
    let cancelled = false;
    getFriends()
      .then((result) => {
        if (!cancelled) startTransition(() => setFriends(result));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  return <FriendsList friends={friends} />;
}
