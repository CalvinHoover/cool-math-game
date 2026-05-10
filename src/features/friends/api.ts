// pretty much the same as profile/api.ts

import type { Friend, FriendRequest, FriendStatus } from "./types";

export async function getFriends(): Promise<Friend[]> {
  const response = await fetch("/api/friends");

  if (!response.ok) {
    throw new Error("Failed to fetch friends :[");
  }

  const data = await response.json();
  return data.friends;
}

export async function getFriendStatus(userId: string): Promise<FriendStatus> {
  const response = await fetch(`/api/friends/status/${userId}`);

  if (!response.ok) {
    throw new Error("Failed to fetch friend status :[");
  }

  const data = await response.json();
  return data.status;
}

export async function getFriendRequests(): Promise<FriendRequest[]> {
  const response = await fetch("/api/friends/requests");

  if (!response.ok) {
    throw new Error("Failed to fetch friend requests :[");
  }

  const data = await response.json();
  return data.requests;
}

export async function sendFriendRequest(userId: string): Promise<FriendRequest> {
  const response = await fetch("/api/friends/requests", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ userId }),
  });

  if (!response.ok) {
    throw new Error("Failed to send friend request :[");
  }

  const data = await response.json();
  return data.request;
}

export async function acceptFriendRequest(
  requestId: string
): Promise<FriendRequest> {
  const response = await fetch(`/api/friends/requests/${requestId}/accept`, {
    method: "POST",
  });

  if (!response.ok) {
    throw new Error("Failed to accept friend request :[");
  }

  const data = await response.json();
  return data.request;
}

export async function denyFriendRequest(
  requestId: string
): Promise<FriendRequest> {
  const response = await fetch(`/api/friends/requests/${requestId}/deny`, {
    method: "POST",
  });

  if (!response.ok) {
    throw new Error("Failed to deny friend request :[");
  }

  const data = await response.json();
  return data.request;
}

export async function removeFriend(userId: string): Promise<void> {
  const response = await fetch(`/api/friends/${userId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to remove friend :[");
  }
}