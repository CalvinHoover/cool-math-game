// pretty much the same as profile/api.ts

import type { Friend, FriendRequest, PastOpponent } from "./types";
import type { PublicProfile } from "../profile/types";

// mock data for friends testing
// id: string;
// username: string;
// avatarUrl?: string;
// level: number;
// bio?: string;
const testUsers: PublicProfile[] = [
  {
    id: "testfriend1",
    username: "gooper1",
    avatarUrl: "/default_friend.png",
    level: 12,
    bio: "I am friendly!"
  },
  {
    id: "testfriend2",
    username: "gooper2",
    avatarUrl: "/default_friend.png",
    level: 35,
    bio: "I am also friendly!"
  },
];

let testFriends: Friend[] = [
  {
    profile: testUsers[0],
    status: {
      isFriend: false,
      incomingRequest: false,
      outgoingRequest: false,
    },
  },
]

let testRequests: FriendRequest[] = [
  {
    id: "request-1",
    fromUser: testUsers[1],
    toUser: {
      id: "currentuser",
      username: "Current User",
      avatarUrl: "/default_avatar.png",
      level: 38,
      bio: "AAAAUUUUUGHHHHH"
    },
    status: "pending",
    createdAt: new Date().toISOString(),
  },
];

let testPastOpponents: PastOpponent[] = [
  {
    profile: testUsers[1],
    result: "win",
    playedAt: new Date().toISOString(),
  }
]
export async function getFriends(): Promise<Friend[]> {
  return testFriends;
}

// export async function getFriendStatus(userId: string): Promise<FriendStatus> {
  // const response = await fetch(`/api/friends/status/${userId}`);

  // if (!response.ok) {
  //   throw new Error("Failed to fetch friend status :[");
  // }

  // const data = await response.json();
  // return data.status;
// }

export async function getFriendRequests(): Promise<FriendRequest[]> {
  return testRequests.filter((request) => request.status === "pending");
}

// search function for users
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
  const request = testRequests.find((request) => request.id === requestId);
  if (!request) {
    throw new Error("Friend request not found.")
  }
  request.status = "accepted";
  const newFriend: Friend = {
    profile: request.fromUser,
    status: {
      isFriend: true,
      incomingRequest: false,
      outgoingRequest: false,
    },
  };

  testFriends.push(newFriend);
  return newFriend;

  // const response = await fetch(`/api/friends/requests/${requestId}/accept`, {
  //   method: "POST",
  // });

  // if (!response.ok) {
  //   throw new Error("Failed to accept friend request :[");
  // }

  // const data = await response.json();
  // return data.request;
}

export async function denyFriendRequest(requestId: string): Promise<FriendRequest> {
  const request = testRequests.find((request) => request.id === requestId);
  if (!request) {
    throw new Error("Friend request not found.");
  }
  request.status = "denied";
  return request;

//   const response = await fetch(`/api/friends/requests/${requestId}/deny`, {
//     method: "POST",
//   });

//   if (!response.ok) {
//     throw new Error("Failed to deny friend request :[");
//   }

//   const data = await response.json();
//   return data.request;
// }

// export async function removeFriend(userId: string): Promise<void> {
//   const response = await fetch(`/api/friends/${userId}`, {
//     method: "DELETE",
//   });

//   if (!response.ok) {
//     throw new Error("Failed to remove friend :[");
//   }
}

export async function getPastOpponents(): Promise<PastOpponent[]> {
  return testPastOpponents;
}