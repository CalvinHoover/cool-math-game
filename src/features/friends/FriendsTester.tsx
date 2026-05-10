// temporary client component to test friend routes
// similar to ProfileHeader.tsx

"use client";

import {
  getFriends,
  getFriendRequests,
  sendFriendRequest,
  getFriendStatus,
} from "./api";

export default function FriendsTester() {
  async function testFriendsAPI() {
    try {
      const friends = await getFriends();
      console.log("Friends:", friends);

      const requests = await getFriendRequests();
      console.log("Friend requests:", requests);

      const status = await getFriendStatus("user-2");
      console.log("Friend status:", status);

      const newRequest = await sendFriendRequest("user-2");
      console.log("Sent request:", newRequest);
    } catch (error) {
      console.error("Friends API test failed:", error);
    }
  }

  return (
    <button onClick={testFriendsAPI}>
      TEST MY FRIENDS ON HOW WELL THEY KNOW ME!!!
    </button>
  );
}
