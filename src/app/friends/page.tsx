// temporary place to render FriendsTester.tsx test case
// in npm run dev, go to localhost:3000/friends
// click the "TEST MY FRIENDS..." text line
// an error should appear in the console that says "Failed to fetch friends :["
// this is intended!!! we will add better tests when we have a backend lol
// note that this change only happens once, so to see it in action again, rerun npm run dev

import FriendsTester from "@/features/friends/FriendsTester";

export default function FriendsPage() {
  return <FriendsTester />;
}