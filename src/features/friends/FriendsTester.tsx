// temporary client component to test friend routes
// similar to ProfileHeader.tsx

"use client";

import { useEffect } from "react";
import { getFriends, searchUsers } from "@/features/friends/api"


export default function FriendsTester() {
  useEffect(() => {
    async function testFriendsAPI() {
      const friends = await getFriends();
      console.log("Friends:", friends);
      const results = await searchUsers("gooper");
      console.log("Search Results:", results);
    }
    testFriendsAPI();
  }, []);

  return (
    <div>
      <h1> Friends API Tester </h1>
      <p> Look at the browser console! </p>
    </div>
  );
}

