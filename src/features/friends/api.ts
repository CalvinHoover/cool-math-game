import type { Friend, FriendRequest, PastOpponent } from "./types";
import type { PublicProfile } from "../profile/types";
export async function getFriends(): Promise<Friend[]> {
  const res = await fetch('/api/friends');
  if (!res.ok) return [];
  return res.json();
}


export async function getFriendRequests(): Promise<FriendRequest[]> {
  const res = await fetch('/api/friends/requests');
  if (!res.ok) return [];
  return res.json();
}

export async function searchUsers(query: string): Promise<PublicProfile[]> {
  if (!query.trim()) return [];
  const res = await fetch(`/api/friends/search?q=${encodeURIComponent(query)}`);
  if (!res.ok) return [];
  const users = await res.json();
  return users.map((u: { id: string; username: string }) => ({
    id: u.id,
    username: u.username,
    level: 0,
  }));
}

export async function sendFriendRequest(username: string): Promise<void> {
  const res = await fetch('/api/friends/request', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username }),
  });
  if (!res.ok) {
    const { error } = await res.json();
    throw new Error(error ?? 'Failed to send friend request');
  }
}

export async function acceptFriendRequest(requestId: string): Promise<Friend> {
  const res = await fetch(`/api/friends/requests/${requestId}/accept`, { method: 'POST' });
  if (!res.ok) {
    const { error } = await res.json();
    throw new Error(error ?? 'Failed to accept friend request');
  }
  return res.json();
}

export async function denyFriendRequest(requestId: string): Promise<FriendRequest> {
  const res = await fetch(`/api/friends/requests/${requestId}/deny`, { method: 'POST' });
  if (!res.ok) {
    const { error } = await res.json();
    throw new Error(error ?? 'Failed to deny friend request');
  }
  return res.json();
}

export async function getPastOpponents(): Promise<PastOpponent[]> {
  return [];
}